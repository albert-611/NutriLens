from pydantic import BaseModel, Field
from typing import List, Optional

class CreateShoppingListRequest(BaseModel):
    meal_plan_id: str
    pantry_inventory_deduction: bool = True
    target_market_id: Optional[str] = None

class ShoppingItem(BaseModel):
    item_name: str
    bangla_name: Optional[str] = None
    required_quantity: float = Field(..., gt=0)
    package_purchase_quantity: float = Field(..., gt=0)
    unit: str
    estimated_price_bdt: float
    is_pantry_deducted: bool = False

class ShoppingListResponse(BaseModel):
    shopping_list_id: str
    meal_plan_id: str
    total_estimated_cost_bdt: float
    items: List[ShoppingItem]
