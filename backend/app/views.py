
# views.py
from fastapi import APIRouter, Request, Depends, HTTPException, status, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse, FileResponse, Response
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, desc
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pathlib import Path
from fastapi import UploadFile, File
from app.models import Message, Medecin, Admin, MessageAdminPatient, Partenaire, Photo, RendezVous, Document, Ordonnance, DossierMedical, Specialite, StatutMessage, StatutRendezVous, TypeConsultation, Consultation, AnalysePatient, InjectionPatient, NotificationReception, NotificationBroadcast
import secrets
from fastapi import Body
import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
import json
from urllib import request as urllib_request
from urllib import error as urllib_error
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
#from fastapi import APIRouter, Request

# Imports locaux
from app.database import get_db, Base, engine
from app.models import Patient

# Configuration
BASE_DIR = Path(__file__).resolve().parent
# Charger les variables d'environnement (backend/.env)
load_dotenv(dotenv_path=BASE_DIR.parent / ".env")

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
    VÃ©rifie si le mot de passe en clair correspond au hash
    
    Args:
        plain_password: Le mot de passe en clair
        hashed_password: Le mot de passe hashÃ© dans la base de donnÃ©es
    
    Returns:
        bool: True si le mot de passe correspond, False sinon
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Erreur lors de la vÃ©rification du mot de passe: {e}")
        return False


def get_password_hash(password: str) -> str:
    """
    Hash un mot de passe avec bcrypt
    
    Args:
        password: Le mot de passe en clair
    
    Returns:
        str: Le mot de passe hashÃ©
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    CrÃ©e un token JWT pour l'authentification
    
    Args:
        data: Les donnÃ©es Ã  encoder dans le token
        expires_delta: DurÃ©e de validitÃ© du token
    
    Returns:
        str: Le token JWT encodÃ©
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
    RÃ©cupÃ¨re un patient par son email dans la base de donnÃ©es
    
    Args:
        db: Session de base de donnÃ©es
        email: Email du patient
    
    Returns:
        Patient: L'objet Patient si trouvÃ©, None sinon
    """
    try:
        return db.query(Patient).filter(Patient.email == email.lower().strip()).first()
    except Exception as e:
        print(f"Erreur lors de la rÃ©cupÃ©ration du patient: {e}")
        return None


def authenticate_user(db: Session, email: str, password: str) -> Patient:
    """
    Authentifie un utilisateur en vÃ©rifiant son email et mot de passe
    
    Args:
        db: Session de base de donnÃ©es
        email: Email du patient
        password: Mot de passe en clair
    
    Returns:
        Patient: L'objet Patient si authentification rÃ©ussie, None sinon
    """
    # RÃ©cupÃ©rer le patient par email
    patient = get_user_by_email(db, email)
    
    # VÃ©rifier si le patient existe
    if not patient:
        print(f"Patient non trouvÃ© avec l'email: {email}")
        return None
    
    # VÃ©rifier le mot de passe
    if not verify_password(password, patient.mot_de_passe_hash):
        print(f"Mot de passe incorrect pour l'email: {email}")
        return None
    
    # VÃ©rifier si le compte est actif
    if not patient.est_actif:
        print(f"Compte inactif pour l'email: {email}")
        return None
    
    return patient


def get_current_user_from_cookie(request: Request, db: Session) -> Patient:
    """
    RÃ©cupÃ¨re l'utilisateur actuel depuis le cookie JWT
    
    Args:
        request: RequÃªte FastAPI
        db: Session de base de donnÃ©es
    
    Returns:
        Patient: L'objet Patient si authentifiÃ©, None sinon
    """
    token = request.cookies.get("access_token")
    
    if not token:
        return None
    
    try:
        # Retirer le prÃ©fixe "Bearer " si prÃ©sent
        if token.startswith("Bearer "):
            token = token[7:]
        
        # DÃ©coder le token JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            return None
        
        # RÃ©cupÃ©rer le patient depuis la base de donnÃ©es
        patient = get_user_by_email(db, email)
        return patient
        
    except JWTError as e:
        print(f"Erreur JWT: {e}")
        return None
    except Exception as e:
        print(f"Erreur lors de la rÃ©cupÃ©ration de l'utilisateur: {e}")
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


def send_consultation_summary_email(recipient_email: str, payload: dict):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM") or smtp_user

    if not all([smtp_host, smtp_user, smtp_password, smtp_from]):
        raise RuntimeError("Configuration SMTP manquante (SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM)")

    msg = EmailMessage()
    msg["Subject"] = "RÃ©capitulatif de votre demande de rendez-vous - Dokira"
    msg["From"] = smtp_from
    msg["To"] = recipient_email
    msg.set_content(
        f"""Bonjour {payload['visiteur_prenom']} {payload['visiteur_nom']},

Votre demande de rendez-vous a bien Ã©tÃ© enregistrÃ©e.

MÃ©decin: {payload['medecin_nom']}
SpÃ©cialitÃ©: {payload['specialite']}
Date et heure souhaitÃ©es: {payload['date_heure']}
Motif: {payload['motif_consultation']}
TÃ©lÃ©phone: {payload['visiteur_telephone']}
Email: {payload['visiteur_email']}

Merci d'avoir utilisÃ© Dokira.
"""
    )

    with smtplib.SMTP(smtp_host, smtp_port) as smtp:
        smtp.starttls()
        smtp.login(smtp_user, smtp_password)
        smtp.send_message(msg)


def send_rdv_update_email(
    recipient_email: str,
    recipient_name: str,
    actor_label: str,
    medecin_name: str,
    old_dt: datetime,
    new_dt: datetime,
    motif: str = ""
):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM") or smtp_user

    if not all([smtp_host, smtp_user, smtp_password, smtp_from]):
        return

    msg = EmailMessage()
    msg["Subject"] = "Dokira - Modification de rendez-vous"
    msg["From"] = smtp_from
    msg["To"] = recipient_email
    msg.set_content(
        f"""Bonjour {recipient_name},

Le rendez-vous avec {medecin_name} a été modifié par {actor_label}.

Ancienne date: {old_dt.strftime('%d/%m/%Y %H:%M')}
Nouvelle date: {new_dt.strftime('%d/%m/%Y %H:%M')}
Motif: {motif or 'Non précisé'}

Merci,
Dokira
"""
    )

    with smtplib.SMTP(smtp_host, smtp_port) as smtp:
        smtp.starttls()
        smtp.login(smtp_user, smtp_password)
        smtp.send_message(msg)


def normalize_rdv_status_value(raw_status) -> str:
    status = str(raw_status or "").strip()
    lowered = status.lower()

    if "annul" in lowered:
        return "Annulé"
    if "confirm" in lowered:
        return "Confirmé"
    if "termin" in lowered or "trait" in lowered:
        return "Terminé"
    return "Planifié"


def compute_effective_rdv_status(rdv: RendezVous, now: datetime | None = None) -> str:
    current = now or datetime.utcnow()
    normalized = normalize_rdv_status_value(rdv.statut)

    if normalized == "Annulé":
        return normalized
    if rdv.date_heure and rdv.date_heure < current:
        return "Terminé"
    return normalized


@router.get("/api/public/specialistes")
async def get_public_specialistes(db: Session = Depends(get_db)):
    medecins = db.query(Medecin).filter(Medecin.est_actif == True).order_by(Medecin.id.desc()).all()
    result = []
    for m in medecins:
        adresse = ", ".join([p for p in [m.adresse, m.ville, m.code_postal] if p])
        result.append({
            "id": m.id,
            "nom": m.nom,
            "prenom": m.prenom,
            "specialite": m.specialite.value if m.specialite else "Non spÃ©cifiÃ©",
            "annees_experience": m.annees_experience or 0,
            "adresse_cabinet": adresse or "Adresse non renseignÃ©e",
            "telephone": m.telephone or "TÃ©lÃ©phone non renseignÃ©",
            "prix_consultation": m.prix_consultation if m.prix_consultation is not None else 0,
            "photo": m.photo_profil_url
        })
    return result


