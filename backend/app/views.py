from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

router = APIRouter()
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

@router.get("/connexion", response_class=HTMLResponse)
def connexion(request: Request):
    return templates.TemplateResponse("connexion.html", {"request": request})

@router.get("/inscription", response_class=HTMLResponse)
def inscription(request: Request):
    return templates.TemplateResponse("inscription.html", {"request": request})

@router.get("/main", response_class=HTMLResponse)
def dashboard(request: Request):
    return templates.TemplateResponse("main.html", {"request": request})
