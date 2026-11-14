from fastapi import APIRouter, Depends
from app.schemas.common import ResponseEnvelope
from app.schemas.shopping import CreateShoppingListRequest, ShoppingListResponse
from app.core.dependencies import get_current_user, CurrentUser
from app.services.meal_planner import MealPlannerService

router = APIRouter(prefix="/shopping-lists", tags=["Shopping Lists"])

@router.post("", response_model=ResponseEnvelope[ShoppingListResponse])
async def create_shopping_list(
    request: CreateShoppingListRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Creates an aggregated shopping list derived from a meal plan,
    accounting for pantry inventory deduction and standard package purchase sizes.
    """
    shopping_list = MealPlannerService.create_shopping_list(request)
    return ResponseEnvelope(data=shopping_list)
