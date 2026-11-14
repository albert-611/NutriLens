from typing import List
from app.schemas.market import MarketInfo, MarketPriceObservation

class MarketService:
    @staticmethod
    def get_supported_markets() -> List[MarketInfo]:
        return [
            MarketInfo(
                id="mkt_karwan_bazar",
                name="Karwan Bazar Wholesale Market",
                bangla_name="কাওরান বাজার পাইকারি আড়ত",
                district="Dhaka",
                thana="Tejgaon",
                market_tier="Wholesale",
            ),
            MarketInfo(
                id="mkt_krishi_market",
                name="Mohammadpur Krishi Market",
                bangla_name="মোহাম্মদপুর কৃষি মার্কেট",
                district="Dhaka",
                thana="Mohammadpur",
                market_tier="Retail",
            ),
            MarketInfo(
                id="mkt_mirpur_1",
                name="Mirpur 1 Raw Market",
                bangla_name="মিরপুর ১ কাঁচা বাজার",
                district="Dhaka",
                thana="Mirpur",
                market_tier="Retail",
            ),
            MarketInfo(
                id="mkt_shantinagar",
                name="Shantinagar Kitchen Market",
                bangla_name="শান্তিনগর বাজার",
                district="Dhaka",
                thana="Paltan",
                market_tier="Retail",
            ),
            MarketInfo(
                id="mkt_swapno_dhanmondi",
                name="Shwapno Super Shop Dhanmondi",
                bangla_name="স্বপ্ন সুপার শপ ধানমন্ডি",
                district="Dhaka",
                thana="Dhanmondi",
                market_tier="Super shop",
            ),
        ]

    @staticmethod
    def get_market_prices(market_id: str = None) -> List[MarketPriceObservation]:
        prices = [
            MarketPriceObservation(
                item_id="rice_miniket",
                item_name="Miniket Rice",
                bangla_name="মিনিকেট চাল",
                market_name="Karwan Bazar Wholesale Market",
                unit="kg",
                price_bdt=68.0,
                observed_date="2026-11-14",
            ),
            MarketPriceObservation(
                item_id="rice_nazirshail",
                item_name="Nazirshail Rice",
                bangla_name="নাজিরশাইল চাল",
                market_name="Mohammadpur Krishi Market",
                unit="kg",
                price_bdt=78.0,
                observed_date="2026-11-14",
            ),
            MarketPriceObservation(
                item_id="masoor_dal_deshi",
                item_name="Masoor Dal (Deshi)",
                bangla_name="দেশি মসুর ডাল",
                market_name="Karwan Bazar Wholesale Market",
                unit="kg",
                price_bdt=135.0,
                observed_date="2026-11-14",
            ),
            MarketPriceObservation(
                item_id="chicken_broiler",
                item_name="Broiler Chicken",
                bangla_name="ব্রয়লার মুরগি",
                market_name="Mirpur 1 Raw Market",
                unit="kg",
                price_bdt=195.0,
                observed_date="2026-11-14",
            ),
            MarketPriceObservation(
                item_id="chicken_sonali",
                item_name="Sonali Chicken",
                bangla_name="সোনালী মুরগি",
                market_name="Shantinagar Kitchen Market",
                unit="kg",
                price_bdt=310.0,
                observed_date="2026-11-14",
            ),
            MarketPriceObservation(
                item_id="fish_rui_medium",
                item_name="Rui Fish (1-2 kg)",
                bangla_name="রুই মাছ (মাঝারি)",
                market_name="Karwan Bazar Wholesale Market",
                unit="kg",
                price_bdt=280.0,
                observed_date="2026-11-14",
            ),
            MarketPriceObservation(
                item_id="eggs_dozen",
                item_name="Farm Brown Eggs (Dozen)",
                bangla_name="ফার্মের ডিম (ডজন)",
                market_name="Mohammadpur Krishi Market",
                unit="dozen",
                price_bdt=155.0,
                observed_date="2026-11-14",
            ),
            MarketPriceObservation(
                item_id="potato_diamond",
                item_name="Diamond Potato",
                bangla_name="ডায়মন্ড আলু",
                market_name="Mirpur 1 Raw Market",
                unit="kg",
                price_bdt=42.0,
                observed_date="2026-11-14",
            ),
        ]
        return prices
