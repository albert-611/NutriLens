from pydantic import BaseModel, Field
from typing import List, Optional

class FoodCandidate(BaseModel):
    candidate_id: str
    food_name: str
    bangla_name: Optional[str] = None
    confidence: float = Field(..., ge=0.0, le=1.0)
    preparation_state: str = "cooked"  # raw, boiled, fried, gravy
    portion_basis: str = "visual_plate_ratio"
    default_grams: float = Field(..., gt=0)
    uncertain_factors: List[str] = []

class FoodRecognizeRequest(BaseModel):
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    meal_type: Optional[str] = "lunch"
    notes: Optional[str] = None

class FoodRecognizeResponse(BaseModel):
    image_id: Optional[str] = None
    meal_type: str
    recognition_outcome: str = "FOOD_DETECTED" # FOOD_DETECTED | NO_FOOD_DETECTED | UNCERTAIN_IMAGE
    is_food: bool = True
    rejection_reason: Optional[str] = None
    candidates: List[FoodCandidate] = []
    requires_user_confirmation: bool = True
    uncertainty_detected: bool = False

class ConfirmedFoodItem(BaseModel):
    food_id: Optional[str] = None
    food_name: str
    bangla_name: Optional[str] = None
    preparation_state: str = "cooked"
    portion_grams: float = Field(..., gt=0)
    confidence: float = Field(1.0, ge=0.0, le=1.0)

class FoodConfirmRequest(BaseModel):
    meal_log_id: Optional[str] = None
    meal_type: str = "lunch"
    items: List[ConfirmedFoodItem]
    notes: Optional[str] = None

class FoodConfirmResponse(BaseModel):
    meal_log_id: str
    confirmed_items_count: int
    status: str = "confirmed"
