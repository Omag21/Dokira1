# views_admin.py - Routes pour les administrateurs
from fastapi import APIRouter, Request, Depends, HTTPException, status, Form, File, UploadFile
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse, Response
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pathlib import Path
import secrets
import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
import shutil
from typing import Optional, List
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
#import requests from datetime import datetime
    

# Imports locaux
from app.database import get_db, engine
from app.models import Admin, Medecin, MessageAdminMedecin, MessageAdminPatient, Partenaire, Patient, RendezVous, DossierMedical, Message, Photo, Annonce, Consultation, Document, StatutInscription, StatutMessage, NotificationBroadcast, NotificationReception
from app.inscription_schema import ensure_inscription_schema

# Charger les variables d'environnement
load_dotenv()

# Configuration
BASE_DIR = Path(__file__).resolve().parent
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = os.environ["JWT_ALGO"]
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"])
UPLOAD_DIR = Path("app/static/uploads/photos")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
PARTENAIRES_UPLOAD_DIR = Path("app/static/uploads/partenaires")
PARTENAIRES_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Configuration du router et templates
router = APIRouter(prefix="/admin", tags=["admin"])
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Configuration du hachage de mot de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Compatibilite schema inscription
ensure_inscription_schema(engine)


def to_public_static_url(path: Optional[str]) -> Optional[str]:
    """Convertit un chemin interne en URL publique /static/..."""
    if not path:
        return path
    normalized = str(path).replace("\\", "/").strip()
    if normalized.startswith("http://") or normalized.startswith("https://"):
        return normalized
    if normalized.startswith("/static/"):
        return normalized
    if normalized.startswith("static/"):
        return f"/{normalized}"
    if normalized.startswith("app/static/"):
        return f"/static/{normalized[len('app/static/'):]}"
    if "/app/static/" in normalized:
        idx = normalized.index("/app/static/") + len("/app/static/")
        return f"/static/{normalized[idx:]}"
    if normalized.startswith("uploads/"):
        return f"/static/{normalized}"
    return normalized


# ============= FONCTIONS UTILITAIRES =============

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """VÃ©rifie si le mot de passe correspond au hash"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Erreur lors de la vÃ©rification du mot de passe: {e}")
        return False


def get_password_hash(password: str) -> str:
    """Hash un mot de passe"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """CrÃ©e un token JWT"""
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


def get_admin_by_email(db: Session, email: str):
    """RÃ©cupÃ¨re un admin par email"""
    try:
        return db.query(Admin).filter(Admin.email == email.lower().strip()).first()
    except Exception as e:
        print(f"Erreur lors de la rÃ©cupÃ©ration de l'admin: {e}")
        return None


def authenticate_admin(db: Session, email: str, password: str):
    """Authentifie un admin"""
    admin = get_admin_by_email(db, email)
    
    if not admin:
        print(f"Admin non trouvÃ© avec l'email: {email}")
        return None
    
    if not verify_password(password, admin.mot_de_passe_hash):
        print(f"Mot de passe incorrect pour l'email: {email}")
        return None
    
    return admin


def get_admin_status(admin: Admin) -> str:
    status_value = (getattr(admin, "statut_inscription", None) or "").strip().upper()
    if not status_value:
        return StatutInscription.APPROUVEE.value if admin.est_actif else StatutInscription.EN_ATTENTE.value
    return status_value


def get_medecin_status(medecin: Medecin) -> str:
    status_value = (getattr(medecin, "statut_inscription", None) or "").strip().upper()
    if not status_value:
        return StatutInscription.APPROUVEE.value if medecin.est_actif else StatutInscription.EN_ATTENTE.value
    return status_value


def send_inscription_decision_email(
    recipient_email: str,
    full_name: str,
    role_label: str,
    approved: bool,
    refusal_reason: Optional[str] = None
) -> None:
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM") or smtp_user

    if not smtp_host or not smtp_user or not smtp_password or not smtp_from:
        print("SMTP non configure: email de decision non envoye.")
        return

    msg = EmailMessage()
    if approved:
        msg["Subject"] = f"Dokira - Inscription {role_label} approuvee"
        body = (
            f"Bonjour {full_name},\n\n"
            f"Votre inscription en tant que {role_label} a ete approuvee.\n"
            "Vous pouvez maintenant acceder a votre interface sur Dokira.\n\n"
            "Cordialement,\nEquipe Dokira"
        )
    else:
        msg["Subject"] = f"Dokira - Inscription {role_label} rejetee"
        reason_text = refusal_reason.strip() if refusal_reason else "Aucun motif specifique n'a ete fourni."
        body = (
            f"Bonjour {full_name},\n\n"
            f"Votre inscription en tant que {role_label} n'a pas ete validee.\n"
            f"Motif: {reason_text}\n\n"
            "Vous pouvez soumettre une nouvelle demande si necessaire.\n\n"
            "Cordialement,\nEquipe Dokira"
        )

    msg["From"] = smtp_from
    msg["To"] = recipient_email
    msg.set_content(body)

    with smtplib.SMTP(smtp_host, smtp_port) as smtp:
        smtp.starttls()     
        smtp.login(smtp_user, smtp_password)
        smtp.send_message(msg)


def get_current_admin_from_cookie(request: Request, db: Session):
    """RÃ©cupÃ¨re l'admin actuel depuis le cookie"""
    token = request.cookies.get("admin_access_token")
    
    if not token:
        return None
    
    try:
        if token.startswith("Bearer "):
            token = token[7:]
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            return None
        
        admin = get_admin_by_email(db, email)
        if not admin:
            return None
        if not admin.est_actif:
            return None
        if get_admin_status(admin) != StatutInscription.APPROUVEE.value:
            return None
        return admin
        
    except JWTError as e:
        print(f"Erreur JWT: {e}")
        return None
    except Exception as e:
        print(f"Erreur lors de la rÃ©cupÃ©ration de l'admin: {e}")
        return None


def save_upload_file(upload_file: UploadFile) -> str:
    """Sauvegarde un fichier uploadÃ© et retourne le chemin"""
    try:
        file_extension = upload_file.filename.split('.')[-1]
        file_name = f"{secrets.token_hex(8)}.{file_extension}"
        file_path = UPLOAD_DIR / file_name
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        
        return to_public_static_url(str(file_path))
    except Exception as e:
        print(f"Erreur lors de la sauvegarde du fichier: {e}")
        return None


# ============= ROUTES HTML =============

@router.get("/connexionAdmin", response_class=HTMLResponse)
def page_connexion_admin(request: Request, db: Session = Depends(get_db)):
    """Page de connexion admin"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if current_admin:
        return RedirectResponse(url="/admin/dashboard", status_code=303)

    return RedirectResponse(url="/medecin/connexionMedecin?role=admin", status_code=303)


@router.get("/inscriptionAdmin", response_class=HTMLResponse)
def page_inscription_admin(request: Request, db: Session = Depends(get_db)):
    """Page d'inscription admin"""
    current_admin = get_current_admin_from_cookie(request, db)

    if current_admin:
        return RedirectResponse(url="/admin/dashboard", status_code=303)

    return templates.TemplateResponse("inscriptionAdmin.html", {"request": request})


@router.get("/attente-approbation", response_class=HTMLResponse)
def page_attente_approbation_admin(request: Request):
    return templates.TemplateResponse("attenteApprobationAdmin.html", {"request": request})


@router.get("/api/inscription-status")
async def admin_inscription_status(email: str, db: Session = Depends(get_db)):
    admin = get_admin_by_email(db, email.strip().lower())
    if not admin:
        raise HTTPException(status_code=404, detail="Compte introuvable")

    return {
        "status": get_admin_status(admin),
        "is_active": bool(admin.est_actif),
        "motif_refus": getattr(admin, "motif_refus_inscription", None),
    }


@router.get("/dashboard", response_class=HTMLResponse)
@router.get("/", response_class=HTMLResponse)
def dashboard_admin(request: Request, db: Session = Depends(get_db)):
    """Dashboard admin - NÃ©cessite authentification"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        return RedirectResponse(url="/admin/connexionAdmin", status_code=303)
    
    # Mettre Ã  jour la derniÃ¨re connexion
    try:
        current_admin.derniere_connexion = datetime.utcnow()
        db.commit()
    except Exception as e:
        print(f"Erreur lors de la mise Ã  jour de la derniÃ¨re connexion: {e}")
        db.rollback()
    
    return templates.TemplateResponse(
        "admin.html",
        {
            "request": request,
            "admin": current_admin,
            "nom_complet": current_admin.nom_complet
        }
    )


# ============= ROUTES POST - AUTHENTIFICATION =============

@router.post("/connexion")
async def login_admin(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Connexion admin"""
    email = email.strip().lower()

    admin = authenticate_admin(db, email, password)

    if not admin:
        return RedirectResponse(
            url="/medecin/connexionMedecin?role=admin&error=Email%20ou%20mot%20de%20passe%20incorrect",
            status_code=303
        )

    admin_status = get_admin_status(admin)
    if admin_status in (StatutInscription.EN_ATTENTE.value, StatutInscription.REJETEE.value):
        pending_token = create_access_token(
            data={"sub": admin.email, "admin_id": admin.id},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        response = RedirectResponse(
            url=f"/admin/attente-approbation?email={admin.email}",
            status_code=303
        )
        response.set_cookie(
            key="admin_access_token",
            value=f"Bearer {pending_token}",
            httponly=True,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            samesite="lax",
            secure=False
        )
        return response

    if not admin.est_actif:
        return RedirectResponse(
            url="/medecin/connexionMedecin?role=admin&error=Votre%20compte%20a%20ete%20desactive",
            status_code=303
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": admin.email,
            "admin_id": admin.id,
            "nom": admin.nom,
            "prenom": admin.prenom
        },
        expires_delta=access_token_expires
    )

    try:
        admin.derniere_connexion = datetime.utcnow()
        db.commit()
    except Exception as e:
        print(f"Erreur lors de la mise a jour: {e}")
        db.rollback()

    response = RedirectResponse(url="/admin/dashboard", status_code=303)
    response.set_cookie(
        key="admin_access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False
    )

    return response


