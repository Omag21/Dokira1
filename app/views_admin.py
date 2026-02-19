# views_admin.py - Routes pour les administrateurs
from fastapi import APIRouter, Request, Depends, HTTPException, status, Form, File, UploadFile
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
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

# Imports locaux
from app.database import get_db, engine
from app.models import Admin, Medecin, Patient, RendezVous, DossierMedical, Message, Photo, Annonce, Consultation, StatutInscription
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

# Configuration du router et templates
router = APIRouter(prefix="/admin", tags=["admin"])
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Configuration du hachage de mot de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Compatibilite schema inscription
ensure_inscription_schema(engine)


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


def get_admin_by_email(db: Session, email: str):
    """Récupère un admin par email"""
    try:
        return db.query(Admin).filter(Admin.email == email.lower().strip()).first()
    except Exception as e:
        print(f"Erreur lors de la récupération de l'admin: {e}")
        return None


def authenticate_admin(db: Session, email: str, password: str):
    """Authentifie un admin"""
    admin = get_admin_by_email(db, email)
    
    if not admin:
        print(f"Admin non trouvé avec l'email: {email}")
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
    """Récupère l'admin actuel depuis le cookie"""
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
        print(f"Erreur lors de la récupération de l'admin: {e}")
        return None


def save_upload_file(upload_file: UploadFile) -> str:
    """Sauvegarde un fichier uploadé et retourne le chemin"""
    try:
        file_extension = upload_file.filename.split('.')[-1]
        file_name = f"{secrets.token_hex(8)}.{file_extension}"
        file_path = UPLOAD_DIR / file_name
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        
        return str(file_path)
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
    """Dashboard admin - Nécessite authentification"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        return RedirectResponse(url="/admin/connexionAdmin", status_code=303)
    
    # Mettre à jour la dernière connexion
    try:
        current_admin.derniere_connexion = datetime.utcnow()
        db.commit()
    except Exception as e:
        print(f"Erreur lors de la mise à jour de la dernière connexion: {e}")
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
    """Déconnexion admin"""
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
            "photo_profil_url": m.photo_profil_url,
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
            "photo_profil_url": a.photo_profil_url,
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


# ============= API ROUTES - MÉDECINS EN ATTENTE =============

@router.get("/api/medecins-en-attente")
async def get_medecins_en_attente(request: Request, db: Session = Depends(get_db)):
    """Récupère la liste des médecins en attente d'approbation"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
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
                "photo_profil_url": m.photo_profil_url,
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
    """Approuve un médecin en attente"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    try:
        medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
        
        if not medecin:
            raise HTTPException(status_code=404, detail="Médecin non trouvé")
        
        # Activer le médecin
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
            "message": f"Le médecin {medecin.nom_complet} a été approuvé",
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
    """Rejette un médecin en attente"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    try:
        medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
        
        if not medecin:
            raise HTTPException(status_code=404, detail="Médecin non trouvé")
        
        # Supprimer le médecin
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
            "message": f"Le médecin {medecin.nom_complet} a été rejeté"
        }
    except Exception as e:
        db.rollback()
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors du rejet")


# ============= API ROUTES - MÉDECINS ACTIFS =============

