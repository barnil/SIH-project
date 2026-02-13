"""Provider-backed chatbot with graceful fallbacks.

Supports (in order):
- OpenRouter (OPENROUTER_API_KEY)
- OpenAI (OPENAI_API_KEY)
- Ollama local (OLLAMA_BASE optional, default http://127.0.0.1:11434; OLLAMA_MODEL default llama3:latest)
- Rule-based fallback

Keep answers concise and agriculture-focused.
"""

import os
from typing import Optional

import httpx

SYSTEM_PROMPT = (
    "You are KrishiYukti, a helpful agriculture assistant for Indian farmers. "
    "Answer in simple, concise language. When relevant, mention soil testing, local mandi prices, weather, and sustainable practices."
)


def _chat_openrouter(message: str) -> Optional[str]:
    """OpenRouter via OpenAI SDK-compatible client.

    Env:
      - OPENROUTER_API_KEY (required)
      - OPENROUTER_MODEL (default 'openai/gpt-4o')
      - OPENROUTER_REFERRER (optional)
      - OPENROUTER_TITLE (optional)
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return None
    try:
        from openai import OpenAI  # lazy import

        client = OpenAI(api_key=api_key, base_url="https://openrouter.ai/api/v1")
        extra_headers = {}
        if os.getenv("OPENROUTER_REFERRER"):
            extra_headers["HTTP-Referer"] = os.getenv("OPENROUTER_REFERRER")
        if os.getenv("OPENROUTER_TITLE"):
            extra_headers["X-Title"] = os.getenv("OPENROUTER_TITLE")
        resp = client.chat.completions.create(
            model=os.getenv("OPENROUTER_MODEL", "openai/gpt-4o"),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message},
            ],
            temperature=0.7,
            max_tokens=250,
            extra_headers=extra_headers or None,
        )
        return resp.choices[0].message.content
    except Exception:
        return None


def _chat_openai(message: str) -> Optional[str]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    try:
        # Lazy import so package remains optional
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        resp = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message},
            ],
            temperature=0.7,
            max_tokens=250,
        )
        return resp.choices[0].message.content
    except Exception:
        return None


## Removed: Groq and Hugging Face providers as per request


def _chat_rule_based(message: str) -> str:
    if not message or len(message.strip()) == 0:
        return "Hello! Ask me about crops, soil, or weather."
    m = message.lower()
    if "soil" in m:
        return "Consider a soil test for pH and organic content; add compost to improve structure."
    if "fert" in m:
        return "Balance NPK and time your application; avoid overuse to prevent runoff."
    if "market" in m or "price" in m:
        return "Check local mandi prices and consider staggered selling for better rates."
    return "Monitor weather, test soil, and plan inputs based on crop stage."


def chat(message: str) -> str:
    # Try providers in priority order (OpenRouter first)
    for fn in (_chat_openrouter, _chat_openai, _chat_ollama):
        try:
            out = fn(message)
        except Exception:
            out = None
        if out:
            return out
    return _chat_rule_based(message)


def _chat_ollama(message: str) -> Optional[str]:
    base = os.getenv("OLLAMA_BASE", "http://127.0.0.1:11434")
    model = os.getenv("OLLAMA_MODEL", "llama3:latest")
    try:
        r = httpx.post(
            f"{base}/api/chat",
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": message},
                ],
                "stream": False,
            },
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()
        msg = (data or {}).get("message") or {}
        content = msg.get("content")
        return content.strip() if isinstance(content, str) else None
    except Exception:
        return None