@router.post("/api/public/consultations")
async def create_public_consultation(
    data: dict = Body(...),
    db: Session = Depends(get_db)
):
    required_fields = [
        "medecin_id", "visiteur_nom", "visiteur_prenom", "motif_consultation",
        "date_heure", "visiteur_email", "visiteur_telephone"
    ]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        raise HTTPException(status_code=400, detail=f"Champs manquants: {', '.join(missing)}")

    medecin = db.query(Medecin).filter(
        Medecin.id == int(data["medecin_id"]),
        Medecin.est_actif == True
    ).first()
    if not medecin:
        raise HTTPException(status_code=404, detail="MÃ©decin introuvable")

    try:
        date_heure = datetime.fromisoformat(str(data["date_heure"]).replace("Z", ""))
    except ValueError:
        raise HTTPException(status_code=400, detail="Format date_heure invalide")

    Base.metadata.create_all(bind=engine, tables=[Consultation.__table__])

    consultation = Consultation(
        medecin_id=medecin.id,
        medecin_nom=f"Dr. {medecin.prenom} {medecin.nom}",
        visiteur_nom=str(data["visiteur_nom"]).strip(),
        visiteur_prenom=str(data["visiteur_prenom"]).strip(),
        visiteur_email=str(data["visiteur_email"]).strip().lower(),
        visiteur_telephone=str(data["visiteur_telephone"]).strip(),
        motif_consultation=str(data["motif_consultation"]).strip(),
        date_heure=date_heure,
        statut="Demandee"
    )

    try:
        db.add(consultation)
        db.commit()
        db.refresh(consultation)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur enregistrement consultation: {str(e)}")

    try:
        send_consultation_summary_email(
            consultation.visiteur_email,
            {
                "visiteur_nom": consultation.visiteur_nom,
                "visiteur_prenom": consultation.visiteur_prenom,
                "medecin_nom": consultation.medecin_nom,
                "specialite": medecin.specialite.value if medecin.specialite else "Non spÃ©cifiÃ©",
                "date_heure": consultation.date_heure.strftime("%d/%m/%Y %H:%M"),
                "motif_consultation": consultation.motif_consultation,
                "visiteur_telephone": consultation.visiteur_telephone,
                "visiteur_email": consultation.visiteur_email
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Consultation enregistrÃ©e mais email non envoyÃ©: {str(e)}"
        )

    return {
        "success": True,
        "consultation_id": consultation.id,
        "message": "Demande de rendez-vous enregistrÃ©e et email envoyÃ©"
    }


@router.get("/connexion", response_class=HTMLResponse)
def page_connexion(request: Request, db: Session = Depends(get_db)):
    """
    Page de connexion
    Si l'utilisateur est dÃ©jÃ  connectÃ©, redirige vers l'espace patient
    """
    # VÃ©rifier si l'utilisateur est dÃ©jÃ  connectÃ©
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
    NÃ©cessite une authentification
    """
    # RÃ©cupÃ©rer l'utilisateur actuel depuis le cookie
    current_user = get_current_user_from_cookie(request, db)
    
    # Si pas authentifiÃ©, rediriger vers la page de connexion
    if not current_user:
        return RedirectResponse(url="/connexion?redirect=espace-patient", status_code=303)
    
    # Mettre Ã  jour la derniÃ¨re connexion
    try:
        current_user.derniere_connexion = datetime.utcnow()
        db.commit()
    except Exception as e:
        print(f"Erreur lors de la mise Ã  jour de la derniÃ¨re connexion: {e}")
        db.rollback()
    
    # Afficher l'interface patient avec les donnÃ©es du patient
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
    VÃ©rifie les credentials et crÃ©e une session
    """
    
    # Nettoyer l'email (enlever espaces, mettre en minuscule)
    email = email.strip().lower()
    
    # Authentifier le patient
    patient = authenticate_user(db, email, password)
    
    # Si l'authentification Ã©choue
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
    
    # VÃ©rifier si le compte est actif
    if not patient.est_actif:
        return templates.TemplateResponse(
            "connexion.html",
            {
                "request": request,
                "error": "Votre compte a Ã©tÃ© dÃ©sactivÃ©. Veuillez contacter le support.",
                "email": email
            },
            status_code=403
        )
    
    # CrÃ©er le token d'accÃ¨s JWT
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
    
    # Mettre Ã  jour la derniÃ¨re connexion
    try:
        patient.derniere_connexion = datetime.utcnow()
        db.commit()
    except Exception as e:
        print(f"Erreur lors de la mise Ã  jour de la derniÃ¨re connexion: {e}")
        db.rollback()
    
    # CrÃ©er la rÃ©ponse de redirection vers l'espace patient
    response = RedirectResponse(url="/espace-patient", status_code=303)
    
    # DÃ©finir le cookie sÃ©curisÃ© avec le token JWT
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,  # EmpÃªche l'accÃ¨s JavaScript (sÃ©curitÃ© XSS)
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # DurÃ©e en secondes
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
    CrÃ©e un nouveau compte patient
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
                "error": "Le mot de passe doit contenir au moins 8 caractÃ¨res",
                "email": email,
                "nom": nom,
                "prenom": prenom
            },
            status_code=400
        )
    
    # VÃ©rifier si l'email existe dÃ©jÃ 
    existing_patient = get_user_by_email(db, email)
    if existing_patient:
        return templates.TemplateResponse(
            "inscription.html",
            {
                "request": request,
                "error": "Un compte existe dÃ©jÃ  avec cet email",
                "email": email
            },
            status_code=400
        )
    
    # CrÃ©er le nouveau patient
    try:
        # Convertir la date de naissance (format YYYY-MM-DD)
        date_naissance_obj = datetime.strptime(date_naissance, "%Y-%m-%d").date()
        
        # CrÃ©er l'objet Patient
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
        
        # Ajouter Ã  la base de donnÃ©es
        db.add(nouveau_patient)
        db.commit()
        db.refresh(nouveau_patient)
        
        print(f"âœ… Nouveau patient crÃ©Ã©: {nouveau_patient.email} (ID: {nouveau_patient.id})")
        
        # CrÃ©er un token et connecter automatiquement l'utilisateur
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
        print(f"âŒ Erreur lors de la crÃ©ation du compte: {e}")
        return templates.TemplateResponse(
            "inscription.html",
            {
                "request": request,
                "error": f"Erreur lors de la crÃ©ation du compte. Veuillez rÃ©essayer.",
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
    DÃ©connexion de l'utilisateur
    Supprime le cookie d'authentification et redirige vers la page de connexion
    """
    response = RedirectResponse(url="/connexion", status_code=303)
    response.delete_cookie(key="access_token")
    return response


# ============= ROUTES API - DONNÃ‰ES DYNAMIQUES =============

@router.get("/api/dashboard/stats")
async def get_dashboard_stats(request: Request, db: Session = Depends(get_db)):
    """API pour rÃ©cupÃ©rer les statistiques du dashboard"""
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
        )
    
    try:
        # âœ… RequÃªte CORRIGÃ‰E - Utiliser query() correctement
        rendez_vous_count = db.query(RendezVous).filter(
            RendezVous.patient_id == current_user.id,
            RendezVous.statut.in_(["PlanifiÃ©", "ConfirmÃ©"]),
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
                    "label": "RDV Ã  venir",
                    "change": { "type": "positive", "text": f"+{rendez_vous_count} ce mois" }
                },
                {
                    "icon": "fa-file-medical",
                    "color": "green",
                    "value": str(documents_count),
                    "label": "Documents",
                    "change": { "type": "positive", "text": f"+{documents_count} rÃ©cents" }
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
                    "label": "Suivi santÃ©",
                    "change": { "type": "positive", "text": "Excellent" }
                }
            ]
        }
        
    except Exception as e:
        print(f"âŒ Erreur dans get_dashboard_stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )
        
# ============= PATIENT - RENDEZ-VOUS =============


@router.get("/api/rendez-vous")
async def get_patient_rendez_vous(request: Request, db: Session = Depends(get_db)):
    """
    API pour rÃ©cupÃ©rer les rendez-vous du patient
    Inclut les informations du mÃ©decin associÃ©
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
        )
    
    try:
        # âœ… CORRECTION: Joindre les tables RendezVous et Medecin
        # Utiliser outerjoin pour supporter les cas oÃ¹ medecin_id serait NULL
        rendez_vous = db.query(RendezVous, Medecin).outerjoin(
            Medecin, RendezVous.medecin_id == Medecin.id
        ).filter(
            RendezVous.patient_id == current_user.id
        ).order_by(RendezVous.date_heure.desc()).all()
        
        result = []
        now = datetime.utcnow()

        for rv, medecin in rendez_vous:
            # âœ… GÃ©rer le type_consultation comme string (pas comme enum)
            type_consultation_value = rv.type_consultation if rv.type_consultation else "Cabinet"
            effective_status = compute_effective_rdv_status(rv, now=now)
            
            # âœ… Construire le nom du mÃ©decin de maniÃ¨re sÃ©curisÃ©e
            medecin_nom = f"Dr. {medecin.prenom} {medecin.nom}" if medecin else "MÃ©decin"
            medecin_specialite = medecin.specialite.value if medecin and medecin.specialite else "Non spÃ©cifiÃ©"
            medecin_id = medecin.id if medecin else rv.medecin_id
            
            result.append({
                "id": rv.id,
                "medecin_id": medecin_id,
                "medecin_nom": medecin_nom,
                "medecin_specialite": medecin_specialite,
                "date_heure": rv.date_heure.isoformat() if rv.date_heure else None,
                "motif": rv.motif or "",
                "statut": effective_status,
                "type_consultation": type_consultation_value,
                "lieu": rv.lieu or "",
                "date_creation": rv.date_creation.isoformat() if rv.date_creation else None
            })

        print(f"âœ… {len(result)} rendez-vous rÃ©cupÃ©rÃ©s pour le patient {current_user.id}")
        return result
        
    except Exception as e:
        print(f"âŒ Erreur rendez-vous: {e}")
        import traceback
        traceback.print_exc()
        # Retourner une liste vide en cas d'erreur au lieu de lever une exception
        return []  
    
        
# ============= PATIENT - CRÃ‰ER UN NOUVEAU RENDEZ-VOUS =============
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
    """CrÃ©e un nouveau rendez-vous"""
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")

    try:
        # VÃ©rifier que le mÃ©decin existe
        medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
        if not medecin:
            raise HTTPException(status_code=404, detail="MÃ©decin non trouvÃ©")

        # VÃ©rifier type de consultation
        types_valides = ["Cabinet", "VidÃ©o", "Domicile"]
        if type_consultation not in types_valides:
            raise HTTPException(
                status_code=400,
                detail=f"Type de consultation invalide. AcceptÃ©s: {types_valides}"
            )

        # Lieu obligatoire pour Domicile
        if type_consultation == "Domicile" and not lieu:
            raise HTTPException(
                status_code=400,
                detail="Le lieu est obligatoire pour une consultation Ã  domicile"
            )

        # Parser date
        try:
            date_heure_obj = datetime.fromisoformat(date_heure.replace("Z", ""))
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Format de date invalide. Utilisez: 2026-01-25T14:30"
            )

        # SpÃ©cialitÃ© du mÃ©decin
        specialite_final = medecin.specialite.value if medecin.specialite else "GÃ©nÃ©raliste"

        # âœ… CrÃ©ation du rendez-vous - SANS CONVERSION EN ENUM
        nouveau_rdv = RendezVous(
            patient_id=current_user.id,
            medecin_id=medecin_id,
            date_heure=date_heure_obj,
            motif=motif,
            type_consultation=type_consultation,  # â† Directement la string
            lieu=lieu if lieu else None,
            statut="PlanifiÃ©",
            specialite=specialite_final
        )

        db.add(nouveau_rdv)
        db.commit()
        db.refresh(nouveau_rdv)

        return {
            "success": True,
            "message": "Rendez-vous crÃ©Ã© avec succÃ¨s",
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
        print("âŒ Erreur crÃ©ation RDV:", e)
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
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")

    try:
        rdv = db.query(RendezVous).filter(
            RendezVous.id == rdv_id,
            RendezVous.patient_id == current_user.id
        ).first()

        if not rdv:
            raise HTTPException(status_code=404, detail="Rendez-vous non trouvÃ©")

        old_dt = rdv.date_heure

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
                    detail=f"Type invalide. AcceptÃ©s: {types_valides}"
                )
            rdv.type_consultation = type_consultation

        # Modifier lieu
        if lieu is not None:
            rdv.lieu = lieu

        # Modifier statut
        if statut:
            statuts_valides = [s.value for s in StatutRendezVous]
            if statut not in statuts_valides:
                raise HTTPException(
                    status_code=400,
                    detail=f"Statut invalide. AcceptÃ©s: {statuts_valides}"
                )
            rdv.statut = statut

        rdv.statut = compute_effective_rdv_status(rdv)

        db.commit()
        db.refresh(rdv)

        patient_name = current_user.nom_complet if hasattr(current_user, "nom_complet") else f"{current_user.prenom} {current_user.nom}".strip()
        medecin = db.query(Medecin).filter(Medecin.id == rdv.medecin_id).first()
        medecin_name = f"Dr. {medecin.prenom} {medecin.nom}" if medecin else "votre médecin"

        notif_to_medecin = Message(
            medecin_id=rdv.medecin_id,
            patient_id=rdv.patient_id,
            sujet="Modification de rendez-vous",
            contenu=f"Le patient {patient_name} a modifié le rendez-vous #{rdv.id} (nouvelle date: {rdv.date_heure.strftime('%d/%m/%Y %H:%M')}).",
            de_medecin=False,
            statut=StatutMessage.ENVOYE
        )
        notif_to_patient = Message(
            medecin_id=rdv.medecin_id,
            patient_id=rdv.patient_id,
            sujet="Rendez-vous modifié",
            contenu=f"Votre rendez-vous #{rdv.id} a bien été mis à jour pour le {rdv.date_heure.strftime('%d/%m/%Y %H:%M')}.",
            de_medecin=True,
            statut=StatutMessage.ENVOYE
        )
        db.add(notif_to_medecin)
        db.add(notif_to_patient)
        db.commit()

        if medecin and medecin.email:
            try:
                send_rdv_update_email(
                    recipient_email=medecin.email,
                    recipient_name=f"Dr. {medecin.prenom} {medecin.nom}",
                    actor_label=patient_name,
                    medecin_name=medecin_name,
                    old_dt=old_dt or rdv.date_heure,
                    new_dt=rdv.date_heure,
                    motif=motif or rdv.motif or ""
                )
            except Exception as mail_error:
                print(f"Erreur email notification médecin: {mail_error}")

        if current_user.email:
            try:
                send_rdv_update_email(
                    recipient_email=current_user.email,
                    recipient_name=patient_name,
                    actor_label=patient_name,
                    medecin_name=medecin_name,
                    old_dt=old_dt or rdv.date_heure,
                    new_dt=rdv.date_heure,
                    motif=motif or rdv.motif or ""
                )
            except Exception as mail_error:
                print(f"Erreur email notification patient: {mail_error}")

        return {
            "success": True,
            "message": "Rendez-vous modifiÃ© avec succÃ¨s",
            "rendez_vous": {
                "id": rdv.id,
                "date_heure": rdv.date_heure.isoformat(),
                "type_consultation": rdv.type_consultation,
                "lieu": rdv.lieu,
                "statut": rdv.statut
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        print("âŒ Erreur modification RDV:", e)
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
            detail="Non authentifiÃ©"
        )
    
    try:
        rdv = db.query(RendezVous).filter(
            RendezVous.id == rdv_id,
            RendezVous.patient_id == current_user.id
        ).first()
        
        if not rdv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rendez-vous non trouvÃ©"
            )
        
        db.delete(rdv)
        db.commit()
        
        return {
            "success": True,
            "message": "Rendez-vous supprimÃ© avec succÃ¨s"
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        print(f"âŒ Erreur suppression RDV: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============= PATIENT - INFORMATIONS PERSONNELLES =============
@router.get("/api/patient/info")
async def get_patient_info(request: Request, db: Session = Depends(get_db)):
    """
    API pour rÃ©cupÃ©rer les informations du patient connectÃ©
    Retourne un JSON avec les donnÃ©es du patient
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
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

# ============= PATIENT - INFORMATIONS COMPLÃˆTES =============
@router.get("/api/patient/full-info")
async def get_patient_full_info(request: Request, db: Session = Depends(get_db)):
    """
    API pour rÃ©cupÃ©rer toutes les informations du patient
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
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

# ============= PATIENT - METTRE Ã€ JOUR INFORMATIONS =============
@router.post("/api/patient/update")
async def update_patient_info(
    request: Request,
    patient_data: dict,
    db: Session = Depends(get_db)
):
    """
    API pour mettre Ã  jour les informations du patient
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
        )
    
    try:
        # Mettre Ã  jour les champs de base
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
        
        # Mettre Ã  jour les informations mÃ©dicales
        if "groupe_sanguin" in patient_data:
            current_user.groupe_sanguin = patient_data["groupe_sanguin"]
        if "allergies" in patient_data:
            current_user.allergies = patient_data["allergies"].strip()
        if "antecedents_medicaux" in patient_data:
            current_user.antecedents_medicaux = patient_data["antecedents_medicaux"].strip()
        if "traitements_en_cours" in patient_data:
            current_user.traitements_en_cours = patient_data["traitements_en_cours"].strip()
        
        # Mettre Ã  jour le mot de passe si fourni
        if "mot_de_passe" in patient_data and patient_data["mot_de_passe"]:
            current_user.mot_de_passe_hash = get_password_hash(patient_data["mot_de_passe"])
        
        # Date de mise Ã  jour
        current_user.date_modification = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": "Informations mises Ã  jour avec succÃ¨s"
        }
        
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur de format: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        print(f"Erreur mise Ã  jour patient: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise Ã  jour: {str(e)}"
        )

# ============= MESSAGERIE =============

@router.get("/api/messagerie/stats")
async def get_messagerie_stats(request: Request, db: Session = Depends(get_db)):
    """
    API pour rÃ©cupÃ©rer les statistiques de la messagerie
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
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
    API pour rÃ©cupÃ©rer la liste des conversations
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
        )
    
    # Sous-requÃªte pour le dernier message de chaque mÃ©decin
    subquery = db.query(
        Message.medecin_id,
        func.max(Message.date_envoi).label('max_date')
    ).filter(
        Message.patient_id == current_user.id
    ).group_by(
        Message.medecin_id
    ).subquery()
    
    # RequÃªte principale
    conversations = db.query(
        Medecin.id,
        Medecin.nom,
        Medecin.prenom,
        Medecin.photo_profil_url,
        Medecin.derniere_connexion,
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
        Medecin.id, Medecin.nom, Medecin.prenom, Medecin.photo_profil_url, Medecin.derniere_connexion,
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
            "specialite": conv.specialite.value if conv.specialite else "Non spÃ©cifiÃ©",
            "last_message": (conv.last_message[:50] + "...") if conv.last_message and len(conv.last_message) > 50 else conv.last_message,
            "last_message_time": conv.last_message_time.isoformat() if conv.last_message_time else "",
            "unread": conv.unread_count or 0,
            "is_online": bool(
                conv.derniere_connexion and
                conv.derniere_connexion >= (datetime.utcnow() - timedelta(minutes=2))
            )
        })
    
    return result

