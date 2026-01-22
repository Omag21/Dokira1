from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus, urlparse, urlunparse
import sys
import time

load_dotenv()  

def has_password_in_url(url: str) -> bool:
    try:
        p = urlparse(url)
        return p.password is not None and p.password != ""
    except Exception:
        return False

def build_from_components():
    db_user = os.getenv("DB_USER") or os.getenv("POSTGRES_USER") or "postgres"
    db_password = os.getenv("DB_PASSWORD") or os.getenv("POSTGRES_PASSWORD") or ""
    db_host = os.getenv("DB_HOST") or "localhost"
    db_port = os.getenv("DB_PORT") or "5432"
    db_name = os.getenv("DB_NAME") or os.getenv("POSTGRES_DB") or "dokira"

    password_encoded = quote_plus(db_password)
    return f"postgresql+psycopg://{db_user}:{password_encoded}@{db_host}:{db_port}/{db_name}", db_password

# Priorité : DATABASE_URL (si presente), sinon construire depuis DB_*
env_url = os.getenv("DATABASE_URL")
built_url, built_password = build_from_components()

if env_url:
    print("DATABASE_URL (env) repr:", repr(env_url), file=sys.stderr)
    if has_password_in_url(env_url):
        DATABASE_URL = env_url
        print("Using DATABASE_URL from env (contains password).", file=sys.stderr)
    else:
        print("DATABASE_URL provided but no password detected in it.", file=sys.stderr)
        if built_password:
            print("Using built URL from DB_* variables (DB_PASSWORD found).", file=sys.stderr)
            DATABASE_URL = built_url
        else:
            print("No DB_PASSWORD found in environment either. Connection will likely fail.", file=sys.stderr)
            DATABASE_URL = env_url
else:
    print("No DATABASE_URL in env; using built URL from DB_* variables.", file=sys.stderr)
    DATABASE_URL = built_url

# Print final repr used to connect
def mask_url(url: str) -> str:
    try:
        p = urlparse(url)
        if p.password:
            netloc = f"{p.username}:***@{p.hostname}"
            if p.port:
                netloc += f":{p.port}"
            masked = urlunparse((p.scheme, netloc, p.path or "", p.params or "", p.query or "", p.fragment or ""))
            return masked
    except Exception:
        pass
    return url

print("Final DATABASE_URL (masked):", mask_url(DATABASE_URL), file=sys.stderr)

# Try to create engine with connection pooling and timeouts
engine = None
try:
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

    # OPTIMISATION: Paramètres de pool réduits pour démarrage rapide
    engine = create_engine(
        DATABASE_URL,
        pool_size=2,  # RÉDUIT: 2 connexions max dans le pool au démarrage
        max_overflow=0,  # RÉDUIT: Pas de connexions supplémentaires au démarrage
        pool_timeout=5,  # RÉDUIT: Timeout de 5s max pour obtenir une connexion
        pool_recycle=3600,  # RECYCLAGE: Recycler les connexions après 1 heure
        pool_pre_ping=True,  # IMPORTANT: Vérifie si la connexion est vivante avant utilisation
        connect_args={
            "connect_timeout": 3,  # RÉDUIT: Timeout de connexion à 3s
            "application_name": "dokira_app",
            "keepalives_idle": 30,  # Garde la connexion active
            "keepalives_interval": 10,
            "keepalives_count": 5
        },
        echo=False,  # IMPORTANT: Désactiver le logging SQL (très lent!)
        future=True  # Utiliser l'API future de SQLAlchemy
    )
    
    # Test simple de connexion - version optimisée
    print("Testing database connection...", file=sys.stderr)
    start = time.time()
    
    # Utiliser une connexion directe sans pool pour le test
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        result = conn.execute(text("SELECT 1 as test"))
        row = result.fetchone()
        if row and row.test == 1:
            end = time.time()
            print(f"✅ Database connection test successful in {end-start:.3f}s", file=sys.stderr)
        else:
            raise Exception("Connection test failed - invalid response")
    
except Exception as e:
    print(f"❌ Error create_engine with DATABASE_URL:", file=sys.stderr)
    print(f"   URL: {mask_url(DATABASE_URL)}", file=sys.stderr)
    print(f"   Exception: {e}", file=sys.stderr)
    
    # OPTIMISATION: Créer un engine SQLite plus rapide
    print("Creating optimized in-memory SQLite engine for fallback...", file=sys.stderr)
    engine = create_engine(
        "sqlite:///:memory:",
        echo=False,
        connect_args={"check_same_thread": False}
    )
    print("⚠️ Using in-memory SQLite as fallback. Data will not persist!", file=sys.stderr)

if engine is None:
    print("Creating fallback in-memory SQLite engine...", file=sys.stderr)
    engine = create_engine("sqlite:///:memory:", echo=False)

# OPTIMISATION: Session configurée pour la performance
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False  # IMPORTANT: Améliore les performances
)

Base = declarative_base()

def get_db():
    """Dependency pour obtenir une session DB - version optimisée"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()