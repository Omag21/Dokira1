from fastapi import FastAPI, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles
from database import Base, engine, get_db
from views import router as views_router
from urls import router as api_router

# Crée toutes les tables dans la base de données
Base.metadata.create_all(bind=engine)

# Initialise FastAPI app
app = FastAPI()

# Configure les templates
templates = Jinja2Templates(directory="templates")

# Inclut les routeurs
app.include_router(views_router)  # Pour les pages HTML
app.include_router(api_router, prefix="/api")  

# Monte le dossier static pour servir CSS, JS, images
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("main.html", {"request": request})