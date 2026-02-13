from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import Base, engine
from .routers import profile as profile_router
from .routers import rewards as rewards_router
from .routers import ai as ai_router
from .routers import weather as weather_router
from .routers import updates as updates_router
from .routers import auth as auth_router
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from project root .env and backend/.env if present
BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
ROOT_DIR = BASE_DIR.parent  # project root
# First, try root .env; then backend/.env (no override)
load_dotenv(ROOT_DIR / ".env")
load_dotenv(BASE_DIR / ".env")

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SIH Backend", version="0.1.0")

# CORS for local dev (Vite default ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok"}

# Include routers under /api
app.include_router(profile_router.router, prefix="/api")
app.include_router(rewards_router.router, prefix="/api")
app.include_router(ai_router.router, prefix="/api")
app.include_router(weather_router.router, prefix="/api")
app.include_router(auth_router.router, prefix="/api")
app.include_router(updates_router.router, prefix="/api")
