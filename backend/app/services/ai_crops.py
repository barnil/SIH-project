from typing import List, Dict, Optional
import os
import json


SYSTEM = (
    "You are KrishiYukti, an agriculture assistant. Return concise, visual-friendly JSON. "
    "Given region, season, soil, and market demand, suggest 3-5 crops as an array of objects with fields: "
    "crop (string), emoji (string), score (0-100 int), category (string), sowing_window (string), "
    "water_need (low|medium|high), yield_range (string), reasons (array of 2 short strings)."
)


def _suggest_openrouter(region: str, season: str, soil: str, market_demand: bool, crop_type: Optional[str]) -> List[Dict]:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return []
    try:
        from openai import OpenAI  # lazy import

        client = OpenAI(api_key=api_key, base_url="https://openrouter.ai/api/v1")
        user_msg = (
            f"Region: {region}\nSeason: {season}\nSoil: {soil}\n"
            f"Market demand priority: {'yes' if market_demand else 'no'}\n"
            f"Preferred crop type: {crop_type or 'any'}\n"
            "Respond with ONLY a JSON array as specified."
        )
        resp = client.chat.completions.create(
            model=os.getenv("OPENROUTER_MODEL", "openai/gpt-4o"),
            messages=[
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": user_msg},
            ],
            temperature=0.4,
            max_tokens=400,
        )
        text = resp.choices[0].message.content or ""
        # Attempt to locate JSON array
        start = text.find("[")
        end = text.rfind("]")
        if start != -1 and end != -1 and end > start:
            text = text[start : end + 1]
        data = json.loads(text)
        # ensure list of dicts minimum fields present
        items = []
        for it in data:
            if not isinstance(it, dict):
                continue
            items.append({
                "crop": it.get("crop") or it.get("name") or "",
                "emoji": it.get("emoji") or "🌾",
                "score": int(it.get("score") or 70),
                "category": it.get("category") or "",
                "sowing_window": it.get("sowing_window") or "",
                "water_need": it.get("water_need") or "medium",
                "yield_range": it.get("yield_range") or "",
                "reasons": it.get("reasons") or [it.get("reason") or "Suitable for conditions."]
            })
        return [x for x in items if x.get("crop")]
    except Exception:
        return []


def _fallback_cards(region: str, season: str, soil: str, market_demand: bool, crop_type: Optional[str]) -> List[Dict]:
    base = [
        {
            "crop": "Wheat", "emoji": "🌾", "score": 78, "category": "Cereal",
            "sowing_window": "Nov-Dec", "water_need": "medium", "yield_range": "3-5 t/ha",
            "reasons": ["Cool season fit", "Stable market demand"],
        },
        {
            "crop": "Paddy", "emoji": "🌾", "score": 70, "category": "Cereal",
            "sowing_window": "Jun-Jul", "water_need": "high", "yield_range": "2-4 t/ha",
            "reasons": ["Abundant water regions", "Regional suitability"],
        },
        {
            "crop": "Millets", "emoji": "🌾", "score": 75, "category": "Cereal",
            "sowing_window": "Jun-Jul", "water_need": "low", "yield_range": "1-2 t/ha",
            "reasons": ["Climate resilient", "Rising nutritional interest"],
        },
    ]
    items = base
    # Simple filter by category if crop_type provided
    if crop_type:
        ct = crop_type.strip().lower()
        items = [x for x in items if x.get("category", "").lower().find(ct) != -1] or items
    if market_demand:
        items = [items[0], items[-1]] if len(items) >= 2 else items
    return items


def suggest(region: str, season: str, soil: str, market_demand: bool, crop_type: Optional[str] = None) -> List[Dict]:
    # Try OpenRouter-backed suggestions
    ai_items = _suggest_openrouter(region, season, soil, market_demand, crop_type)
    if ai_items:
        return ai_items
    # Fallback to simple cards
    return _fallback_cards(region, season, soil, market_demand, crop_type)