# ============= PATIENT - MESSAGES D'UNE CONVERSATION =============
@router.get("/api/messagerie/conversation/{medecin_id}")
async def get_conversation_messages(medecin_id: int, request: Request, db: Session = Depends(get_db)):
    """
    API pour rÃ©cupÃ©rer les messages d'une conversation et les infos du mÃ©decin
    """
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
        )

    # RÃ©cupÃ©rer les messages
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
            "date_envoi": msg.date_envoi.isoformat() if msg.date_envoi else None,
            "expediteur_type": "medecin" if msg.de_medecin else "patient",
            "statut": msg.statut
        })

    # Infos du mÃ©decin
    medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
    medecin_data = None
    if medecin:
        medecin_data = {
            "id": medecin.id,
            "nom": medecin.nom,
            "prenom": medecin.prenom,
            "specialite": medecin.specialite.value if medecin.specialite else "Non spÃ©cifiÃ©",
            "photo": medecin.photo_profil_url,
            "is_online": bool(
                medecin.derniere_connexion and
                medecin.derniere_connexion >= (datetime.utcnow() - timedelta(minutes=2))
            ),
            "email": medecin.email,
            "telephone": medecin.telephone
        }

    return {
        "messages": result,
        "medecin": medecin_data
    }

@router.get("/api/messagerie/medecin-presence/{medecin_id}")
async def get_medecin_presence(medecin_id: int, request: Request, db: Session = Depends(get_db)):
    """
    API lÃ©gere pour rÃ©cupÃ©rer l'etat en ligne/hors ligne d'un mÃ©decin.
    """
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
        )

    medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
    if not medecin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MÃ©decin non trouvÃ©"
        )

    is_online = bool(
        medecin.derniere_connexion and
        medecin.derniere_connexion >= (datetime.utcnow() - timedelta(minutes=2))
    )

    return {
        "medecin_id": medecin.id,
        "is_online": is_online,
        "derniere_connexion": medecin.derniere_connexion.isoformat() if medecin.derniere_connexion else None
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
            detail="Non authentifiÃ©"
        )
    
    medecin_id = message_data.get("medecin_id")
    contenu = message_data.get("contenu")
    
    if not medecin_id or not contenu:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="DonnÃ©es manquantes"
        )
    
    # VÃ©rifier que le mÃ©decin existe
    medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
    if not medecin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MÃ©decin non trouvÃ©"
        )
    
    # CrÃ©er le message
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

# ============= MÃ‰DECINS =============

