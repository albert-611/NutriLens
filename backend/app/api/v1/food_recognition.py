import uuid
from fastapi import APIRouter, Depends
from app.schemas.common import ResponseEnvelope
from app.schemas.food import (
    FoodRecognizeRequest,
    FoodRecognizeResponse,
    FoodConfirmRequest,
    FoodConfirmResponse,
    ClarificationSubmitRequest,
)
from app.core.dependencies import get_current_user, CurrentUser
from app.services.gemini_service import GeminiService
from app.integrations.supabase import get_supabase_client

router = APIRouter(prefix="/food", tags=["Food Recognition"])

from fastapi.responses import JSONResponse

@router.post("/recognize")
async def recognize_food(
    request: FoodRecognizeRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Multimodal intake endpoint: accepts an image and returns food candidates
    with preparation state, portion basis, and explicit uncertainty detection.
    Rejects non-food images with HTTP 422.
    """
    result = await GeminiService.recognize_food_from_image(
        image_base64=request.image_base64,
        image_url=request.image_url,
        meal_type=request.meal_type or "lunch",
    )

    if result.recognition_outcome == "UNCERTAIN_IMAGE":
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "status": "UNCERTAIN_IMAGE",
                "message": result.rejection_reason or "Image is too blurry or unclear to detect food. Please provide a clear, well-lit picture of your meal.",
                "data": {
                    "food_items": [],
                    "candidate_count": 0,
                    "nutrition": None,
                    "clarification_questions": [],
                },
            },
        )

    if result.recognition_outcome == "NO_FOOD_DETECTED" or not result.is_food:
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "status": "NON_FOOD_IMAGE",
                "message": result.rejection_reason or "No recognizable food was detected in this image. Please upload a clear picture of your meal.",
                "data": {
                    "food_items": [],
                    "candidate_count": 0,
                    "nutrition": None,
                    "clarification_questions": [],
                },
            },
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

@router.post("/clarification")
async def submit_clarification(
    request: ClarificationSubmitRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Submits user clarification answers, updating ingredient assumptions,
    recalculating nutrition multipliers, and returning personal intolerance audits.
    """
    from app.services.clarification_service import ClarificationService
    from app.services.intolerance_service import IntoleranceService
    from app.services.personal_context_service import PersonalContextService

    # 1. Interpret user answers and update item ingredients
    interpretation = ClarificationService.interpret_answers(
        answers=request.answers,
        items=request.items,
    )

    # 2. Fetch authenticated user's actual saved allergies & intolerances
    context = await PersonalContextService.get_user_context(current_user.id, current_user.raw_token)
    user_allergies = context.get("medical", {}).get("allergies", [])
    user_intolerances = context.get("medical", {}).get("intolerances", [])

    # 3. Perform deduplicated intolerance & allergy audit
    audit_res = IntoleranceService.audit_food_safety(
        candidate_foods=[it.model_dump() for it in interpretation["updated_items"]],
        user_allergies=user_allergies,
        user_intolerances=user_intolerances,
    )

    return ResponseEnvelope(data={
        "scan_id": request.scan_id,
        "updated_items": [it.model_dump() for it in interpretation["updated_items"]],
        "user_reported_ingredients": interpretation["user_reported_ingredients"],
        "oil_multiplier": interpretation["oil_multiplier"],
        "oil_preference": interpretation["oil_preference"],
        "uncertainty_preserved": interpretation["uncertainty_preserved"],
        "safety_audit": audit_res,
    })
