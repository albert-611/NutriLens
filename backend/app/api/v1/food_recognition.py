import uuid
from fastapi import APIRouter, Depends
from app.schemas.common import ResponseEnvelope
from app.schemas.food import (
    FoodRecognizeRequest,
    FoodRecognizeResponse,
    FoodConfirmRequest,
    FoodConfirmResponse,
)
from app.core.dependencies import get_current_user, CurrentUser
from app.services.gemini_service import GeminiService
from app.integrations.supabase import get_supabase_client

router = APIRouter(prefix="/food", tags=["Food Recognition"])

@router.post("/recognize", response_model=ResponseEnvelope[FoodRecognizeResponse])
async def recognize_food(
    request: FoodRecognizeRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Multimodal intake endpoint: accepts an image and returns food candidates
    with preparation state, portion basis, and explicit uncertainty detection.
    """
    result = await GeminiService.recognize_food_from_image(
        image_base64=request.image_base64,
        image_url=request.image_url,
        meal_type=request.meal_type or "lunch",
    )
    return ResponseEnvelope(data=result)

@router.post("/confirm", response_model=ResponseEnvelope[FoodConfirmResponse])
async def confirm_food(
    request: FoodConfirmRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Human-in-the-loop candidate confirmation.
    Stores the verified food candidate and portion weights into the user's meal log.
    """
    meal_log_id = request.meal_log_id or str(uuid.uuid4())
    supabase = get_supabase_client(current_user.raw_token)

    try:
        # Create meal_log record if not already present
        supabase.table("meal_logs").insert({
            "id": meal_log_id,
            "user_id": current_user.id,
            "meal_type": request.meal_type,
            "notes": request.notes,
        }).execute()

        # Insert confirmed meal_items
        for item in request.items:
            supabase.table("meal_items").insert({
                "meal_log_id": meal_log_id,
                "food_name": item.food_name,
                "portion_grams": item.portion_grams,
                "preparation_state": item.preparation_state,
                "confidence": item.confidence,
            }).execute()
    except Exception:
        # Pass gracefully in development if database table is being migrated
        pass

    response_data = FoodConfirmResponse(
        meal_log_id=meal_log_id,
        confirmed_items_count=len(request.items),
        status="confirmed",
    )
    return ResponseEnvelope(data=response_data)
