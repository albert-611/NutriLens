from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[str] = None
    height_cm: Optional[float] = Field(None, ge=50, le=250)
    weight_kg: Optional[float] = Field(None, ge=20, le=300)
    activity_level: Optional[str] = None
    daily_calorie_target: Optional[int] = Field(None, ge=800, le=6000)
    dietary_preferences: Optional[List[str]] = None
    health_conditions: Optional[List[str]] = None
    weekly_budget_bdt: Optional[float] = Field(None, ge=0)

class UserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    role: Optional[str] = "authenticated"
    profile: Optional[Dict[str, Any]] = None