@router.get("/api/medecins-actifs")
async def get_medecins_actifs(request: Request, db: Session = Depends(get_db)):
    """Récupère la liste des médecins actifs"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
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
                "photo_profil_url": m.photo_profil_url,
                "est_actif": m.est_actif
            }
            for m in medecins
        ]
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


@router.get("/api/tous-medecins")
async def get_tous_medecins(request: Request, db: Session = Depends(get_db)):
    """Récupère tous les médecins (actifs et en attente) organisés par catégorie"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
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
                "photo_profil_url": m.photo_profil_url,
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
        "photo_profil_url": medecin.photo_profil_url,
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
    """Supprime un médecin"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    try:
        medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
        
        if not medecin:
            raise HTTPException(status_code=404, detail="Médecin non trouvé")
        
        db.delete(medecin)
        db.commit()
        
        return {
            "success": True,
            "message": f"Le médecin {medecin.nom_complet} a été supprimé"
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
    """Ajoute un médecin directement (admin)"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    try:
        email = email.strip().lower()
        
        # Vérifier si email existe
        existing = db.query(Medecin).filter(Medecin.email == email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email déjà utilisé")
        
        # Générer un mot de passe temporaire
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
        
        # Gérer la photo si fournie
        if photo:
            photo_path = save_upload_file(photo)
            if photo_path:
                nouveau_medecin.photo_profil_url = photo_path
        
        db.add(nouveau_medecin)
        db.commit()
        db.refresh(nouveau_medecin)
        
        return {
            "success": True,
            "message": f"Le médecin {nom} a été ajouté",
            "medecin_id": nouveau_medecin.id,
            "temp_password": temp_password
        }
    except Exception as e:
        db.rollback()
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'ajout du médecin")


# ============= API ROUTES - PATIENTS =============

@router.get("/api/patients")
async def get_patients(request: Request, db: Session = Depends(get_db)):
    """Récupère la liste de tous les patients"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
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
                "photo_profil_url": p.photo_profil_url,
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
        "photo_profil_url": patient.photo_profil_url,
        "est_actif": patient.est_actif,
        "date_creation": patient.date_creation.isoformat() if patient.date_creation else None
    }


# ============= API ROUTES - ANNONCES =============

@router.get("/api/annonces")
async def get_annonces(request: Request, db: Session = Depends(get_db)):
    """Récupère la liste des annonces"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
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
                "image_url": a.image_url,
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
    date_expiration: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Ajoute une annonce"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    try:
        image_url = None
        if image:
            image_url = save_upload_file(image)
        
        date_exp = None
        if date_expiration:
            date_exp = datetime.strptime(date_expiration, "%Y-%m-%d").date()
        
        nouvelle_annonce = Annonce(
            titre=titre.strip(),
            contenu=contenu.strip(),
            image_url=image_url,
            date_creation=datetime.utcnow(),
            date_expiration=date_exp,
            admin_id=current_admin.id
        )
        
        db.add(nouvelle_annonce)
        db.commit()
        db.refresh(nouvelle_annonce)
        
        return {
            "success": True,
            "message": "Annonce ajoutée avec succès",
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
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    try:
        annonce = db.query(Annonce).filter(Annonce.id == annonce_id).first()
        
        if not annonce:
            raise HTTPException(status_code=404, detail="Annonce non trouvée")
        
        db.delete(annonce)
        db.commit()
        
        return {
            "success": True,
            "message": "Annonce supprimée"
        }
    except Exception as e:
        db.rollback()
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")


# ============= API ROUTES - STATISTIQUES =============

@router.get("/api/statistiques/consultations")
async def get_consultation_stats(request: Request, db: Session = Depends(get_db)):
    """Récupère les statistiques de consultations par médecin"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
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
    """Récupère les statistiques de revenus par catégorie"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
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
    """Récupère le profil de l'admin connecté"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    return {
        "id": current_admin.id,
        "nom": current_admin.nom,
        "prenom": current_admin.prenom,
        "nom_complet": current_admin.nom_complet,
        "email": current_admin.email,
        "telephone": current_admin.telephone,
        "photo_profil_url": current_admin.photo_profil_url
    }


@router.post("/api/profil/update")
async def update_admin_profile(
    request: Request,
    nom_complet: str = Form(...),
    email: str = Form(...),
    telephone: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Met à jour le profil de l'admin"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    try:
        # Vérifier si le nouvel email existe
        if email.lower() != current_admin.email.lower():
            existing = db.query(Admin).filter(Admin.email == email.lower().strip()).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email déjà utilisé")
        
        # Mettre à jour les informations
        nom_parts = nom_complet.strip().split(" ", 1)
        current_admin.nom = nom_parts[0].capitalize()
        current_admin.prenom = nom_parts[1].capitalize() if len(nom_parts) > 1 else ""
        current_admin.email = email.lower().strip()
        current_admin.telephone = telephone.strip() if telephone else None
        
        # Gérer la photo
        if photo:
            photo_path = save_upload_file(photo)
            if photo_path:
                current_admin.photo_profil_url = photo_path
        
        db.commit()
        db.refresh(current_admin)
        
        return {
            "success": True,
            "message": "Profil mis à jour avec succès"
        }
    except Exception as e:
        db.rollback()
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour")


# ============= API ROUTES - ADMINISTRATEURS =============

@router.get("/api/administrateurs")
async def get_administrateurs(request: Request, db: Session = Depends(get_db)):
    """Récupère la liste des administrateurs"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
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
    """Nomme un médecin comme administrateur"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    try:
        medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
        
        if not medecin:
            raise HTTPException(status_code=404, detail="Médecin non trouvé")
        
        # Vérifier si déjà admin
        existing_admin = db.query(Admin).filter(Admin.email == medecin.email).first()
        if existing_admin:
            raise HTTPException(status_code=400, detail="Ce médecin est déjà administrateur")
        
        # Créer un nouveau compte admin
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
            "message": f"{medecin.nom_complet} a été nommé administrateur",
            "admin_id": nouvel_admin.id,
            "redirect_url": "/admin/dashboard"
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
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    if admin_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Impossible de se supprimer soi-même")
    
    try:
        admin = db.query(Admin).filter(Admin.id == admin_id).first()
        
        if not admin:
            raise HTTPException(status_code=404, detail="Administrateur non trouvé")
        
        admin.est_actif = False
        db.commit()
        
        return {
            "success": True,
            "message": f"Les droits d'administrateur de {admin.nom_complet} ont été retirés"
        }
    except Exception as e:
        db.rollback()
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")


# ============= API ROUTES - MESSAGERIE =============

@router.get("/api/contacts")
async def get_contacts(request: Request, db: Session = Depends(get_db)):
    """Récupère la liste des contacts (médecins et patients)"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    try:
        # Récupérer les médecins et patients
        medecins = db.query(Medecin).all()
        patients = db.query(Patient).all()
        
        contacts = []
        
        for m in medecins:
            contacts.append({
                "id": m.id,
                "type": "medecin",
                "nom": m.nom,
                "nom_complet": m.nom_complet,
                "email": m.email,
                "last_message": "Dernier message..."
            })
        
        for p in patients:
            contacts.append({
                "id": p.id,
                "type": "patient",
                "nom": p.nom,
                "nom_complet": p.nom_complet,
                "email": p.email,
                "last_message": "Dernier message..."
            })
        
        return contacts
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


@router.get("/api/messages/{contact_id}")
async def get_messages(
    request: Request,
    contact_id: int,
    db: Session = Depends(get_db)
):
    """Récupère les messages avec un contact"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    try:
        # Récupérer les messages (à adapter selon votre modèle)
        messages = db.query(Message).filter(
            or_(
                Message.medecin_id == contact_id,
                Message.patient_id == contact_id
            )
        ).order_by(Message.date_envoi.desc()).limit(50).all()
        
        return [
            {
                "id": msg.id,
                "contenu": msg.contenu,
                "date_envoi": msg.date_envoi.isoformat() if msg.date_envoi else None,
                "de_admin": False,  # À adapter selon votre structure
                "statut": msg.statut.value if msg.statut else "Envoyé"
            }
            for msg in messages
        ]
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


@router.post("/api/messages/send")
async def send_message(
    request: Request,
    contact_id: int = Form(...),
    contenu: str = Form(...),
    db: Session = Depends(get_db)
):
    """Envoie un message à un contact"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    try:
        # À adapter selon votre structure de messages
        nouveau_message = Message(
            medecin_id=contact_id,
            de_medecin=False,
            sujet="Message Admin",
            contenu=contenu,
            date_envoi=datetime.utcnow()
        )
        
        db.add(nouveau_message)
        db.commit()
        db.refresh(nouveau_message)
        
        return {
            "success": True,
            "message_id": nouveau_message.id
        }
    except Exception as e:
        db.rollback()
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi")



# ============= API ROUTES - ANNONCES PUBLIQUES =============

@router.get("/api/public/annonces")
async def get_public_annonces(db: Session = Depends(get_db)):
    """Récupère les annonces actives et valides pour la page d'accueil"""
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
        
        print(f"Nombre d'annonces trouvées: {len(annonces)}")
        
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
                "image_url": image_url,  # URL corrigée
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
    """Récupère les revenus détaillés par médecin"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
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
    """Récupère les revenus par catégorie/spécialité"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
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
    """Récupère les statistiques complètes pour le tableau de bord"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
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
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    try:
        # Simuler une réponse IA
        # À remplacer par un vrai service IA (OpenAI, HuggingFace, etc.)
        
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
    
    # Réponses basiques
    if "statistique" in message_lower or "stat" in message_lower:
        return "Je peux vous aider avec les statistiques. Consultez la section Statistiques du tableau de bord pour voir les consultations et revenus par médecin et catégorie."
    
    elif "médecin" in message_lower:
        try:
            medecin_count = db.query(Medecin).filter(Medecin.est_actif == True).count()
            return f"Vous avez actuellement {medecin_count} médecins actifs sur la plateforme."
        except:
            return "Erreur lors de la récupération du nombre de médecins."
    
    elif "patient" in message_lower:
        try:
            patient_count = db.query(Patient).count()
            return f"Vous avez {patient_count} patients enregistrés sur la plateforme."
        except:
            return "Erreur lors de la récupération du nombre de patients."
    
    elif "revenu" in message_lower or "revenue" in message_lower:
        return "Pour voir les revenus détaillés, consultez la section Statistiques > Revenus par Médecin et par Catégorie."
    
    elif "annonce" in message_lower:
        return "Vous pouvez gérer les annonces de la page d'accueil dans la section Annonces."
    
    else:
        return "Je suis un assistant IA pour l'administration. Je peux vous aider avec les statistiques, les médecins, les patients et l'annonce. Comment puis-je vous assister ?"


# ============= API ROUTES - STATS AVANCÉES =============

@router.get("/api/stats/dashboard")
async def get_dashboard_stats(request: Request, db: Session = Depends(get_db)):
    """Récupère les statistiques du tableau de bord"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
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
