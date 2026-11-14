from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from app.schemas.common import ResponseEnvelope
from app.schemas.market import MarketInfo, MarketPriceObservation
from app.core.dependencies import get_current_user, CurrentUser
from app.services.market_service import MarketService

router = APIRouter(prefix="/markets", tags=["Markets & Intelligence"])

@router.get("", response_model=ResponseEnvelope[List[MarketInfo]])
async def list_markets(
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    List supported physical markets and wholesale centres in Dhaka.
    """
    markets = MarketService.get_supported_markets()
    return ResponseEnvelope(data=markets)

@router.get("/prices", response_model=ResponseEnvelope[List[MarketPriceObservation]])
async def get_market_prices(
    market_id: Optional[str] = Query(None, description="Optional filter by market ID"),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Retrieve real-time commodity price observations.
    """
    prices = MarketService.get_market_prices(market_id=market_id)
    return ResponseEnvelope(data=prices)
