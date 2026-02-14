# views_medecin.py - Routes pour les médecins
from fastapi import APIRouter, Request, Depends, HTTPException, status, Form, UploadFile, File
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse, FileResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pathlib import Path
import secrets
import shutil
from sqlalchemy import func, case, and_,literal
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from io import BytesIO
import tempfile
import os
from dotenv import load_dotenv


# Imports locaux
from app.database import get_db
from app.models import Medecin, Patient, RendezVous, DossierMedical, Message , StatutMessage, Document, Ordonnance, Specialite

# Charger les variables d'environnement
load_dotenv()

# Configuration
BASE_DIR = Path(__file__).resolve().parent
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = os.environ["JWT_ALGO"]
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"])

# Configuration du router et templates
router = APIRouter(prefix="/medecin", tags=["medecin"])
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Configuration du hachage de mot de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ============= FONCTIONS UTILITAIRES =============

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si le mot de passe correspond au hash"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Erreur lors de la vérification du mot de passe: {e}")
        return False


def get_password_hash(password: str) -> str:
    """Hash un mot de passe"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Crée un token JWT"""
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


def get_medecin_by_email(db: Session, email: str):
    """Récupère un médecin par email"""
    try:
        return db.query(Medecin).filter(Medecin.email == email.lower().strip()).first()
    except Exception as e:
        print(f"Erreur lors de la récupération du médecin: {e}")
        return None


def authenticate_medecin(db: Session, email: str, password: str):
    """Authentifie un médecin"""
    medecin = get_medecin_by_email(db, email)
    
    if not medecin:
        print(f"Médecin non trouvé avec l'email: {email}")
        return None
    
    if not verify_password(password, medecin.mot_de_passe_hash):
        print(f"Mot de passe incorrect pour l'email: {email}")
        return None
    
    if not medecin.est_actif:
        print(f"Compte inactif pour l'email: {email}")
        return None
    
    return medecin


def get_current_medecin_from_cookie(request: Request, db: Session):
    """Récupère le médecin actuel depuis le cookie"""
    token = request.cookies.get("medecin_access_token")
    
    if not token:
        return None
    
    try:
        if token.startswith("Bearer "):
            token = token[7:]
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            return None
        
        medecin = get_medecin_by_email(db, email)
        return medecin
        
    except JWTError as e:
        print(f"Erreur JWT: {e}")
        return None
    except Exception as e:
        print(f"Erreur lors de la récupération du médecin: {e}")
        return None


# ============= ROUTES HTML =============

@router.get("/inscriptionMedecin", response_class=HTMLResponse)
def page_inscription_medecin(request: Request):
    return templates.TemplateResponse("inscriptionMedecin.html", {"request": request})

@router.get("/connexionMedecin", response_class=HTMLResponse)
def page_connexion_medecin(request: Request, db: Session = Depends(get_db)):
    """Page de connexion médecin"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if current_medecin:
        return RedirectResponse(url="/medecin/dashboard", status_code=303)
    
    return templates.TemplateResponse("connexionMedecin.html", {"request": request})


@router.get("/dashboard", response_class=HTMLResponse)
@router.get("/", response_class=HTMLResponse)
def dashboard_medecin(request: Request, db: Session = Depends(get_db)):
    """Dashboard médecin - Nécessite authentification"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        return RedirectResponse(url="/connexionMedecin", status_code=303)
    
    # Mettre à jour la dernière connexion
    try:
        current_medecin.derniere_connexion = datetime.utcnow()
        db.commit()
    except Exception as e:
        print(f"Erreur lors de la mise à jour de la dernière connexion: {e}")
        db.rollback()
    
    return templates.TemplateResponse(
        "EspaceMedecin.html",
        {
            "request": request,
            "medecin": current_medecin,
            "nom_complet": current_medecin.nom_complet
        }
    )


# ============= ROUTES POST - AUTHENTIFICATION =============

