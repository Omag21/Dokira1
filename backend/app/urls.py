from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/patients")
def patients_list():
    return JSONResponse(content=[], status_code=200)

@router.get("/consultations")
def consultations_list():
    return JSONResponse(content=[], status_code=200)

@router.get("/prescriptions")
def prescriptions_list():
    return JSONResponse(content=[], status_code=200)