@router.get("/api/medecins")
async def get_all_medecins(request: Request, db: Session = Depends(get_db)):
    """
    API pour rÃ©cupÃ©rer la liste de tous les mÃ©decins
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
        )
    
    medecins = db.query(Medecin).filter(Medecin.est_actif == True).all()
    
    result = []
    for medecin in medecins:
        result.append({
            "id": medecin.id,
            "nom": medecin.nom,
            "prenom": medecin.prenom,
            "specialite": medecin.specialite.value if medecin.specialite else "Non spÃ©cifiÃ©",
            "annees_experience": medecin.annees_experience,
            "email": medecin.email,
            "prix_consultation": medecin.prix_consultation,
            "photo": medecin.photo_profil_url,
            "telephone": medecin.telephone,
            "description": medecin.biographie
        })
    
    return result

# ============= DÃ‰TAIL MÃ‰DECIN =============
@router.get("/api/medecins/{medecin_id}")
async def get_medecin_detail(medecin_id: int, request: Request, db: Session = Depends(get_db)):
    """
    API pour rÃ©cupÃ©rer les dÃ©tails d'un mÃ©decin
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
        )
    
    medecin = db.query(Medecin).filter(
        Medecin.id == medecin_id, 
        Medecin.est_actif == True
    ).first()
    
    if not medecin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MÃ©decin non trouvÃ©"
        )
    
    return {
        "id": medecin.id,
        "nom": medecin.nom,
        "prenom": medecin.prenom,
        "specialite": medecin.specialite.value if medecin.specialite else "Non spÃ©cifiÃ©",
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
    API pour rÃ©cupÃ©rer les documents du patient
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
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
    """API pour tÃ©lÃ©verser un document - Version CORRIGÃ‰E avec chemin absolu"""
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
        )
    
    try:
       
        BASE_DIR = Path(__file__).resolve().parent  
        UPLOAD_BASE_DIR = BASE_DIR  / "static" / "uploads"
        
        # RÃ©pertoire spÃ©cifique aux documents
        documents_dir = UPLOAD_BASE_DIR / "documents"
        documents_dir.mkdir(parents=True, exist_ok=True)
        
        # GÃ©nÃ©rer un nom de fichier unique
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = file.filename.replace(" ", "_").replace("/", "_")
        filename = f"doc_{current_user.id}_{timestamp}_{safe_filename}"
        file_path = documents_dir / filename
        
        # Sauvegarder le fichier
        content = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        
        fichier_url = f"/static/uploads/documents/{filename}"
        
        # CrÃ©er l'entrÃ©e document
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
            detail=f"Erreur lors du tÃ©lÃ©versement: {str(e)}"
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
            detail="Non authentifiÃ©"
        )
    
    try:
        # RÃ©cupÃ©rer le document
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.patient_id == current_user.id
        ).first()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document non trouvÃ©"
            )
        
        
        uploads_dir = Path(__file__).resolve().parent / "static" / "uploads" / "documents"
        uploads_dir.mkdir(parents=True, exist_ok=True)

        
        if document.fichier_url and document.fichier_url.startswith("/static/uploads/"):
            # Extraire le nom de fichier de l'URL
            filename = document.fichier_url.split("/")[-1]
            #file_path = UPLOAD_BASE_DIR / "documents" / filename
            file_path = uploads_dir / filename
            
            # VÃ©rifier et supprimer le fichier physique
            if file_path.exists():
                try:
                    file_path.unlink()
                    print(f"âœ… Fichier supprimÃ©: {file_path}")
                except Exception as e:
                    print(f"âš ï¸ Impossible de supprimer le fichier physique: {e}")
        
        # Supprimer l'entrÃ©e de la base de donnÃ©es
        db.delete(document)
        db.commit()
        
        return {
            "success": True,
            "message": "Document supprimÃ© avec succÃ¨s"
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        print(f"âŒ Erreur suppression document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression: {str(e)}"
        )
        
 #============ VUE DÃ‰TAILLÃ‰E D'UN DOCUMENT ============= 
@router.get("/api/documents/{document_id}/view")
async def view_document_api(
    document_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """API pour rÃ©cupÃ©rer les infos d'un document spÃ©cifique"""
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
        )
    
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.patient_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document non trouvÃ©"
        )
    
    # Construire l'URL complÃ¨te
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
    API pour rÃ©cupÃ©rer les ordonnances du patient
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
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
            "medicaments": ord.medicaments or "",
            "posologie": ord.posologie or "",
            "duree_traitement": ord.duree_traitement or "",
            "statut": ord.statut or "Active",
            "date_expiration": ord.date_expiration.isoformat() if ord.date_expiration else None,
            "fichier_url": ord.fichier_url,
            "pdf_disponible": bool(ord.fichier_url)
        })
    
    return result


