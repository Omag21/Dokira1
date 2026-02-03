
# views.py
from fastapi import APIRouter, Request, Depends, HTTPException, status, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, desc
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pathlib import Path
from fastapi import UploadFile, File
from app.models import Message, Medecin, Admin, Photo, RendezVous, Document, Ordonnance, DossierMedical, Specialite, StatutMessage, StatutRendezVous, TypeConsultation
import secrets
from fastapi import Body
import os
from dotenv import load_dotenv
#from fastapi import APIRouter, Request

# Imports locaux
from app.database import get_db
from app.models import Patient

# Charger les variables d'environnement
load_dotenv()

# Configuration
BASE_DIR = Path(__file__).resolve().parent
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = os.environ["JWT_ALGO"]
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"])

BASE_DIR = Path(__file__).resolve().parent

# Configuration du router et templates
router = APIRouter()
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Configuration du hachage de mot de passe avec bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ============= FONCTIONS UTILITAIRES D'AUTHENTIFICATION =============

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Vérifie si le mot de passe en clair correspond au hash
    
    Args:
        plain_password: Le mot de passe en clair
        hashed_password: Le mot de passe hashé dans la base de données
    
    Returns:
        bool: True si le mot de passe correspond, False sinon
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Erreur lors de la vérification du mot de passe: {e}")
        return False


def get_password_hash(password: str) -> str:
    """
    Hash un mot de passe avec bcrypt
    
    Args:
        password: Le mot de passe en clair
    
    Returns:
        str: Le mot de passe hashé
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    Crée un token JWT pour l'authentification
    
    Args:
        data: Les données à encoder dans le token
        expires_delta: Durée de validité du token
    
    Returns:
        str: Le token JWT encodé
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow()
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_user_by_email(db: Session, email: str) -> Patient:
    """
    Récupère un patient par son email dans la base de données
    
    Args:
        db: Session de base de données
        email: Email du patient
    
    Returns:
        Patient: L'objet Patient si trouvé, None sinon
    """
    try:
        return db.query(Patient).filter(Patient.email == email.lower().strip()).first()
    except Exception as e:
        print(f"Erreur lors de la récupération du patient: {e}")
        return None


def authenticate_user(db: Session, email: str, password: str) -> Patient:
    """
    Authentifie un utilisateur en vérifiant son email et mot de passe
    
    Args:
        db: Session de base de données
        email: Email du patient
        password: Mot de passe en clair
    
    Returns:
        Patient: L'objet Patient si authentification réussie, None sinon
    """
    # Récupérer le patient par email
    patient = get_user_by_email(db, email)
    
    # Vérifier si le patient existe
    if not patient:
        print(f"Patient non trouvé avec l'email: {email}")
        return None
    
    # Vérifier le mot de passe
    if not verify_password(password, patient.mot_de_passe_hash):
        print(f"Mot de passe incorrect pour l'email: {email}")
        return None
    
    # Vérifier si le compte est actif
    if not patient.est_actif:
        print(f"Compte inactif pour l'email: {email}")
        return None
    
    return patient


def get_current_user_from_cookie(request: Request, db: Session) -> Patient:
    """
    Récupère l'utilisateur actuel depuis le cookie JWT
    
    Args:
        request: Requête FastAPI
        db: Session de base de données
    
    Returns:
        Patient: L'objet Patient si authentifié, None sinon
    """
    token = request.cookies.get("access_token")
    
    if not token:
        return None
    
    try:
        # Retirer le préfixe "Bearer " si présent
        if token.startswith("Bearer "):
            token = token[7:]
        
        # Décoder le token JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            return None
        
        # Récupérer le patient depuis la base de données
        patient = get_user_by_email(db, email)
        return patient
        
    except JWTError as e:
        print(f"Erreur JWT: {e}")
        return None
    except Exception as e:
        print(f"Erreur lors de la récupération de l'utilisateur: {e}")
        return None


# ============= ROUTES HTML - PAGES =============

@router.get("/", response_class=HTMLResponse)
def home(request: Request):
    """Page d'accueil principale"""
    return templates.TemplateResponse("main.html", {"request": request})


@router.get("/main", response_class=HTMLResponse)
def main(request: Request):
    """Page principale/dashboard public"""
    return templates.TemplateResponse("main.html", {"request": request})


@router.get("/connexion", response_class=HTMLResponse)
def page_connexion(request: Request, db: Session = Depends(get_db)):
    """
    Page de connexion
    Si l'utilisateur est déjà connecté, redirige vers l'espace patient
    """
    # Vérifier si l'utilisateur est déjà connecté
    current_user = get_current_user_from_cookie(request, db)
    
    if current_user:
        return RedirectResponse(url="/espace-patient", status_code=303)
    
    return templates.TemplateResponse("connexion.html", {"request": request})


@router.get("/inscription", response_class=HTMLResponse)
def page_inscription(request: Request):
    """Page d'inscription pour nouveaux patients"""
    return templates.TemplateResponse("inscription.html", {"request": request})


@router.get("/espace-patient", response_class=HTMLResponse)
def espace_patient(request: Request, db: Session = Depends(get_db)):
    """
    Espace patient - Interface principale du patient
    Nécessite une authentification
    """
    # Récupérer l'utilisateur actuel depuis le cookie
    current_user = get_current_user_from_cookie(request, db)
    
    # Si pas authentifié, rediriger vers la page de connexion
    if not current_user:
        return RedirectResponse(url="/connexion?redirect=espace-patient", status_code=303)
    
    # Mettre à jour la dernière connexion
    try:
        current_user.derniere_connexion = datetime.utcnow()
        db.commit()
    except Exception as e:
        print(f"Erreur lors de la mise à jour de la dernière connexion: {e}")
        db.rollback()
    
    # Afficher l'interface patient avec les données du patient
    return templates.TemplateResponse(
        "EspaceClient.html", 
        {
            "request": request,
            "patient": current_user,
            "nom_complet": current_user.nom_complet,
            "email": current_user.email
        }
    )


# ============= ROUTES POST - AUTHENTIFICATION =============

