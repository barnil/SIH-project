from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from .. import models
from ..schemas import ProfileIn, ProfileOut, PointsIn, BadgeIn, NameIn
from datetime import datetime

router = APIRouter(tags=["profile"])


def _to_out(p: models.Profile) -> ProfileOut:
    return ProfileOut(
        device_id=p.device_id,
        user_name=p.user_name,
        points=p.points,
        badges=p.badges or [],
        streak_days=p.streak_days or 0,
        last_claim_iso=p.last_claim_iso,
    )


@router.post("/profile/init", response_model=ProfileOut)
def init_profile(body: ProfileIn, db: Session = Depends(get_db)):
    p = db.query(models.Profile).filter(models.Profile.device_id == body.device_id).first()
    created = False
    if not p:
        p = models.Profile(device_id=body.device_id, user_name=body.user_name or None, points=0, badges=[])
        db.add(p)
        created = True
    else:
        if body.user_name and body.user_name != p.user_name:
            p.user_name = body.user_name
    p.updated_at = datetime.utcnow()
    db.commit()
    if created:
        db.refresh(p)
    return _to_out(p)


@router.get("/profile", response_model=ProfileOut)
def get_profile(deviceId: str, db: Session = Depends(get_db)):
    p = db.query(models.Profile).filter(models.Profile.device_id == deviceId).first()
    if not p:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _to_out(p)


@router.post("/profile/name", response_model=ProfileOut)
def set_name(body: NameIn, db: Session = Depends(get_db)):
    p = db.query(models.Profile).filter(models.Profile.device_id == body.device_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Profile not found")
    p.user_name = body.user_name
    p.updated_at = datetime.utcnow()
    db.commit()
    return _to_out(p)


@router.post("/profile/add-points", response_model=ProfileOut)
def add_points(body: PointsIn, db: Session = Depends(get_db)):
    p = db.query(models.Profile).filter(models.Profile.device_id == body.device_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Profile not found")
    p.points = (p.points or 0) + body.delta
    p.updated_at = datetime.utcnow()
    # activity
    act = models.Activity(device_id=p.device_id, type="add_points", meta={"delta": body.delta, "reason": body.reason})
    db.add(act)
    db.commit()
    return _to_out(p)


@router.post("/profile/award-badge", response_model=ProfileOut)
def award_badge(body: BadgeIn, db: Session = Depends(get_db)):
    p = db.query(models.Profile).filter(models.Profile.device_id == body.device_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Profile not found")
    badges = list(p.badges or [])
    if body.badge not in badges:
        badges.append(body.badge)
        p.badges = badges
    p.updated_at = datetime.utcnow()
    # activity
    act = models.Activity(device_id=p.device_id, type="award_badge", meta={"badge": body.badge})
    db.add(act)
    db.commit()
    return _to_out(p)