@router.get("/api/ordonnances/telecharger/{ordonnance_id}")
async def telecharger_ordonnance_patient(
    ordonnance_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """TÃ©lÃ©charge le PDF d'une ordonnance pour le patient connectÃ©."""
    current_user = get_current_user_from_cookie(request, db)

    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")

    ordonnance = db.query(Ordonnance).filter(
        Ordonnance.id == ordonnance_id,
        Ordonnance.patient_id == current_user.id
    ).first()

    if not ordonnance:
        raise HTTPException(status_code=404, detail="Ordonnance non trouvÃ©e")

    if not ordonnance.fichier_url:
        raise HTTPException(status_code=404, detail="PDF non disponible")

    filepath = ordonnance.fichier_url.replace("/static/", "static/")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Fichier introuvable")

    return FileResponse(filepath, filename=f"ordonnance_{ordonnance_id}.pdf")

# ============= NOTIFICATIONS =============

@router.get("/api/notifications")
async def get_notifications_count(request: Request, db: Session = Depends(get_db)):
    """
    API pour rÃ©cupÃ©rer le nombre de notifications (messages non lus)
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


@router.get("/api/notifications/summary")
async def get_patient_notifications_summary(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        return {
            "total": 0,
            "unread_messages": 0,
            "documents_recents": 0,
            "rdv_a_venir": 0
        }

    now = datetime.utcnow()
    recent_threshold = now - timedelta(days=7)

    unread_messages = db.query(Message).filter(
        Message.patient_id == current_user.id,
        Message.statut == StatutMessage.ENVOYE,
        Message.de_medecin == True
    ).count()

    documents_recents = db.query(Document).filter(
        Document.patient_id == current_user.id,
        Document.date_upload >= recent_threshold
    ).count()

    rdv_a_venir = db.query(RendezVous).filter(
        RendezVous.patient_id == current_user.id,
        RendezVous.date_heure >= now
    ).count()

    notifications_systeme = db.query(NotificationReception).filter(
        NotificationReception.user_role == "patient",
        NotificationReception.user_id == current_user.id,
        NotificationReception.lu == False
    ).count()

    total = unread_messages + documents_recents + rdv_a_venir + notifications_systeme
    return {
        "total": total,
        "unread_messages": unread_messages,
        "documents_recents": documents_recents,
        "rdv_a_venir": rdv_a_venir,
        "notifications_systeme": notifications_systeme
    }


@router.get("/api/notifications/list")
async def get_patient_notifications_list(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        return []

    rows = db.query(NotificationReception, NotificationBroadcast).join(
        NotificationBroadcast, NotificationBroadcast.id == NotificationReception.notification_id
    ).filter(
        NotificationReception.user_role == "patient",
        NotificationReception.user_id == current_user.id
    ).order_by(NotificationReception.date_reception.desc()).limit(30).all()

    return [
        {
            "id": nr.id,
            "titre": nb.titre,
            "contenu": nb.contenu,
            "lu": nr.lu,
            "date": nr.date_reception.isoformat() if nr.date_reception else None
        }
        for nr, nb in rows
    ]


@router.put("/api/notifications/{notification_reception_id}/read")
async def mark_patient_notification_read(
    notification_reception_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifié")

    notif = db.query(NotificationReception).filter(
        NotificationReception.id == notification_reception_id,
        NotificationReception.user_role == "patient",
        NotificationReception.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification introuvable")

    notif.lu = True
    notif.date_lu = datetime.utcnow()
    db.commit()
    return {"success": True}


@router.get("/api/patient/analyses")
async def get_patient_analyses(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifié")

    rows = db.query(AnalysePatient, Medecin).join(
        Medecin, Medecin.id == AnalysePatient.medecin_id
    ).filter(
        AnalysePatient.patient_id == current_user.id
    ).order_by(AnalysePatient.date_analyse.desc()).all()

    return [
        {
            "id": a.id,
            "titre": a.titre,
            "resultat": a.resultat,
            "notes": a.notes,
            "document_url": a.document_url,
            "date_analyse": a.date_analyse.isoformat() if a.date_analyse else None,
            "medecin_nom": f"Dr. {m.prenom} {m.nom}"
        }
        for a, m in rows
    ]


@router.get("/api/patient/injections")
async def get_patient_injections(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifié")

    rows = db.query(InjectionPatient, Medecin).join(
        Medecin, Medecin.id == InjectionPatient.medecin_id
    ).filter(
        InjectionPatient.patient_id == current_user.id
    ).order_by(InjectionPatient.date_injection.desc()).all()

    return [
        {
            "id": inj.id,
            "nom_injection": inj.nom_injection,
            "dosage": inj.dosage,
            "frequence": inj.frequence,
            "instructions": inj.instructions,
            "date_injection": inj.date_injection.isoformat() if inj.date_injection else None,
            "medecin_nom": f"Dr. {m.prenom} {m.nom}"
        }
        for inj, m in rows
    ]


@router.get("/api/patient/analyses/{analyse_id}/pdf")
async def download_patient_analyse_pdf(
    analyse_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifié")

    analyse = db.query(AnalysePatient).filter(
        AnalysePatient.id == analyse_id,
        AnalysePatient.patient_id == current_user.id
    ).first()
    if not analyse:
        raise HTTPException(status_code=404, detail="Analyse introuvable")

    medecin = db.query(Medecin).filter(Medecin.id == analyse.medecin_id).first()
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    y = 800
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Dokira - Resultat d'analyse")
    y -= 30
    pdf.setFont("Helvetica", 11)
    pdf.drawString(50, y, f"Patient: {current_user.nom_complet}")
    y -= 18
    pdf.drawString(50, y, f"Medecin: {'Dr. ' + medecin.prenom + ' ' + medecin.nom if medecin else '-'}")
    y -= 18
    pdf.drawString(50, y, f"Titre: {analyse.titre}")
    y -= 18
    pdf.drawString(50, y, f"Date: {analyse.date_analyse.strftime('%d/%m/%Y %H:%M') if analyse.date_analyse else '-'}")
    y -= 24
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(50, y, "Resultat:")
    y -= 18
    pdf.setFont("Helvetica", 10)
    for line in (analyse.resultat or "").splitlines() or ["-"]:
        pdf.drawString(50, y, line[:110])
        y -= 14
        if y < 80:
            pdf.showPage()
            y = 800
    if analyse.notes:
        y -= 10
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(50, y, "Notes:")
        y -= 18
        pdf.setFont("Helvetica", 10)
        for line in analyse.notes.splitlines():
            pdf.drawString(50, y, line[:110])
            y -= 14
            if y < 80:
                pdf.showPage()
                y = 800

    pdf.save()
    buffer.seek(0)
    return Response(
        content=buffer.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=analyse_{analyse_id}.pdf"}
    )


@router.get("/api/help/patient.pdf")
async def patient_help_pdf():
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    y = 800
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Guide Patient Dokira")
    y -= 24
    pdf.setFont("Helvetica", 11)
    lines = [
        "- Dashboard: vue generale de vos activites",
        "- Profil: consulter et modifier vos informations",
        "- Dossier Medical: informations medicales personnelles",
        "- Rendez-vous: creer, modifier, annuler",
        "- Messagerie: echanger avec medecin/admin (bug technique pour admin)",
        "- Analyses & Resultats: consulter resultats et telecharger PDF",
        "- Injections: consulter prescriptions d'injections",
        "- Documents/Ordonnances: consulter et telecharger",
    ]
    for line in lines:
        pdf.drawString(50, y, line)
        y -= 16
    pdf.save()
    buffer.seek(0)
    return Response(content=buffer.read(), media_type="application/pdf", headers={"Content-Disposition": "inline; filename=guide_patient_dokira.pdf"})




# Route optimisÃ©e pour le dashboard
@router.get("/api/dashboard/optimized")
async def get_optimized_dashboard(request: Request, db: Session = Depends(get_db)):
    """
    API optimisÃ©e pour le dashboard - Toutes les donnÃ©es en un seul appel
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
        )
    
    try:
        # Utiliser des requÃªtes parallÃ¨les avec asyncio
        import asyncio
        
        # Toutes les requÃªtes en parallÃ¨le
        rendez_vous_count = db.query(RendezVous).filter(
            RendezVous.patient_id == current_user.id,
            RendezVous.date_heure > datetime.utcnow(),
            RendezVous.statut.in_(["PlanifiÃ©", "ConfirmÃ©"])
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
        
        # RÃ©cupÃ©rer quelques mÃ©decins pour affichage rapide
        recent_medecins = db.query(Medecin).filter(
            Medecin.est_actif == True
        ).limit(3).all()
        
        medecins_list = []
        for medecin in recent_medecins:
            medecins_list.append({
                "id": medecin.id,
                "nom": medecin.nom,
                "prenom": medecin.prenom,
                "specialite": medecin.specialite.value if medecin.specialite else "Non spÃ©cifiÃ©",
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
                    "description": "RÃ©server une consultation",
                    "link": "/rendez-vous"
                },
                {
                    "icon": "fa-file-upload",
                    "title": "TÃ©lÃ©verser",
                    "description": "Ajouter un document",
                    "link": "/documents"
                },
                {
                    "icon": "fa-comments",
                    "title": "Messagerie",
                    "description": "Contacter un mÃ©decin",
                    "link": "/messagerie"
                }
            ]
        }
        
    except Exception as e:
        print(f"âŒ Erreur dashboard optimisÃ©: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )

# Route de dÃ©bogage pour les messages
@router.get("/api/debug/messages")
async def debug_messages(request: Request, db: Session = Depends(get_db)):
    """
    Route de dÃ©bogage pour vÃ©rifier les messages
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        return {"error": "Non authentifiÃ©"}
    
    # VÃ©rifier la structure de la table Message
    try:
        # Tester un insert
        test_message = Message(
            patient_id=current_user.id,
            medecin_id=1,  # ID du premier mÃ©decin
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

# Route pour vÃ©rifier un mÃ©decin spÃ©cifique
@router.get("/api/debug/medecin/{medecin_id}")
async def debug_medecin(medecin_id: int, db: Session = Depends(get_db)):
    """
    VÃ©rifier qu'un mÃ©decin existe
    """
    medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
    
    if not medecin:
        return {
            "exists": False,
            "message": f"MÃ©decin avec ID {medecin_id} non trouvÃ©"
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

# Route simplifiÃ©e pour envoyer un message (debug)
@router.post("/api/simple-message")
async def send_simple_message(
    request: Request,
    medecin_id: int = Body(...),
    message: str = Body(...),
    db: Session = Depends(get_db)
):
    """
    Version simplifiÃ©e pour dÃ©boguer l'envoi de message
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    # VÃ©rifier le mÃ©decin
    medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
    if not medecin:
        raise HTTPException(status_code=404, detail="MÃ©decin non trouvÃ©")
    
    try:
        # CrÃ©er le message avec des valeurs simples
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
            "message": "Message envoyÃ© avec succÃ¨s",
            "message_id": new_message.id
        }
        
    except Exception as e:
        db.rollback()
        import traceback
        traceback_str = traceback.format_exc()
        print(f"âŒ Erreur dÃ©taillÃ©e: {traceback_str}")
        
        raise HTTPException(
            status_code=500,
            detail=f"Erreur: {str(e)}"
        )


# ============= ROUTES EXISTANTES =============

@router.get("/api/check-auth")
async def check_auth(request: Request, db: Session = Depends(get_db)):
    """
    VÃ©rifie si l'utilisateur est authentifiÃ©
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
    Route de test pour vÃ©rifier la connexion Ã  la base de donnÃ©es
    Affiche le nombre de patients enregistrÃ©s
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
            "message": "âœ… Connexion Ã  la base de donnÃ©es rÃ©ussie",
            "nombre_patients": patients_count,
            "patients_exemples": patients_list
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"âŒ Erreur de connexion: {str(e)}"
        }
        
        
#Route pour uploader une photo de profil patient

@router.post("/api/patient/upload-photo")
async def upload_photo(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload photo de profil - Version CORRIGÃ‰E"""
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")

    # CrÃ©er le rÃ©pertoire avec le chemin correct
    uploads_dir = Path(__file__).resolve().parent / "static" / "uploads" / "patients"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    # GÃ©nÃ©rer un nom de fichier unique avec timestamp
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
        
        # Mettre Ã  jour la base de donnÃ©es
        current_user.photo_profil_url = photo_url
        db.commit()
        db.refresh(current_user)

        return {
            "success": True,
            "photo_url": photo_url,
            "message": "Photo mise Ã  jour avec succÃ¨s"
        }

    except Exception as e:
        db.rollback()
        print(f"Erreur upload photo: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'upload: {str(e)}"
        )

#Route pour envoyer un message au mÃ©decin (version formulaire)
@router.post("/api/messages/send")
async def send_message_form(
    request: Request,
    medecin_id: int = Form(...),
    contenu: str = Form(...),
    db: Session = Depends(get_db)
):
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")

    medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
    if not medecin:
        raise HTTPException(status_code=404, detail="MÃ©decin introuvable")

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


# ============= MESSAGERIE PATIENT AVEC ADMIN =============

