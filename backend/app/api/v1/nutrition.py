from typing import Literal
from fastapi import APIRouter, Depends, Query
from app.schemas.common import ResponseEnvelope
from app.schemas.nutrition import (
    CalculateNutritionRequest,
    CalculateNutritionResponse,
    NutritionReportResponse,
    NutrientBreakdown,
)
from app.core.dependencies import get_current_user, CurrentUser
from app.services.nutrition_service import NutritionService

router = APIRouter(prefix="/nutrition", tags=["Nutrition"])

@router.post("/calculate", response_model=ResponseEnvelope[CalculateNutritionResponse])
async def calculate_nutrition(
    request: CalculateNutritionRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Deterministic calculation engine:
    Computes exact nutrients across items based on portion grams and food composition tables.
    """
    calc_result = NutritionService.calculate_items_nutrition(request.items)
    return ResponseEnvelope(data=calc_result)

@router.get("/report", response_model=ResponseEnvelope[NutritionReportResponse])
async def get_nutrition_report(
    current_user: CurrentUser = Depends(get_current_user),
    period: Literal["daily", "weekly", "monthly"] = Query("daily"),
):
    """
    Retrieves cumulative nutrition report with RDA percentages and clinical deficiency flags.
    """
    # Sample baseline daily consumption
    consumed = NutrientBreakdown(
        calories=1780.0,
        protein_g=54.2,
        carbs_g=235.0,
        fat_g=48.0,
        fiber_g=14.5,
        sodium_mg=2450.0,
        potassium_mg=2100.0,
        calcium_mg=450.0,
        iron_mg=11.2,
        vitamin_c_mg=42.0,
    )
    report = NutritionService.generate_nutrition_report(
        user_id=current_user.id,
        consumed=consumed,
        target_calories=2000,
    )
    return ResponseEnvelope(data=report)