@router.post("/connexion")
async def login_medecin(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Connexion médecin"""
    email = email.strip().lower()
    
    medecin = authenticate_medecin(db, email, password)
    
    if not medecin:
        return templates.TemplateResponse(
            "connexionMedecin.html",
            {
                "request": request,
                "error": "Email ou mot de passe incorrect",
                "email": email
            },
            status_code=401
        )
    
    if not medecin.est_actif:
        return templates.TemplateResponse(
            "connexionMedecin.html",
            {
                "request": request,
                "error": "Votre compte a été désactivé. Contactez le support.",
                "email": email
            },
            status_code=403
        )
    
    # Créer le token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": medecin.email,
            "medecin_id": medecin.id,
            "nom": medecin.nom,
            "prenom": medecin.prenom,
            "specialite": medecin.specialite.value if medecin.specialite else None
        },
        expires_delta=access_token_expires
    )
    
    # Mettre à jour la dernière connexion
    try:
        medecin.derniere_connexion = datetime.utcnow()
        db.commit()
    except Exception as e:
        print(f"Erreur lors de la mise à jour: {e}")
        db.rollback()
    
    # Redirection
    response = RedirectResponse(url="/medecin/dashboard", status_code=303)
    
    response.set_cookie(
        key="medecin_access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False
    )
    
    return response

@router.post("/inscription")
async def register_medecin(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    nom: str = Form(...),
    prenom: str = Form(...),
    specialite: str = Form(...),
    telephone: str = Form(...),
    numero_ordre: str = Form(default=None),
    adresse: str = Form(default=None),
    ville: str = Form(default=None),
    code_postal: str = Form(default=None),
    langues: str = Form(default=None),
    acceptConditions: str = Form(default=None),
    db: Session = Depends(get_db)
):
    """Inscription d'un nouveau médecin"""

    email = email.strip().lower()

    # ✅ Validation conditions
    if acceptConditions != "on":
        return templates.TemplateResponse(
            "inscriptionMedecin.html",
            {
                "request": request,
                "error": "Vous devez accepter les conditions d'utilisation",
                "email": email
            },
            status_code=400
        )

    # ✅ Validation longueur mot de passe (bcrypt max = 72 bytes)
    if len(password.encode("utf-8")) > 72:
        return templates.TemplateResponse(
            "inscriptionMedecin.html",
            {
                "request": request,
                "error": "Le mot de passe est trop long (72 caractères max)",
                "email": email
            },
            status_code=400
        )

    # ✅ Vérifier email existant
    existing = get_medecin_by_email(db, email)
    if existing:
        return templates.TemplateResponse(
            "inscriptionMedecin.html",
            {
                "request": request,
                "error": "Cet email est déjà utilisé",
                "email": email
            },
            status_code=400
        )

    try:
        nouveau_medecin = Medecin(
            email=email,
            mot_de_passe_hash=get_password_hash(password),
            nom=nom.strip().capitalize(),
            prenom=prenom.strip().capitalize(),
            specialite=specialite,
            telephone=telephone.strip(),
            numero_ordre=numero_ordre.strip() if numero_ordre else None,
            adresse=adresse.strip() if adresse else None,
            ville=ville.strip().capitalize() if ville else None,
            code_postal=code_postal.strip() if code_postal else None,
            langues=langues.strip() if langues else None,
            est_actif=True,
            date_creation=datetime.utcnow()
        )

        db.add(nouveau_medecin)
        db.commit()
        db.refresh(nouveau_medecin)

        # ✅ Création du token
        access_token = create_access_token(
            data={
                "sub": nouveau_medecin.email,
                "medecin_id": nouveau_medecin.id,
                "nom": nouveau_medecin.nom,
                "prenom": nouveau_medecin.prenom,
                "specialite": nouveau_medecin.specialite.value if nouveau_medecin.specialite else None
            },
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        response = RedirectResponse(url="/medecin/dashboard", status_code=303)
        response.set_cookie(
            key="medecin_access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            samesite="lax",
            secure=False
        )

        return response

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur création médecin: {e}")
        return templates.TemplateResponse(
            "inscriptionMedecin.html",
            {
                "request": request,
                "error": "Erreur lors de la création du compte",
                "email": email
            },
            status_code=500
        )

@router.get("/deconnexionMedecin")
async def deconnexion_medecin_legacy():
    """Route legacy pour compatibilité"""
    response = RedirectResponse(url="/medecin/connexionMedecin", status_code=303)
    response.delete_cookie(key="medecin_access_token")
    return response


# ============= API - DONNÉES =============

@router.get("/api/info")
async def get_medecin_info(request: Request, db: Session = Depends(get_db)):
    """Récupère les informations du médecin connecté"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    return {
        "id": current_medecin.id,
        "email": current_medecin.email,
        "nom": current_medecin.nom,
        "prenom": current_medecin.prenom,
        "nom_complet": current_medecin.nom_complet,
        "specialite": current_medecin.specialite.value if current_medecin.specialite else None,
        "photo_profil_url": current_medecin.photo_profil_url,
        "langues": current_medecin.langues_liste
    }


@router.get("/api/profil/complete")
async def get_complete_medecin_info(request: Request, db: Session = Depends(get_db)):
    """Récupère les informations personnelles et professionnelles du médecin."""
    current_medecin = get_current_medecin_from_cookie(request, db)

    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")

    return {
        "id": current_medecin.id,
        "prenom": current_medecin.prenom,
        "nom": current_medecin.nom,
        "email": current_medecin.email,
        "telephone": current_medecin.telephone or "",
        "specialite": current_medecin.specialite.value if current_medecin.specialite else "Médecin",
        "photo_profil_url": current_medecin.photo_profil_url,
        "annees_experience": current_medecin.annees_experience or 0,
        "adresse_cabinet": current_medecin.adresse or "",
        "ville": current_medecin.ville or "",
        "code_postal": current_medecin.code_postal or ""
    }


@router.post("/api/profil/update")
async def update_medecin_profile(
    request: Request,
    nom: str = Form(...),
    prenom: str = Form(...),
    email: str = Form(...),
    telephone: str = Form(default=""),
    specialite: str = Form(default=""),
    adresse_cabinet: str = Form(default=""),
    annees_experience: str = Form(default="0"),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """Met à jour les informations personnelles et professionnelles du médecin."""
    current_medecin = get_current_medecin_from_cookie(request, db)
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")

    new_email = email.strip().lower()
    if new_email != current_medecin.email:
        existing = db.query(Medecin).filter(Medecin.email == new_email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    current_medecin.nom = nom.strip()
    current_medecin.prenom = prenom.strip()
    current_medecin.email = new_email
    current_medecin.telephone = telephone.strip() if telephone else None
    current_medecin.adresse = adresse_cabinet.strip() if adresse_cabinet else None

    try:
        current_medecin.annees_experience = max(0, int(annees_experience or "0"))
    except ValueError:
        raise HTTPException(status_code=400, detail="Le nombre d'années d'expérience est invalide")

    specialite_value = (specialite or "").strip()
    if specialite_value:
        matched_specialite = None
        for sp in Specialite:
            if specialite_value.lower() == sp.value.lower() or specialite_value.lower() == sp.name.lower():
                matched_specialite = sp
                break
        if matched_specialite is None:
            raise HTTPException(status_code=400, detail="Spécialité invalide")
        current_medecin.specialite = matched_specialite

    if photo is not None:
        if not photo.content_type or not photo.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Fichier image invalide")

        upload_dir = Path("app/static/uploads/medecins")
        upload_dir.mkdir(parents=True, exist_ok=True)

        ext = photo.filename.split(".")[-1] if photo.filename and "." in photo.filename else "jpg"
        filename = f"medecin_{current_medecin.id}_{secrets.token_hex(8)}.{ext}"
        file_path = upload_dir / filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)

        current_medecin.photo_profil_url = f"/static/uploads/medecins/{filename}"

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur update profil médecin: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour")

    return {"success": True, "message": "Profil mis à jour"}


@router.get("/api/patients")
async def get_patients_list(request: Request, db: Session = Depends(get_db)):
    """Liste des patients du médecin"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    # Récupérer les patients via les RDV
    patients = db.query(Patient).join(RendezVous).filter(
        RendezVous.medecin_id == current_medecin.id
    ).distinct().order_by(Patient.nom.asc(), Patient.prenom.asc()).all()
    
    return [
        {
            "id": p.id,
            "nom_complet": p.nom_complet,
            "age": p.age,
            "genre": p.genre.value if p.genre else None,
            "telephone": p.telephone,
            "email": p.email
        }
        for p in patients
    ]

@router.get("/api/rendez-vous")
async def get_rendez_vous(
    request: Request,
    filtre: str = "tous",
    db: Session = Depends(get_db)
):
    """Liste des rendez-vous"""
    current_medecin = get_current_medecin_from_cookie(request, db)

    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")

    query = db.query(RendezVous).filter(
        RendezVous.medecin_id == current_medecin.id
    )

    # Filtres temporels
    today = datetime.now().date()

    if filtre == "aujourd_hui":
        query = query.filter(
            RendezVous.date_heure >= datetime.combine(today, datetime.min.time()),
            RendezVous.date_heure < datetime.combine(today, datetime.max.time())
        )

    elif filtre == "semaine":
        start_week = today - timedelta(days=today.weekday())
        query = query.filter(
            RendezVous.date_heure >= datetime.combine(start_week, datetime.min.time())
        )

    elif filtre == "mois":
        query = query.filter(
            RendezVous.date_heure >= datetime(today.year, today.month, 1)
        )

    rdvs = query.order_by(RendezVous.date_heure.desc()).all()

    results = []
    for rdv in rdvs:
        # ✅ CORRECTION: Gestion sécurisée du type_consultation
        if hasattr(rdv.type_consultation, 'value'):
            # C'est un Enum
            type_safe = rdv.type_consultation.value
        else:
            # C'est déjà une string ou None
            type_safe = rdv.type_consultation or "Cabinet"

        # ✅ CORRECTION: Gestion sécurisée du statut
        if hasattr(rdv.statut, 'value'):
            # C'est un Enum
            statut_safe = rdv.statut.value
        else:
            # C'est déjà une string ou None
            statut_safe = rdv.statut or "Planifié"

        results.append({
            "id": rdv.id,
            "patient": {
                "nom_complet": rdv.patient.nom_complet if rdv.patient else "Patient supprimé",
                "telephone": rdv.patient.telephone if rdv.patient else ""
            },
            "date_heure": rdv.date_heure.isoformat(),
            "motif": rdv.motif or "",
            "type": type_safe,
            "statut": statut_safe
        })

    return results


@router.get("/api/historique")
async def get_historique_medecin(request: Request, db: Session = Depends(get_db)):
    """Historique des consultations et rendez-vous du médecin (semaine/mois)."""
    current_medecin = get_current_medecin_from_cookie(request, db)

    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")

    now = datetime.now()
    today = now.date()
    start_week = today - timedelta(days=today.weekday())
    start_week_dt = datetime.combine(start_week, datetime.min.time())
    start_month_dt = datetime(today.year, today.month, 1)

    # Consultations (dossiers médicaux)
    consultations_week = db.query(DossierMedical).filter(
        DossierMedical.medecin_id == current_medecin.id,
        DossierMedical.date_consultation >= start_week_dt,
        DossierMedical.date_consultation <= now
    ).order_by(DossierMedical.date_consultation.desc()).all()

    consultations_month = db.query(DossierMedical).filter(
        DossierMedical.medecin_id == current_medecin.id,
        DossierMedical.date_consultation >= start_month_dt,
        DossierMedical.date_consultation <= now
    ).order_by(DossierMedical.date_consultation.desc()).all()

    # Rendez-vous déjà passés
    rdv_week = db.query(RendezVous).filter(
        RendezVous.medecin_id == current_medecin.id,
        RendezVous.date_heure >= start_week_dt,
        RendezVous.date_heure <= now
    ).order_by(RendezVous.date_heure.desc()).all()

    rdv_month = db.query(RendezVous).filter(
        RendezVous.medecin_id == current_medecin.id,
        RendezVous.date_heure >= start_month_dt,
        RendezVous.date_heure <= now
    ).order_by(RendezVous.date_heure.desc()).all()

    def _map_consultation(dossier: DossierMedical):
        patient_nom = dossier.patient.nom_complet if dossier.patient else "Patient supprimé"
        return {
            "id": dossier.id,
            "patient_nom": patient_nom,
            "date_consultation": dossier.date_consultation.isoformat() if dossier.date_consultation else None,
            "motif": dossier.motif_consultation or "",
            "diagnostic": dossier.diagnostic or ""
        }

    def _map_rdv(rdv: RendezVous):
        patient_nom = rdv.patient.nom_complet if rdv.patient else "Patient supprimé"
        if hasattr(rdv.type_consultation, "value"):
            type_safe = rdv.type_consultation.value
        else:
            type_safe = rdv.type_consultation or "Cabinet"

        if hasattr(rdv.statut, "value"):
            statut_safe = rdv.statut.value
        else:
            statut_safe = rdv.statut or "Planifié"

        return {
            "id": rdv.id,
            "patient_nom": patient_nom,
            "date_heure": rdv.date_heure.isoformat() if rdv.date_heure else None,
            "motif": rdv.motif or "",
            "type": type_safe,
            "statut": statut_safe
        }

    consultations_week_data = [_map_consultation(c) for c in consultations_week]
    consultations_month_data = [_map_consultation(c) for c in consultations_month]
    rdv_week_data = [_map_rdv(r) for r in rdv_week]
    rdv_month_data = [_map_rdv(r) for r in rdv_month]

    return {
        "consultations": {
            "semaine": consultations_week_data,
            "mois": consultations_month_data,
            "total_semaine": len(consultations_week_data),
            "total_mois": len(consultations_month_data)
        },
        "rendez_vous": {
            "semaine": rdv_week_data,
            "mois": rdv_month_data,
            "total_semaine": len(rdv_week_data),
            "total_mois": len(rdv_month_data)
        }
    }


@router.get("/api/stats")
async def get_stats(request: Request, db: Session = Depends(get_db)):
    """Statistiques du dashboard"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    today = datetime.now().date()
    
    # RDV aujourd'hui
    rdv_today = db.query(RendezVous).filter(
        RendezVous.medecin_id == current_medecin.id,
        RendezVous.date_heure >= datetime.combine(today, datetime.min.time()),
        RendezVous.date_heure < datetime.combine(today, datetime.max.time())
    ).count()
    
    # Patients actifs
    patients_actifs = db.query(Patient).join(RendezVous).filter(
        RendezVous.medecin_id == current_medecin.id
    ).distinct().count()
    
    # En traitement
    en_traitement = db.query(DossierMedical).filter(
        DossierMedical.medecin_id == current_medecin.id,
        DossierMedical.statut_traitement == "En cours de traitement"
    ).count()
    
    # Messages non lus
    messages_non_lus = db.query(Message).filter(
        Message.medecin_id == current_medecin.id,
        Message.de_medecin == False,
        Message.statut != StatutMessage.LU
    ).count()
    
    return {
        "rdv_today": rdv_today,
        "patients_actifs": patients_actifs,
        "en_traitement": en_traitement,
        "messages_non_lus": messages_non_lus
    }
    

# ============= MESSAGERIE ROUTES =============

@router.get("/api/messagerie/conversations")
async def get_conversations(request: Request, db: Session = Depends(get_db)):
    """Récupère la liste des conversations du médecin avec compteurs"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    # Récupérer tous les patients avec lesquels le médecin a un RDV
    # Grouper par conversation (patient)
    from app.models import StatutMessage
    
    conversations = db.query(
    Patient.id,
    func.concat(Patient.prenom, " ", Patient.nom).label("nom_complet"),
    Patient.email,
    Patient.telephone,
    func.count(Message.id).label('nb_messages'),
    func.max(Message.date_envoi).label('derniere_date'),
    func.sum(
        case(
            (and_(Message.de_medecin == False, Message.statut != StatutMessage.LU), 1),
            else_=0
        )
      ).label('non_lus')
    ).outerjoin(
      Message, (Message.patient_id == Patient.id) & (Message.medecin_id == current_medecin.id)
    ).join(
      RendezVous, RendezVous.patient_id == Patient.id
    ).filter(
     RendezVous.medecin_id == current_medecin.id
    ).group_by(
        Patient.id,
        Patient.prenom,
        Patient.nom,
        Patient.email,
        Patient.telephone
    ).order_by(
        func.max(Message.date_envoi).desc()
    ).all()
        
    return [
        {
            "patient_id": conv.id,
            "nom_complet": conv.nom_complet,
            "email": conv.email,
            "telephone": conv.telephone or "N/A",
            "nombre_messages": conv.nb_messages or 0,
            "derniere_date": conv.derniere_date.isoformat() if conv.derniere_date else None,
            "non_lus": conv.non_lus or 0
        }
        for conv in conversations
    ]


@router.get("/api/messagerie/conversation/{patient_id}")
async def get_conversation_messages(
    patient_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Récupère tous les messages d'une conversation avec un patient"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    # Vérifier que le médecin a une relation avec ce patient via un RDV
    patient_rdv = db.query(RendezVous).filter(
        RendezVous.patient_id == patient_id,
        RendezVous.medecin_id == current_medecin.id
    ).first()
    
    if not patient_rdv:
        raise HTTPException(status_code=403, detail="Accès refusé à cette conversation")
    
    # ✅ FIX 1: Sélection explicite AVANT conversion enum
    messages_raw = db.query(
        Message.id,
        Message.contenu,
        Message.sujet,
        Message.de_medecin,
        Message.date_envoi,
        Message.statut  # Récupère comme STRING brut
    ).filter(
        Message.patient_id == patient_id,
        Message.medecin_id == current_medecin.id
    ).order_by(Message.date_envoi.asc()).all()
    
    # Convertir statut en string safe
    messages_safe = []
    for msg_raw in messages_raw:
        statut_safe = str(msg_raw.statut) if msg_raw.statut else 'INCONNU'
        messages_safe.append({
            'id': msg_raw.id,
            'contenu': msg_raw.contenu,
            'sujet': msg_raw.sujet,
            'de_medecin': msg_raw.de_medecin,
            'date_envoi': msg_raw.date_envoi,
            'statut': statut_safe  # ✅ STRING SAFE
        })
    
    # ✅ FIX 2: Marquer comme lus (sur ID, pas objets)
    try:
        from app.models import StatutMessage
        db.query(Message).filter(
            Message.patient_id == patient_id,
            Message.medecin_id == current_medecin.id,
            Message.de_medecin == False
        ).update(
            {Message.statut: StatutMessage.LU.value},  # Utilise .value (string)
            synchronize_session=False
        )
        db.commit()
        print(f"✅ {len(messages_raw)} messages marqués comme lus pour patient {patient_id}")
    except Exception as e:
        print(f"⚠️ Erreur marquage lu: {e}")
        db.rollback()
    
    # Récupérer les infos du patient
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
    
    return {
        "patient": {
            "id": patient.id,
            "nom_complet": patient.nom_complet,
            "email": patient.email,
            "telephone": patient.telephone or "N/A"
        },
        "messages": [
            {
                "id": msg['id'],
                "contenu": msg['contenu'],
                "sujet": msg['sujet'],
                "de_medecin": msg['de_medecin'],
                "date_envoi": msg['date_envoi'].isoformat(),
                "statut": msg['statut']
            }
            for msg in messages_safe
        ]
    }

@router.post("/api/messagerie/send")
async def send_message_to_patient(
    request: Request,
    patient_id: int = Form(...),
    sujet: str = Form("Message"),
    contenu: str = Form(...),
    db: Session = Depends(get_db)
):
    """Envoie un message à un patient"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    # Validation des champs
    sujet = (sujet or "Message").strip()
    contenu = contenu.strip()
    
    if not contenu:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": "Contenu obligatoire"}
        )
    
    if len(sujet) > 255:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": "Sujet trop long (max 255 caractères)"}
        )
    
    # Vérifier que le patient existe
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        return JSONResponse(
            status_code=404,
            content={"success": False, "error": "Patient non trouvé"}
        )
    
    # Vérifier que le médecin a une relation avec ce patient via un RDV
    patient_rdv = db.query(RendezVous).filter(
        RendezVous.patient_id == patient_id,
        RendezVous.medecin_id == current_medecin.id
    ).first()
    
    if not patient_rdv:
        return JSONResponse(
            status_code=403,
            content={"success": False, "error": "Accès refusé à cette conversation"}
        )
    
    try:
        from app.models import StatutMessage
        
        nouveau_message = Message(
            medecin_id=current_medecin.id,
            patient_id=patient_id,
            de_medecin=True,
            sujet=sujet,
            contenu=contenu,
            statut=StatutMessage.ENVOYE,
            date_envoi=datetime.utcnow()
        )
        
        db.add(nouveau_message)
        db.commit()
        db.refresh(nouveau_message)
        
        return {
            "success": True,
            "message_id": nouveau_message.id,
            "date_envoi": nouveau_message.date_envoi.isoformat(),
            "statut": nouveau_message.statut.value if hasattr(nouveau_message.statut, 'value') else str(nouveau_message.statut)
        }
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur envoi message: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "Erreur lors de l'envoi du message"}
        )


@router.get("/api/messagerie/patients-list")
async def get_patients_for_messaging(request: Request, db: Session = Depends(get_db)):
    """Récupère la liste des patients pour sélection dans la messagerie"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    # Récupérer les patients du médecin via les RDV
    patients = db.query(Patient).join(RendezVous).filter(
        RendezVous.medecin_id == current_medecin.id
    ).distinct().all()
    
    return [
        {
            "id": p.id,
            "nom_complet": p.nom_complet,
            "email": p.email,
            "telephone": p.telephone or "N/A"
        }
        for p in patients
    ]


@router.put("/api/messagerie/mark-as-read/{message_id}")
async def mark_message_as_read(
    message_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Marque un message comme lu"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    message = db.query(Message).filter(
        Message.id == message_id,
        Message.medecin_id == current_medecin.id
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    
    try:
        from app.models import StatutMessage
        message.statut = StatutMessage.LU
        db.commit()
        return {"success": True, "statut": message.statut.value if hasattr(message.statut, 'value') else str(message.statut)}
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur mise à jour message: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour")



# ============= API - DOSSIERS MÉDICAUX =============

@router.get("/api/dossiers-medicaux")
async def get_dossiers_medicaux(
    request: Request,
    statut: str = None,
    db: Session = Depends(get_db)
):
    """Récupère TOUS les dossiers médicaux des patients du médecin"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    # Récupérer tous les dossiers du médecin
    query = db.query(DossierMedical).filter(
        DossierMedical.medecin_id == current_medecin.id
    )
    
    # Filtrer par statut si spécifié
    if statut:
        query = query.filter(DossierMedical.statut_traitement == statut)
    
    dossiers = query.order_by(DossierMedical.date_consultation.desc()).all()
    
    result = []
    for d in dossiers:
        # Récupérer le patient associé
        patient = d.patient
        
        # Récupérer le document s'il existe
        document = None
        if d.document_id:
            doc_obj = db.query(Document).filter(Document.id == d.document_id).first()
            if doc_obj:
                document = {
                    "id": doc_obj.id,
                    "titre": doc_obj.titre,
                    "type": doc_obj.type_document,
                    "url": doc_obj.fichier_url
                }
        
        # Récupérer l'ordonnance s'elle existe
        ordonnance = None
        if d.ordonnance_id:
            ord_obj = db.query(Ordonnance).filter(Ordonnance.id == d.ordonnance_id).first()
            if ord_obj:
                ordonnance = {
                    "id": ord_obj.id,
                    "medecin_nom": ord_obj.medecin_nom,
                    "date_emission": ord_obj.date_emission.strftime("%d/%m/%Y") if ord_obj.date_emission else None,
                    "medicaments": ord_obj.medicaments,
                    "statut": ord_obj.statut
                }
        
        result.append({
            "id": d.id,
            "patient": {
                "id": patient.id if patient else None,
                "nom_complet": patient.nom_complet if patient else "Patient supprimé",
                "email": patient.email if patient else "N/A",
                "telephone": patient.telephone if patient else "N/A",
                "age": patient.age if patient else None
            },
            "date_consultation": d.date_consultation.strftime("%d/%m/%Y") if d.date_consultation else None,
            "date_consultation_iso": d.date_consultation.isoformat() if d.date_consultation else None,
            "motif": d.motif_consultation or "",
            "diagnostic": d.diagnostic or "",
            "traitement": d.traitement or "",
            "observations": d.observations or "",
            "groupe_sanguin": d.groupe_sanguin.value if d.groupe_sanguin else None,
            "allergies": d.allergies or "",
            "antecedents_medicaux": d.antecedents_medicaux or "",
            "antecedents_familiaux": d.antecedents_familiaux or "",
            "numero_securite_sociale": d.numero_securite_sociale or "",
            "statut_traitement": d.statut_traitement.value if d.statut_traitement else "À traiter",
            "document": document,
            "ordonnance": ordonnance
        })
    
    return {
        "success": True,
        "total": len(result),
        "dossiers": result
    }


@router.get("/api/dossiers-medicaux/{dossier_id}")
async def get_dossier_medical_detail(
    dossier_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Récupère les détails d'un dossier médical spécifique"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    dossier = db.query(DossierMedical).filter(
        DossierMedical.id == dossier_id,
        DossierMedical.medecin_id == current_medecin.id
    ).first()
    
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    
    patient = dossier.patient
    
    # Récupérer le document
    document = None
    if dossier.document_id:
        doc_obj = db.query(Document).filter(Document.id == dossier.document_id).first()
        if doc_obj:
            document = {
                "id": doc_obj.id,
                "titre": doc_obj.titre,
                "type": doc_obj.type_document,
                "url": doc_obj.fichier_url,
                "date_upload": doc_obj.date_upload.strftime("%d/%m/%Y") if doc_obj.date_upload else None
            }
    
    # Récupérer l'ordonnance
    ordonnance = None
    if dossier.ordonnance_id:
        ord_obj = db.query(Ordonnance).filter(Ordonnance.id == dossier.ordonnance_id).first()
        if ord_obj:
            ordonnance = {
                "id": ord_obj.id,
                "medecin_nom": ord_obj.medecin_nom,
                "date_emission": ord_obj.date_emission.strftime("%d/%m/%Y") if ord_obj.date_emission else None,
                "medicaments": ord_obj.medicaments,
                "posologie": ord_obj.posologie,
                "duree_traitement": ord_obj.duree_traitement,
                "statut": ord_obj.statut,
                "fichier_url": ord_obj.fichier_url
            }
    
    # Récupérer tous les dossiers du même patient pour l'historique
    historique = db.query(DossierMedical).filter(
        DossierMedical.patient_id == patient.id,
        DossierMedical.medecin_id == current_medecin.id
    ).order_by(DossierMedical.date_consultation.desc()).all()
    
    historique_list = []
    for h in historique:
        historique_list.append({
            "id": h.id,
            "date": h.date_consultation.strftime("%d/%m/%Y") if h.date_consultation else None,
            "motif": h.motif_consultation or "",
            "diagnostic": h.diagnostic or "",
            "statut": h.statut_traitement.value if h.statut_traitement else "À traiter"
        })
    
    return {
        "success": True,
        "dossier": {
            "id": dossier.id,
            "patient": {
                "id": patient.id if patient else None,
                "nom_complet": patient.nom_complet if patient else "Patient supprimé",
                "email": patient.email if patient else "N/A",
                "telephone": patient.telephone if patient else "N/A",
                "age": patient.age if patient else None,
                "genre": patient.genre.value if patient and patient.genre else None
            },
            "date_consultation": dossier.date_consultation.strftime("%d/%m/%Y") if dossier.date_consultation else None,
            "motif": dossier.motif_consultation or "",
            "diagnostic": dossier.diagnostic or "",
            "traitement": dossier.traitement or "",
            "observations": dossier.observations or "",
            "groupe_sanguin": dossier.groupe_sanguin.value if dossier.groupe_sanguin else None,
            "allergies": dossier.allergies or "",
            "antecedents_medicaux": dossier.antecedents_medicaux or "",
            "antecedents_familiaux": dossier.antecedents_familiaux or "",
            "numero_securite_sociale": dossier.numero_securite_sociale or "",
            "statut_traitement": dossier.statut_traitement.value if dossier.statut_traitement else "À traiter",
            "document": document,
            "ordonnance": ordonnance,
            "historique": historique_list
        }
    }


 # ============= API - ORDONNANCES =============

@router.post("/api/ordonnances/creer")
async def creer_ordonnance(
    request: Request,
    patient_id: int = Form(...),
    medicaments: str = Form(...),
    posologie: str = Form(...),
    duree_traitement: str = Form(...),
    db: Session = Depends(get_db)
):
    """Crée une ordonnance et génère un PDF"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    # Vérifier que le patient existe
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
    
    # Vérifier que le médecin a une relation avec ce patient via un RDV
    patient_rdv = db.query(RendezVous).filter(
        RendezVous.patient_id == patient_id,
        RendezVous.medecin_id == current_medecin.id
    ).first()
    
    if not patient_rdv:
        raise HTTPException(status_code=403, detail="Accès refusé à ce patient")
    
    try:
        # Créer l'ordonnance en BD
        ordonnance = Ordonnance(
            patient_id=patient_id,
            medecin_nom=f"Dr. {current_medecin.prenom} {current_medecin.nom}",
            date_emission=datetime.now().date(),
            medicaments=medicaments.strip(),
            posologie=posologie.strip(),
            duree_traitement=duree_traitement.strip(),
            statut="Active"
        )
        
        db.add(ordonnance)
        db.commit()
        db.refresh(ordonnance)
        
        # Générer le PDF
        pdf_buffer = generer_pdf_ordonnance(ordonnance, patient, current_medecin)
        
        # Sauvegarder le fichier
        upload_dir = Path("static/uploads/ordonnances")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        filename = f"ordonnance_{ordonnance.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = upload_dir / filename
        
        with open(filepath, 'wb') as f:
            f.write(pdf_buffer.getvalue())
        
        # Mettre à jour l'URL du fichier
        ordonnance.fichier_url = f"/static/uploads/ordonnances/{filename}"
        db.commit()
        
        return {
            "success": True,
            "ordonnance_id": ordonnance.id,
            "fichier_url": ordonnance.fichier_url,
            "message": "Ordonnance créée et PDF généré"
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur création ordonnance: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création de l'ordonnance")


def generer_pdf_ordonnance(ordonnance, patient, medecin):
    """Génère le PDF de l'ordonnance"""
    buffer = BytesIO()
    
    # Créer le document PDF
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#0d8abc'),
        spaceAfter=20,
        alignment=1  # Center
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#0d8abc'),
        spaceAfter=12,
        spaceBefore=12,
        borderPadding=10
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        leading=16
    )
    
    # En-tête
    elements.append(Paragraph("ORDONNANCE MÉDICALE", title_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Infos Cabinet/Médecin
    medecin_info = f"""
    <b>Dr. {medecin.prenom} {medecin.nom}</b><br/>
    Spécialité: {medecin.specialite.value if medecin.specialite else 'Généraliste'}<br/>
    Téléphone: {medecin.telephone or 'N/A'}<br/>
    Numéro d'ordre: {medecin.numero_ordre or 'N/A'}
    """
    elements.append(Paragraph(medecin_info, normal_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Ligne séparatrice
    elements.append(Paragraph("_" * 80, normal_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Infos Patient
    elements.append(Paragraph("INFORMATIONS PATIENT", heading_style))
    
    patient_data = [
        ['Nom Complet:', patient.nom_complet],
        ['Âge:', f"{patient.age} ans"],
        ['Genre:', patient.genre.value if patient.genre else 'N/A'],
        ['Date de naissance:', patient.date_naissance.strftime("%d/%m/%Y") if patient.date_naissance else 'N/A'],
    ]
    
    patient_table = Table(patient_data, colWidths=[2*inch, 4*inch])
    patient_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(patient_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Ligne séparatrice
    elements.append(Paragraph("_" * 80, normal_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Ordonnance - Médicaments
    elements.append(Paragraph("PRESCRIPTION MÉDICALE", heading_style))
    
    ordonnance_data = [
        ['Médicament(s):', ordonnance.medicaments],
        ['Posologie:', ordonnance.posologie],
        ['Durée du traitement:', ordonnance.duree_traitement],
    ]
    
    ordonnance_table = Table(ordonnance_data, colWidths=[2*inch, 4*inch])
    ordonnance_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
    ]))
    
    elements.append(ordonnance_table)
    elements.append(Spacer(1, 0.4*inch))
    
    # Ligne séparatrice
    elements.append(Paragraph("_" * 80, normal_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Infos supplémentaires
    info_supplementaires = f"""
    <b>Date d'émission:</b> {ordonnance.date_emission.strftime("%d/%m/%Y")}<br/>
    <b>Statut:</b> {ordonnance.statut}<br/>
    <b>Valide jusqu'au:</b> {ordonnance.date_expiration.strftime("%d/%m/%Y") if ordonnance.date_expiration else 'À définir'}
    """
    elements.append(Paragraph(info_supplementaires, normal_style))
    elements.append(Spacer(1, 0.4*inch))
    
    # Signature
    elements.append(Spacer(1, 0.3*inch))
    signature = f"""
    <br/><br/>
    ________________________<br/>
    Signature du médecin<br/>
    <b>Dr. {medecin.prenom} {medecin.nom}</b>
    """
    elements.append(Paragraph(signature, normal_style))
    
    # Footer
    elements.append(Spacer(1, 0.5*inch))
    footer = f"""
    <font size="9" color="gray">
    Document généré par Dokira - {datetime.now().strftime("%d/%m/%Y à %H:%M")}<br/>
    Ordonnance ID: {ordonnance.id} | Patient ID: {patient.id}
    </font>
    """
    elements.append(Paragraph(footer, normal_style))
    
    # Construire le PDF
    doc.build(elements)
    buffer.seek(0)
    
    return buffer


@router.get("/api/ordonnances")
async def get_ordonnances_medecin(
    request: Request,
    statut: str = None,
    db: Session = Depends(get_db)
):
    """Récupère toutes les ordonnances du médecin"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    # Récupérer tous les patients du médecin
    patients_ids = db.query(RendezVous.patient_id).filter(
        RendezVous.medecin_id == current_medecin.id
    ).distinct().all()
    
    patients_ids = [p[0] for p in patients_ids]
    
    query = db.query(Ordonnance).filter(Ordonnance.patient_id.in_(patients_ids))
    
    if statut:
        query = query.filter(Ordonnance.statut == statut)
    
    ordonnances = query.order_by(Ordonnance.date_emission.desc()).all()
    
    result = []
    for ord in ordonnances:
        patient = db.query(Patient).filter(Patient.id == ord.patient_id).first()
        result.append({
            "id": ord.id,
            "patient": {
                "id": patient.id if patient else None,
                "nom_complet": patient.nom_complet if patient else "Patient supprimé"
            },
            "medecin_nom": ord.medecin_nom,
            "date_emission": ord.date_emission.strftime("%d/%m/%Y") if ord.date_emission else None,
            "medicaments": ord.medicaments,
            "posologie": ord.posologie,
            "duree_traitement": ord.duree_traitement,
            "statut": ord.statut,
            "fichier_url": ord.fichier_url
        })
    
    return {
        "success": True,
        "total": len(result),
        "ordonnances": result
    }

# ============= Télécharger Ordonnance PDF =============
@router.get("/api/ordonnances/telecharger/{ordonnance_id}")
async def telecharger_ordonnance(
    ordonnance_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Télécharge le PDF d'une ordonnance"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    ordonnance = db.query(Ordonnance).filter(Ordonnance.id == ordonnance_id).first()
    
    if not ordonnance:
        raise HTTPException(status_code=404, detail="Ordonnance non trouvée")
    
    # Vérifier que le médecin a créé cette ordonnance
    if ordonnance.medecin_nom != f"Dr. {current_medecin.prenom} {current_medecin.nom}":
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    if not ordonnance.fichier_url:
        raise HTTPException(status_code=404, detail="Fichier non trouvé")
    
    filepath = ordonnance.fichier_url.replace("/static/", "static/")
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Fichier non trouvé sur le serveur")
    
    return FileResponse(filepath, filename=f"ordonnance_{ordonnance_id}.pdf")




# ============= UPLOAD PHOTO PROFIL =============

@router.post("/api/upload-photo")
async def upload_photo_profil(
    request: Request,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    current_medecin = get_current_medecin_from_cookie(request, db)

    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")

    # Vérifier type image
    if not photo.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Fichier invalide")

    # Dossier upload
    upload_dir = Path("app/static/uploads/medecins")
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Nom unique
    ext = photo.filename.split(".")[-1]
    filename = f"medecin_{current_medecin.id}_{secrets.token_hex(8)}.{ext}"

    file_path = upload_dir / filename

    # Sauvegarde
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)

    # URL publique
    photo_url = f"/static/uploads/medecins/{filename}"

    # Sauvegarde DB
    current_medecin.photo_profil_url = photo_url
    db.commit()

    return {
        "success": True,
        "photo_url": photo_url
    }




# Charger les variables d'environnement
load_dotenv()
