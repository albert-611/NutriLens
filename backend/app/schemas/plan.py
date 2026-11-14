from pydantic import BaseModel, Field
from typing import List, Optional

class GeneratePlanRequest(BaseModel):
    days: int = Field(7, ge=1, le=14)
    target_calories_daily: int = Field(2000, ge=800, le=5000)
    target_protein_daily_g: Optional[float] = Field(None, ge=20, le=300)
    weekly_budget_bdt: float = Field(2000.0, ge=500.0)
    dietary_preferences: List[str] = []
    excluded_ingredients: List[str] = []
    preferred_markets: List[str] = []

class PlannedIngredient(BaseModel):
    name: str
    grams: float
    estimated_cost_bdt: float

class PlannedMeal(BaseModel):
    meal_type: str  # breakfast, lunch, dinner, snack
    meal_name: str
    bangla_name: Optional[str] = None
    ingredients: List[PlannedIngredient]
    calories: float
    protein_g: float
    cost_bdt: float

class PlannedDay(BaseModel):
    day_number: int
    meals: List[PlannedMeal]
    day_calories: float
    day_protein_g: float
    day_cost_bdt: float

class MealPlanResponse(BaseModel):
    plan_id: str
    days: List[PlannedDay]
    total_cost_bdt: float
    weekly_budget_bdt: float
    budget_variance_pct: float
    nutritional_adherence_score: float
