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
    def get_supported_markets() -> List[MarketInfo]:
        """
        Extract unique verified 2026 markets monitored by the World Food Programme in Bangladesh.
        """
        seen_markets = set()
        markets: List[MarketInfo] = []

        for obs in _WFP_OBSERVATIONS:
            mkt_name = obs.get("market")
            mkt_id = str(obs.get("marketId") or mkt_name.lower().replace(" ", "_"))
            if mkt_name and mkt_id not in seen_markets:
                seen_markets.add(mkt_id)
                admin1 = obs.get("admin1", "Bangladesh")
                admin2 = obs.get("admin2", admin1)
                markets.append(
                    MarketInfo(
                        id=mkt_id,
                        name=f"{mkt_name} ({admin1})",
                        bangla_name=f"{mkt_name} বাজার",
                        district=admin2,
                        thana=mkt_name,
                        market_tier="Retail" if "wholesale" not in mkt_name.lower() else "Wholesale",
                    )
                )

        # Sort alphabetically by market name
        markets.sort(key=lambda m: m.name)
        return markets

    @staticmethod
    def get_market_prices(market_id: Optional[str] = None) -> List[MarketPriceObservation]:
        """
        Retrieve 2026 WFP commodity price observations across Bangladesh.
        Optionally filter by market_id.
        """
        results: List[MarketPriceObservation] = []
        
        for obs in _WFP_OBSERVATIONS:
            m_id = str(obs.get("marketId"))
            m_name = obs.get("market", "")
            
            if market_id:
                if m_id != str(market_id) and m_name.lower() != str(market_id).lower():
                    continue

            results.append(
                MarketPriceObservation(
                    item_id=obs["id"],
                    item_name=obs["name"],
                    bangla_name=obs.get("nameBn", obs["name"]),
                    market_name=m_name,
                    unit=obs["unit"],
                    price_bdt=float(obs["price"]),
                    observed_date=obs["observedAt"],
                )
            )

        return results
