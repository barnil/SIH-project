import os
import time
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from datetime import datetime, timezone

_CACHE = {"ts": 0.0, "key": "", "items": []}
_CACHE_TTL = int(os.getenv("SCHEMES_CACHE_TTL", "1800"))  # 30 min default

DEFAULT_SOURCE = os.getenv("SCHEMES_SOURCE_URL", "https://www.myscheme.gov.in/schemes")


def _now_ts() -> float:
    return time.time()


def _parse_myscheme_list(html: str, base_url: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    items = []
    # Heuristic: find links to '/schemes/'
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "/schemes/" not in href:
            continue
        name = a.get_text(strip=True)
        if not name or len(name) < 3:
            continue
        link = href if href.startswith("http") else urljoin(base_url, href)
        # Try to find a nearby description (sibling <p> or parent text)
        desc = ""
        parent = a.find_parent()
        if parent:
            p = parent.find("p")
            if p:
                desc = p.get_text(" ", strip=True)
        items.append({
            "name": name,
            "desc": desc,
            "link": link,
            "source": "myscheme",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })
        if len(items) >= 20:
            break
    # Deduplicate by link
    seen = set()
    uniq = []
    for it in items:
        if it["link"] in seen:
            continue
        seen.add(it["link"])
        uniq.append(it)
    return uniq


def fetch_live_schemes(query: str | None = None, limit: int = 8) -> list[dict]:
    global _CACHE
    key = f"q={query}|l={limit}"
    if _CACHE["items"] and _CACHE["key"] == key and (_now_ts() - _CACHE["ts"]) < _CACHE_TTL:
        return _CACHE["items"][:limit]
    url = DEFAULT_SOURCE
    try:
        with httpx.Client(timeout=20) as client:
            r = client.get(url)
            r.raise_for_status()
            items = _parse_myscheme_list(r.text, url)
            if query:
                q = query.lower()
                items = [x for x in items if q in (x.get("name", "") + " " + x.get("desc", "")).lower()]
            if not items:
                raise ValueError("no items parsed")
            _CACHE = {"ts": _now_ts(), "key": key, "items": items}
            return items[:limit]
    except Exception:
        # Fallback curated items
        fallback = [
            {"name": "PM-Kisan Samman Nidhi", "desc": "Income support to landholding farmer families.", "link": "https://pmkisan.gov.in/", "source": "curated", "updated_at": datetime.now(timezone.utc).isoformat()},
            {"name": "Kisan Credit Card (KCC)", "desc": "Short-term credit for cultivation and allied needs.", "link": "https://www.myscheme.gov.in/schemes/kcc", "source": "curated", "updated_at": datetime.now(timezone.utc).isoformat()},
            {"name": "PM Fasal Bima Yojana (PMFBY)", "desc": "Crop insurance against unavoidable risks.", "link": "https://pmfby.gov.in/", "source": "curated", "updated_at": datetime.now(timezone.utc).isoformat()},
        ]
        _CACHE = {"ts": _now_ts(), "key": key, "items": fallback}
        return fallback[:limit]
