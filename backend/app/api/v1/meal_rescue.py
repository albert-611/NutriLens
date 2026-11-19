from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.schemas.common import ResponseEnvelope
from app.schemas.meal_rescue import (
    MealRescueAnalyzeRequest,
    MealRescueAnalyzeResponse,
    MealRescueRecommendRequest,
    MealRescueRecommendResponse,
    MealRescueRecalculateRequest,
    MealRescueRecalculateResponse,
    MealRescueShoppingRequest,
    MealRescueShoppingResponse,
    SaveMealRescueRequest,
)
from app.services.meal_rescue_service import MealRescueService
from app.core.dependencies import get_current_user, get_optional_user, CurrentUser
from app.integrations.supabase import get_supabase_client

router = APIRouter(prefix="/meal-rescue", tags=["Meal Rescue"])

@router.post("/analyze", response_model=ResponseEnvelope[MealRescueAnalyzeResponse])
async def analyze_meal(
    request: MealRescueAnalyzeRequest,
    user: Optional[CurrentUser] = Depends(get_optional_user),
):
    """
    Authoritative nutritional evaluation of a candidate meal.
    Calculates calories, macros, sodium, cost, and identifies rescue opportunities.
    """
    result = MealRescueService.analyze_meal(request)
    return ResponseEnvelope(data=result)

@router.post("/recommend", response_model=ResponseEnvelope[MealRescueRecommendResponse])
async def recommend_rescues(
    request: MealRescueRecommendRequest,
    user: Optional[CurrentUser] = Depends(get_optional_user),
):
    """
    Generates culturally preserved, constraint-aware rescued meal recommendations.
    Respects excluded ingredients, pantry ingredients, budget, and selected rescue objective.
    """
    result = MealRescueService.recommend_rescues(request)
    return ResponseEnvelope(data=result)

@router.post("/recalculate", response_model=ResponseEnvelope[MealRescueRecalculateResponse])
async def recalculate_meal(
    request: MealRescueRecalculateRequest,
    user: Optional[CurrentUser] = Depends(get_optional_user),
):
    """
    Deterministically recalculates complete meal nutrition when user edits ingredient portions.
    """
    result = MealRescueService.recalculate_meal(request)
    return ResponseEnvelope(data=result)

@router.post("/shopping-basket", response_model=ResponseEnvelope[MealRescueShoppingResponse])
async def generate_shopping_basket(
    request: MealRescueShoppingRequest,
    user: Optional[CurrentUser] = Depends(get_optional_user),
):
    """
    Calculates smart market shopping basket:
    need_g = max(0, recipe_needed - pantry)
    pack_count = ceil(need_g / pack_size)
    cash_cost = pack_count * pack_price
    """
    result = MealRescueService.generate_shopping_basket(request)
    return ResponseEnvelope(data=result)

@router.post("/save", response_model=ResponseEnvelope[Dict[str, Any]])
async def save_rescue_session(
    request: SaveMealRescueRequest,
    user: CurrentUser = Depends(get_current_user),
):
    """
    Persists accepted rescued meal plan into Supabase meal_plans table.
    """
    result = MealRescueService.save_rescue_session(
        user_id=user.id,
        request=request,
        raw_token=user.raw_token,
    )
    return ResponseEnvelope(data=result)

@router.get("/sessions", response_model=ResponseEnvelope[List[Dict[str, Any]]])
async def get_saved_sessions(
    limit: int = Query(10, ge=1, le=50),
    user: CurrentUser = Depends(get_current_user),
):
    """
    Retrieves previous accepted meal rescue plans for the authenticated user from Supabase.
    """
    client = get_supabase_client(user.raw_token)
    try:
        res = client.table("meal_plans").select("*").eq("user_id", user.id).order("created_at", desc=True).limit(limit).execute()
        return ResponseEnvelope(data=res.data or [])
    except Exception:
        return ResponseEnvelope(data=[])
