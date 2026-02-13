import os
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(tags=["weather"])

OW_BASE = "https://api.openweathermap.org/data/2.5"


def _kph(ms: Optional[float]) -> Optional[int]:
    if ms is None:
        return None
    try:
        return round(float(ms) * 3.6)
    except Exception:
        return None


def _get_key() -> str:
    key = os.getenv("OPENWEATHER_API_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="OPENWEATHER_API_KEY is not set in backend/.env")
    return key


@router.get("/weather/current")
def weather_current(lat: float = Query(...), lon: float = Query(...)):
    params = {
        "lat": lat,
        "lon": lon,
        "units": "metric",
        "appid": _get_key(),
    }
    try:
        r = httpx.get(f"{OW_BASE}/weather", params=params, timeout=10)
        r.raise_for_status()
        j = r.json()
        rain_1h = None
        try:
            rain_1h = j.get("rain", {}).get("1h")
        except Exception:
            rain_1h = None
        wind_kph = _kph(j.get("wind", {}).get("speed"))
        cond = None
        if isinstance(j.get("weather"), list) and j["weather"]:
            cond = j["weather"][0].get("description")
        return {
            "temperatureC": j.get("main", {}).get("temp"),
            "humidity": j.get("main", {}).get("humidity"),
            "windKph": wind_kph,
            "condition": cond,
            "rainMm1h": rain_1h,
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"OpenWeather error: {e}")


@router.get("/weather/forecast")
def weather_forecast(lat: float = Query(...), lon: float = Query(...)):
    params = {
        "lat": lat,
        "lon": lon,
        "units": "metric",
        "appid": _get_key(),
    }
    try:
        r = httpx.get(f"{OW_BASE}/forecast", params=params, timeout=10)
        r.raise_for_status()
        j = r.json()
        items = []
        for it in (j.get("list") or [])[:8]:  # next ~24h (3h steps)
            dt_txt = it.get("dt_txt")
            ts = it.get("dt")
            when = dt_txt or (datetime.fromtimestamp(ts, tz=timezone.utc).isoformat() if ts else None)
            main = it.get("main", {})
            wind_kph = _kph((it.get("wind") or {}).get("speed"))
            rain_mm = None
            try:
                rain_mm = (it.get("rain") or {}).get("3h")
            except Exception:
                rain_mm = None
            pop = it.get("pop")  # probability of precipitation (0..1)
            cond = None
            weather = it.get("weather")
            if isinstance(weather, list) and weather:
                cond = weather[0].get("description")
            items.append({
                "time": when,
                "tempC": main.get("temp"),
                "pop": pop,
                "rainMm": rain_mm,
                "windKph": wind_kph,
                "condition": cond,
            })
        return {"items": items}
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"OpenWeather error: {e}")
