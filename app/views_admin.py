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
from dotenv import load_dotenv
import shutil
from typing import Optional, List

# Imports locaux
from app.database import get_db
from app.models import Admin, Medecin, Patient, RendezVous, DossierMedical, Message, Photo, Annonce

# Charger les variables d'environnement
load_dotenv()

# Configuration
BASE_DIR = Path(__file__).resolve().parent
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = os.environ["JWT_ALGO"]
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"])
UPLOAD_DIR = Path("uploads/photos")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Configuration du router et templates
router = APIRouter(prefix="/admin", tags=["admin"])
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
    
    if not admin.est_actif:
        print(f"Compte inactif pour l'email: {email}")
        return None
    
    return admin


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
    
    return templates.TemplateResponse("admin.html", {"request": request})


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
        "admin_dashboard.html",
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
        return templates.TemplateResponse(
            "connexionAdmin.html",
            {
                "request": request,
                "error": "Email ou mot de passe incorrect",
                "email": email
            },
            status_code=401
        )
    
    if not admin.est_actif:
        return templates.TemplateResponse(
            "connexionAdmin.html",
            {
                "request": request,
                "error": "Votre compte a été désactivé.",
                "email": email
            },
            status_code=403
        )
    
    # Créer le token
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
    
    # Mettre à jour la dernière connexion
    try:
        admin.derniere_connexion = datetime.utcnow()
        db.commit()
    except Exception as e:
        print(f"Erreur lors de la mise à jour: {e}")
        db.rollback()
    
    # Redirection
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


@router.get("/deconnexion")
@router.get("/deconnexionAdmin")
async def deconnexion_admin():
    """Déconnexion admin"""
    response = RedirectResponse(url="/admin/connexionAdmin", status_code=303)
    response.delete_cookie(key="admin_access_token")
    return response


# ============= API ROUTES - MÉDECINS EN ATTENTE =============

@router.get("/api/medecins-en-attente")
async def get_medecins_en_attente(request: Request, db: Session = Depends(get_db)):
    """Récupère la liste des médecins en attente d'approbation"""
    current_admin = get_current_admin_from_cookie(request, db)
    
    if not current_admin:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    try:
        medecins = db.query(Medecin).filter(Medecin.est_actif == False).all()
        
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
        medecin.date_approbation = datetime.utcnow()
        medecin.approuve_par = current_admin.id
        
        db.commit()
        db.refresh(medecin)
        
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
        db.delete(medecin)
        db.commit()
        
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
        medecins = db.query(Medecin).filter(Medecin.est_actif == True).all()
        
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
                "date_creation": m.date_creation.isoformat() if m.date_creation else None
            }
            for m in medecins
        ]
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


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
            bio=bio,
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
                "date_creation": p.date_creation.isoformat() if p.date_creation else None
            }
            for p in patients
        ]
    except Exception as e:
        print(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


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
        
        # Générer un mot de passe temporaire
        temp_password = secrets.token_urlsafe(12)
        
        # Créer un nouveau compte admin
        nouvel_admin = Admin(
            email=medecin.email,
            mot_de_passe_hash=get_password_hash(temp_password),
            nom=medecin.nom,
            prenom=medecin.prenom,
            telephone=medecin.telephone,
            photo_profil_url=medecin.photo_profil_url,
            est_actif=True,
            date_creation=datetime.utcnow()
        )
        
        db.add(nouvel_admin)
        db.commit()
        db.refresh(nouvel_admin)
        
        return {
            "success": True,
            "message": f"{medecin.nom_complet} a été nommé administrateur",
            "admin_id": nouvel_admin.id,
            "temp_password": temp_password
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