@router.get("/api/messagerie/conversations")
async def get_conversations_list(request: Request, db: Session = Depends(get_db)):
    """
    API pour rÃ©cupÃ©rer la liste des conversations (mÃ©decins + admin)
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
        )
    
    try:
        # 1. Conversations avec les mÃ©decins (code existant)
        subquery = db.query(
            Message.medecin_id,
            func.max(Message.date_envoi).label('max_date')
        ).filter(
            Message.patient_id == current_user.id
        ).group_by(
            Message.medecin_id
        ).subquery()
        
        conversations_medecins = db.query(
            Medecin.id,
            Medecin.nom,
            Medecin.prenom,
            Medecin.photo_profil_url,
            Medecin.derniere_connexion,
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
            Medecin.derniere_connexion, Medecin.specialite, Message.contenu, Message.date_envoi
        ).all()
        
        result = []
        
        # Ajouter les conversations avec mÃ©decins
        for conv in conversations_medecins:
            result.append({
                "contact_id": conv.id,
                "contact_type": "medecin",
                "nom_complet": f"Dr. {conv.prenom} {conv.nom}",
                "photo_profil_url": conv.photo_profil_url,
                "specialite": conv.specialite.value if conv.specialite else "MÃ©decin",
                "last_message": (conv.last_message[:50] + "...") if conv.last_message and len(conv.last_message) > 50 else conv.last_message,
                "last_message_time": conv.last_message_time.isoformat() if conv.last_message_time else None,
                "unread_count": conv.unread_count or 0,
                "is_online": bool(
                    conv.derniere_connexion and
                    conv.derniere_connexion >= (datetime.utcnow() - timedelta(minutes=2))
                )
            })
        
        # 2. Conversation avec l'admin
        admin_messages = db.query(MessageAdminPatient).filter(
            MessageAdminPatient.patient_id == current_user.id
        ).order_by(MessageAdminPatient.date_envoi.desc()).first()
        
        admin_unread = db.query(MessageAdminPatient).filter(
            MessageAdminPatient.patient_id == current_user.id,
            MessageAdminPatient.de_admin == True,
            MessageAdminPatient.statut == StatutMessage.ENVOYE
        ).count()
        
        if admin_messages or admin_unread > 0:
            # RÃ©cupÃ©rer les infos de l'admin (premier admin par dÃ©faut)
            admin = db.query(Admin).filter(Admin.est_actif == True).first()
            
            result.append({
                "contact_id": 0,  # ID spÃ©cial pour l'admin
                "contact_type": "admin",
                "nom_complet": "Administrateur",
                "photo_profil_url": admin.photo_profil_url if admin else None,
                "specialite": "Support",
                "last_message": admin_messages.contenu[:50] + "..." if admin_messages and len(admin_messages.contenu) > 50 else (admin_messages.contenu if admin_messages else ""),
                "last_message_time": admin_messages.date_envoi.isoformat() if admin_messages else None,
                "unread_count": admin_unread,
                "is_online": True
            })
        
        # Trier par date du dernier message
        result.sort(key=lambda x: x["last_message_time"] or "", reverse=True)
        
        return result
        
    except Exception as e:
        print(f"âŒ Erreur conversations: {e}")
        import traceback
        traceback.print_exc()
        return []


@router.get("/api/messagerie/conversation/{contact_type}/{contact_id}")
async def get_conversation_messages_patient(
    contact_type: str,
    contact_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    API pour rÃ©cupÃ©rer les messages d'une conversation (mÃ©decin ou admin)
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
        )
    
    try:
        contact_type = contact_type.lower()
        messages = []
        contact_info = None
        
        # Cas 1: Conversation avec un mÃ©decin
        if contact_type == "medecin":
            # VÃ©rifier que le mÃ©decin existe
            medecin = db.query(Medecin).filter(Medecin.id == contact_id).first()
            if not medecin:
                raise HTTPException(status_code=404, detail="MÃ©decin non trouvÃ©")
            
            contact_info = {
                "id": medecin.id,
                "type": "medecin",
                "nom_complet": f"Dr. {medecin.prenom} {medecin.nom}",
                "specialite": medecin.specialite.value if medecin.specialite else "MÃ©decin",
                "photo_profil_url": medecin.photo_profil_url,
                "email": medecin.email,
                "telephone": medecin.telephone
            }
            
            # RÃ©cupÃ©rer les messages
            msg_list = db.query(Message).filter(
                Message.patient_id == current_user.id,
                Message.medecin_id == contact_id
            ).order_by(Message.date_envoi.asc()).all()
            
            # Marquer comme lus
            db.query(Message).filter(
                Message.patient_id == current_user.id,
                Message.medecin_id == contact_id,
                Message.de_medecin == True,
                Message.statut == StatutMessage.ENVOYE
            ).update({"statut": StatutMessage.LU})
            db.commit()
            
            # Formater les messages
            for msg in msg_list:
                messages.append({
                    "id": msg.id,
                    "contenu": msg.contenu,
                    "date_envoi": msg.date_envoi.isoformat(),
                    "expediteur_type": "medecin" if msg.de_medecin else "patient",
                    "expediteur_nom": f"Dr. {medecin.prenom} {medecin.nom}" if msg.de_medecin else current_user.nom_complet,
                    "statut": msg.statut.value if hasattr(msg.statut, 'value') else str(msg.statut)
                })
        
        # Cas 2: Conversation avec l'admin
        elif contact_type == "admin":
            contact_info = {
                "id": 0,
                "type": "admin",
                "nom_complet": "Administrateur",
                "specialite": "Support",
                "photo_profil_url": None,
                "email": None,
                "telephone": None
            }
            
            # RÃ©cupÃ©rer les messages avec l'admin
            msg_list = db.query(MessageAdminPatient).filter(
                MessageAdminPatient.patient_id == current_user.id
            ).order_by(MessageAdminPatient.date_envoi.asc()).all()
            
            # Marquer comme lus
            db.query(MessageAdminPatient).filter(
                MessageAdminPatient.patient_id == current_user.id,
                MessageAdminPatient.de_admin == True,
                MessageAdminPatient.statut == StatutMessage.ENVOYE
            ).update({"statut": StatutMessage.LU, "date_lu": datetime.utcnow()})
            db.commit()
            
            # Formater les messages
            for msg in msg_list:
                messages.append({
                    "id": msg.id,
                    "contenu": msg.contenu,
                    "date_envoi": msg.date_envoi.isoformat(),
                    "expediteur_type": "admin" if msg.de_admin else "patient",
                    "expediteur_nom": "Administrateur" if msg.de_admin else current_user.nom_complet,
                    "statut": msg.statut.value if hasattr(msg.statut, 'value') else str(msg.statut)
                })
        
        else:
            raise HTTPException(status_code=400, detail="Type de contact invalide")
        
        return {
            "contact": contact_info,
            "messages": messages
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"âŒ Erreur rÃ©cupÃ©ration messages: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la rÃ©cupÃ©ration des messages: {str(e)}")


@router.post("/api/messagerie/send-to-admin")
async def send_message_to_admin(
    request: Request,
    contenu: str = Body(..., embed=True),
    sujet: str = Body("Signalement bug technique", embed=True),
    db: Session = Depends(get_db)
):
    """
    API pour envoyer un message Ã  l'administrateur
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifiÃ©"
        )
    
    if not contenu or not contenu.strip():
        raise HTTPException(status_code=400, detail="Le message ne peut pas Ãªtre vide")

    allowed_keywords = ["bug", "erreur", "technique", "application", "probleme", "problÃ¨me", "crash"]
    msg_check = f"{sujet} {contenu}".lower()
    if not any(k in msg_check for k in allowed_keywords):
        raise HTTPException(
            status_code=400,
            detail="Seuls les signalements de bug technique sont autorisÃ©s vers l'admin."
        )
    
    try:
        # Trouver un admin (prendre le premier admin actif)
        admin = db.query(Admin).filter(Admin.est_actif == True).first()
        if not admin:
            raise HTTPException(status_code=404, detail="Aucun administrateur trouvÃ©")
        
        # CrÃ©er le message
        nouveau_message = MessageAdminPatient(
            admin_id=admin.id,
            patient_id=current_user.id,
            sujet=(sujet or "Signalement bug technique").strip()[:255],
            contenu=contenu.strip(),
            de_admin=False,  # False = envoyÃ© par patient
            statut=StatutMessage.ENVOYE,
            date_envoi=datetime.utcnow()
        )
        
        db.add(nouveau_message)
        db.commit()
        db.refresh(nouveau_message)
        
        return {
            "success": True,
            "message": {
                "id": nouveau_message.id,
                "contenu": nouveau_message.contenu,
                "date_envoi": nouveau_message.date_envoi.isoformat(),
                "expediteur_type": "patient",
                "expediteur_nom": current_user.nom_complet,
                "statut": nouveau_message.statut.value if hasattr(nouveau_message.statut, 'value') else str(nouveau_message.statut)
            }
        }
        
    except Exception as e:
        db.rollback()
        print(f"âŒ Erreur envoi message Ã  l'admin: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'envoi du message: {str(e)}")
    
    

#Route pour complÃ©ter le profil patient
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
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")

    if telephone: current_user.telephone = telephone
    if adresse: current_user.adresse = adresse
    if ville: current_user.ville = ville
    if code_postal: current_user.code_postal = code_postal

    db.commit()

    return {"status": "ok"}

#Routes pour le chat IA
@router.get("/api/chat-ia")
async def get_chat_ia(request: Request, db: Session = Depends(get_db)):
    patient = get_current_user_from_cookie(request, db)
    medecin = None
    if not patient:
        medecin = get_current_medecin_from_cookie_light(request, db)
    return {
        "status": "ok",
        "role": "patient" if patient else ("medecin" if medecin else "public")
    }