@router.post("/connexion")
async def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Traite la soumission du formulaire de connexion
    Vérifie les credentials et crée une session
    """
    
    # Nettoyer l'email (enlever espaces, mettre en minuscule)
    email = email.strip().lower()
    
    # Authentifier le patient
    patient = authenticate_user(db, email, password)
    
    # Si l'authentification échoue
    if not patient:
        return templates.TemplateResponse(
            "connexion.html",
            {
                "request": request,
                "error": "Email ou mot de passe incorrect",
                "email": email
            },
            status_code=401
        )
    
    # Vérifier si le compte est actif
    if not patient.est_actif:
        return templates.TemplateResponse(
            "connexion.html",
            {
                "request": request,
                "error": "Votre compte a été désactivé. Veuillez contacter le support.",
                "email": email
            },
            status_code=403
        )
    
    # Créer le token d'accès JWT
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": patient.email,
            "patient_id": patient.id,
            "nom": patient.nom,
            "prenom": patient.prenom
        },
        expires_delta=access_token_expires
    )
    
    # Mettre à jour la dernière connexion
    try:
        patient.derniere_connexion = datetime.utcnow()
        db.commit()
    except Exception as e:
        print(f"Erreur lors de la mise à jour de la dernière connexion: {e}")
        db.rollback()
    
    # Créer la réponse de redirection vers l'espace patient
    response = RedirectResponse(url="/espace-patient", status_code=303)
    
    # Définir le cookie sécurisé avec le token JWT
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,  # Empêche l'accès JavaScript (sécurité XSS)
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Durée en secondes
        expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",  # Protection CSRF
        secure=False  # Mettre True en production avec HTTPS
    )
    
    return response


@router.post("/inscription")
async def register(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    password_confirm: str = Form(...),
    nom: str = Form(...),
    prenom: str = Form(...),
    date_naissance: str = Form(...),
    genre: str = Form(...),
    telephone: str = Form(...),
    adresse: str = Form(...),
    ville: str = Form(...),
    code_postal: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Traite la soumission du formulaire d'inscription
    Crée un nouveau compte patient
    """
    
    # Nettoyer l'email
    email = email.strip().lower()
    
    # Valider que les mots de passe correspondent
    if password != password_confirm:
        return templates.TemplateResponse(
            "inscription.html",
            {
                "request": request,
                "error": "Les mots de passe ne correspondent pas",
                "email": email,
                "nom": nom,
                "prenom": prenom
            },
            status_code=400
        )
    
    # Valider la longueur du mot de passe
    if len(password) < 8:
        return templates.TemplateResponse(
            "inscription.html",
            {
                "request": request,
                "error": "Le mot de passe doit contenir au moins 8 caractères",
                "email": email,
                "nom": nom,
                "prenom": prenom
            },
            status_code=400
        )
    
    # Vérifier si l'email existe déjà
    existing_patient = get_user_by_email(db, email)
    if existing_patient:
        return templates.TemplateResponse(
            "inscription.html",
            {
                "request": request,
                "error": "Un compte existe déjà avec cet email",
                "email": email
            },
            status_code=400
        )
    
    # Créer le nouveau patient
    try:
        # Convertir la date de naissance (format YYYY-MM-DD)
        date_naissance_obj = datetime.strptime(date_naissance, "%Y-%m-%d").date()
        
        # Créer l'objet Patient
        nouveau_patient = Patient(
            email=email,
            mot_de_passe_hash=get_password_hash(password),
            nom=nom.strip().capitalize(),
            prenom=prenom.strip().capitalize(),
            date_naissance=date_naissance_obj,
            genre=genre,
            telephone=telephone.strip(),
            adresse=adresse.strip(),
            ville=ville.strip().capitalize(),
            code_postal=code_postal.strip(),
            est_actif=True,
            est_email_verifie=False,
            date_creation=datetime.utcnow()
        )
        
        # Ajouter à la base de données
        db.add(nouveau_patient)
        db.commit()
        db.refresh(nouveau_patient)
        
        print(f"✅ Nouveau patient créé: {nouveau_patient.email} (ID: {nouveau_patient.id})")
        
        # Créer un token et connecter automatiquement l'utilisateur
        access_token = create_access_token(
            data={
                "sub": nouveau_patient.email,
                "patient_id": nouveau_patient.id,
                "nom": nouveau_patient.nom,
                "prenom": nouveau_patient.prenom
            }
        )
        
        # Rediriger vers l'espace patient
        response = RedirectResponse(url="/espace-patient", status_code=303)
        response.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            samesite="lax",
            secure=False
        )
        
        return response
        
    except ValueError as e:
        # Erreur de format de date
        db.rollback()
        return templates.TemplateResponse(
            "inscription.html",
            {
                "request": request,
                "error": "Format de date invalide. Utilisez JJ/MM/AAAA",
                "email": email,
                "nom": nom,
                "prenom": prenom
            },
            status_code=400
        )
    except Exception as e:
        # Autres erreurs
        db.rollback()
        print(f"❌ Erreur lors de la création du compte: {e}")
        return templates.TemplateResponse(
            "inscription.html",
            {
                "request": request,
                "error": f"Erreur lors de la création du compte. Veuillez réessayer.",
                "email": email,
                "nom": nom,
                "prenom": prenom
            },
            status_code=500
        )


@router.get("/deconnexion")
@router.get("/api/deconnexion")
async def deconnexion():
    """
    Déconnexion de l'utilisateur
    Supprime le cookie d'authentification et redirige vers la page de connexion
    """
    response = RedirectResponse(url="/connexion", status_code=303)
    response.delete_cookie(key="access_token")
    return response


# ============= ROUTES API - DONNÉES DYNAMIQUES =============

