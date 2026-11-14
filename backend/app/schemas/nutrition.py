from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class NutrientBreakdown(BaseModel):
    calories: float = 0.0
    protein_g: float = 0.0
    carbs_g: float = 0.0
    fat_g: float = 0.0
    fiber_g: float = 0.0
    sodium_mg: float = 0.0
    potassium_mg: float = 0.0
    calcium_mg: float = 0.0
    iron_mg: float = 0.0
    vitamin_c_mg: float = 0.0

class CalculateItemInput(BaseModel):
    food_id: Optional[str] = None
    food_name: str
    portion_grams: float = Field(..., gt=0)
    preparation_state: str = "cooked"

class CalculatedItemNutrient(BaseModel):
    food_name: str
    portion_grams: float
    preparation_state: str
    nutrients: NutrientBreakdown

class CalculateNutritionRequest(BaseModel):
    items: List[CalculateItemInput]

class CalculateNutritionResponse(BaseModel):
    total_nutrients: NutrientBreakdown
    items: List[CalculatedItemNutrient]
    calculation_basis: str = "sum((portion_grams / 100.0) * nutrient_per_100g)"

class RDAPercentages(BaseModel):
    calories_pct: float
    protein_pct: float
    carbs_pct: float
    fat_pct: float
    fiber_pct: float

class NutritionReportResponse(BaseModel):
    user_id: str
    period: str = "daily"
    consumed_totals: NutrientBreakdown
    target_targets: NutrientBreakdown
    rda_percentages: RDAPercentages
    clinical_flags: List[str] = []
    recommendations: List[str] = []
