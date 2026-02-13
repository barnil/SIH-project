import os
import time
from datetime import datetime
from typing import Optional, Tuple

import httpx

BASE_URL = os.getenv("ESHRAM_BASE_URL", "https://betaapiregisterapi.eshram.gov.in/externalscheme-api-service")
AUTH_PATH = os.getenv("ESHRAM_AUTH_PATH", "/api/v1/generateAuthToken")
VALIDATE_PATH = os.getenv("ESHRAM_VALIDATE_PATH", "/api/v1/validateUserByUanAndDob")
CLIENT_ID = os.getenv("ESHRAM_CLIENT_ID")
CLIENT_SECRET = os.getenv("ESHRAM_CLIENT_SECRET")
DOB_INPUT_FORMAT = os.getenv("ESHRAM_DOB_INPUT_FORMAT", "%Y-%m-%d")  # expected from frontend
DOB_API_FORMAT = os.getenv("ESHRAM_DOB_API_FORMAT", "%d-%m-%Y")       # API expected format
TOKEN_TTL_DEFAULT = int(os.getenv("ESHRAM_TOKEN_TTL", "1500"))         # 25 minutes

_TOKEN_CACHE = {"token": None, "exp": 0.0}


def _now() -> float:
    return time.time()


def _full_url(path: str) -> str:
    if BASE_URL.endswith("/") and path.startswith("/"):
        return BASE_URL[:-1] + path
    if not BASE_URL.endswith("/") and not path.startswith("/"):
        return BASE_URL + "/" + path
    return BASE_URL + path


def _parse_token_json(data: dict) -> Tuple[Optional[str], int]:
    # Try common shapes
    token = (
        data.get("access_token")
        or data.get("token")
        or (data.get("data") or {}).get("access_token")
        or (data.get("data") or {}).get("token")
    )
    # TTL seconds if available
    ttl = (
        data.get("expires_in")
        or (data.get("data") or {}).get("expires_in")
        or data.get("expiresIn")
        or (data.get("data") or {}).get("expiresIn")
        or TOKEN_TTL_DEFAULT
    )
    try:
        ttl = int(ttl)
    except Exception:
        ttl = TOKEN_TTL_DEFAULT
    return token, ttl


def _get_token() -> str:
    if _TOKEN_CACHE["token"] and _now() < _TOKEN_CACHE["exp"]:
        return _TOKEN_CACHE["token"]
    # Build payload
    auth_payload_str = os.getenv("ESHRAM_AUTH_PAYLOAD")
    if auth_payload_str:
        try:
            import json
            payload = json.loads(auth_payload_str)
        except Exception:
            payload = None
    else:
        payload = {"clientId": CLIENT_ID, "clientSecret": CLIENT_SECRET}
    if not payload or not any(payload.values()):
        raise RuntimeError("ESHRAM credentials not configured. Set ESHRAM_CLIENT_ID/ESHRAM_CLIENT_SECRET or ESHRAM_AUTH_PAYLOAD in .env")
    url = _full_url(AUTH_PATH)
    with httpx.Client(timeout=20) as client:
        r = client.post(url, json=payload)
        r.raise_for_status()
        data = r.json()
        token, ttl = _parse_token_json(data)
        if not token:
            raise RuntimeError("e-Shram token not found in response")
        _TOKEN_CACHE["token"] = token
        _TOKEN_CACHE["exp"] = _now() + max(60, ttl - 30)
        return token


def _format_dob(dob_input: str) -> str:
    # Convert from input format to API format
    dt = datetime.strptime(dob_input, DOB_INPUT_FORMAT)
    return dt.strftime(DOB_API_FORMAT)


def validate_uan(uan: str, dob: str) -> dict:
    token = _get_token()
    url = _full_url(VALIDATE_PATH)
    dob_fmt = _format_dob(dob)
    payload = {"uan": uan, "dob": dob_fmt}
    headers = {"Authorization": f"Bearer {token}"}
    with httpx.Client(timeout=20) as client:
        r = client.post(url, json=payload, headers=headers)
        # Surface 4xx as clean error messages
        if r.status_code >= 400:
            try:
                return {"ok": False, "status": r.status_code, "error": r.json()}
            except Exception:
                return {"ok": False, "status": r.status_code, "error": r.text}
        data = r.json()
        return {"ok": True, "status": r.status_code, "data": data}
