from fastapi import APIRouter, Depends
from app.schemas.common import ResponseEnvelope
from app.schemas.plan import GeneratePlanRequest, MealPlanResponse
from app.core.dependencies import get_current_user, CurrentUser
from app.services.meal_planner import MealPlannerService

router = APIRouter(prefix="/meal-plans", tags=["Meal Plans"])

@router.post("/generate", response_model=ResponseEnvelope[MealPlanResponse])
async def generate_meal_plan(
    request: GeneratePlanRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Generates a personalized, budget-constrained meal plan adhering to Bangladeshi local diet.
    """
    plan = MealPlannerService.generate_plan(request)
    return ResponseEnvelope(data=plan)