@router.get("/api/dashboard/stats")
async def get_dashboard_stats(request: Request, db: Session = Depends(get_db)):
    """API pour récupérer les statistiques du dashboard"""
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    try:
        # ✅ Requête CORRIGÉE - Utiliser query() correctement
        rendez_vous_count = db.query(RendezVous).filter(
            RendezVous.patient_id == current_user.id,
            RendezVous.statut.in_(["Planifié", "Confirmé"]),
            RendezVous.date_heure > datetime.utcnow()
        ).count()
        
        # Documents
        documents_count = db.query(Document).filter(
            Document.patient_id == current_user.id
        ).count()
        
        # Messages non lus
        messages_non_lus = db.query(Message).filter(
            Message.patient_id == current_user.id,
            Message.statut == StatutMessage.ENVOYE,
            Message.de_medecin == True
        ).count()
        
        # Total messages
        total_messages = db.query(Message).filter(
            Message.patient_id == current_user.id
        ).count()
        
        return {
            "patient_name": f"{current_user.prenom} {current_user.nom}",
            "stats": [
                {
                    "icon": "fa-calendar-check",
                    "color": "blue",
                    "value": str(rendez_vous_count),
                    "label": "RDV à venir",
                    "change": { "type": "positive", "text": f"+{rendez_vous_count} ce mois" }
                },
                {
                    "icon": "fa-file-medical",
                    "color": "green",
                    "value": str(documents_count),
                    "label": "Documents",
                    "change": { "type": "positive", "text": f"+{documents_count} récents" }
                },
                {
                    "icon": "fa-comments",
                    "color": "orange",
                    "value": str(total_messages),
                    "label": "Messages",
                    "change": { "type": "positive", "text": f"{messages_non_lus} non lus" }
                },
                {
                    "icon": "fa-heartbeat",
                    "color": "red",
                    "value": "98%",
                    "label": "Suivi santé",
                    "change": { "type": "positive", "text": "Excellent" }
                }
            ]
        }
        
    except Exception as e:
        print(f"❌ Erreur dans get_dashboard_stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )
        
        
# ============= PATIENT - RENDEZ-VOUS =============
@router.get("/api/rendez-vous")
async def get_patient_rendez_vous(request: Request, db: Session = Depends(get_db)):
    """API pour récupérer les rendez-vous du patient"""
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    try:
        rendez_vous = db.query(RendezVous).filter(
            RendezVous.patient_id == current_user.id
        ).order_by(RendezVous.date_heure.desc()).all()
        
        result = []
        for rv in rendez_vous:
            result.append({
                "id": rv.id,
                "medecin_id": rv.medecin_id,
                "date_heure": rv.date_heure.isoformat(),
                "motif": rv.motif,
                "statut": rv.statut.value,
                "type_consultation": rv.type_consultation.value if rv.type_consultation else "Cabinet",
                "lieu": rv.lieu,
                "date_creation": rv.date_creation.isoformat() if rv.date_creation else None
            })
        
        return result
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============= PATIENT - CRÉER UN NOUVEAU RENDEZ-VOUS =============

@router.post("/api/rendez-vous/creer")
async def creer_rendez_vous(
    request: Request,
    medecin_id: int = Body(...),
    date_heure: str = Body(...), 
    motif: str = Body(...),
    type_consultation: str = Body(...),  
    lieu: str = Body(None),  
    db: Session = Depends(get_db)
):
    """Crée un nouveau rendez-vous"""
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifié")

    try:
        # ✅ VÉRIFICATION 1: Vérifier que le médecin existe (UNE SEULE FOIS)
        medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
        if not medecin:
            raise HTTPException(status_code=404, detail="Médecin non trouvé")

        # ✅ VÉRIFICATION 2: Vérifier que le médecin a une spécialité
        if not medecin.specialite:
            raise HTTPException(
                status_code=400,
                detail="Le médecin sélectionné n'a pas de spécialité définie. Veuillez contacter le support."
            )

        # ✅ VÉRIFICATION 3: Vérifier type de consultation
        types_valides = [t.value for t in TypeConsultation]
        if type_consultation not in types_valides:
            raise HTTPException(
                status_code=400,
                detail=f"Type de consultation invalide. Acceptés: {types_valides}"
            )

        # ✅ VÉRIFICATION 4: Lieu obligatoire pour Domicile
        if type_consultation == "Domicile" and not lieu:
            raise HTTPException(
                status_code=400,
                detail="Le lieu est obligatoire pour une consultation à domicile"
            )

        # ✅ VÉRIFICATION 5: Parser date avec sécurité
        try:
            date_heure_obj = datetime.fromisoformat(date_heure.replace("Z", ""))
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Format de date invalide. Utilisez: 2026-01-25T14:30"
            )

       
        specialite_final = medecin.specialite.value

        # ✅ Création du rendez-vous avec tous les paramètres validés
        nouveau_rdv = RendezVous(
            patient_id=current_user.id,
            medecin_id=medecin_id,
            date_heure=date_heure_obj,
            motif=motif,
            type_consultation=TypeConsultation(type_consultation),
            lieu=lieu if lieu else None,
            statut=StatutRendezVous.PLANIFIE,
            specialite=specialite_final
        )

        db.add(nouveau_rdv)
        db.commit()
        db.refresh(nouveau_rdv)

        return {
            "success": True,
            "message": "Rendez-vous créé avec succès",
            "rendez_vous": {
                "id": nouveau_rdv.id,
                "date_heure": nouveau_rdv.date_heure.isoformat(),
                "type_consultation": nouveau_rdv.type_consultation,
                "lieu": nouveau_rdv.lieu
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        print("❌ Erreur création RDV:", e)
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne serveur: {str(e)}"
        )
# ================== MODIFIER RENDEZ-VOUS ==================
@router.put("/api/rendez-vous/{rdv_id}")
async def modifier_rendez_vous(
    rdv_id: int,
    request: Request,
    date_heure: str = Body(None),
    motif: str = Body(None),
    type_consultation: str = Body(None),
    lieu: str = Body(None),
    statut: str = Body(None),
    db: Session = Depends(get_db)
):
    """Modifie un rendez-vous existant"""
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifié")

    try:
        rdv = db.query(RendezVous).filter(
            RendezVous.id == rdv_id,
            RendezVous.patient_id == current_user.id
        ).first()

        if not rdv:
            raise HTTPException(status_code=404, detail="Rendez-vous non trouvé")

        # Modifier date
        if date_heure:
            try:
                rdv.date_heure = datetime.fromisoformat(date_heure.replace("Z", ""))
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Format de date invalide. Utilisez: 2026-01-25T14:30"
                )

        # Modifier motif
        if motif:
            rdv.motif = motif

        # Modifier type_consultation
        if type_consultation:
            types_valides = [t.value for t in TypeConsultation]
            if type_consultation not in types_valides:
                raise HTTPException(
                    status_code=400,
                    detail=f"Type invalide. Acceptés: {types_valides}"
                )
            rdv.type_consultation = TypeConsultation(type_consultation)

        # Modifier lieu
        if lieu is not None:
            rdv.lieu = lieu

        # Modifier statut
        if statut:
            statuts_valides = [s.value for s in StatutRendezVous]
            if statut not in statuts_valides:
                raise HTTPException(
                    status_code=400,
                    detail=f"Statut invalide. Acceptés: {statuts_valides}"
                )
            rdv.statut = StatutRendezVous(statut)

        db.commit()
        db.refresh(rdv)

        return {
            "success": True,
            "message": "Rendez-vous modifié avec succès",
            "rendez_vous": {
                "id": rdv.id,
                "date_heure": rdv.date_heure.isoformat(),
                "type_consultation": rdv.type_consultation.value,
                "lieu": rdv.lieu,
                "statut": rdv.statut.value
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        print("❌ Erreur modification RDV:", e)
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne serveur: {str(e)}"
        )

# ============= PATIENT - SUPPRIMER UN RENDEZ-VOUS =============
@router.delete("/api/rendez-vous/{rdv_id}")
async def supprimer_rendez_vous(
    rdv_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Supprime un rendez-vous"""
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    try:
        rdv = db.query(RendezVous).filter(
            RendezVous.id == rdv_id,
            RendezVous.patient_id == current_user.id
        ).first()
        
        if not rdv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rendez-vous non trouvé"
            )
        
        db.delete(rdv)
        db.commit()
        
        return {
            "success": True,
            "message": "Rendez-vous supprimé avec succès"
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur suppression RDV: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============= PATIENT - INFORMATIONS PERSONNELLES =============
@router.get("/api/patient/info")
async def get_patient_info(request: Request, db: Session = Depends(get_db)):
    """
    API pour récupérer les informations du patient connecté
    Retourne un JSON avec les données du patient
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "nom": current_user.nom,
        "prenom": current_user.prenom,
        "nom_complet": current_user.nom_complet,
        "date_naissance": current_user.date_naissance.isoformat(),
        "age": current_user.age,
        "genre": current_user.genre.value if current_user.genre else None,
        "telephone": current_user.telephone,
        "photo_profil_url": current_user.photo_profil_url,
        "derniere_connexion": current_user.derniere_connexion.isoformat() if current_user.derniere_connexion else None
    }

# ============= PATIENT - INFORMATIONS COMPLÈTES =============
@router.get("/api/patient/full-info")
async def get_patient_full_info(request: Request, db: Session = Depends(get_db)):
    """
    API pour récupérer toutes les informations du patient
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    return {
        "id": current_user.id,
        "nom": current_user.nom,
        "prenom": current_user.prenom,
        "email": current_user.email,
        "date_naissance": current_user.date_naissance.isoformat() if current_user.date_naissance else None,
        "genre": current_user.genre.value if current_user.genre else None,
        "telephone": current_user.telephone,
        "adresse": current_user.adresse,
        "ville": current_user.ville,
        "code_postal": current_user.code_postal,
        "photo_profil_url": current_user.photo_profil_url,
        "groupe_sanguin": current_user.groupe_sanguin.value if current_user.groupe_sanguin else None,
        "allergies": current_user.allergies,
        "antecedents_medicaux": current_user.antecedents_medicaux,
        "traitements_en_cours": current_user.traitements_en_cours
    }

# ============= PATIENT - METTRE À JOUR INFORMATIONS =============
@router.post("/api/patient/update")
async def update_patient_info(
    request: Request,
    patient_data: dict,
    db: Session = Depends(get_db)
):
    """
    API pour mettre à jour les informations du patient
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    try:
        # Mettre à jour les champs de base
        if "nom" in patient_data and patient_data["nom"]:
            current_user.nom = patient_data["nom"].strip().capitalize()
        if "prenom" in patient_data and patient_data["prenom"]:
            current_user.prenom = patient_data["prenom"].strip().capitalize()
        if "date_naissance" in patient_data and patient_data["date_naissance"]:
            current_user.date_naissance = datetime.strptime(patient_data["date_naissance"], "%Y-%m-%d").date()
        if "telephone" in patient_data:
            current_user.telephone = patient_data["telephone"].strip()
        if "email" in patient_data and patient_data["email"]:
            current_user.email = patient_data["email"].strip().lower()
        if "adresse" in patient_data:
            current_user.adresse = patient_data["adresse"].strip()
        if "ville" in patient_data:
            current_user.ville = patient_data["ville"].strip().capitalize()
        if "code_postal" in patient_data:
            current_user.code_postal = patient_data["code_postal"].strip()
        
        # Mettre à jour les informations médicales
        if "groupe_sanguin" in patient_data:
            current_user.groupe_sanguin = patient_data["groupe_sanguin"]
        if "allergies" in patient_data:
            current_user.allergies = patient_data["allergies"].strip()
        if "antecedents_medicaux" in patient_data:
            current_user.antecedents_medicaux = patient_data["antecedents_medicaux"].strip()
        if "traitements_en_cours" in patient_data:
            current_user.traitements_en_cours = patient_data["traitements_en_cours"].strip()
        
        # Mettre à jour le mot de passe si fourni
        if "mot_de_passe" in patient_data and patient_data["mot_de_passe"]:
            current_user.mot_de_passe_hash = get_password_hash(patient_data["mot_de_passe"])
        
        # Date de mise à jour
        current_user.date_modification = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": "Informations mises à jour avec succès"
        }
        
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur de format: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        print(f"Erreur mise à jour patient: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour: {str(e)}"
        )

