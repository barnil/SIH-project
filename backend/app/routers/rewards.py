from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from .. import models
from ..schemas import RedeemIn
from datetime import datetime

router = APIRouter(tags=["rewards"])

CATALOG = [
    {"id": "fert-5", "name": "Fertilizer Discount Coupon", "cost": 50, "desc": "₹50 off at partner stores"},
    {"id": "soil-test", "name": "Free Soil Test", "cost": 120, "desc": "One free soil test at partner lab"},
    {"id": "drone-demo", "name": "Drone Demo Session", "cost": 220, "desc": "Hands-on demo with experts"},
    {"id": "insure-10", "name": "Crop Insurance Cashback", "cost": 300, "desc": "₹100 cashback on premium"},
]


@router.get("/rewards/catalog")
def get_catalog():
    return CATALOG


@router.post("/rewards/redeem")
def redeem(body: RedeemIn, db: Session = Depends(get_db)):
    p = db.query(models.Profile).filter(models.Profile.device_id == body.device_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Profile not found")
    if (p.points or 0) < body.cost:
        raise HTTPException(status_code=400, detail="Not enough points")
    # deduct
    p.points = (p.points or 0) - body.cost
    p.updated_at = datetime.utcnow()
    r = models.Redemption(
        device_id=body.device_id,
        item_id=body.item_id,
        item_name=body.item_name,
        cost=body.cost,
    )
    db.add(r)
    db.add(models.Activity(device_id=body.device_id, type="redeem", meta={"item_id": body.item_id, "cost": body.cost}))
    db.commit()
    return {"ok": True, "newPoints": p.points}