@router.post("/inscription")
async def register_admin(
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
    biographie: str = Form(default=None),
    acceptConditions: str = Form(default=None),
    db: Session = Depends(get_db)
):
    """Inscription d'un nouvel administrateur"""
    email = email.strip().lower()

    if acceptConditions != "on":
        return RedirectResponse(
            url="/admin/inscriptionAdmin?error=Vous%20devez%20accepter%20les%20conditions",
            status_code=303
        )

    if len(password.encode("utf-8")) > 72:
        return RedirectResponse(
            url="/admin/inscriptionAdmin?error=Le%20mot%20de%20passe%20est%20trop%20long",
            status_code=303
        )

    existing = get_admin_by_email(db, email)
    if existing:
        return RedirectResponse(
            url="/admin/inscriptionAdmin?error=Cet%20email%20est%20deja%20utilise",
            status_code=303
        )

    try:
        nouvel_admin = Admin(
            email=email,
            mot_de_passe_hash=get_password_hash(password),
            nom=nom.strip().capitalize(),
            prenom=prenom.strip().capitalize(),
            telephone=telephone.strip() if telephone else None,
            specialite=specialite.strip() if specialite else None,
            numero_ordre=numero_ordre.strip() if numero_ordre else None,
            adresse=adresse.strip() if adresse else None,
            ville=ville.strip().capitalize() if ville else None,
            code_postal=code_postal.strip() if code_postal else None,
            langues=langues.strip() if langues else None,
            biographie=biographie.strip() if biographie else None,
            est_actif=False,
            statut_inscription=StatutInscription.EN_ATTENTE.value,
            date_creation=datetime.utcnow()
        )

        db.add(nouvel_admin)
        db.commit()
        db.refresh(nouvel_admin)

        access_token = create_access_token(
            data={
                "sub": nouvel_admin.email,
                "admin_id": nouvel_admin.id,
                "nom": nouvel_admin.nom,
                "prenom": nouvel_admin.prenom
            },
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        response = RedirectResponse(
            url=f"/admin/attente-approbation?email={nouvel_admin.email}",
            status_code=303
        )
        response.set_cookie(
            key="admin_access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            samesite="lax",
            secure=False
        )
        return response
    except Exception as e:
        db.rollback()
        print(f"Erreur creation admin: {e}")
        return RedirectResponse(
            url="/admin/inscriptionAdmin?error=Erreur%20lors%20de%20la%20creation%20du%20compte",
            status_code=303
        )
@router.get("/deconnexion")
@router.get("/deconnexionAdmin")
async def deconnexion_admin():
    """DÃ©connexion admin"""
    response = RedirectResponse(url="/admin/connexionAdmin", status_code=303)
    response.delete_cookie(key="admin_access_token")
    return response


@router.get("/api/inscriptions-en-attente")
async def get_inscriptions_en_attente(request: Request, db: Session = Depends(get_db)):
    current_admin = get_current_admin_from_cookie(request, db)
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifie")

    medecins = db.query(Medecin).filter(
        Medecin.statut_inscription == StatutInscription.EN_ATTENTE.value
    ).all()
    admins = db.query(Admin).filter(
        Admin.statut_inscription == StatutInscription.EN_ATTENTE.value
    ).all()

    pending = []
    for m in medecins:
        pending.append({
            "profil_type": "medecin",
            "id": m.id,
            "nom_complet": f"Dr. {m.prenom} {m.nom}".strip(),
            "nom": m.nom,
            "prenom": m.prenom,
            "email": m.email,
            "telephone": m.telephone,
            "specialite": m.specialite.value if getattr(m.specialite, "value", None) else str(m.specialite or ""),
            "numero_ordre": m.numero_ordre,
            "adresse": m.adresse,
            "ville": m.ville,
            "code_postal": m.code_postal,
            "langues": m.langues,
            "biographie": m.biographie,
            "photo_profil_url": to_public_static_url(m.photo_profil_url),
            "date_creation": m.date_creation.isoformat() if m.date_creation else None,
        })

    for a in admins:
        pending.append({
            "profil_type": "admin",
            "id": a.id,
            "nom_complet": f"{a.prenom} {a.nom}".strip(),
            "nom": a.nom,
            "prenom": a.prenom,
            "email": a.email,
            "telephone": a.telephone,
            "specialite": a.specialite,
            "numero_ordre": a.numero_ordre,
            "adresse": a.adresse,
            "ville": a.ville,
            "code_postal": a.code_postal,
            "langues": a.langues,
            "biographie": a.biographie,
            "photo_profil_url": to_public_static_url(a.photo_profil_url),
            "date_creation": a.date_creation.isoformat() if a.date_creation else None,
        })

    pending.sort(key=lambda x: x.get("date_creation") or "", reverse=True)
    return pending


@router.get("/api/inscriptions/statistiques")
async def get_inscriptions_statistiques(request: Request, db: Session = Depends(get_db)):
    current_admin = get_current_admin_from_cookie(request, db)
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifie")

    med_pending = db.query(Medecin).filter(Medecin.statut_inscription == StatutInscription.EN_ATTENTE.value).count()
    adm_pending = db.query(Admin).filter(Admin.statut_inscription == StatutInscription.EN_ATTENTE.value).count()
    med_approved = db.query(Medecin).filter(Medecin.statut_inscription == StatutInscription.APPROUVEE.value).count()
    adm_approved = db.query(Admin).filter(Admin.statut_inscription == StatutInscription.APPROUVEE.value).count()
    med_rejected = db.query(Medecin).filter(Medecin.statut_inscription == StatutInscription.REJETEE.value).count()
    adm_rejected = db.query(Admin).filter(Admin.statut_inscription == StatutInscription.REJETEE.value).count()

    return {
        "pending_total": med_pending + adm_pending,
        "approved_total": med_approved + adm_approved,
        "rejected_total": med_rejected + adm_rejected
    }


@router.post("/api/inscriptions/{profil_type}/{profil_id}/approuver")
async def approuver_inscription(
    request: Request,
    profil_type: str,
    profil_id: int,
    db: Session = Depends(get_db)
):
    current_admin = get_current_admin_from_cookie(request, db)
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifie")

    profil_type = (profil_type or "").strip().lower()
    if profil_type == "medecin":
        profile = db.query(Medecin).filter(Medecin.id == profil_id).first()
        role_label = "medecin"
    elif profil_type == "admin":
        profile = db.query(Admin).filter(Admin.id == profil_id).first()
        role_label = "administrateur"
    else:
        raise HTTPException(status_code=400, detail="Type de profil invalide")

    if not profile:
        raise HTTPException(status_code=404, detail="Profil non trouve")

    profile.est_actif = True
    profile.statut_inscription = StatutInscription.APPROUVEE.value
    profile.motif_refus_inscription = None
    profile.date_decision_inscription = datetime.utcnow()

    if profil_type == "medecin":
        profile.date_approbation = datetime.utcnow()
        profile.approuve_par = current_admin.id
    else:
        profile.approuve_par_admin_id = current_admin.id

    db.commit()
    db.refresh(profile)

    full_name = f"{getattr(profile, 'prenom', '')} {getattr(profile, 'nom', '')}".strip()
    send_inscription_decision_email(profile.email, full_name, role_label, approved=True)

    return {"success": True, "message": "Inscription approuvee"}


@router.post("/api/inscriptions/{profil_type}/{profil_id}/rejeter")
async def rejeter_inscription(
    request: Request,
    profil_type: str,
    profil_id: int,
    motif_refus: str = Form(default=""),
    db: Session = Depends(get_db)
):
    current_admin = get_current_admin_from_cookie(request, db)
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifie")

    profil_type = (profil_type or "").strip().lower()
    if profil_type == "medecin":
        profile = db.query(Medecin).filter(Medecin.id == profil_id).first()
        role_label = "medecin"
    elif profil_type == "admin":
        profile = db.query(Admin).filter(Admin.id == profil_id).first()
        role_label = "administrateur"
    else:
        raise HTTPException(status_code=400, detail="Type de profil invalide")

    if not profile:
        raise HTTPException(status_code=404, detail="Profil non trouve")

    profile.est_actif = False
    profile.statut_inscription = StatutInscription.REJETEE.value
    profile.motif_refus_inscription = (motif_refus or "").strip() or None
    profile.date_decision_inscription = datetime.utcnow()

    if profil_type == "medecin":
        profile.approuve_par = current_admin.id
    else:
        profile.approuve_par_admin_id = current_admin.id

    db.commit()
    db.refresh(profile)

    full_name = f"{getattr(profile, 'prenom', '')} {getattr(profile, 'nom', '')}".strip()
    send_inscription_decision_email(
        profile.email,
        full_name,
        role_label,
        approved=False,
        refusal_reason=profile.motif_refus_inscription
    )

    return {"success": True, "message": "Inscription rejetee"}


# ============= API ROUTES - MÃ‰DECINS EN ATTENTE =============

@router.get("/api/medecins-en-attente")
async def get_medecins_en_attente(request: Request, db: Session = Depends(get_db)):
    """RÃ©cupÃ¨re la liste des mÃ©decins en attente d'approbation"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        medecins = db.query(Medecin).filter(
            Medecin.statut_inscription == StatutInscription.EN_ATTENTE.value
        ).all()
        
        return [
            {
                "id": m.id,
                "nom": m.nom,
                "prenom": m.prenom,
                "nom_complet": m.nom_complet,
                "email": m.email,
                "telephone": m.telephone,
                "specialite": m.specialite.value if m.specialite else None,
                "numero_ordre": m.numero_ordre,
                "adresse": m.adresse,
                "ville": m.ville,
                "code_postal": m.code_postal,
                "langues": m.langues,
                "photo_profil_url": to_public_static_url(m.photo_profil_url),
                "date_creation": m.date_creation.isoformat() if m.date_creation else None
            }
            for m in medecins
        ]
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


@router.post("/api/medecins/{medecin_id}/approuver")
async def approuver_medecin(
    request: Request,
    medecin_id: int,
    db: Session = Depends(get_db)
):
    """Approuve un mÃ©decin en attente"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
        
        if not medecin:
            raise HTTPException(status_code=404, detail="MÃ©decin non trouvÃ©")
        
        # Activer le mÃ©decin
        medecin.est_actif = True
        medecin.statut_inscription = StatutInscription.APPROUVEE.value
        medecin.motif_refus_inscription = None
        medecin.date_decision_inscription = datetime.utcnow()
        medecin.date_approbation = datetime.utcnow()
        medecin.approuve_par = current_admin.id
        
        db.commit()
        db.refresh(medecin)

        send_inscription_decision_email(
            medecin.email,
            f"{medecin.prenom} {medecin.nom}".strip(),
            "medecin",
            approved=True
        )
        
        return {
            "success": True,
            "message": f"Le mÃ©decin {medecin.nom_complet} a Ã©tÃ© approuvÃ©",
            "medecin_id": medecin.id
        }
    except Exception as e:
        db.rollback()
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'approbation")


@router.post("/api/medecins/{medecin_id}/rejeter")
async def rejeter_medecin(
    request: Request,
    medecin_id: int,
    motif_refus: str = Form(default=""),
    db: Session = Depends(get_db)
):
    """Rejette un mÃ©decin en attente"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
        
        if not medecin:
            raise HTTPException(status_code=404, detail="MÃ©decin non trouvÃ©")
        
        # Supprimer le mÃ©decin
        medecin.est_actif = False
        medecin.statut_inscription = StatutInscription.REJETEE.value
        medecin.motif_refus_inscription = (motif_refus or "").strip() or None
        medecin.date_decision_inscription = datetime.utcnow()
        medecin.approuve_par = current_admin.id
        db.commit()

        send_inscription_decision_email(
            medecin.email,
            f"{medecin.prenom} {medecin.nom}".strip(),
            "medecin",
            approved=False,
            refusal_reason=medecin.motif_refus_inscription
        )
        
        return {
            "success": True,
            "message": f"Le mÃ©decin {medecin.nom_complet} a Ã©tÃ© rejetÃ©"
        }
    except Exception as e:
        db.rollback()
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors du rejet")


# ============= API ROUTES - MÃ‰DECINS ACTIFS =============

@router.get("/api/medecins-actifs")
async def get_medecins_actifs(request: Request, db: Session = Depends(get_db)):
    """RÃ©cupÃ¨re la liste des mÃ©decins actifs"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        medecins = db.query(Medecin).filter(
            Medecin.est_actif == True,
            Medecin.statut_inscription == StatutInscription.APPROUVEE.value
        ).all()
        
        return [
            {
                "id": m.id,
                "nom": m.nom,
                "prenom": m.prenom,
                "nom_complet": m.nom_complet,
                "email": m.email,
                "telephone": m.telephone,
                "specialite": m.specialite.value if m.specialite else None,
                "prix_consultation": m.prix_consultation,
                "photo_profil_url": to_public_static_url(m.photo_profil_url),
                "est_actif": m.est_actif
            }
            for m in medecins
        ]
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