@router.post("/api/chat-ia/message")
async def send_chat_message(
    request: Request,
    message_data: dict = Body(...),
    db: Session = Depends(get_db)
):
    user_message = message_data.get("message", "").strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="Message vide")

    try:
        identity = get_chat_identity_context(request, db)
        history = message_data.get("history", [])
        ia_result = get_ia_response(user_message, identity, history)

        return {
            "success": True,
            "user_message": user_message,
            "ia_response": ia_result["text"],
            "ai_source": ia_result["source"],
            "ai_error": ia_result.get("error"),
            "role": identity["role"],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


def get_current_medecin_from_cookie_light(request: Request, db: Session):
    token = request.cookies.get("medecin_access_token")
    if not token:
        return None
    try:
        if token.startswith("Bearer "):
            token = token[7:]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            return None
        medecin = db.query(Medecin).filter(Medecin.email == email).first()
        if not medecin or not medecin.est_actif:
            return None
        return medecin
    except Exception:
        return None


def get_chat_identity_context(request: Request, db: Session) -> dict:
    patient = get_current_user_from_cookie(request, db)
    if patient:
        return {
            "role": "patient",
            "context": {
                "age": patient.age,
                "genre": patient.genre.value if patient.genre else "Non spécifié",
                "allergies": patient.allergies or "Aucune connue",
                "traitements": patient.traitements_en_cours or "Aucun"
            }
        }

    medecin = get_current_medecin_from_cookie_light(request, db)
    if medecin:
        return {
            "role": "medecin",
            "context": {
                "nom": f"Dr. {medecin.prenom or ''} {medecin.nom or ''}".strip(),
                "specialite": medecin.specialite.value if medecin.specialite else "Médecine générale",
                "annees_experience": medecin.annees_experience or 0
            }
        }

    return {"role": "public", "context": {}}


def build_chat_system_prompt(identity: dict) -> str:
    role = identity.get("role", "public")
    context = identity.get("context", {})

    base_rules = (
        "Tu es l'assistant IA de Dokira. "
        "Réponds en français, de façon claire, concise et utile. "
        "Tu donnes des informations générales, jamais un diagnostic définitif. "
        "En cas de signes graves (douleur thoracique, détresse respiratoire, saignement important, perte de connaissance), "
        "demande de contacter immédiatement les urgences locales."
    )

    if role == "patient":
        return (
            f"{base_rules}\n"
            f"Contexte patient: âge={context.get('age', 'N/A')}, genre={context.get('genre', 'N/A')}, "
            f"allergies={context.get('allergies', 'N/A')}, traitements={context.get('traitements', 'N/A')}."
        )

    if role == "medecin":
        return (
            f"{base_rules}\n"
            "L'utilisateur est un médecin. Donne des réponses orientées pratique clinique, communication patient et organisation."
            f" Contexte médecin: {context.get('nom', 'Médecin')}, spécialité={context.get('specialite', 'N/A')}, "
            f"expérience={context.get('annees_experience', 0)} ans."
        )

    return (
        f"{base_rules}\n"
        "Utilisateur non authentifié. Reste général et propose la connexion Dokira pour des réponses personnalisées."
    )


def _openai_post(url: str, payload: dict, api_key: str) -> dict:
    req = urllib_request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    try:
        with urllib_request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib_error.HTTPError as err:
        raw = ""
        try:
            raw = err.read().decode("utf-8", errors="ignore")
        except Exception:
            raw = ""
        detail = raw
        try:
            parsed = json.loads(raw) if raw else {}
            detail = parsed.get("error", {}).get("message") or raw or str(err)
        except Exception:
            detail = raw or str(err)
        raise RuntimeError(f"HTTP {err.code}: {detail}") from err


def call_llm_openai(system_prompt: str, user_message: str, history: list) -> str:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY manquante")

    cleaned_history = []
    if isinstance(history, list):
        for item in history[-8:]:
            if not isinstance(item, dict):
                continue
            role = item.get("role")
            content = str(item.get("content", "")).strip()
            if role in ("user", "assistant") and content:
                cleaned_history.append({
                    "role": role,
                    "content": [{"type": "input_text", "text": content}]
                })

    responses_payload = {
        "model": model,
        "input": [
            {"role": "system", "content": [{"type": "input_text", "text": system_prompt}]},
            *cleaned_history,
            {"role": "user", "content": [{"type": "input_text", "text": user_message}]}
        ],
        "temperature": 0.3,
        "max_output_tokens": 600
    }

    try:
        data = _openai_post("https://api.openai.com/v1/responses", responses_payload, api_key)
    except RuntimeError as first_error:
        # Compatibilité: bascule sur Chat Completions si /responses échoue (ex: 400)
        chat_payload = {
            "model": model,
            "temperature": 0.3,
            "max_tokens": 600,
            "messages": [
                {"role": "system", "content": system_prompt},
                *[
                    {"role": item["role"], "content": item["content"][0]["text"]}
                    for item in cleaned_history
                ],
                {"role": "user", "content": user_message}
            ]
        }
        try:
            data = _openai_post("https://api.openai.com/v1/chat/completions", chat_payload, api_key)
            choices = data.get("choices", [])
            if choices:
                content = choices[0].get("message", {}).get("content", "")
                if content:
                    return str(content).strip()
            raise RuntimeError("Réponse IA vide (chat/completions)")
        except RuntimeError:
            raise first_error

    output_text = (data or {}).get("output_text")
    if output_text:
        return output_text.strip()

    output = (data or {}).get("output", [])
    for item in output:
        content_items = item.get("content", [])
        for content in content_items:
            text_value = content.get("text")
            if text_value:
                return str(text_value).strip()

    raise RuntimeError("Réponse IA vide")


def get_ia_response(message: str, identity: dict, history: list) -> dict:
    """Génère une réponse du chat IA avec fallback local."""
    system_prompt = build_chat_system_prompt(identity)
    try:
        return {"text": call_llm_openai(system_prompt, message, history), "source": "openai"}
    except (urllib_error.URLError, urllib_error.HTTPError, RuntimeError, ValueError, TimeoutError) as llm_error:
        print(f"Erreur LLM, fallback local: {llm_error}")
        fallback_error = str(llm_error)

    context = identity.get("context", {})
    responses = {
        "symptôme": "Je peux donner des informations générales, mais consultez un médecin pour un avis personnalisé.",
        "médicament": "Ne modifiez jamais un traitement sans avis médical. Vérifiez avec votre médecin ou pharmacien.",
        "allergie": f"Allergies connues: {context.get('allergies', 'Aucune connue')}. Évitez les allergènes identifiés.",
        "traitement": f"Traitements indiqués: {context.get('traitements', 'Aucun')}. Suivez strictement les prescriptions.",
        "conseil": "Hydratation, sommeil régulier, alimentation équilibrée et activité physique adaptée.",
        "default": "Je peux aider avec des informations générales de santé et l'utilisation de Dokira."
    }

    message_lower = message.lower()
    for keyword, response in responses.items():
        if keyword in message_lower:
            return {"text": response, "source": "fallback", "error": fallback_error}
    return {"text": responses["default"], "source": "fallback", "error": fallback_error}


@router.get("/manifest.webmanifest")
async def pwa_manifest():
    manifest = {
        "name": "Dokira",
        "short_name": "Dokira",
        "start_url": "/",
        "scope": "/",
        "display": "standalone",
        "background_color": "#0D8ABC",
        "theme_color": "#0D8ABC",
        "description": "Plateforme médicale Dokira",
        "icons": [
            {"src": "/static/images/hero-image.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/static/images/hero-image.png", "sizes": "512x512", "type": "image/png"}
        ]
    }
    return Response(content=json.dumps(manifest, ensure_ascii=False), media_type="application/manifest+json")


@router.get("/service-worker.js")
async def service_worker_js():
    js_content = """
const CACHE_NAME = "dokira-cache-v1";
const URLS_TO_CACHE = ["/", "/main", "/static/css/styles.css", "/static/js/main.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
"""
    return Response(content=js_content, media_type="application/javascript")


# ============= FONCTION POUR VERIFIER L'AUTH (RAPIDE) =============

def verify_token(token: str):
    """VÃ©rifie un token JWT rapidement"""
    try:
        if token.startswith("Bearer "):
            token = token[7:]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None


# ============= INFORMATIONS MÃ‰DICALES PATIENT =============
@router.get("/api/patient/medical-info")
async def get_patient_medical_info(request: Request, db: Session = Depends(get_db)):
    """
    API pour rÃ©cupÃ©rer UNIQUEMENT les informations mÃ©dicales du patient
    (Sans les infos sensibles de connexion)
    """
    # VÃ©rification rapide du token
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    patient = get_user_by_email(db, email)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvÃ©")
    
    # Retourner uniquement les infos mÃ©dicales
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

# ============= RÃ‰CUPÃ‰RER INFORMATIONS MÃ‰DICALES VIA ASYNC =============

async def get_medical_info(request: Request, db: Session = Depends(get_db)):
    """
    Version alternative pour rÃ©cupÃ©rer les infos mÃ©dicales
    """
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        return {"success": False, "message": "Non authentifiÃ©"}
    
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
    
    
# ============= METTRE Ã€ JOUR INFORMATIONS MÃ‰DICALES PATIENT =============
@router.post("/api/patient/update-medical")
async def update_patient_medical_info(
    request: Request,
    patient_data: dict,
    db: Session = Depends(get_db)
):
    """
    API pour mettre Ã  jour UNIQUEMENT les informations mÃ©dicales
    (DiffÃ©rent de /api/patient/update qui met Ã  jour toutes les infos)
    """
    # VÃ©rification rapide du token
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    patient = get_user_by_email(db, email)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvÃ©")

    def sync_patient_dossier_medical() -> bool:
        rdv_recent = db.query(RendezVous).filter(
            RendezVous.patient_id == patient.id
        ).order_by(RendezVous.date_heure.desc()).first()

        dossier_recent = db.query(DossierMedical).filter(
            DossierMedical.patient_id == patient.id
        ).order_by(DossierMedical.date_consultation.desc()).first()

        medecin_id = rdv_recent.medecin_id if rdv_recent else (dossier_recent.medecin_id if dossier_recent else None)
        if not medecin_id:
            return False

        dossier = db.query(DossierMedical).filter(
            DossierMedical.patient_id == patient.id,
            DossierMedical.medecin_id == medecin_id
        ).order_by(DossierMedical.date_consultation.desc()).first()

        if not dossier:
            dossier = DossierMedical(
                medecin_id=medecin_id,
                patient_id=patient.id,
                date_consultation=datetime.utcnow(),
                motif_consultation="Mise a jour dossier patient",
                diagnostic="Mise a jour des informations medicales",
            )
            db.add(dossier)

        dossier.groupe_sanguin = patient.groupe_sanguin
        dossier.allergies = patient.allergies or ""
        dossier.antecedents_medicaux = patient.antecedents_medicaux or ""
        dossier.antecedents_familiaux = patient.antecedents_familiaux or ""
        dossier.numero_securite_sociale = patient.numero_securite_sociale or ""
        dossier.traitement = patient.traitements_en_cours or ""
        dossier.observations = "Synchro depuis espace patient"
        dossier.date_modification = datetime.utcnow()
        return True
    
    try:
        # Mettre Ã  jour uniquement les champs mÃ©dicaux
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
        sync_ok = sync_patient_dossier_medical()
        db.commit()
        
        return {
            "success": True,
            "message": "Informations mÃ©dicales mises Ã  jour avec succÃ¨s",
            "dossier_sync": sync_ok
        }
        
    except Exception as e:
        db.rollback()
        print(f"Erreur mise Ã  jour infos mÃ©dicales: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise Ã  jour: {str(e)}"
        )


@router.post("/api/dossier-medical/sync")
async def sync_dossier_medical_patient(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user_from_cookie(request, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifie")

    rdv_recent = db.query(RendezVous).filter(
        RendezVous.patient_id == current_user.id
    ).order_by(RendezVous.date_heure.desc()).first()

    dossier_recent = db.query(DossierMedical).filter(
        DossierMedical.patient_id == current_user.id
    ).order_by(DossierMedical.date_consultation.desc()).first()

    medecin_id = rdv_recent.medecin_id if rdv_recent else (dossier_recent.medecin_id if dossier_recent else None)
    if not medecin_id:
        return {
            "success": False,
            "message": "Aucun medecin lie au patient pour synchroniser le dossier"
        }

    dossier = db.query(DossierMedical).filter(
        DossierMedical.patient_id == current_user.id,
        DossierMedical.medecin_id == medecin_id
    ).order_by(DossierMedical.date_consultation.desc()).first()

    if not dossier:
        dossier = DossierMedical(
            medecin_id=medecin_id,
            patient_id=current_user.id,
            date_consultation=datetime.utcnow(),
            motif_consultation="Mise a jour dossier patient",
            diagnostic="Mise a jour des informations medicales"
        )
        db.add(dossier)

    dossier.groupe_sanguin = current_user.groupe_sanguin
    dossier.allergies = current_user.allergies or ""
    dossier.antecedents_medicaux = current_user.antecedents_medicaux or ""
    dossier.antecedents_familiaux = current_user.antecedents_familiaux or ""
    dossier.numero_securite_sociale = current_user.numero_securite_sociale or ""
    dossier.traitement = current_user.traitements_en_cours or ""
    dossier.observations = "Synchro manuelle depuis espace patient"
    dossier.date_modification = datetime.utcnow()

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur sync dossier medical: {str(e)}")

    return {
        "success": True,
        "message": "Dossier medical synchronise avec succes"
    }



# ============= SUPPRIMER COMPTE PATIENT =============
@router.delete("/api/patient/delete-account")
async def delete_patient_account(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Supprime le compte du patient (soft delete)
    """
    # VÃ©rification rapide du token
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    patient = get_user_by_email(db, email)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvÃ©")
    
    try:
        # Soft delete: dÃ©sactiver le compte au lieu de le supprimer
        patient.est_actif = False
        patient.email = f"deleted_{patient.id}_{patient.email}"  # EmpÃªche la rÃ©utilisation
        patient.date_modification = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": "Compte dÃ©sactivÃ© avec succÃ¨s"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression: {str(e)}"
        )
        
        
 # ============= ROUTES DOSSIER MÃ‰DICAL =============

@router.get("/api/dossier-medical")
async def get_dossier_medical_complet(request: Request, db: Session = Depends(get_db)):
    """API UNIFIÃ‰E pour rÃ©cupÃ©rer TOUTES les donnÃ©es du dossier mÃ©dical"""
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    # 1. DonnÃ©es du patient (table patients)
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
    
    # 3. RÃ©cupÃ©rer quelques consultations rÃ©centes
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
            "medecin": f"Dr. {medecin.prenom} {medecin.nom}" if medecin else "MÃ©decin",
            "specialite": medecin.specialite.value if medecin and medecin.specialite else "",
            "motif": dossier.motif_consultation or "",
            "diagnostic": dossier.diagnostic or ""
        })
    
    # 4. âœ… RÃ©cupÃ©rer les documents mÃ©dicaux du patient (depuis la table documents)
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
    
    # 5. âœ… RÃ©cupÃ©rer les ordonnances du patient (depuis la table ordonnances)
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
            # Infos mÃ©dicales
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
            
            # DÃ©tails
            "consultations_recentes": consultations_list,
            "documents": documents_list,
            "ordonnances": ordonnances_list,
            "has_data": bool(allergies or antecedents_medicaux or antecedents_familiaux or groupe_sanguin)
        }
    }

@router.get("/api/dossier-medical/historique-detaille")
async def get_historique_detaille(request: Request, db: Session = Depends(get_db)):
    """API pour l'historique dÃ©taillÃ©"""
    current_user = get_current_user_from_cookie(request, db)
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
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
            "medecin_nom": f"Dr. {medecin.prenom} {medecin.nom}" if medecin else "MÃ©decin",
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



# ============= STATISTIQUES PUBLIQUES =============

@router.get("/api/public/stats")
async def get_public_stats(db: Session = Depends(get_db)):
    """
    API pour rÃ©cupÃ©rer les statistiques rÃ©elles depuis la base de donnÃ©es
    - Patients gÃ©rÃ©s : nombre total de patients inscrits
    - Professionnels de santÃ© : nombre total de mÃ©decins inscrits
    - Consultations rÃ©alisÃ©es : nombre total de consultations + rendez-vous effectuÃ©s
    """
    try:
        # 1. Nombre total de patients inscrits
        total_patients = db.query(Patient).filter(Patient.est_actif == True).count()
        
        # 2. Nombre total de mÃ©decins inscrits (professionnels de santÃ©)
        total_medecins = db.query(Medecin).filter(Medecin.est_actif == True).count()
        
        # 3. Nombre total de consultations effectuÃ©es (depuis la table consultations)
        total_consultations = db.query(Consultation).count()
        
        # 4. Nombre total de rendez-vous effectuÃ©s (depuis la table rendez_vous)
        # On compte les rendez-vous avec statut "TerminÃ©" ou "ConfirmÃ©" comme effectuÃ©s
        total_rendez_vous_effectues = db.query(RendezVous).filter(
            RendezVous.statut.in_(["TerminÃ©", "ConfirmÃ©"])
        ).count()
        
        # Total des consultations rÃ©alisÃ©es = consultations + rendez-vous effectuÃ©s
        total_consultations_realisees = total_consultations + total_rendez_vous_effectues
        
        # 5. Taux de satisfaction (par dÃ©faut 99.9% si pas de donnÃ©es)
        # Vous pouvez calculer ce taux si vous avez des donnÃ©es de satisfaction
        # Sinon on garde la valeur par dÃ©faut
        taux_satisfaction = 99.9
        
        print(f"âœ… Stats rÃ©cupÃ©rÃ©es - Patients: {total_patients}, MÃ©decins: {total_medecins}, Consultations: {total_consultations_realisees}")
        
        return {
            "success": True,
            "stats": {
                "patients_geres": total_patients,
                "professionnels_sante": total_medecins,
                "consultations_realisees": total_consultations_realisees,
                "taux_satisfaction": taux_satisfaction
            }
        }
        
    except Exception as e:
        print(f"âŒ Erreur lors de la rÃ©cupÃ©ration des stats: {e}")
        import traceback
        traceback.print_exc()
        
        # En cas d'erreur, retourner des valeurs par dÃ©faut
        return {
            "success": False,
            "stats": {
                "patients_geres": 50000,
                "professionnels_sante": 1500,
                "consultations_realisees": 200000,
                "taux_satisfaction": 99.9
            },
            "error": str(e)
        }


@router.get("/api/public/stats/details")
async def get_public_stats_details(db: Session = Depends(get_db)):
    """
    API dÃ©taillÃ©e pour les statistiques (avec breakdown des consultations)
    """
    try:
        # Patients actifs
        total_patients_actifs = db.query(Patient).filter(Patient.est_actif == True).count()
        total_patients_inactifs = db.query(Patient).filter(Patient.est_actif == False).count()
        
        # MÃ©decins par spÃ©cialitÃ©
        medecins_par_specialite = db.query(
            Medecin.specialite, 
            func.count(Medecin.id).label('count')
        ).filter(
            Medecin.est_actif == True
        ).group_by(Medecin.specialite).all()
        
        specialites = []
        for specialite, count in medecins_par_specialite:
            specialites.append({
                "specialite": specialite.value if specialite else "Non spÃ©cifiÃ©",
                "count": count
            })
        
        # Consultations par statut
        consultations_par_statut = db.query(
            Consultation.statut,
            func.count(Consultation.id).label('count')
        ).group_by(Consultation.statut).all()
        
        consultations_stats = []
        for statut, count in consultations_par_statut:
            consultations_stats.append({
                "statut": statut or "Inconnu",
                "count": count
            })
        
        # Rendez-vous par statut
        rendez_vous_par_statut = db.query(
            RendezVous.statut,
            func.count(RendezVous.id).label('count')
        ).group_by(RendezVous.statut).all()
        
        rendez_vous_stats = []
        for statut, count in rendez_vous_par_statut:
            rendez_vous_stats.append({
                "statut": statut or "Inconnu",
                "count": count
            })
        
        return {
            "success": True,
            "details": {
                "patients": {
                    "actifs": total_patients_actifs,
                    "inactifs": total_patients_inactifs,
                    "total": total_patients_actifs + total_patients_inactifs
                },
                "medecins": {
                    "total": db.query(Medecin).filter(Medecin.est_actif == True).count(),
                    "par_specialite": specialites
                },
                "consultations": {
                    "total": db.query(Consultation).count(),
                    "par_statut": consultations_stats
                },
                "rendez_vous": {
                    "total": db.query(RendezVous).count(),
                    "par_statut": rendez_vous_stats
                }
            }
        }
        
    except Exception as e:
        print(f"âŒ Erreur stats dÃ©taillÃ©es: {e}")
        return {
            "success": False,
            "error": str(e)
        }
        
        
        
# ============= ROUTE PUBLIQUE - PARTENAIRES =============

# ============= ROUTE PUBLIQUE - PARTENAIRES =============

@router.get("/api/public/partenaires")
async def get_public_partenaires(
    db: Session = Depends(get_db)
):
    """RÃ©cupÃ¨re tous les partenaires pour l'affichage public"""
    partenaires = db.query(Partenaire).order_by(Partenaire.date_ajout.desc()).all()
    
    result = []
    for p in partenaires:
        logo_url = p.logo_url
        
        # CORRECTION: Si l'URL contient 'app/', on la corrige pour le frontend
        if logo_url and 'app/' in logo_url:
            # Transformer app/static/uploads/partenaires/xxx.jpg en /static/uploads/partenaires/xxx.jpg
            logo_url = '/' + logo_url.replace('app/', '', 1)
        # Ou si c'est un chemin absolu commenÃ§ant par app/
        elif logo_url and logo_url.startswith('app/'):
            logo_url = '/' + logo_url.replace('app/', '', 1)
        
        result.append({
            "id": p.id,
            "nom": p.nom,
            "type": p.type_partenaire,
            "logo_url": logo_url
        })
    
    return result

