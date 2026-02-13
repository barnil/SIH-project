from fastapi import APIRouter
from ..schemas import ChatIn, CropSuggestIn
from ..services.ai_chat import chat as chat_impl
from ..services.ai_crops import suggest as crop_suggest

router = APIRouter(tags=["ai"])

@router.post("/ai/chat")
def chat(body: ChatIn):
    return {"reply": chat_impl(body.message)}

@router.post("/ai/crops")
def crops(body: CropSuggestIn):
    items = crop_suggest(body.region, body.season, body.soil, body.marketDemand, body.cropType)
    return items
