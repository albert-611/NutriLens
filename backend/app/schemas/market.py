from pydantic import BaseModel
from typing import List, Optional

class MarketInfo(BaseModel):
    id: str
    name: str
    bangla_name: Optional[str] = None
    district: str
    thana: Optional[str] = None
    market_tier: str  # Wholesale, Retail, Super shop

class MarketPriceObservation(BaseModel):
    item_id: str
    item_name: str
    bangla_name: Optional[str] = None
    market_name: str
    unit: str
    price_bdt: float
    observed_date: str