@router.get("/api/tous-medecins")
async def get_tous_medecins(request: Request, db: Session = Depends(get_db)):
    """RÃ©cupÃ¨re tous les mÃ©decins (actifs et en attente) organisÃ©s par catÃ©gorie"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        medecins = db.query(Medecin).all()
        
        return [
            {
                "id": m.id,
                "nom": m.nom,
                "prenom": m.prenom,
                "nom_complet": m.nom_complet,
                "email": m.email,
                "telephone": m.telephone,
                "specialite": m.specialite.value if m.specialite else None,
                "prix_consultation": m.prix_consultation,
                "photo_profil_url": to_public_static_url(m.photo_profil_url),
                "est_actif": m.est_actif,
                "statut_inscription": m.statut_inscription,
                "date_creation": m.date_creation.isoformat() if m.date_creation else None
            }
            for m in medecins
        ]
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


@router.get("/api/medecins/{medecin_id}/profil-professionnel")
async def get_medecin_profil_professionnel(
    medecin_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    current_admin = get_current_admin_from_cookie(request, db)
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifie")

    medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
    if not medecin:
        raise HTTPException(status_code=404, detail="Medecin non trouve")

    return {
        "id": medecin.id,
        "nom": medecin.nom,
        "prenom": medecin.prenom,
        "nom_complet": medecin.nom_complet,
        "email": medecin.email,
        "telephone": medecin.telephone,
        "specialite": medecin.specialite.value if getattr(medecin.specialite, "value", None) else str(medecin.specialite or ""),
        "numero_ordre": medecin.numero_ordre,
        "adresse": medecin.adresse,
        "ville": medecin.ville,
        "code_postal": medecin.code_postal,
        "langues": medecin.langues,
        "biographie": medecin.biographie,
        "annees_experience": medecin.annees_experience,
        "prix_consultation": medecin.prix_consultation,
        "photo_profil_url": to_public_static_url(medecin.photo_profil_url),
        "est_actif": medecin.est_actif,
        "statut_inscription": medecin.statut_inscription,
        "date_creation": medecin.date_creation.isoformat() if medecin.date_creation else None
    }


@router.get("/api/medecins-actifs-jour")
async def get_medecins_actifs_du_jour(request: Request, db: Session = Depends(get_db)):
    current_admin = get_current_admin_from_cookie(request, db)
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifie")

    now = datetime.now()
    start_day = datetime(now.year, now.month, now.day, 0, 0, 0)
    end_day = start_day + timedelta(days=1)

    rdv_rows = db.query(RendezVous, Medecin, Patient).join(
        Medecin, RendezVous.medecin_id == Medecin.id
    ).join(
        Patient, RendezVous.patient_id == Patient.id
    ).filter(
        RendezVous.date_heure >= start_day,
        RendezVous.date_heure < end_day,
        Medecin.est_actif == True,
        Medecin.statut_inscription == StatutInscription.APPROUVEE.value
    ).all()

    consultations_rows = []
    try:
        consultations_rows = db.query(Consultation, Medecin).join(
            Medecin, Consultation.medecin_id == Medecin.id
        ).filter(
            Consultation.date_heure >= start_day,
            Consultation.date_heure < end_day,
            Medecin.est_actif == True,
            Medecin.statut_inscription == StatutInscription.APPROUVEE.value
        ).all()
    except Exception:
        consultations_rows = []

    cards = []
    for rdv, medecin, patient in rdv_rows:
        cards.append({
            "event_type": "rendez_vous",
            "date_heure": rdv.date_heure.isoformat() if rdv.date_heure else None,
            "medecin": {
                "id": medecin.id,
                "nom_complet": medecin.nom_complet,
                "email": medecin.email,
                "telephone": medecin.telephone,
                "specialite": medecin.specialite.value if getattr(medecin.specialite, "value", None) else str(medecin.specialite or ""),
                "numero_ordre": medecin.numero_ordre,
                "adresse": medecin.adresse,
                "ville": medecin.ville,
                "code_postal": medecin.code_postal,
                "langues": medecin.langues,
                "biographie": medecin.biographie,
                "prix_consultation": medecin.prix_consultation,
            },
            "patient": {
                "id": patient.id,
                "nom_complet": patient.nom_complet,
                "email": patient.email,
                "telephone": patient.telephone,
                "adresse": patient.adresse,
                "ville": patient.ville,
                "code_postal": patient.code_postal
            }
        })

    for consultation, medecin in consultations_rows:
        cards.append({
            "event_type": "consultation",
            "date_heure": consultation.date_heure.isoformat() if consultation.date_heure else None,
            "medecin": {
                "id": medecin.id,
                "nom_complet": medecin.nom_complet,
                "email": medecin.email,
                "telephone": medecin.telephone,
                "specialite": medecin.specialite.value if getattr(medecin.specialite, "value", None) else str(medecin.specialite or ""),
                "numero_ordre": medecin.numero_ordre,
                "adresse": medecin.adresse,
                "ville": medecin.ville,
                "code_postal": medecin.code_postal,
                "langues": medecin.langues,
                "biographie": medecin.biographie,
                "prix_consultation": medecin.prix_consultation,
            },
            "patient": {
                "id": None,
                "nom_complet": f"{consultation.visiteur_prenom} {consultation.visiteur_nom}".strip(),
                "email": consultation.visiteur_email,
                "telephone": consultation.visiteur_telephone,
                "adresse": None,
                "ville": None,
                "code_postal": None
            }
        })

    cards.sort(key=lambda x: x.get("date_heure") or "")
    return {"date": start_day.date().isoformat(), "cards": cards}


@router.delete("/api/medecins/{medecin_id}")
async def supprimer_medecin(
    request: Request,
    medecin_id: int,
    db: Session = Depends(get_db)
):
    """Supprime un mÃ©decin"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
        
        if not medecin:
            raise HTTPException(status_code=404, detail="MÃ©decin non trouvÃ©")
        
        db.delete(medecin)
        db.commit()
        
        return {
            "success": True,
            "message": f"Le mÃ©decin {medecin.nom_complet} a Ã©tÃ© supprimÃ©"
        }
    except Exception as e:
        db.rollback()
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")


