from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional, Any

class ProfileIn(BaseModel):
    device_id: str
    user_name: Optional[str] = None

class ProfileOut(BaseModel):
    device_id: str
    user_name: Optional[str]
    points: int
    badges: List[str]
    streak_days: int
    last_claim_iso: Optional[str]

class PointsIn(BaseModel):
    device_id: str
    delta: int
    reason: Optional[str] = None

class BadgeIn(BaseModel):
    device_id: str
    badge: str

class NameIn(BaseModel):
    device_id: str
    user_name: str

class RedeemIn(BaseModel):
    device_id: str
    item_id: str
    item_name: str
    cost: int

class ChatIn(BaseModel):
    message: str

class CropSuggestIn(BaseModel):
    region: str
    season: str
    soil: str
    marketDemand: bool = True
    cropType: Optional[str] = None

class EshramValidateIn(BaseModel):
    uan: str
    dob: str  # expected YYYY-MM-DD; backend will adapt format if needed

class ActivityOut(BaseModel):
    type: str
    meta: Any
    created_at: datetime

# RGI (Registrar General of India) certificate verification inputs
class RgiBirthIn(BaseModel):
    regNo: str
    fullName: str
    dob: str  # expected DD-MM-YYYY as per API docs
    gender: Optional[str] = None  # e.g., 'Male' | 'Female' | 'Other'
    format: Optional[str] = "json"
    userIdType: Optional[str] = None
    userIdNumber: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None


class RgiDeathIn(BaseModel):
    regNo: str
    fullName: str  # applicant full name
    gender_deceased: str  # e.g., 'Male'
    dec_name: str  # name of deceased
    dod: str       # expected DD-MM-YYYY
    relation: str  # e.g., 'Father', 'Mother', 'Spouse'
    format: Optional[str] = "json"
    userIdType: Optional[str] = None
    userIdNumber: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None

# Auth schemas
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class LinkDeviceIn(BaseModel):
    device_id: str
