# views.py
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


# ============= ROUTES API - DONNÉES =============

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


# ============= ROUTE DE TEST =============

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
        
        
