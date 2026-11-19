from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class IngredientItemInput(BaseModel):
    food_id: Optional[str] = None
    food_name: str
    food_name_bn: Optional[str] = None
    portion_grams: float = Field(..., gt=0)
    preparation_state: str = "cooked"
    category: Optional[str] = None

class MealRescueAnalyzeRequest(BaseModel):
    meal_id: Optional[str] = None
    meal_name: str = "Custom Meal"
    meal_name_bn: Optional[str] = None
    items: List[IngredientItemInput] = []
    meal_type: str = "lunch"
    target_budget_bdt: Optional[float] = None
    cuisine_preference: str = "bangladeshi"

class NutrientSummary(BaseModel):
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float = 0.0
    sugar_g: float = 0.0
    sodium_mg: float = 0.0
    cost_bdt: float = 0.0

class IdentifiedOpportunity(BaseModel):
    type: str  # excess_calories, low_protein, high_sodium, high_cost, low_fiber, allergen_risk
    severity: str  # high, medium, low
    message: str
    suggestion: str

class MealRescueAnalyzeResponse(BaseModel):
    meal_name: str
    meal_name_bn: Optional[str] = None
    nutrition: NutrientSummary
    dietary_score: float = Field(..., ge=0, le=100)
    identified_opportunities: List[IdentifiedOpportunity] = []
    allergen_warnings: List[str] = []
    cuisine_detected: str = "bangladeshi"

class SubstitutionDetail(BaseModel):
    original_food: str
    original_grams: float
    replacement_food: str
    replacement_food_bn: Optional[str] = None
    replacement_grams: float
    reason: str
    savings_bdt: float = 0.0
    protein_delta_g: float = 0.0
    calories_delta: float = 0.0

class RescuedMealOption(BaseModel):
    id: str
    name: str
    name_bn: Optional[str] = None
    category: str = "Everyday"
    cuisine_type: str = "bangladeshi"
    rationale: str
    substitutions: List[SubstitutionDetail] = []
    original_nutrition: NutrientSummary
    rescued_nutrition: NutrientSummary
    savings_bdt: float = 0.0
    prep_time_minutes: int = 25
    prep_time_label: str = "25 mins"
    ingredients: List[Dict[str, Any]] = []
    instruction_steps: List[str] = []
    tags: List[str] = []
    adherence_score: float = 95.0

class MealRescueRecommendRequest(BaseModel):
    original_meal_name: str = "Current Meal"
    items: List[IngredientItemInput] = []
    objective: str = "balance"  # balance, lower_cost, high_protein, low_calorie, low_sodium, preserve_cuisine, use_pantry, goal_aligned
    cuisine_preference: str = "bangladeshi"
    budget_bdt: float = Field(180.0, gt=0)
    servings: int = Field(1, ge=1, le=20)
    pantry_ingredients: List[str] = []
    excluded_ingredients: List[str] = []
    max_prep_time: int = Field(45, ge=10, le=180)
    user_goal: Optional[str] = None

class MealRescueRecommendResponse(BaseModel):
    objective: str
    original_meal_name: str
    recommendations: List[RescuedMealOption] = []
    cuisine_preserved: bool = True
    hard_constraints_checked: bool = True
    warnings: List[str] = []

class MealRescueRecalculateRequest(BaseModel):
    items: List[IngredientItemInput]
    servings: int = 1
    pantry_items: List[str] = []
    target_budget_bdt: Optional[float] = None

class MealRescueRecalculateResponse(BaseModel):
    nutrition: NutrientSummary
    per_serving_nutrition: NutrientSummary
    estimated_cost_bdt: float
    allergen_audits: List[str] = []
    is_safe: bool = True
    nutrition_score: float = 90.0

class BasketLineItem(BaseModel):
    id: str
    item_name: str
    bangla_name: Optional[str] = None
    recipe_needed_quantity: float
    recipe_needed_unit: str
    usable_pantry_quantity: float = 0.0
    remaining_purchase_quantity: float
    package_net_quantity: float
    package_unit: str
    package_count: int
    package_unit_price_bdt: float
    cash_checkout_cost_bdt: float
    consumed_ingredient_cost_bdt: float
    in_pantry: bool = False
    seller: str = "Savar Local Bazar Stall"
    is_simulated_price: bool = False

class MealRescueShoppingRequest(BaseModel):
    recipe_id: Optional[str] = None
    recipe_name: str
    ingredients: List[Dict[str, Any]]
    servings: int = 1
    pantry_inventory: List[str] = []
    market_id: Optional[str] = None

class MealRescueShoppingResponse(BaseModel):
    shopping_list_id: str
    recipe_name: str
    total_cash_checkout_bdt: float
    total_consumed_value_bdt: float
    pantry_savings_bdt: float
    currency: str = "BDT"
    items: List[BasketLineItem] = []
    market_label: str = "Savar Pilot Market (WFP 2026 Reference)"
    data_provenance: str = "WFP Bangladesh Division Benchmark"

class SaveMealRescueRequest(BaseModel):
    meal_log_id: Optional[str] = None
    original_meal_name: str
    rescued_meal_name: str
    rescued_recipe_id: Optional[str] = None
    objective: str
    servings: int = 1
    customized_ingredients: List[Dict[str, Any]]
    final_nutrients: NutrientSummary
    shopping_list: Optional[MealRescueShoppingResponse] = None
    cash_cost_bdt: float = 0.0