# ============= MESSAGERIE =============

@router.get("/api/messagerie/stats")
async def get_messagerie_stats(request: Request, db: Session = Depends(get_db)):
    """
    API pour récupérer les statistiques de la messagerie
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    # Messages non lus
    unread_messages = db.query(Message).filter(
        Message.patient_id == current_user.id,
        Message.statut == StatutMessage.ENVOYE,
        Message.de_medecin == True
    ).count()
    
    # Total des messages
    total_messages = db.query(Message).filter(
        Message.patient_id == current_user.id
    ).count()
    
    # Nombre de conversations distinctes
    conversations_count = db.query(func.count(func.distinct(Message.medecin_id))).filter(
        Message.patient_id == current_user.id
    ).scalar() or 0
    
    return {
        "unread_messages": unread_messages,
        "total_messages": total_messages,
        "conversations_count": conversations_count
    }

# ============= PATIENT - LISTE DES CONVERSATIONS =============
@router.get("/api/messagerie/conversations")    
async def get_conversations_list(request: Request, db: Session = Depends(get_db)):
    """
    API pour récupérer la liste des conversations
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    # Sous-requête pour le dernier message de chaque médecin
    subquery = db.query(
        Message.medecin_id,
        func.max(Message.date_envoi).label('max_date')
    ).filter(
        Message.patient_id == current_user.id
    ).group_by(
        Message.medecin_id
    ).subquery()
    
    # Requête principale
    conversations = db.query(
        Medecin.id,
        Medecin.nom,
        Medecin.prenom,
        Medecin.photo_profil_url,
        Medecin.specialite,
        Message.contenu.label('last_message'),
        Message.date_envoi.label('last_message_time'),
        func.count(Message.id).filter(
            Message.statut == StatutMessage.ENVOYE,
            Message.de_medecin == True
        ).label('unread_count')
    ).join(
        subquery,
        (Medecin.id == subquery.c.medecin_id)
    ).join(
        Message,
        (Message.medecin_id == Medecin.id) & (Message.date_envoi == subquery.c.max_date)
    ).filter(
        Message.patient_id == current_user.id
    ).group_by(
        Medecin.id, Medecin.nom, Medecin.prenom, Medecin.photo_profil_url, 
        Medecin.specialite, Message.contenu, Message.date_envoi
    ).order_by(
        Message.date_envoi.desc()
    ).all()
    
    result = []
    for conv in conversations:
        result.append({
            "medecin_id": conv.id,
            "medecin_name": f"Dr. {conv.prenom} {conv.nom}",
            "medecin_photo": conv.photo_profil_url,
            "specialite": conv.specialite.value if conv.specialite else "Non spécifié",
            "last_message": (conv.last_message[:50] + "...") if conv.last_message and len(conv.last_message) > 50 else conv.last_message,
            "last_message_time": conv.last_message_time.strftime("%d/%m/%Y %H:%M") if conv.last_message_time else "",
            "unread": conv.unread_count or 0
        })
    
    return result

# ============= PATIENT - MESSAGES D'UNE CONVERSATION =============
@router.get("/api/messagerie/conversation/{medecin_id}")
async def get_conversation_messages(medecin_id: int, request: Request, db: Session = Depends(get_db)):
    """
    API pour récupérer les messages d'une conversation et les infos du médecin
    """
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )

    # Récupérer les messages
    messages = db.query(
        Message.id,
        Message.contenu,
        Message.date_envoi,
        Message.de_medecin,
        Message.statut
    ).filter(
        Message.patient_id == current_user.id,
        Message.medecin_id == medecin_id
    ).order_by(
        Message.date_envoi.asc()
    ).all()

    # Marquer comme lus
    db.query(Message).filter(
        Message.patient_id == current_user.id,
        Message.medecin_id == medecin_id,
        Message.statut == StatutMessage.ENVOYE,
        Message.de_medecin == True
    ).update({"statut": StatutMessage.LU})
    db.commit()

    result = []
    for msg in messages:
        result.append({
            "id": msg.id,
            "contenu": msg.contenu,
            "date_envoi": msg.date_envoi.strftime("%d/%m/%Y %H:%M"),
            "expediteur_type": "medecin" if msg.de_medecin else "patient",
            "statut": msg.statut
        })

    # Infos du médecin
    medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
    medecin_data = None
    if medecin:
        medecin_data = {
            "id": medecin.id,
            "nom": medecin.nom,
            "prenom": medecin.prenom,
            "specialite": medecin.specialite.value if medecin.specialite else "Non spécifié",
            "photo": medecin.photo_profil_url,
            "is_online": getattr(medecin, "is_online", False)
        }

    return {
        "messages": result,
        "medecin": medecin_data
    }

