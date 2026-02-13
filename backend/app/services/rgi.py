import os
import uuid
from datetime import datetime, timezone
from typing import Dict, Any

import httpx
import base64

RGI_BASE_URL = os.getenv("RGI_BASE_URL", "https://apisetu.gov.in/certificate/v3/rgi")
RGI_BIRTH_PATH = os.getenv("RGI_BIRTH_PATH", "/btcer")
RGI_DEATH_PATH = os.getenv("RGI_DEATH_PATH", "/dtcer")
RGI_API_KEY = os.getenv("RGI_API_KEY")
RGI_API_KEY_HEADER = os.getenv("RGI_API_KEY_HEADER", "x-api-key")
RGI_CONSUMER_ID = os.getenv("RGI_CONSUMER_ID", "krishiyukti-app")
RGI_PROVIDER_ID = os.getenv("RGI_PROVIDER_ID", "rgi")
RGI_PURPOSE = os.getenv("RGI_PURPOSE", "Certificate verification for citizen")


def _full_url(path: str) -> str:
    if RGI_BASE_URL.endswith("/") and path.startswith("/"):
        return RGI_BASE_URL[:-1] + path
    if not RGI_BASE_URL.endswith("/") and not path.startswith("/"):
        return RGI_BASE_URL + "/" + path
    return RGI_BASE_URL + path


def _headers() -> Dict[str, str]:
    headers = {"Content-Type": "application/json"}
    if RGI_API_KEY:
        headers[RGI_API_KEY_HEADER] = RGI_API_KEY
    return headers


def _consent(user: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    base = {
        "consent": {
            "consentId": str(uuid.uuid4()),
            "timestamp": now,
            "dataConsumer": {"id": RGI_CONSUMER_ID},
            "dataProvider": {"id": RGI_PROVIDER_ID},
            "purpose": {"description": RGI_PURPOSE},
            "user": {
                "idType": user.get("userIdType", "mobile"),
                "idNumber": user.get("userIdNumber", ""),
                "mobile": user.get("mobile", ""),
                "email": user.get("email", ""),
            },
            "data": {"id": user.get("regNo", "")},
            "permission": {
                "access": "VIEW",
                "dateRange": {"from": now, "to": now},
                "frequency": {"unit": "once", "value": 1, "repeats": 0},
            },
        },
        "signature": {"signature": user.get("signature", "")},
    }
    return base


def verify_birth(reg_no: str, full_name: str, dob_ddmmyyyy: str, gender: str | None, fmt: str = "pdf", user: Dict[str, Any] | None = None):
    payload = {
        "txnId": str(uuid.uuid4()),
        "format": fmt,
        "certificateParameters": {
            "RegNo": reg_no,
            "FullName": full_name,
            "DOB": dob_ddmmyyyy,
        },
        "consentArtifact": _consent({**(user or {}), "regNo": reg_no}),
    }
    if gender:
        payload["certificateParameters"]["GENDER"] = gender
    url = _full_url(RGI_BIRTH_PATH)
    with httpx.Client(timeout=30) as client:
        r = client.post(url, json=payload, headers=_headers())
        if r.status_code == 200:
            # The API can return PDF/XML; we forward content-type and bytes as base64 for safety to frontend.
            ct = r.headers.get("Content-Type", "application/pdf")
            b64 = base64.b64encode(r.content).decode("ascii")
            return {"ok": True, "status": 200, "contentType": ct, "data": b64}
        # Error JSON forward
        try:
            return {"ok": False, "status": r.status_code, "error": r.json()}
        except Exception:
            return {"ok": False, "status": r.status_code, "error": r.text}


def verify_death(reg_no: str, full_name: str, gender_deceased: str, dec_name: str, dod_ddmmyyyy: str, relation: str, fmt: str = "pdf", user: Dict[str, Any] | None = None):
    payload = {
        "txnId": str(uuid.uuid4()),
        "format": fmt,
        "certificateParameters": {
            "RegNo": reg_no,
            "gender_deceased": gender_deceased,
            "dec_name": dec_name,
            "dod": dod_ddmmyyyy,
            "relation": relation,
            "FullName": full_name,
        },
        "consentArtifact": _consent({**(user or {}), "regNo": reg_no}),
    }
    url = _full_url(RGI_DEATH_PATH)
    with httpx.Client(timeout=30) as client:
        r = client.post(url, json=payload, headers=_headers())
        if r.status_code == 200:
            ct = r.headers.get("Content-Type", "application/pdf")
            b64 = base64.b64encode(r.content).decode("ascii")
            return {"ok": True, "status": 200, "contentType": ct, "data": b64}
        try:
            return {"ok": False, "status": r.status_code, "error": r.json()}
        except Exception:
            return {"ok": False, "status": r.status_code, "error": r.text}
