from datetime import datetime, timedelta
import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models
from ..schemas import UserCreate, UserLogin, UserOut, TokenOut, LinkDeviceIn

router = APIRouter(tags=["auth"])

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(*, subject: str, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = {"sub": subject}
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> models.User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub: str = payload.get("sub")
        if sub is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(models.User).filter(models.User.id == int(sub)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@router.post("/auth/register", response_model=TokenOut)
def register(body: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = models.User(email=body.email, full_name=body.full_name or None, password_hash=get_password_hash(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(subject=str(user.id))
    return TokenOut(access_token=token, user=UserOut(id=user.id, email=user.email, full_name=user.full_name))


@router.post("/auth/login", response_model=TokenOut)
def login(body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=str(user.id))
    return TokenOut(access_token=token, user=UserOut(id=user.id, email=user.email, full_name=user.full_name))


@router.get("/auth/me", response_model=UserOut)
def me(current: models.User = Depends(get_current_user)):
    return UserOut(id=current.id, email=current.email, full_name=current.full_name)


@router.post("/auth/link-device")
def link_device(body: LinkDeviceIn, current: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Upsert mapping
    mapping = db.query(models.UserDevice).filter(models.UserDevice.user_id == current.id, models.UserDevice.device_id == body.device_id).first()
    if not mapping:
        mapping = models.UserDevice(user_id=current.id, device_id=body.device_id)
        db.add(mapping)
    mapping.created_at = mapping.created_at or datetime.utcnow()
    # Ensure a Profile exists for this device
    prof = db.query(models.Profile).filter(models.Profile.device_id == body.device_id).first()
    if not prof:
        prof = models.Profile(device_id=body.device_id, user_name=current.full_name or current.email.split("@")[0], points=0, badges=[])
        db.add(prof)
    else:
        # Optionally sync name if absent
        if not prof.user_name and (current.full_name or current.email):
            prof.user_name = current.full_name or current.email.split("@")[0]
    db.commit()
    return {"linked": True, "device_id": body.device_id}
