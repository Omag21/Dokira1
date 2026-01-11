# views_medecin.py - Routes pour les médecins
from fastapi import APIRouter, Request, Depends, HTTPException, status, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pathlib import Path
import secrets
import os
from dotenv import load_dotenv

# Imports locaux
from app.database import get_db
from app.models import Medecin, Patient, RendezVous, DossierMedical, Message

# Charger les variables d'environnement
load_dotenv()

# Configuration
BASE_DIR = Path(__file__).resolve().parent
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

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

@router.get("/connexion", response_class=HTMLResponse)
def page_connexion_medecin(request: Request, db: Session = Depends(get_db)):
    """Page de connexion médecin"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if current_medecin:
        return RedirectResponse(url="/medecin/dashboard", status_code=303)
    
    return templates.TemplateResponse("connexion_medecin.html", {"request": request})


@router.get("/dashboard", response_class=HTMLResponse)
@router.get("/", response_class=HTMLResponse)
def dashboard_medecin(request: Request, db: Session = Depends(get_db)):
    """Dashboard médecin - Nécessite authentification"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        return RedirectResponse(url="/medecin/connexion", status_code=303)
    
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
            "connexion_medecin.html",
            {
                "request": request,
                "error": "Email ou mot de passe incorrect",
                "email": email
            },
            status_code=401
        )
    
    if not medecin.est_actif:
        return templates.TemplateResponse(
            "connexion_medecin.html",
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


@router.get("/deconnexion")
async def deconnexion_medecin():
    """Déconnexion médecin"""
    response = RedirectResponse(url="/medecin/connexion", status_code=303)
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


@router.get("/api/patients")
async def get_patients_list(request: Request, db: Session = Depends(get_db)):
    """Liste des patients du médecin"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    # Récupérer les patients via les RDV
    patients = db.query(Patient).join(RendezVous).filter(
        RendezVous.medecin_id == current_medecin.id
    ).distinct().all()
    
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
    
    query = db.query(RendezVous).filter(RendezVous.medecin_id == current_medecin.id)
    
    # Filtres
    today = datetime.now().date()
    if filtre == "aujourd_hui":
        query = query.filter(RendezVous.date_heure >= datetime.combine(today, datetime.min.time()))
        query = query.filter(RendezVous.date_heure < datetime.combine(today, datetime.max.time()))
    elif filtre == "semaine":
        from datetime import timedelta
        start_week = today - timedelta(days=today.weekday())
        query = query.filter(RendezVous.date_heure >= datetime.combine(start_week, datetime.min.time()))
    elif filtre == "mois":
        query = query.filter(RendezVous.date_heure >= datetime(today.year, today.month, 1))
    
    rdvs = query.order_by(RendezVous.date_heure.desc()).all()
    
    return [
        {
            "id": rdv.id,
            "patient": {
                "nom_complet": rdv.patient.nom_complet if rdv.patient else "Patient supprimé",
                "telephone": rdv.patient.telephone if rdv.patient else ""
            },
            "date_heure": rdv.date_heure.isoformat(),
            "motif": rdv.motif,
            "type": rdv.type_consultation.value if rdv.type_consultation else "Cabinet",
            "statut": rdv.statut.value if rdv.statut else "Planifié"
        }
        for rdv in rdvs
    ]


@router.get("/api/messages")
async def get_messages(request: Request, db: Session = Depends(get_db)):
    """Liste des messages"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    messages = db.query(Message).filter(
        Message.medecin_id == current_medecin.id
    ).order_by(Message.date_envoi.desc()).limit(50).all()
    
    return [
        {
            "id": msg.id,
            "patient": {
                "nom_complet": msg.patient.nom_complet if msg.patient else "Patient supprimé"
            },
            "sujet": msg.sujet,
            "contenu": msg.contenu,
            "statut": msg.statut.value if msg.statut else "Envoyé",
            "de_medecin": msg.de_medecin,
            "date_envoi": msg.date_envoi.isoformat()
        }
        for msg in messages
    ]


@router.post("/api/messages/send")
async def send_message(
    request: Request,
    patient_id: int = Form(...),
    sujet: str = Form(...),
    contenu: str = Form(...),
    db: Session = Depends(get_db)
):
    """Envoyer un message à un patient"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    nouveau_message = Message(
        medecin_id=current_medecin.id,
        patient_id=patient_id,
        de_medecin=True,
        sujet=sujet,
        contenu=contenu
    )
    
    db.add(nouveau_message)
    db.commit()
    db.refresh(nouveau_message)
    
    return {"success": True, "message_id": nouveau_message.id}


@router.get("/api/dossiers")
async def get_dossiers(
    request: Request,
    statut: str = None,
    db: Session = Depends(get_db)
):
    """Liste des dossiers médicaux"""
    current_medecin = get_current_medecin_from_cookie(request, db)
    
    if not current_medecin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    query = db.query(DossierMedical).filter(DossierMedical.medecin_id == current_medecin.id)
    
    if statut:
        query = query.filter(DossierMedical.statut_traitement == statut)
    
    dossiers = query.order_by(DossierMedical.date_consultation.desc()).all()
    
    return [
        {
            "id": d.id,
            "patient": {
                "nom_complet": d.patient.nom_complet if d.patient else "Patient supprimé"
            },
            "diagnostic": d.diagnostic,
            "date_consultation": d.date_consultation.isoformat(),
            "statut_traitement": d.statut_traitement.value if d.statut_traitement else "À traiter"
        }
        for d in dossiers
    ]


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
        Message.statut != "Lu"
    ).count()
    
    return {
        "rdv_today": rdv_today,
        "patients_actifs": patients_actifs,
        "en_traitement": en_traitement,
        "messages_non_lus": messages_non_lus
    }