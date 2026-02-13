# SIH Backend (FastAPI)

## Run locally (Windows)

1. Create virtual environment
```
python -m venv .venv
.venv\Scripts\activate
```

2. Install deps
```
pip install -r requirements.txt
```

3. Start server (auto-reload on changes)
```
uvicorn app.main:app --reload --port 8000
```

4. API Docs
- Swagger UI: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/api/health

## Config
- Uses SQLite by default: `sqlite:///./sih.db`
- Override with `DATABASE_URL` env var for Postgres, etc.

## Notes
- AI endpoints are simple rule-based placeholders. Replace `app/services/ai_chat.py` and `app/services/ai_crops.py` with real models (PyTorch) when ready.
- Profile and rewards endpoints store data in SQLite tables (`profiles`, `activities`, `redemptions`).
