from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from app.schemas.common import ResponseEnvelope
from app.schemas.market import MarketInfo, MarketPriceObservation
from app.core.dependencies import get_current_user, CurrentUser
from app.services.market_service import MarketService

router = APIRouter(prefix="/markets", tags=["Markets & Intelligence"])

@router.get("", response_model=ResponseEnvelope[List[MarketInfo]])
async def list_markets(
    division: Optional[str] = Query(None, description="Filter markets by administrative division (e.g. Dhaka, Chittagong, Sylhet)"),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    List verified physical markets and wholesale centres across Bangladesh divisions.
    """
    markets = MarketService.get_supported_markets(division=division)
    return ResponseEnvelope(data=markets)

@router.get("/prices", response_model=ResponseEnvelope[List[MarketPriceObservation]])
async def get_market_prices(
    market_id: Optional[str] = Query(None, description="Optional filter by market ID or name"),
    division: Optional[str] = Query(None, description="Optional filter by administrative division"),
    year: Optional[str] = Query(None, description="Optional filter by observation year (2024, 2025, 2026)"),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Retrieve official WFP commodity price observations across Bangladesh (2024-2026).
    """
    prices = MarketService.get_market_prices(market_id=market_id, division=division, year=year)
    return ResponseEnvelope(data=prices)
