from fastapi import APIRouter, Query
from typing import Optional
from ..services.schemes import fetch_live_schemes
from ..services.eshram import validate_uan as eshram_validate
from ..schemas import EshramValidateIn, RgiBirthIn, RgiDeathIn
from ..services import rgi as rgi_service

router = APIRouter(tags=["updates"])

@router.get("/updates/schemes")
def get_schemes(q: Optional[str] = Query(default=None, description="Search query"), limit: int = Query(default=8, ge=1, le=50)):
    return fetch_live_schemes(q, limit)


@router.post("/updates/eshram/validate")
def validate_eshram(body: EshramValidateIn):
    """Validate UAN and DOB against e-Shram API.

    Returns shape: { ok: bool, status: int, data?: any, error?: any }
    """
    return eshram_validate(body.uan, body.dob)


@router.post("/updates/rgi/birth")
def rgi_birth(body: RgiBirthIn):
    user = {
        "userIdType": body.userIdType,
        "userIdNumber": body.userIdNumber,
        "mobile": body.mobile,
        "email": body.email,
    }
    fmt = (body.format or "pdf").lower()
    return rgi_service.verify_birth(body.regNo, body.fullName, body.dob, body.gender, fmt=fmt, user=user)


@router.post("/updates/rgi/death")
def rgi_death(body: RgiDeathIn):
    user = {
        "userIdType": body.userIdType,
        "userIdNumber": body.userIdNumber,
        "mobile": body.mobile,
        "email": body.email,
    }
    fmt = (body.format or "pdf").lower()
    return rgi_service.verify_death(body.regNo, body.fullName, body.gender_deceased, body.dec_name, body.dod, body.relation, fmt=fmt, user=user)