# ============= PATIENT - ENVOYER UN MESSAGE =============
@router.post("/api/messagerie/send")
async def send_message_api(
    request: Request,
    message_data: dict = Body(...),
    db: Session = Depends(get_db)
):

    """
    API pour envoyer un message
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    medecin_id = message_data.get("medecin_id")
    contenu = message_data.get("contenu")
    
    if not medecin_id or not contenu:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Données manquantes"
        )
    
    # Vérifier que le médecin existe
    medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
    if not medecin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Médecin non trouvé"
        )
    
    # Créer le message
    message = Message(
        patient_id=current_user.id,
        medecin_id=medecin_id,
        sujet="Message du patient",
        contenu=contenu.strip(),
        de_medecin=False,
        statut= StatutMessage.ENVOYE,
        date_envoi=datetime.utcnow()
    )
    
    try:
        db.add(message)
        db.commit()
        db.refresh(message)
        
        return {
            "success": True,
            "message_id": message.id,
            "timestamp": message.date_envoi.isoformat()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'envoi du message: {str(e)}"
        )

# ============= MÉDECINS =============

@router.get("/api/medecins")
async def get_all_medecins(request: Request, db: Session = Depends(get_db)):
    """
    API pour récupérer la liste de tous les médecins
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    medecins = db.query(Medecin).filter(Medecin.est_actif == True).all()
    
    result = []
    for medecin in medecins:
        result.append({
            "id": medecin.id,
            "nom": medecin.nom,
            "prenom": medecin.prenom,
            "specialite": medecin.specialite.value if medecin.specialite else "Non spécifié",
            "annees_experience": medecin.annees_experience,
            "email": medecin.email,
            "prix_consultation": medecin.prix_consultation,
            "photo": medecin.photo_profil_url,
            "telephone": medecin.telephone,
            "description": medecin.biographie
        })
    
    return result

# ============= DÉTAIL MÉDECIN =============
@router.get("/api/medecins/{medecin_id}")
async def get_medecin_detail(medecin_id: int, request: Request, db: Session = Depends(get_db)):
    """
    API pour récupérer les détails d'un médecin
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    medecin = db.query(Medecin).filter(
        Medecin.id == medecin_id, 
        Medecin.est_actif == True
    ).first()
    
    if not medecin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Médecin non trouvé"
        )
    
    return {
        "id": medecin.id,
        "nom": medecin.nom,
        "prenom": medecin.prenom,
        "specialite": medecin.specialite.value if medecin.specialite else "Non spécifié",
        "annees_experience": medecin.annees_experience,
        "email": medecin.email,
        "prix_consultation": medecin.prix_consultation,
        "photo": medecin.photo_profil_url,
        "telephone": medecin.telephone,
        "description": medecin.biographie,
        "adresse_cabinet": medecin.adresse,
        "ville_cabinet": medecin.ville,
        "code_postal_cabinet": medecin.code_postal,
        "langues": medecin.langues
    }

# ============= DOCUMENTS =============

@router.get("/api/documents")
async def get_patient_documents(request: Request, db: Session = Depends(get_db)):
    """
    API pour récupérer les documents du patient
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    documents = db.query(Document).filter(
        Document.patient_id == current_user.id
    ).order_by(Document.date_upload.desc()).all()
    
    result = []
    for doc in documents:
        # CORRECTION: Construire l'URL absolue pour le serveur
        fichier_url = doc.fichier_url
        if fichier_url and not fichier_url.startswith("http"):
            # Si c'est un chemin relatif, ajouter le host
            base_url = str(request.base_url).rstrip('/')
            fichier_url = f"{base_url}{fichier_url}"
        
        result.append({
            "id": doc.id,
            "titre": doc.titre,
            "type_document": doc.type_document,
            "description": doc.description,
            "date_document": doc.date_document.isoformat() if doc.date_document else None,
            "date_upload": doc.date_upload.isoformat() if doc.date_upload else None,
            "fichier_url": fichier_url,
            "fichier_nom": doc.titre
        })
    
    return result

