from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON, UniqueConstraint
from .db import Base

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True, nullable=False)
    user_name = Column(String, nullable=True)
    points = Column(Integer, default=0, nullable=False)
    badges = Column(JSON, default=list)
    streak_days = Column(Integer, default=0)
    last_claim_iso = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# Auth tables (new)
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserDevice(Base):
    __tablename__ = "user_devices"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    device_id = Column(String, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint('user_id', 'device_id', name='uq_user_device'),)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False)
    meta = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

class Redemption(Base):
    __tablename__ = "redemptions"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True, nullable=False)
    item_id = Column(String, nullable=False)
    item_name = Column(String, nullable=False)
    cost = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
