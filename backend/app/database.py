from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus, urlparse, urlunparse
import sys


load_dotenv()  

def has_password_in_url(url: str) -> bool:
    try:
        p = urlparse(url)
        # password present if netloc contains ':' between user and host (or p.password not None)
        return p.password is not None and p.password != ""
    except Exception:
        return False

def build_from_components():
    db_user = os.getenv("DB_USER") or os.getenv("POSTGRES_USER") or "postgres"
    db_password = os.getenv("DB_PASSWORD") or os.getenv("POSTGRES_PASSWORD") or ""
    db_host = os.getenv("DB_HOST") or "localhost"
    db_port = os.getenv("DB_PORT") or "5432"
    db_name = os.getenv("DB_NAME") or os.getenv("POSTGRES_DB") or "dokira"

    # encode password safely
    password_encoded = quote_plus(db_password)
    return f"postgresql://{db_user}:{password_encoded}@{db_host}:{db_port}/{db_name}", db_password

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

# Print final repr used to connect (masque le mot de passe pour sécurité dans le log)
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

# Try to create engine and give helpful debug if it fails
try:
    engine = create_engine(DATABASE_URL)
except Exception as e:
    print("Error create_engine with DATABASE_URL repr:", repr(DATABASE_URL), file=sys.stderr)
    print("Exception:", e, file=sys.stderr)
   
    if not has_password_in_url(DATABASE_URL):
        print("Detected: No password in DATABASE_URL. Please set DB_PASSWORD or include password in DATABASE_URL.", file=sys.stderr)
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()