# ============= UPLOAD DOCUMENT =============
@router.post("/api/documents/upload")
async def upload_document_api(
    request: Request,
    titre: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """API pour téléverser un document - Version CORRIGÉE avec chemin absolu"""
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    try:
       
        BASE_DIR = Path(__file__).resolve().parent  
        UPLOAD_BASE_DIR = BASE_DIR  / "static" / "uploads"
        
        # Répertoire spécifique aux documents
        documents_dir = UPLOAD_BASE_DIR / "documents"
        documents_dir.mkdir(parents=True, exist_ok=True)
        
        # Générer un nom de fichier unique
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = file.filename.replace(" ", "_").replace("/", "_")
        filename = f"doc_{current_user.id}_{timestamp}_{safe_filename}"
        file_path = documents_dir / filename
        
        # Sauvegarder le fichier
        content = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        
        fichier_url = f"/static/uploads/documents/{filename}"
        
        # Créer l'entrée document
        document = Document(
            patient_id=current_user.id,
            titre=titre,
            description=description,
            type_document=file.content_type,
            fichier_url=fichier_url,
            date_upload=datetime.utcnow(),
            date_document=datetime.utcnow().date()
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        return {
            "success": True,
            "document_id": document.id,
            "filename": filename,
            "url": fichier_url
        }
        
    except Exception as e:
        db.rollback()
        print(f"Erreur upload document: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du téléversement: {str(e)}"
        )

# ============= SUPPRIMER DOCUMENT =============
@router.delete("/api/documents/{document_id}")
async def delete_document_api(
    document_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """API pour supprimer un document"""
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    try:
        # Récupérer le document
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.patient_id == current_user.id
        ).first()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document non trouvé"
            )
        
        
        uploads_dir = Path(__file__).resolve().parent / "static" / "uploads" / "documents"
        uploads_dir.mkdir(parents=True, exist_ok=True)

        
        if document.fichier_url and document.fichier_url.startswith("/static/uploads/"):
            # Extraire le nom de fichier de l'URL
            filename = document.fichier_url.split("/")[-1]
            #file_path = UPLOAD_BASE_DIR / "documents" / filename
            file_path = uploads_dir / filename
            
            # Vérifier et supprimer le fichier physique
            if file_path.exists():
                try:
                    file_path.unlink()
                    print(f"✅ Fichier supprimé: {file_path}")
                except Exception as e:
                    print(f"⚠️ Impossible de supprimer le fichier physique: {e}")
        
        # Supprimer l'entrée de la base de données
        db.delete(document)
        db.commit()
        
        return {
            "success": True,
            "message": "Document supprimé avec succès"
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur suppression document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression: {str(e)}"
        )
        
 #============ VUE DÉTAILLÉE D'UN DOCUMENT ============= 
@router.get("/api/documents/{document_id}/view")
async def view_document_api(
    document_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """API pour récupérer les infos d'un document spécifique"""
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.patient_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document non trouvé"
        )
    
    # Construire l'URL complète
    base_url = str(request.base_url).rstrip('/')
    fichier_url = f"{base_url}{document.fichier_url}"
    
    return {
        "id": document.id,
        "titre": document.titre,
        "description": document.description,
        "type_document": document.type_document,
        "date_upload": document.date_upload.isoformat() if document.date_upload else None,
        "fichier_url": fichier_url,
        "fichier_nom": document.titre
    }
    
    
# ============= ORDONNANCES =============

@router.get("/api/ordonnances")
async def get_patient_ordonnances(request: Request, db: Session = Depends(get_db)):
    """
    API pour récupérer les ordonnances du patient
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    ordonnances = db.query(Ordonnance).filter(
        Ordonnance.patient_id == current_user.id
    ).order_by(Ordonnance.date_emission.desc()).all()
    
    result = []
    for ord in ordonnances:
        result.append({
            "id": ord.id,
            "medecin_nom": ord.medecin_nom,
            "date_emission": ord.date_emission.isoformat() if ord.date_emission else None,
            "medicaments": ord.medicaments,
            "posologie": ord.posologie,
            "duree_traitement": ord.duree_traitement,
            "statut": ord.statut,
            "date_expiration": ord.date_expiration.isoformat() if ord.date_expiration else None,
            "fichier_url": ord.fichier_url
        })
    
    return result

# ============= NOTIFICATIONS =============

@router.get("/api/notifications")
async def get_notifications_count(request: Request, db: Session = Depends(get_db)):
    """
    API pour récupérer le nombre de notifications (messages non lus)
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        return {"unread_messages": 0}
    
    unread_count = db.query(Message).filter(
        Message.patient_id == current_user.id,
        Message.statut == StatutMessage.ENVOYE,
        Message.de_medecin == True
    ).count()
    
    return {"unread_messages": unread_count}




# Route optimisée pour le dashboard
@router.get("/api/dashboard/optimized")
async def get_optimized_dashboard(request: Request, db: Session = Depends(get_db)):
    """
    API optimisée pour le dashboard - Toutes les données en un seul appel
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    try:
        # Utiliser des requêtes parallèles avec asyncio
        import asyncio
        
        # Toutes les requêtes en parallèle
        rendez_vous_count = db.query(RendezVous).filter(
            RendezVous.patient_id == current_user.id,
            RendezVous.date_heure > datetime.utcnow(),
            RendezVous.statut.in_(["Planifié", "Confirmé"])
        ).count()
        
        documents_count = db.query(Document).filter(
            Document.patient_id == current_user.id
        ).count()
        
        # Messages non lus
        unread_messages = db.query(Message).filter(
            Message.patient_id == current_user.id,
            Message.statut == StatutMessage.ENVOYE,
            Message.de_medecin == True
        ).count()
        
        total_messages = db.query(Message).filter(
            Message.patient_id == current_user.id
        ).count()
        
        # Récupérer quelques médecins pour affichage rapide
        recent_medecins = db.query(Medecin).filter(
            Medecin.est_actif == True
        ).limit(3).all()
        
        medecins_list = []
        for medecin in recent_medecins:
            medecins_list.append({
                "id": medecin.id,
                "nom": medecin.nom,
                "prenom": medecin.prenom,
                "specialite": medecin.specialite.value if medecin.specialite else "Non spécifié",
                "photo": medecin.photo_profil_url
            })
        
        return {
            "patient": {
                "nom_complet": current_user.nom_complet,
                "photo_profil_url": current_user.photo_profil_url
            },
            "stats": {
                "rendez_vous": rendez_vous_count,
                "documents": documents_count,
                "messages": total_messages,
                "unread_messages": unread_messages
            },
            "recent_medecins": medecins_list,
            "quick_links": [
                {
                    "icon": "fa-calendar-plus",
                    "title": "Prendre RDV",
                    "description": "Réserver une consultation",
                    "link": "/rendez-vous"
                },
                {
                    "icon": "fa-file-upload",
                    "title": "Téléverser",
                    "description": "Ajouter un document",
                    "link": "/documents"
                },
                {
                    "icon": "fa-comments",
                    "title": "Messagerie",
                    "description": "Contacter un médecin",
                    "link": "/messagerie"
                }
            ]
        }
        
    except Exception as e:
        print(f"❌ Erreur dashboard optimisé: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )

# Route de débogage pour les messages
@router.get("/api/debug/messages")
async def debug_messages(request: Request, db: Session = Depends(get_db)):
    """
    Route de débogage pour vérifier les messages
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        return {"error": "Non authentifié"}
    
    # Vérifier la structure de la table Message
    try:
        # Tester un insert
        test_message = Message(
            patient_id=current_user.id,
            medecin_id=1,  # ID du premier médecin
            sujet="Test",
            contenu="Message de test",
            de_medecin=False,
            statut= StatutMessage.ENVOYE,
            date_envoi=datetime.utcnow()
        )
        
        db.add(test_message)
        db.flush()  # Ne pas commit pour ne pas polluer la base
        
        return {
            "status": "success",
            "message": "Structure Message OK",
            "test_data": {
                "patient_id": test_message.patient_id,
                "medecin_id": test_message.medecin_id,
                "statut": test_message.statut
            }
        }
        
    except Exception as e:
        db.rollback()
        return {
            "status": "error",
            "error": str(e),
            "message_structure": str(Message.__table__.columns.keys())
        }

# Route pour vérifier un médecin spécifique
@router.get("/api/debug/medecin/{medecin_id}")
async def debug_medecin(medecin_id: int, db: Session = Depends(get_db)):
    """
    Vérifier qu'un médecin existe
    """
    medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
    
    if not medecin:
        return {
            "exists": False,
            "message": f"Médecin avec ID {medecin_id} non trouvé"
        }
    
    return {
        "exists": True,
        "medecin": {
            "id": medecin.id,
            "nom": medecin.nom,
            "prenom": medecin.prenom,
            "email": medecin.email,
            "est_actif": medecin.est_actif
        }
    }

# Route simplifiée pour envoyer un message (debug)
@router.post("/api/simple-message")
async def send_simple_message(
    request: Request,
    medecin_id: int = Body(...),
    message: str = Body(...),
    db: Session = Depends(get_db)
):
    """
    Version simplifiée pour déboguer l'envoi de message
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    # Vérifier le médecin
    medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
    if not medecin:
        raise HTTPException(status_code=404, detail="Médecin non trouvé")
    
    try:
        # Créer le message avec des valeurs simples
        new_message = Message(
            patient_id=current_user.id,
            medecin_id=medecin_id,
            sujet="Message du patient",
            contenu=message,
            de_medecin=False,
            statut= StatutMessage.ENVOYE,
            date_envoi=datetime.utcnow()
        )
        
        db.add(new_message)
        db.commit()
        
        return {
            "success": True,
            "message": "Message envoyé avec succès",
            "message_id": new_message.id
        }
        
    except Exception as e:
        db.rollback()
        import traceback
        traceback_str = traceback.format_exc()
        print(f"❌ Erreur détaillée: {traceback_str}")
        
        raise HTTPException(
            status_code=500,
            detail=f"Erreur: {str(e)}"
        )


# ============= ROUTES EXISTANTES =============

@router.get("/api/check-auth")
async def check_auth(request: Request, db: Session = Depends(get_db)):
    """
    Vérifie si l'utilisateur est authentifié
    Utile pour les appels AJAX
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if current_user:
        return {
            "authenticated": True,
            "patient_id": current_user.id,
            "nom_complet": current_user.nom_complet
        }
    else:
        return {
            "authenticated": False
        }

@router.get("/test-db")
async def test_database(db: Session = Depends(get_db)):
    """
    Route de test pour vérifier la connexion à la base de données
    Affiche le nombre de patients enregistrés
    """
    try:
        patients_count = db.query(Patient).count()
        patients = db.query(Patient).limit(5).all()
        
        patients_list = [
            {
                "id": p.id,
                "nom_complet": p.nom_complet,
                "email": p.email,
                "est_actif": p.est_actif
            }
            for p in patients
        ]
        
        return {
            "status": "success",
            "message": "✅ Connexion à la base de données réussie",
            "nombre_patients": patients_count,
            "patients_exemples": patients_list
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"❌ Erreur de connexion: {str(e)}"
        }
        
        
#Route pour uploader une photo de profil patient

@router.post("/api/patient/upload-photo")
async def upload_photo(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload photo de profil - Version CORRIGÉE"""
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifié")

    # Créer le répertoire avec le chemin correct
    uploads_dir = Path(__file__).resolve().parent / "static" / "uploads" / "patients"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    # Générer un nom de fichier unique avec timestamp
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
    file_extension = Path(file.filename).suffix.lower()
    filename = f"patient_{current_user.id}_{timestamp}{file_extension}"
    file_path = uploads_dir / filename

    try:
        # Sauvegarder le fichier
        content = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(content)

        # Construire l'URL avec cache busting
        photo_url = f"/static/uploads/patients/{filename}"
        
        # Mettre à jour la base de données
        current_user.photo_profil_url = photo_url
        db.commit()
        db.refresh(current_user)

        return {
            "success": True,
            "photo_url": photo_url,
            "message": "Photo mise à jour avec succès"
        }

    except Exception as e:
        db.rollback()
        print(f"Erreur upload photo: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'upload: {str(e)}"
        )

#Route pour envoyer un message au médecin (version formulaire)
@router.post("/api/messages/send")
async def send_message_form(
    request: Request,
    medecin_id: int = Form(...),
    contenu: str = Form(...),
    db: Session = Depends(get_db)
):
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifié")

    medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
    if not medecin:
        raise HTTPException(status_code=404, detail="Médecin introuvable")

    message = Message(
    patient_id=current_user.id,
    medecin_id=medecin_id,
    sujet="Nouveau message",
    contenu=contenu,
    de_medecin=False,
    statut= StatutMessage.ENVOYE,
    date_envoi=datetime.utcnow()
    )


    db.add(message)
    db.commit()

    return {"status": "ok"}

#Route pour compléter le profil patient
@router.post("/api/patient/completer-profil")
async def completer_profil(
    request: Request,
    telephone: str = Form(None),
    adresse: str = Form(None),
    ville: str = Form(None),
    code_postal: str = Form(None),
    db: Session = Depends(get_db)
):
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifié")

    if telephone: current_user.telephone = telephone
    if adresse: current_user.adresse = adresse
    if ville: current_user.ville = ville
    if code_postal: current_user.code_postal = code_postal

    db.commit()

    return {"status": "ok"}

#Routes pour le chat IA
@router.get("/api/chat-ia")
async def get_chat_ia(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifié")
    return {"status": "ok"}


@router.post("/api/chat-ia/message")
async def send_chat_message(
    request: Request,
    message_data: dict = Body(...),
    db: Session = Depends(get_db)
):
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    user_message = message_data.get("message", "").strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="Message vide")
    
    try:
        context = {
            "patient_age": current_user.age,
            "patient_genre": current_user.genre.value if current_user.genre else "Non spécifié",
            "allergies": current_user.allergies or "Aucune connue",
            "traitements": current_user.traitements_en_cours or "Aucun"
        }
        
        ia_response = get_ia_response(user_message, context)
        
        return {
            "success": True,
            "user_message": user_message,
            "ia_response": ia_response,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


def get_ia_response(message: str, context: dict) -> str:
    """Génère une réponse du chat IA"""
    responses = {
        "symptôme": "Consultez un médecin. En attendant, hydratez-vous et reposez-vous.",
        "médicament": "Consultez votre médecin ou pharmacien pour des conseils adaptés.",
        "allergie": f"Vos allergies: {context.get('allergies')}. Évitez ces allergènes.",
        "traitement": f"Continuez: {context.get('traitements')}",
        "conseil": "Alimentation équilibrée, exercice, sommeil suffisant.",
        "default": "Assistant IA pour infos générales. Consultez un professionnel pour diagnostics."
    }
    
    message_lower = message.lower()
    for keyword, response in responses.items():
        if keyword in message_lower:
            return response
    return responses["default"] 



# ============= FONCTION POUR VERIFIER L'AUTH (RAPIDE) =============

def verify_token(token: str):
    """Vérifie un token JWT rapidement"""
    try:
        if token.startswith("Bearer "):
            token = token[7:]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None


# ============= INFORMATIONS MÉDICALES PATIENT =============
@router.get("/api/patient/medical-info")
async def get_patient_medical_info(request: Request, db: Session = Depends(get_db)):
    """
    API pour récupérer UNIQUEMENT les informations médicales du patient
    (Sans les infos sensibles de connexion)
    """
    # Vérification rapide du token
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    patient = get_user_by_email(db, email)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
    
    # Retourner uniquement les infos médicales
    return {
        "allergies": patient.allergies or "",
        "antecedents_medicaux": patient.antecedents_medicaux or "",
        "antecedents_familiaux": patient.antecedents_familiaux or "",
        "traitements_en_cours": patient.traitements_en_cours or "",
        "groupe_sanguin": patient.groupe_sanguin.value if patient.groupe_sanguin else "",
        "numero_securite_sociale": patient.numero_securite_sociale or "",
        "mutuelle_nom": patient.mutuelle_nom or "",
        "mutuelle_numero": patient.mutuelle_numero or "",
        "medecin_traitant_nom": patient.medecin_traitant_nom or "",
        "medecin_traitant_telephone": patient.medecin_traitant_telephone or ""
    }

# ============= RÉCUPÉRER INFORMATIONS MÉDICALES VIA ASYNC =============

async def get_medical_info(request: Request, db: Session = Depends(get_db)):
    """
    Version alternative pour récupérer les infos médicales
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        return {"success": False, "message": "Non authentifié"}
    
    return {
        "success": True,
        "data": {
            "allergies": current_user.allergies or "",
            "antecedents_medicaux": current_user.antecedents_medicaux or "",
            "antecedents_familiaux": current_user.antecedents_familiaux or "",
            "traitements_en_cours": current_user.traitements_en_cours or "",
            "groupe_sanguin": current_user.groupe_sanguin.value if current_user.groupe_sanguin else "",
            "numero_securite_sociale": current_user.numero_securite_sociale or "",
            "mutuelle_nom": current_user.mutuelle_nom or "",
            "mutuelle_numero": current_user.mutuelle_numero or "",
            "medecin_traitant_nom": current_user.medecin_traitant_nom or "",
            "medecin_traitant_telephone": current_user.medecin_traitant_telephone or ""
        }
    }
    
    
# ============= METTRE À JOUR INFORMATIONS MÉDICALES PATIENT =============
@router.post("/api/patient/update-medical")
async def update_patient_medical_info(
    request: Request,
    patient_data: dict,
    db: Session = Depends(get_db)
):
    """
    API pour mettre à jour UNIQUEMENT les informations médicales
    (Différent de /api/patient/update qui met à jour toutes les infos)
    """
    # Vérification rapide du token
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    patient = get_user_by_email(db, email)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
    
    try:
        # Mettre à jour uniquement les champs médicaux
        if "allergies" in patient_data:
            patient.allergies = patient_data["allergies"].strip()
        if "antecedents_medicaux" in patient_data:
            patient.antecedents_medicaux = patient_data["antecedents_medicaux"].strip()
        if "antecedents_familiaux" in patient_data:
            patient.antecedents_familiaux = patient_data["antecedents_familiaux"].strip()
        if "traitements_en_cours" in patient_data:
            patient.traitements_en_cours = patient_data["traitements_en_cours"].strip()
        if "groupe_sanguin" in patient_data and patient_data["groupe_sanguin"]:
            patient.groupe_sanguin = patient_data["groupe_sanguin"]
        if "numero_securite_sociale" in patient_data:
            patient.numero_securite_sociale = patient_data["numero_securite_sociale"].strip()
        if "mutuelle_nom" in patient_data:
            patient.mutuelle_nom = patient_data["mutuelle_nom"].strip()
        if "mutuelle_numero" in patient_data:
            patient.mutuelle_numero = patient_data["mutuelle_numero"].strip()
        if "medecin_traitant_nom" in patient_data:
            patient.medecin_traitant_nom = patient_data["medecin_traitant_nom"].strip()
        if "medecin_traitant_telephone" in patient_data:
            patient.medecin_traitant_telephone = patient_data["medecin_traitant_telephone"].strip()
        
        patient.date_modification = datetime.utcnow()
        db.commit()
        
        return {
            "success": True,
            "message": "Informations médicales mises à jour avec succès"
        }
        
    except Exception as e:
        db.rollback()
        print(f"Erreur mise à jour infos médicales: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour: {str(e)}"
        )



# ============= SUPPRIMER COMPTE PATIENT =============
@router.delete("/api/patient/delete-account")
async def delete_patient_account(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Supprime le compte du patient (soft delete)
    """
    # Vérification rapide du token
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    patient = get_user_by_email(db, email)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
    
    try:
        # Soft delete: désactiver le compte au lieu de le supprimer
        patient.est_actif = False
        patient.email = f"deleted_{patient.id}_{patient.email}"  # Empêche la réutilisation
        patient.date_modification = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": "Compte désactivé avec succès"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression: {str(e)}"
        )
        
        
 # ============= ROUTES DOSSIER MÉDICAL =============

@router.get("/api/dossier-medical")
async def get_dossier_medical_complet(request: Request, db: Session = Depends(get_db)):
    """API UNIFIÉE pour récupérer TOUTES les données du dossier médical"""
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    # 1. Données du patient (table patients)
    allergies = current_user.allergies or ""
    antecedents_medicaux = current_user.antecedents_medicaux or ""
    antecedents_familiaux = current_user.antecedents_familiaux or ""
    groupe_sanguin = current_user.groupe_sanguin.value if current_user.groupe_sanguin else ""
    medecin_traitant = current_user.medecin_traitant_nom or ""
    numero_securite_sociale = current_user.numero_securite_sociale or ""
    
    # 2. Historique (table dossiers_medicaux)
    dossiers_count = db.query(DossierMedical).filter(
        DossierMedical.patient_id == current_user.id
    ).count()
    
    # 3. Récupérer quelques consultations récentes
    consultations_recentes = db.query(DossierMedical, Medecin).outerjoin(
        Medecin, DossierMedical.medecin_id == Medecin.id
    ).filter(
        DossierMedical.patient_id == current_user.id
    ).order_by(
        DossierMedical.date_consultation.desc()
    ).limit(5).all()
    
    consultations_list = []
    for dossier, medecin in consultations_recentes:
        consultations_list.append({
            "date": dossier.date_consultation.strftime("%d/%m/%Y") if dossier.date_consultation else "",
            "medecin": f"Dr. {medecin.prenom} {medecin.nom}" if medecin else "Médecin",
            "specialite": medecin.specialite.value if medecin and medecin.specialite else "",
            "motif": dossier.motif_consultation or "",
            "diagnostic": dossier.diagnostic or ""
        })
    
    # 4. ✅ Récupérer les documents médicaux du patient (depuis la table documents)
    documents = db.query(Document).filter(
        Document.patient_id == current_user.id
    ).order_by(Document.date_upload.desc()).all()
    
    documents_list = []
    for doc in documents:
        documents_list.append({
            "id": doc.id,
            "titre": doc.titre,
            "type_document": doc.type_document,
            "date_upload": doc.date_upload.strftime("%d/%m/%Y") if doc.date_upload else "",
            "description": doc.description or "",
            "fichier_url": doc.fichier_url
        })
    
    # 5. ✅ Récupérer les ordonnances du patient (depuis la table ordonnances)
    ordonnances = db.query(Ordonnance).filter(
        Ordonnance.patient_id == current_user.id
    ).order_by(Ordonnance.date_emission.desc()).all()
    
    ordonnances_list = []
    for ord in ordonnances:
        ordonnances_list.append({
            "id": ord.id,
            "medecin_nom": ord.medecin_nom,
            "date_emission": ord.date_emission.strftime("%d/%m/%Y") if ord.date_emission else "",
            "medicaments": ord.medicaments,
            "posologie": ord.posologie,
            "statut": ord.statut or "Active",
            "fichier_url": ord.fichier_url
        })
    
    return {
        "success": True,
        "data": {
            # Infos médicales
            "allergies": allergies,
            "allergies_count": len([a for a in allergies.split(",") if a.strip()]) if allergies else 0,
            "antecedents_medicaux": antecedents_medicaux,
            "antecedents_familiaux": antecedents_familiaux,
            "groupe_sanguin": groupe_sanguin,
            "traitements_en_cours": current_user.traitements_en_cours or "",
            "medecin_traitant": medecin_traitant,
            "numero_securite_sociale": numero_securite_sociale,
            
            # Statistiques
            "consultations_count": dossiers_count,
            "documents_count": len(documents_list),
            "ordonnances_count": len(ordonnances_list),
            
            # Détails
            "consultations_recentes": consultations_list,
            "documents": documents_list,
            "ordonnances": ordonnances_list,
            "has_data": bool(allergies or antecedents_medicaux or antecedents_familiaux or groupe_sanguin)
        }
    }

@router.get("/api/dossier-medical/historique-detaille")
async def get_historique_detaille(request: Request, db: Session = Depends(get_db)):
    """API pour l'historique détaillé"""
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    dossiers = db.query(DossierMedical, Medecin).outerjoin(
        Medecin, DossierMedical.medecin_id == Medecin.id
    ).filter(
        DossierMedical.patient_id == current_user.id
    ).order_by(DossierMedical.date_consultation.desc()).all()
    
    result = []
    for dossier, medecin in dossiers:
        result.append({
            "id": dossier.id,
            "date": dossier.date_consultation.isoformat() if dossier.date_consultation else None,
            "date_formatee": dossier.date_consultation.strftime("%d/%m/%Y %H:%M") if dossier.date_consultation else "",
            "medecin_nom": f"Dr. {medecin.prenom} {medecin.nom}" if medecin else "Médecin",
            "medecin_specialite": medecin.specialite.value if medecin and medecin.specialite else "",
            "motif": dossier.motif_consultation or "",
            "diagnostic": dossier.diagnostic or "",
            "prescription": dossier.prescription or "",
            "notes": dossier.notes_medecin or ""
        })
    
    return {
        "success": True,
        "total": len(result),
        "consultations": result
    }