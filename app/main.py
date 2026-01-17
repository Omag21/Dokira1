from fastapi import FastAPI, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine, get_db
from app.views import router as views_router
from app.urls import router as api_router
from app.views_medecin import router as medecin_router  
from dotenv import load_dotenv
import time

load_dotenv()

# Initialiser l'application FastAPI D'ABORD
app = FastAPI()

# Configurer les modèles
templates = Jinja2Templates(directory="app/templates")
templates.env.cache = {}

# Inclure les routeurs
app.include_router(views_router)
app.include_router(api_router, prefix="/api")
app.include_router(medecin_router)  

# Monte le dossier static pour servir CSS, JS, images
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Middleware pour mesurer le temps de chargement
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    print(f"Request to {request.url.path} took {process_time:.3f}s")
    return response

# Fonction pour créer les tables (ne sera exécutée qu'une fois)
# def create_tables():
   # try:
       # print("Creating database tables...")
       # start = time.time()
       # Base.metadata.create_all(bind=engine)
       # end = time.time()
       # print(f"Tables created successfully in {end-start:.3f}s")
    # except Exception as e:
        # print(f"Error creating tables: {e}")
        # Ne pas bloquer le démarrage si la base n'est pas accessible
       # pass

# Exécuter la création des tables au démarrage
# create_tables()

@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("main.html", {"request": request})

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": time.time()}