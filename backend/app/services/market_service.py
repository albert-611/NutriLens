import json
import os
from typing import List, Optional
from app.schemas.market import MarketInfo, MarketPriceObservation

_DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "wfp_market_prices.json")
_WFP_OBSERVATIONS: List[dict] = []

if os.path.exists(_DATA_FILE):
    try:
        with open(_DATA_FILE, "r", encoding="utf-8") as _f:
            _WFP_OBSERVATIONS = json.load(_f)
    except Exception:
        _WFP_OBSERVATIONS = []

class MarketService:
    @staticmethod
    def get_supported_markets(division: Optional[str] = None) -> List[MarketInfo]:
        """
        Extract unique verified markets monitored by the World Food Programme (2024-2026).
        Optionally filter by administrative division.
        """
        seen_markets = set()
        markets: List[MarketInfo] = []

        for obs in _WFP_OBSERVATIONS:
            div = obs.get("division") or obs.get("admin1", "Bangladesh")
            if division and division.lower() != "all" and div.lower() != division.lower():
                continue

            mkt_name = obs.get("market")
            mkt_id = str(obs.get("marketId") or mkt_name.lower().replace(" ", "_"))
            if mkt_name and mkt_id not in seen_markets:
                seen_markets.add(mkt_id)
                dist = obs.get("district") or obs.get("admin2", div)
                markets.append(
                    MarketInfo(
                        id=mkt_id,
                        name=f"{mkt_name} ({dist}, {div})",
                        bangla_name=f"{mkt_name} বাজার",
                        district=dist,
                        thana=mkt_name,
                        market_tier="Retail" if "wholesale" not in mkt_name.lower() else "Wholesale",
                    )
                )

        markets.sort(key=lambda m: m.name)
        return markets

    @staticmethod
    def get_market_prices(
        market_id: Optional[str] = None,
        division: Optional[str] = None,
        year: Optional[str] = None,
    ) -> List[MarketPriceObservation]:
        """
        Retrieve 2024-2026 WFP commodity price observations across Bangladesh.
        Optionally filter by market_id, division, and year.
        """
        results: List[MarketPriceObservation] = []
        
        for obs in _WFP_OBSERVATIONS:
            m_id = str(obs.get("marketId"))
            m_name = obs.get("market", "")
            m_div = obs.get("division") or obs.get("admin1", "")
            m_yr = obs.get("year") or obs.get("observedAt", "")[:4]
            
            if division and division.lower() != "all" and m_div.lower() != division.lower():
                continue

            if market_id and market_id.lower() != "all":
                if m_id != str(market_id) and m_name.lower() != str(market_id).lower():
                    continue

            if year and year.lower() != "all" and m_yr != str(year):
                continue

            results.append(
                MarketPriceObservation(
                    item_id=obs["id"],
                    item_name=obs["name"],
                    bangla_name=obs.get("nameBn", obs["name"]),
                    market_name=f"{m_name} ({m_div})",
                    unit=obs["unit"],
                    price_bdt=float(obs["price"]),
                    observed_date=obs["observedAt"],
                )
            )

        return results