@router.post("/api/medecins/ajouter")
async def ajouter_medecin(
    request: Request,
    nom: str = Form(...),
    email: str = Form(...),
    telephone: str = Form(...),
    specialite: str = Form(...),
    prix: float = Form(...),
    bio: Optional[str] = Form(None),
    featured: bool = Form(False),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Ajoute un mÃ©decin directement (admin)"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        email = email.strip().lower()
        
        # VÃ©rifier si email existe
        existing = db.query(Medecin).filter(Medecin.email == email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email dÃ©jÃ  utilisÃ©")
        
        # GÃ©nÃ©rer un mot de passe temporaire
        temp_password = secrets.token_urlsafe(12)
        
        nouveau_medecin = Medecin(
            email=email,
            mot_de_passe_hash=get_password_hash(temp_password),
            nom=nom.strip().capitalize(),
            prenom="",
            specialite=specialite,
            telephone=telephone.strip(),
            prix_consultation=prix,
            est_actif=True,
            statut_inscription=StatutInscription.APPROUVEE.value,
            biographie=bio,
            featured=featured,
            date_creation=datetime.utcnow(),
            date_approbation=datetime.utcnow(),
            approuve_par=current_admin.id
        )
        
        # GÃ©rer la photo si fournie
        if photo:
            photo_path = save_upload_file(photo)
            if photo_path:
                nouveau_medecin.photo_profil_url = photo_path
        
        db.add(nouveau_medecin)
        db.commit()
        db.refresh(nouveau_medecin)
        
        return {
            "success": True,
            "message": f"Le mÃ©decin {nom} a Ã©tÃ© ajoutÃ©",
            "medecin_id": nouveau_medecin.id,
            "temp_password": temp_password
        }
    except Exception as e:
        db.rollback()
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'ajout du mÃ©decin")


# ============= API ROUTES - PATIENTS =============

@router.get("/api/patients")
async def get_patients(request: Request, db: Session = Depends(get_db)):
    """RÃ©cupÃ¨re la liste de tous les patients"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        patients = db.query(Patient).all()
        
        return [
            {
                "id": p.id,
                "nom": p.nom,
                "prenom": p.prenom,
                "nom_complet": p.nom_complet,
                "email": p.email,
                "telephone": p.telephone,
                "photo_profil_url": to_public_static_url(p.photo_profil_url),
                "date_creation": p.date_creation.isoformat() if p.date_creation else None,
                "consultations_count": db.query(RendezVous).filter(RendezVous.patient_id == p.id).count()
            }
            for p in patients
        ]
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


@router.get("/api/patients/{patient_id}/profil")
async def get_patient_profil(
    patient_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    current_admin = get_current_admin_from_cookie(request, db)
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifie")

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouve")

    return {
        "id": patient.id,
        "nom": patient.nom,
        "prenom": patient.prenom,
        "nom_complet": patient.nom_complet,
        "email": patient.email,
        "telephone": patient.telephone,
        "telephone_urgence": patient.telephone_urgence,
        "date_naissance": patient.date_naissance.isoformat() if patient.date_naissance else None,
        "genre": patient.genre.value if getattr(patient.genre, "value", None) else str(patient.genre or ""),
        "adresse": patient.adresse,
        "adresse_ligne2": patient.adresse_ligne2,
        "ville": patient.ville,
        "code_postal": patient.code_postal,
        "pays": patient.pays,
        "numero_securite_sociale": patient.numero_securite_sociale,
        "groupe_sanguin": patient.groupe_sanguin.value if getattr(patient.groupe_sanguin, "value", None) else str(patient.groupe_sanguin or ""),
        "allergies": patient.allergies,
        "antecedents_medicaux": patient.antecedents_medicaux,
        "antecedents_familiaux": patient.antecedents_familiaux,
        "traitements_en_cours": patient.traitements_en_cours,
        "mutuelle_nom": patient.mutuelle_nom,
        "mutuelle_numero": patient.mutuelle_numero,
        "medecin_traitant_nom": patient.medecin_traitant_nom,
        "medecin_traitant_telephone": patient.medecin_traitant_telephone,
        "photo_profil_url": to_public_static_url(patient.photo_profil_url),
        "est_actif": patient.est_actif,
        "date_creation": patient.date_creation.isoformat() if patient.date_creation else None
    }


# ============= API ROUTES - ANNONCES =============

@router.get("/api/annonces")
async def get_annonces(request: Request, db: Session = Depends(get_db)):
    """RÃ©cupÃ¨re la liste des annonces"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        annonces = db.query(Annonce).filter(
            or_(
                Annonce.date_expiration.is_(None),
                Annonce.date_expiration >= datetime.utcnow()
            )
        ).all()
        
        return [
            {
                "id": a.id,
                "titre": a.titre,
                "contenu": a.contenu,
                "description_courte": a.description_courte,
                "image_url": to_public_static_url(a.image_url),
                "lien_cible": a.lien_cible,
                "lien_texte": a.lien_texte,
                "categorie": a.categorie,
                "priorite": a.priorite,
                "est_active": a.est_active,
                "dateCreation": a.date_creation.isoformat() if a.date_creation else None,
                "date_expiration": a.date_expiration.isoformat() if a.date_expiration else None
            }
            for a in annonces
        ]
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


@router.post("/api/annonces/ajouter")
async def ajouter_annonce(
    request: Request,
    titre: str = Form(...),
    contenu: str = Form(...),
    description_courte: Optional[str] = Form(None),
    categorie: Optional[str] = Form(None),
    priorite: int = Form(0),
    lien_cible: Optional[str] = Form(None),
    lien_texte: Optional[str] = Form(None),
    date_expiration: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Ajoute une annonce"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        image_url = None
        if image:
            image_url = save_upload_file(image)
        
        date_exp = None
        if date_expiration:
            day_end = datetime.strptime(date_expiration, "%Y-%m-%d")
            date_exp = day_end.replace(hour=23, minute=59, second=59)
        
        nouvelle_annonce = Annonce(
            titre=titre.strip(),
            contenu=contenu.strip(),
            description_courte=(description_courte or "").strip() or None,
            image_url=image_url,
            categorie=(categorie or "").strip() or None,
            priorite=priorite if priorite is not None else 0,
            lien_cible=(lien_cible or "").strip() or None,
            lien_texte=(lien_texte or "").strip() or None,
            date_creation=datetime.utcnow(),
            date_expiration=date_exp,
            admin_id=current_admin.id
        )
        
        db.add(nouvelle_annonce)
        db.commit()
        db.refresh(nouvelle_annonce)
        
        return {
            "success": True,
            "message": "Annonce ajoutÃ©e avec succÃ¨s",
            "annonce_id": nouvelle_annonce.id
        }
    except Exception as e:
        db.rollback()
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'ajout de l'annonce")


@router.delete("/api/annonces/{annonce_id}")
async def supprimer_annonce(
    request: Request,
    annonce_id: int,
    db: Session = Depends(get_db)
):
    """Supprime une annonce"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        annonce = db.query(Annonce).filter(Annonce.id == annonce_id).first()
        
        if not annonce:
            raise HTTPException(status_code=404, detail="Annonce non trouvÃ©e")
        
        db.delete(annonce)
        db.commit()
        
        return {
            "success": True,
            "message": "Annonce supprimÃ©e"
        }
    except Exception as e:
        db.rollback()
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")


# ============= API ROUTES - STATISTIQUES =============

@router.get("/api/statistiques/consultations")
async def get_consultation_stats(request: Request, db: Session = Depends(get_db)):
    """RÃ©cupÃ¨re les statistiques de consultations par mÃ©decin"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        medecins = db.query(Medecin).filter(Medecin.est_actif == True).all()
        stats = []
        
        for medecin in medecins:
            consultations = db.query(RendezVous).filter(
                RendezVous.medecin_id == medecin.id
            ).count()
            
            revenue = consultations * (medecin.prix_consultation or 0)
            
            stats.append({
                "medecin_nom": medecin.nom_complet,
                "consultations_count": consultations,
                "revenue": revenue
            })
        
        return stats
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


@router.get("/api/statistiques/revenus")
async def get_revenue_stats(request: Request, db: Session = Depends(get_db)):
    """RÃ©cupÃ¨re les statistiques de revenus par catÃ©gorie"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        medecins = db.query(Medecin).filter(Medecin.est_actif == True).all()
        categories = {}
        
        for medecin in medecins:
            specialite = medecin.specialite.value if medecin.specialite else "Autre"
            
            if specialite not in categories:
                categories[specialite] = {
                    "consultations_count": 0,
                    "revenue": 0
                }
            
            consultations = db.query(RendezVous).filter(
                RendezVous.medecin_id == medecin.id
            ).count()
            
            categories[specialite]["consultations_count"] += consultations
            categories[specialite]["revenue"] += consultations * (medecin.prix_consultation or 0)
        
        return [
            {
                "categorie": cat,
                "consultations_count": data["consultations_count"],
                "revenue": data["revenue"]
            }
            for cat, data in categories.items()
        ]
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


# ============= API ROUTES - PROFIL ADMIN =============

@router.get("/api/profil")
async def get_admin_profile(request: Request, db: Session = Depends(get_db)):
    """RÃ©cupÃ¨re le profil de l'admin connectÃ©"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    return {
        "id": current_admin.id,
        "nom": current_admin.nom,
        "prenom": current_admin.prenom,
        "nom_complet": current_admin.nom_complet,
        "email": current_admin.email,
        "telephone": current_admin.telephone,
        "specialite": current_admin.specialite,
        "numero_ordre": current_admin.numero_ordre,
        "adresse": current_admin.adresse,
        "ville": current_admin.ville,
        "code_postal": current_admin.code_postal,
        "langues": current_admin.langues,
        "biographie": current_admin.biographie,
        "photo_profil_url": to_public_static_url(current_admin.photo_profil_url)
    }


@router.post("/api/profil/update")
async def update_admin_profile(
    request: Request,
    nom_complet: str = Form(...),
    email: str = Form(...),
    telephone: Optional[str] = Form(None),
    specialite: Optional[str] = Form(None),
    numero_ordre: Optional[str] = Form(None),
    adresse: Optional[str] = Form(None),
    ville: Optional[str] = Form(None),
    code_postal: Optional[str] = Form(None),
    langues: Optional[str] = Form(None),
    biographie: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Met a jour le profil de l'admin"""
    current_admin = get_current_admin_from_cookie(request, db)

    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifie")

    try:
        if email.lower() != current_admin.email.lower():
            existing = db.query(Admin).filter(Admin.email == email.lower().strip()).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email deja utilise")

        nom_parts = nom_complet.strip().split(" ", 1)
        current_admin.nom = nom_parts[0].capitalize()
        current_admin.prenom = nom_parts[1].capitalize() if len(nom_parts) > 1 else ""
        current_admin.email = email.lower().strip()
        current_admin.telephone = telephone.strip() if telephone else None
        current_admin.specialite = specialite.strip() if specialite else None
        current_admin.numero_ordre = numero_ordre.strip() if numero_ordre else None
        current_admin.adresse = adresse.strip() if adresse else None
        current_admin.ville = ville.strip() if ville else None
        current_admin.code_postal = code_postal.strip() if code_postal else None
        current_admin.langues = langues.strip() if langues else None
        current_admin.biographie = biographie.strip() if biographie else None

        if photo:
            photo_path = save_upload_file(photo)
            if photo_path:
                current_admin.photo_profil_url = photo_path

        db.commit()
        db.refresh(current_admin)

        return {
            "success": True,
            "message": "Profil mis a jour avec succes",
            "profile": {
                "nom_complet": current_admin.nom_complet,
                "email": current_admin.email,
                "telephone": current_admin.telephone,
                "specialite": current_admin.specialite,
                "numero_ordre": current_admin.numero_ordre,
                "adresse": current_admin.adresse,
                "ville": current_admin.ville,
                "code_postal": current_admin.code_postal,
                "langues": current_admin.langues,
                "biographie": current_admin.biographie,
                "photo_profil_url": to_public_static_url(current_admin.photo_profil_url)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise a jour")


@router.post("/api/profil/photo")
async def update_admin_profile_photo(
    request: Request,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Met a jour uniquement la photo de profil admin"""
    current_admin = get_current_admin_from_cookie(request, db)
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifie")

    if not photo:
        raise HTTPException(status_code=400, detail="Aucune photo fournie")

    try:
        photo_path = save_upload_file(photo)
        if not photo_path:
            raise HTTPException(status_code=400, detail="Upload photo impossible")

        current_admin.photo_profil_url = photo_path
        db.commit()
        db.refresh(current_admin)

        return {
            "success": True,
            "message": "Photo de profil mise a jour",
            "photo_profil_url": to_public_static_url(current_admin.photo_profil_url)
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Erreur update photo admin: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise a jour de la photo")


# ============= API ROUTES - ADMINISTRATEURS =============

@router.get("/api/administrateurs")
async def get_administrateurs(request: Request, db: Session = Depends(get_db)):
    """RÃ©cupÃ¨re la liste des administrateurs"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        admins = db.query(Admin).filter(Admin.est_actif == True).all()
        
        return [
            {
                "id": a.id,
                "nom": a.nom,
                "prenom": a.prenom,
                "nom_complet": a.nom_complet,
                "email": a.email,
                "telephone": a.telephone,
                "date_nomination": a.date_creation.isoformat() if a.date_creation else None
            }
            for a in admins
        ]
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


@router.post("/api/administrateurs/nommer/{medecin_id}")
async def nommer_medecin_admin(
    request: Request,
    medecin_id: int,
    db: Session = Depends(get_db)
):
    """Nomme un mÃ©decin comme administrateur"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
        
        if not medecin:
            raise HTTPException(status_code=404, detail="MÃ©decin non trouvÃ©")
        
        # VÃ©rifier si dÃ©jÃ  admin
        existing_admin = db.query(Admin).filter(Admin.email == medecin.email).first()
        if existing_admin:
            raise HTTPException(status_code=400, detail="Ce mÃ©decin est dÃ©jÃ  administrateur")
        
        # CrÃ©er un nouveau compte admin
        nouvel_admin = Admin(
            email=medecin.email,
            mot_de_passe_hash=medecin.mot_de_passe_hash,
            nom=medecin.nom,
            prenom=medecin.prenom,
            telephone=medecin.telephone,
            specialite=medecin.specialite.value if getattr(medecin.specialite, "value", None) else str(medecin.specialite or ""),
            numero_ordre=medecin.numero_ordre,
            adresse=medecin.adresse,
            ville=medecin.ville,
            code_postal=medecin.code_postal,
            langues=medecin.langues,
            biographie=medecin.biographie,
            photo_profil_url=medecin.photo_profil_url,
            est_actif=True,
            statut_inscription=StatutInscription.APPROUVEE.value,
            date_decision_inscription=datetime.utcnow(),
            approuve_par_admin_id=current_admin.id,
            date_creation=datetime.utcnow()
        )
        
        db.add(nouvel_admin)
        db.commit()
        db.refresh(nouvel_admin)
        
        return {
            "success": True,
            "message": f"{medecin.nom_complet} a Ã©tÃ© nommÃ© administrateur",
            "admin_id": nouvel_admin.id,
            "redirect_url": "/admin/dashboard",
            "medecin_redirect_url": "/medecin/dashboard"
        }
    except Exception as e:
        db.rollback()
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la nomination")


@router.delete("/api/administrateurs/{admin_id}")
async def retirer_admin(
    request: Request,
    admin_id: int,
    db: Session = Depends(get_db)
):
    """Retire les droits d'administrateur"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    if admin_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Impossible de se supprimer soi-mÃªme")
    
    try:
        admin = db.query(Admin).filter(Admin.id == admin_id).first()
        
        if not admin:
            raise HTTPException(status_code=404, detail="Administrateur non trouvÃ©")
        
        admin.est_actif = False
        db.commit()
        
        return {
            "success": True,
            "message": f"Les droits d'administrateur de {admin.nom_complet} ont Ã©tÃ© retirÃ©s"
        }
    except Exception as e:
        db.rollback()
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")





# ============= API ROUTES - ANNONCES PUBLIQUES =============

@router.get("/api/public/annonces")
async def get_public_annonces(db: Session = Depends(get_db)):
    """RÃ©cupÃ¨re les annonces actives et valides pour la page d'accueil"""
    try:
        now = datetime.utcnow()
        
        annonces = db.query(Annonce).filter(
            Annonce.est_active == True,
            or_(
                Annonce.date_expiration.is_(None),
                Annonce.date_expiration >= now
            )
        ).order_by(
            Annonce.priorite.desc(),
            Annonce.date_creation.desc()
        ).all()
        
        print(f"Nombre d'annonces trouvÃ©es: {len(annonces)}")
        
        result = []
        for a in annonces:
            # Corriger l'URL de l'image
            image_url = a.image_url
            if image_url and 'uploads' in image_url:
                # Extraire juste le nom du fichier
                filename = image_url.split('/')[-1].split('\\')[-1]
                # Construire l'URL correcte
                image_url = f"/static/uploads/photos/{filename}"
            
            annonce_data = {
                "id": a.id,
                "titre": a.titre,
                "contenu": a.contenu,
                "description_courte": a.description_courte,
                "image_url": image_url,  # URL corrigÃ©e
                "lien_cible": a.lien_cible,
                "lien_texte": a.lien_texte,
                "categorie": a.categorie,
                "date_creation": a.date_creation.isoformat() if a.date_creation else None,
                "date_expiration": a.date_expiration.isoformat() if a.date_expiration else None
            }
            result.append(annonce_data)
        
        return result
        
    except Exception as e:
        print(f"Erreur dans get_public_annonces: {e}")
        return []

# ============= API ROUTES - STATISTIQUES REVENUS =============

@router.get("/api/statistiques/revenus-medecins")
async def get_revenus_medecins(request: Request, db: Session = Depends(get_db)):
    """RÃ©cupÃ¨re les revenus dÃ©taillÃ©s par mÃ©decin"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        medecins = db.query(Medecin).filter(Medecin.est_actif == True).all()
        stats = []
        
        for medecin in medecins:
            rendez_vous_count = db.query(RendezVous).filter(
                RendezVous.medecin_id == medecin.id
            ).count()
            
            consultations_count = 0
            try:
                consultations_count = db.query(Consultation).filter(
                    Consultation.medecin_id == medecin.id
                ).count()
            except:
                consultations_count = 0
            
            prix_consultation = medecin.prix_consultation or 0
            revenu_consultations = rendez_vous_count * prix_consultation
            revenu_public = consultations_count * prix_consultation
            revenu_total = revenu_consultations + revenu_public
            
            total_consultations = rendez_vous_count + consultations_count
            
            stats.append({
                "medecin_id": medecin.id,
                "nom_complet": medecin.nom_complet,
                "email": medecin.email,
                "specialite": medecin.specialite.value if getattr(medecin.specialite, "value", None) else str(medecin.specialite or ""),
                "prix_consultation": prix_consultation,
                "rendez_vous_count": rendez_vous_count,
                "consultations_publiques_count": consultations_count,
                "total_consultations": total_consultations,
                "revenu_rendez_vous": revenu_consultations,
                "revenu_consultations_publiques": revenu_public,
                "revenu_total": revenu_total
            })
        
        stats.sort(key=lambda x: x["revenu_total"], reverse=True)
        return stats
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


@router.get("/api/statistiques/revenus-categories")
async def get_revenus_categories(request: Request, db: Session = Depends(get_db)):
    """RÃ©cupÃ¨re les revenus par catÃ©gorie/spÃ©cialitÃ©"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        medecins = db.query(Medecin).filter(Medecin.est_actif == True).all()
        categories = {}
        
        for medecin in medecins:
            specialite = medecin.specialite.value if getattr(medecin.specialite, "value", None) else str(medecin.specialite or "Autre")
            
            if specialite not in categories:
                categories[specialite] = {
                    "rendez_vous_count": 0,
                    "consultations_publiques_count": 0,
                    "revenu_total": 0,
                    "prix_moyen": 0,
                    "medecins_count": 0
                }
            
            rendez_vous_count = db.query(RendezVous).filter(
                RendezVous.medecin_id == medecin.id
            ).count()
            
            consultations_count = 0
            try:
                consultations_count = db.query(Consultation).filter(
                    Consultation.medecin_id == medecin.id
                ).count()
            except:
                consultations_count = 0
            
            prix_consultation = medecin.prix_consultation or 0
            revenu = (rendez_vous_count + consultations_count) * prix_consultation
            
            categories[specialite]["rendez_vous_count"] += rendez_vous_count
            categories[specialite]["consultations_publiques_count"] += consultations_count
            categories[specialite]["revenu_total"] += revenu
            categories[specialite]["medecins_count"] += 1
        
        result = []
        for cat, data in categories.items():
            total_consultations = data["rendez_vous_count"] + data["consultations_publiques_count"]
            result.append({
                "categorie": cat,
                "medecins_count": data["medecins_count"],
                "rendez_vous_count": data["rendez_vous_count"],
                "consultations_publiques_count": data["consultations_publiques_count"],
                "total_consultations": total_consultations,
                "revenu_total": data["revenu_total"],
                "revenu_moyen_par_medecin": round(data["revenu_total"] / data["medecins_count"], 2) if data["medecins_count"] > 0 else 0
            })
        
        result.sort(key=lambda x: x["revenu_total"], reverse=True)
        return result
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


@router.get("/api/statistiques/tableau-bord")
async def get_dashboard_stats_avances(request: Request, db: Session = Depends(get_db)):
    """RÃ©cupÃ¨re les statistiques complÃ¨tes pour le tableau de bord"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        medecins_actifs = db.query(Medecin).filter(Medecin.est_actif == True).count()
        medecins_en_attente = db.query(Medecin).filter(Medecin.est_actif == False).count()
        patients_total = db.query(Patient).count()
        admins_actifs = db.query(Admin).filter(Admin.est_actif == True).count()
        
        total_revenu = 0
        total_consultations = 0
        
        medecins = db.query(Medecin).filter(Medecin.est_actif == True).all()
        
        for medecin in medecins:
            rendez_vous_count = db.query(RendezVous).filter(
                RendezVous.medecin_id == medecin.id
            ).count()
            
            consultations_count = 0
            try:
                consultations_count = db.query(Consultation).filter(
                    Consultation.medecin_id == medecin.id
                ).count()
            except:
                consultations_count = 0
            
            prix_consultation = medecin.prix_consultation or 0
            revenu_medecin = (rendez_vous_count + consultations_count) * prix_consultation
            
            total_revenu += revenu_medecin
            total_consultations += rendez_vous_count + consultations_count
        
        today = datetime.utcnow()
        first_day = datetime(today.year, today.month, 1)
        
        consultations_mois = db.query(RendezVous).filter(
            RendezVous.date_heure >= first_day
        ).count()
        
        revenu_mois = 0
        for medecin in medecins:
            consultations_mois_medecin = db.query(RendezVous).filter(
                RendezVous.medecin_id == medecin.id,
                RendezVous.date_heure >= first_day
            ).count()
            prix_consultation = medecin.prix_consultation or 0
            revenu_mois += consultations_mois_medecin * prix_consultation
        
        return {
            "medecins_actifs": medecins_actifs,
            "medecins_en_attente": medecins_en_attente,
            "patients_total": patients_total,
            "admins_actifs": admins_actifs,
            "total_consultations": total_consultations,
            "total_revenu": round(total_revenu, 2),
            "consultations_mois": consultations_mois,
            "revenu_mois": round(revenu_mois, 2),
            "revenu_moyen_par_consultation": round(total_revenu / total_consultations, 2) if total_consultations > 0 else 0
        }
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


# ============= API ROUTES - CHAT IA =============

@router.post("/api/ia/chat")
async def chat_ia(
    request: Request,
    message: str = Form(...),
    db: Session = Depends(get_db)
):
    """Endpoint de chat IA pour l'admin"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        # Simuler une rÃ©ponse IA
        # Ã€ remplacer par un vrai service IA (OpenAI, HuggingFace, etc.)
        
        response_text = process_ia_message(message, db)
        
        return {
            "success": True,
            "reply": response_text
        }
    except Exception as e:
        print(f"Erreur IA: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors du traitement IA")


def process_ia_message(message: str, db: Session) -> str:
    """Traite un message IA"""
    message_lower = message.lower()
    
    # RÃ©ponses basiques
    if "statistique" in message_lower or "stat" in message_lower:
        return "Je peux vous aider avec les statistiques. Consultez la section Statistiques du tableau de bord pour voir les consultations et revenus par mÃ©decin et catÃ©gorie."
    
    elif "mÃ©decin" in message_lower:
        try:
            medecin_count = db.query(Medecin).filter(Medecin.est_actif == True).count()
            return f"Vous avez actuellement {medecin_count} mÃ©decins actifs sur la plateforme."
        except:
            return "Erreur lors de la rÃ©cupÃ©ration du nombre de mÃ©decins."
    
    elif "patient" in message_lower:
        try:
            patient_count = db.query(Patient).count()
            return f"Vous avez {patient_count} patients enregistrÃ©s sur la plateforme."
        except:
            return "Erreur lors de la rÃ©cupÃ©ration du nombre de patients."
    
    elif "revenu" in message_lower or "revenue" in message_lower:
        return "Pour voir les revenus dÃ©taillÃ©s, consultez la section Statistiques > Revenus par MÃ©decin et par CatÃ©gorie."
    
    elif "annonce" in message_lower:
        return "Vous pouvez gÃ©rer les annonces de la page d'accueil dans la section Annonces."
    
    else:
        return "Je suis un assistant IA pour l'administration. Je peux vous aider avec les statistiques, les mÃ©decins, les patients et l'annonce. Comment puis-je vous assister ?"


# ============= API ROUTES - STATS AVANCÃ‰ES =============

@router.get("/api/stats/dashboard")
async def get_dashboard_stats(request: Request, db: Session = Depends(get_db)):
    """RÃ©cupÃ¨re les statistiques du tableau de bord"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        medecins_actifs = db.query(Medecin).filter(Medecin.est_actif == True).count()
        medecins_en_attente = db.query(Medecin).filter(Medecin.est_actif == False).count()
        patients_total = db.query(Patient).count()
        
        # Calcul des revenus du mois
        today = datetime.utcnow()
        first_day = datetime(today.year, today.month, 1)
        
        consultations_mois = db.query(RendezVous).filter(
            RendezVous.date_heure >= first_day
        ).count()
        
        # Calculer le revenu moyen
        medecins = db.query(Medecin).filter(Medecin.est_actif == True).all()
        total_revenue = sum((m.prix_consultation or 0) * consultations_mois for m in medecins)
        
        return {
            "medecins_actifs": medecins_actifs,
            "medecins_en_attente": medecins_en_attente,
            "patients_total": patients_total,
            "consultations_mois": consultations_mois,
            "revenus_mois": total_revenue
        }
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")





# ============= MESSAGERIE ADMIN AVEC NOUVELLES TABLES =============

@router.get("/api/contacts")
async def get_contacts(request: Request, db: Session = Depends(get_db)):
    """RÃ©cupÃ¨re la liste des contacts (mÃ©decins et patients) avec dernier message"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        # RÃ©cupÃ©rer les mÃ©decins
        medecins = db.query(Medecin).filter(
            Medecin.est_actif == True
        ).order_by(Medecin.nom, Medecin.prenom).all()
        
        # RÃ©cupÃ©rer les patients
        patients = db.query(Patient).filter(
            Patient.est_actif == True
        ).order_by(Patient.nom, Patient.prenom).all()
        
        contacts = []
        
        # Ajouter les mÃ©decins avec leur dernier message
        for m in medecins:
            # RÃ©cupÃ©rer le dernier message avec ce mÃ©decin
            last_message = db.query(MessageAdminMedecin).filter(
                MessageAdminMedecin.medecin_id == m.id
            ).order_by(MessageAdminMedecin.date_envoi.desc()).first()
            
            # Compter les messages non lus (messages du mÃ©decin non lus par admin)
            unread_count = db.query(MessageAdminMedecin).filter(
                MessageAdminMedecin.medecin_id == m.id,
                MessageAdminMedecin.de_admin == False,  # Messages du mÃ©decin
                MessageAdminMedecin.statut == StatutMessage.ENVOYE
            ).count()
            
            contact_data = {
                "id": m.id,
                "type": "medecin",
                "nom_complet": m.nom_complet,
                "email": m.email,
                "telephone": m.telephone or "",
                "photo_profil_url": to_public_static_url(m.photo_profil_url),
                "specialite": m.specialite.value if m.specialite else "MÃ©decin",
                "last_message": last_message.contenu[:100] + "..." if last_message and len(last_message.contenu) > 100 else (last_message.contenu if last_message else ""),
                "last_message_time": last_message.date_envoi.isoformat() if last_message else None,
                "unread_count": unread_count,
                "is_online": bool(m.derniere_connexion and 
                                 m.derniere_connexion >= (datetime.utcnow() - timedelta(minutes=2)))
            }
            contacts.append(contact_data)
        
        # Ajouter les patients avec leur dernier message
        for p in patients:
            # RÃ©cupÃ©rer le dernier message avec ce patient
            last_message = db.query(MessageAdminPatient).filter(
                MessageAdminPatient.patient_id == p.id
            ).order_by(MessageAdminPatient.date_envoi.desc()).first()
            
            # Compter les messages non lus (messages du patient non lus par admin)
            unread_count = db.query(MessageAdminPatient).filter(
                MessageAdminPatient.patient_id == p.id,
                MessageAdminPatient.de_admin == False,  # Messages du patient
                MessageAdminPatient.statut == StatutMessage.ENVOYE
            ).count()
            
            contact_data = {
                "id": p.id,
                "type": "patient",
                "nom_complet": p.nom_complet,
                "email": p.email,
                "telephone": p.telephone or "",
                "photo_profil_url": to_public_static_url(p.photo_profil_url),
                "specialite": "Patient",
                "last_message": last_message.contenu[:100] + "..." if last_message and len(last_message.contenu) > 100 else (last_message.contenu if last_message else ""),
                "last_message_time": last_message.date_envoi.isoformat() if last_message else None,
                "unread_count": unread_count,
                "is_online": bool(p.derniere_connexion and 
                                 p.derniere_connexion >= (datetime.utcnow() - timedelta(minutes=2)))
            }
            contacts.append(contact_data)
        
        # Trier par date du dernier message
        contacts.sort(key=lambda x: x["last_message_time"] or "", reverse=True)
        
        return contacts
        
    except Exception as e:
        print(f"âŒ Erreur contacts: {e}")
        import traceback
        traceback.print_exc()
        return []


@router.get("/api/messages/{contact_type}/{contact_id}")
async def get_conversation_messages(
    request: Request,
    contact_type: str,
    contact_id: int,
    db: Session = Depends(get_db)
):
    """RÃ©cupÃ¨re les messages avec un contact spÃ©cifique"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        contact_type = contact_type.lower()
        messages = []
        contact_info = None
        
        if contact_type == "medecin":
            # VÃ©rifier que le mÃ©decin existe
            medecin = db.query(Medecin).filter(Medecin.id == contact_id).first()
            if not medecin:
                raise HTTPException(status_code=404, detail="MÃ©decin non trouvÃ©")
            
            contact_info = {
                "id": medecin.id,
                "type": "medecin",
                "nom_complet": medecin.nom_complet,
                "email": medecin.email,
                "telephone": medecin.telephone,
                "photo_profil_url": to_public_static_url(medecin.photo_profil_url),
                "specialite": medecin.specialite.value if medecin.specialite else "MÃ©decin"
            }
            
            # RÃ©cupÃ©rer les messages
            msg_list = db.query(MessageAdminMedecin).filter(
                MessageAdminMedecin.medecin_id == contact_id
            ).order_by(MessageAdminMedecin.date_envoi.asc()).all()
            
            # Marquer comme lus
            db.query(MessageAdminMedecin).filter(
                MessageAdminMedecin.medecin_id == contact_id,
                MessageAdminMedecin.de_admin == False,
                MessageAdminMedecin.statut == StatutMessage.ENVOYE
            ).update({"statut": StatutMessage.LU, "date_lu": datetime.utcnow()})
            db.commit()
            
            # Formater les messages
            for msg in msg_list:
                messages.append({
                    "id": msg.id,
                    "contenu": msg.contenu,
                    "date_envoi": msg.date_envoi.isoformat(),
                    "expediteur_type": "medecin" if not msg.de_admin else "admin",
                    "expediteur_nom": medecin.nom_complet if not msg.de_admin else current_admin.nom_complet,
                    "statut": msg.statut.value if hasattr(msg.statut, 'value') else str(msg.statut)
                })
            
        elif contact_type == "patient":
            # VÃ©rifier que le patient existe
            patient = db.query(Patient).filter(Patient.id == contact_id).first()
            if not patient:
                raise HTTPException(status_code=404, detail="Patient non trouvÃ©")
            
            contact_info = {
                "id": patient.id,
                "type": "patient",
                "nom_complet": patient.nom_complet,
                "email": patient.email,
                "telephone": patient.telephone,
                "photo_profil_url": to_public_static_url(patient.photo_profil_url),
                "specialite": "Patient"
            }
            
            # RÃ©cupÃ©rer les messages
            msg_list = db.query(MessageAdminPatient).filter(
                MessageAdminPatient.patient_id == contact_id
            ).order_by(MessageAdminPatient.date_envoi.asc()).all()
            
            # Marquer comme lus
            db.query(MessageAdminPatient).filter(
                MessageAdminPatient.patient_id == contact_id,
                MessageAdminPatient.de_admin == False,
                MessageAdminPatient.statut == StatutMessage.ENVOYE
            ).update({"statut": StatutMessage.LU, "date_lu": datetime.utcnow()})
            db.commit()
            
            # Formater les messages
            for msg in msg_list:
                messages.append({
                    "id": msg.id,
                    "contenu": msg.contenu,
                    "date_envoi": msg.date_envoi.isoformat(),
                    "expediteur_type": "patient" if not msg.de_admin else "admin",
                    "expediteur_nom": patient.nom_complet if not msg.de_admin else current_admin.nom_complet,
                    "statut": msg.statut.value if hasattr(msg.statut, 'value') else str(msg.statut)
                })
        
        return {
            "contact": contact_info,
            "messages": messages
        }
        
    except Exception as e:
        print(f"âŒ Erreur messages: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la rÃ©cupÃ©ration des messages: {str(e)}")


@router.post("/api/messages/send")
async def send_message_admin(
    request: Request,
    contact_type: str = Form(...),
    contact_id: int = Form(...),
    contenu: str = Form(...),
    db: Session = Depends(get_db)
):
    """Envoie un message Ã  un contact"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    if not contenu or not contenu.strip():
        raise HTTPException(status_code=400, detail="Le message ne peut pas Ãªtre vide")
    
    try:
        contact_type = contact_type.lower()
        
        if contact_type == "medecin":
            # VÃ©rifier que le mÃ©decin existe
            medecin = db.query(Medecin).filter(Medecin.id == contact_id).first()
            if not medecin:
                raise HTTPException(status_code=404, detail="MÃ©decin non trouvÃ©")
            
            # CrÃ©er le message
            nouveau_message = MessageAdminMedecin(
                admin_id=current_admin.id,
                medecin_id=contact_id,
                contenu=contenu.strip(),
                de_admin=True,
                statut=StatutMessage.ENVOYE,
                date_envoi=datetime.utcnow()
            )
            
        elif contact_type == "patient":
            # VÃ©rifier que le patient existe
            patient = db.query(Patient).filter(Patient.id == contact_id).first()
            if not patient:
                raise HTTPException(status_code=404, detail="Patient non trouvÃ©")

            has_bug_signal = db.query(MessageAdminPatient).filter(
                MessageAdminPatient.patient_id == contact_id,
                MessageAdminPatient.de_admin == False
            ).count() > 0
            if not has_bug_signal:
                raise HTTPException(
                    status_code=400,
                    detail="Le patient doit d'abord signaler un bug technique avant rÃ©ponse admin."
                )
            
            # CrÃ©er le message
            nouveau_message = MessageAdminPatient(
                admin_id=current_admin.id,
                patient_id=contact_id,
                sujet="RÃ©ponse support technique",
                contenu=contenu.strip(),
                de_admin=True,
                statut=StatutMessage.ENVOYE,
                date_envoi=datetime.utcnow()
            )
        else:
            raise HTTPException(status_code=400, detail="Type de contact invalide")
        
        db.add(nouveau_message)
        db.commit()
        db.refresh(nouveau_message)
        
        return {
            "success": True,
            "message": {
                "id": nouveau_message.id,
                "contenu": nouveau_message.contenu,
                "date_envoi": nouveau_message.date_envoi.isoformat(),
                "expediteur_type": "admin",
                "expediteur_nom": current_admin.nom_complet,
                "statut": nouveau_message.statut.value if hasattr(nouveau_message.statut, 'value') else str(nouveau_message.statut)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"âŒ Erreur envoi message: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'envoi du message: {str(e)}")


@router.get("/api/messages/unread-count")
async def get_unread_messages_count(request: Request, db: Session = Depends(get_db)):
    """RÃ©cupÃ¨re le nombre total de messages non lus"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        # Messages non lus des mÃ©decins
        unread_from_medecins = db.query(MessageAdminMedecin).filter(
            MessageAdminMedecin.de_admin == False,
            MessageAdminMedecin.statut == StatutMessage.ENVOYE
        ).count()
        
        # Messages non lus des patients
        unread_from_patients = db.query(MessageAdminPatient).filter(
            MessageAdminPatient.de_admin == False,
            MessageAdminPatient.statut == StatutMessage.ENVOYE
        ).count()
        
        return {
            "total": unread_from_medecins + unread_from_patients,
            "from_medecins": unread_from_medecins,
            "from_patients": unread_from_patients
        }
        
    except Exception as e:
        print(f"âŒ Erreur comptage messages non lus: {e}")
        return {"total": 0, "from_medecins": 0, "from_patients": 0}


@router.get("/api/notifications/summary")
async def get_admin_notifications_summary(request: Request, db: Session = Depends(get_db)):
    current_admin = get_current_admin_from_cookie(request, db)
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifie")

    today = datetime.utcnow().date()
    start_today = datetime.combine(today, datetime.min.time())
    end_today = datetime.combine(today, datetime.max.time())

    unread_from_medecins = db.query(MessageAdminMedecin).filter(
        MessageAdminMedecin.de_admin == False,
        MessageAdminMedecin.statut == StatutMessage.ENVOYE
    ).count()
    unread_from_patients = db.query(MessageAdminPatient).filter(
        MessageAdminPatient.de_admin == False,
        MessageAdminPatient.statut == StatutMessage.ENVOYE
    ).count()

    inscriptions_pending = db.query(Medecin).filter(
        Medecin.statut_inscription == StatutInscription.EN_ATTENTE.value
    ).count() + db.query(Admin).filter(
        Admin.statut_inscription == StatutInscription.EN_ATTENTE.value
    ).count()

    new_patients_today = db.query(Patient).filter(
        Patient.date_creation >= start_today,
        Patient.date_creation <= end_today
    ).count()

    new_documents_today = db.query(Document).filter(
        Document.date_upload >= start_today,
        Document.date_upload <= end_today
    ).count()

    total = unread_from_medecins + unread_from_patients + inscriptions_pending + new_patients_today + new_documents_today
    return {
        "total": total,
        "messages_non_lus": unread_from_medecins + unread_from_patients,
        "inscriptions_en_attente": inscriptions_pending,
        "nouveaux_patients": new_patients_today,
        "nouveaux_documents": new_documents_today
    }


@router.post("/api/notifications/broadcast")
async def broadcast_notification(
    request: Request,
    titre: str = Form(...),
    contenu: str = Form(...),
    cible: str = Form("all"),
    db: Session = Depends(get_db)
):
    current_admin = get_current_admin_from_cookie(request, db)
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")

    cible = (cible or "all").lower().strip()
    if cible not in {"all", "patients", "medecins"}:
        raise HTTPException(status_code=400, detail="Cible invalide")

    notif = NotificationBroadcast(
        admin_id=current_admin.id,
        cible=cible,
        titre=titre.strip(),
        contenu=contenu.strip()
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    recipients = []
    if cible in {"all", "patients"}:
        patients = db.query(Patient.id).filter(Patient.est_actif == True).all()
        recipients.extend([("patient", p.id) for p in patients])
    if cible in {"all", "medecins"}:
        medecins = db.query(Medecin.id).filter(Medecin.est_actif == True).all()
        recipients.extend([("medecin", m.id) for m in medecins])

    for role, user_id in recipients:
        db.add(NotificationReception(
            notification_id=notif.id,
            user_role=role,
            user_id=user_id,
            lu=False
        ))
    db.commit()

    return {"success": True, "sent": len(recipients)}


@router.get("/api/notifications/broadcast")
async def get_broadcast_notifications(request: Request, db: Session = Depends(get_db)):
    current_admin = get_current_admin_from_cookie(request, db)
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")

    rows = db.query(NotificationBroadcast).order_by(NotificationBroadcast.date_creation.desc()).limit(30).all()
    return [
        {
            "id": r.id,
            "titre": r.titre,
            "contenu": r.contenu,
            "cible": r.cible,
            "date_creation": r.date_creation.isoformat() if r.date_creation else None
        }
        for r in rows
    ]
@router.put("/api/messages/{message_id}/mark-read")
async def mark_message_read(
    request: Request,
    message_id: int,
    db: Session = Depends(get_db)
):
    """Marque un message comme lu"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        message = db.query(Message).filter(Message.id == message_id).first()
        
        if not message:
            raise HTTPException(status_code=404, detail="Message non trouvÃ©")
        
        message.statut = StatutMessage.LU
        db.commit()
        
        return {"success": True}
        
    except Exception as e:
        print(f"Erreur marquage message: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")
    
    
    
    # Ã€ ajouter dans votre fichier routes admin
@router.get("/api/public/holidays")
async def get_public_holidays(year: int = None):
    """
    API pour rÃ©cupÃ©rer les jours fÃ©riÃ©s d'une annÃ©e
    """
    from datetime import datetime
    
    if not year:
        year = datetime.now().year
    
    try:
        import requests
        response = requests.get(
            f"https://calendrier.api.gouv.fr/jours-feries/metropole/{year}.json",
            timeout=8
        )
        if response.status_code == 200:
            data = response.json()
            holidays = []
            for date_str, name in data.items():
                date = datetime.strptime(date_str, "%Y-%m-%d")
                holidays.append({
                    "date": date.isoformat(),
                    "name": name,
                    "type": "public"
                })
            return holidays
    except Exception:
        pass
    
    # Fallback - retourner une liste vide
    return []



    
@router.get("/api/profile")
async def get_admin_profile(
    request: Request,
    db: Session = Depends(get_db)
):
    """RÃ©cupÃ¨re le profil de l'admin connectÃ©"""
    # Utilisez votre fonction d'authentification existante
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    return {
        "id": current_admin.id,
        "nom_complet": f"{current_admin.prenom} {current_admin.nom}",
        "email": current_admin.email,
        "telephone": current_admin.telephone,
        "photo_profil_url": to_public_static_url(current_admin.photo_profil_url)
    }
    
    
# ============= ROUTES ADMIN - PARTENAIRES SIMPLIFIÃ‰ES =============
@router.get("/api/partenaires")
async def get_all_partenaires(
    request: Request,
    db: Session = Depends(get_db)
):
    """RÃ©cupÃ¨re tous les partenaires"""
    current_admin = get_current_admin_from_cookie(request, db)
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    partenaires = db.query(Partenaire).order_by(Partenaire.date_ajout.desc()).all()
    
    result = []
    for p in partenaires:
        admin_nom = f"{p.admin.prenom} {p.admin.nom}" if p.admin else "Admin"
        
        # FIX: Convert absolute path to URL path
        logo_url = p.logo_url
        if logo_url and logo_url.startswith('app/'):
            # Convert 'app/static/uploads/partenaires/filename.jpg' to '/static/uploads/partenaires/filename.jpg'
            logo_url = '/' + logo_url.replace('app/', '', 1)
        
        result.append({
            "id": p.id,
            "nom": p.nom,
            "type": p.type_partenaire,
            "logo_url": logo_url,
            "date_ajout": p.date_ajout.strftime("%d/%m/%Y %H:%M") if p.date_ajout else "",
            "admin": admin_nom
        })
    
    return result

@router.post("/api/partenaires/ajouter")
async def ajouter_partenaire(
    request: Request,
    nom: str = Form(...),
    type_partenaire: str = Form(...),
    logo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """Ajoute un nouveau partenaire"""
    current_admin = get_current_admin_from_cookie(request, db)
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    try:
        # GÃ©rer l'upload du logo
        logo_url = None
        if logo and logo.filename:
            # Nettoyer le nom de fichier
            ext = Path(logo.filename).suffix
            safe_filename = f"partenaire_{int(datetime.utcnow().timestamp())}{ext}"
            
            # FIX: Use PARTENAIRES_UPLOAD_DIR instead of UPLOAD_DIR
            file_path = PARTENAIRES_UPLOAD_DIR / safe_filename
            
            # Sauvegarder le fichier
            content = await logo.read()
            with open(file_path, "wb") as buffer:
                buffer.write(content)
            
            # FIX: Store relative path that will be properly converted when serving
            logo_url = f"app/static/uploads/partenaires/{safe_filename}"
        
        # CrÃ©er le partenaire
        nouveau_partenaire = Partenaire(
            nom=nom,
            type_partenaire=type_partenaire,
            logo_url=logo_url,
            admin_id=current_admin.id,
            date_ajout=datetime.utcnow()
        )
        
        db.add(nouveau_partenaire)
        db.commit()
        
        return {
            "success": True,
            "message": "Partenaire ajoutÃ© avec succÃ¨s",
            "id": nouveau_partenaire.id
        }
        
    except Exception as e:
        db.rollback()
        print(f"Erreur ajout partenaire: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/api/partenaires/{partenaire_id}")
async def modifier_partenaire(
    partenaire_id: int,
    request: Request,
    nom: str = Form(...),
    type_partenaire: str = Form(...),
    logo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """Modifie un partenaire existant"""
    current_admin = get_current_admin_from_cookie(request, db)
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    partenaire = db.query(Partenaire).filter(Partenaire.id == partenaire_id).first()
    if not partenaire:
        raise HTTPException(status_code=404, detail="Partenaire non trouvÃ©")
    
    try:
        # Mettre Ã  jour les champs
        partenaire.nom = nom
        partenaire.type_partenaire = type_partenaire
        
        # GÃ©rer le nouveau logo
        if logo and logo.filename:
            ext = Path(logo.filename).suffix
            safe_filename = f"partenaire_{int(datetime.utcnow().timestamp())}{ext}"
            
            # FIX: Use PARTENAIRES_UPLOAD_DIR
            file_path = PARTENAIRES_UPLOAD_DIR / safe_filename
            
            content = await logo.read()
            with open(file_path, "wb") as buffer:
                buffer.write(content)
            
            # FIX: Store relative path
            partenaire.logo_url = f"app/static/uploads/partenaires/{safe_filename}"
        
        db.commit()
        
        return {
            "success": True,
            "message": "Partenaire modifiÃ© avec succÃ¨s"
        }
        
    except Exception as e:
        db.rollback()
        print(f"Erreur modification partenaire: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/api/partenaires/{partenaire_id}")
async def supprimer_partenaire(
    partenaire_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Supprime un partenaire"""
    current_admin = get_current_admin_from_cookie(request, db)
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")
    
    partenaire = db.query(Partenaire).filter(Partenaire.id == partenaire_id).first()
    if not partenaire:
        raise HTTPException(status_code=404, detail="Partenaire non trouvÃ©")
    
    try:
        db.delete(partenaire)
        db.commit()
        
        return {
            "success": True,
            "message": "Partenaire supprimÃ© avec succÃ¨s"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/help/pdf")
async def admin_help_pdf(request: Request, db: Session = Depends(get_db)):
    current_admin = get_current_admin_from_cookie(request, db)
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifiÃ©")

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    y = 800
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Guide Administrateur Dokira")
    y -= 24
    pdf.setFont("Helvetica", 11)
    lines = [
        "- Tableau de bord: indicateurs globaux",
        "- Inscriptions Medecins: approbation/rejet",
        "- Gestion Medecins/Patients: consultation et suivi",
        "- Annonces: CRUD et publication",
        "- Notifications: diffusion vers patients/medecins",
        "- Messagerie: reponses support aux signalements",
        "- Parametres: profil et informations professionnelles",
    ]
    for line in lines:
        pdf.drawString(50, y, line)
        y -= 16
    pdf.save()
    buffer.seek(0)
    return Response(
        content=buffer.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": "inline; filename=guide_admin_dokira.pdf"}
    )

