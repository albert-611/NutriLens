import logging
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1"

class USDAService:
    @staticmethod
    def get_api_key() -> str:
        key = (settings.USDA_API_KEY or "").strip("\"' ")
        return key if key else "DEMO_KEY"

    @classmethod
    async def search_foods(cls, query: str, page_size: int = 10) -> List[Dict[str, Any]]:
        """
        Searches USDA FoodData Central for foods matching the query.
        Normalizes the response into canonical 100g nutrient values.
        """
        api_key = cls.get_api_key()
        url = f"{USDA_BASE_URL}/foods/search?api_key={api_key}"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    url,
                    headers={"Content-Type": "application/json"},
                    json={"query": query, "pageSize": page_size},
                )
                if res.status_code != 200:
                    logger.warning(f"USDA search failed with status {res.status_code}: {res.text[:200]}")
                    return []
                data = res.json()
                raw_foods = data.get("foods", [])
                normalized = []
                for item in raw_foods:
                    norm = cls._normalize_food_item(item)
                    if norm:
                        normalized.append(norm)
                return normalized
        except Exception as e:
            logger.error(f"Error querying USDA FoodData Central: {e}")
            return []

    @classmethod
    async def get_food_by_id(cls, fdc_id: int) -> Optional[Dict[str, Any]]:
        """
        Retrieves detailed nutrient data for a specific food by FDC ID.
        """
        api_key = cls.get_api_key()
        url = f"{USDA_BASE_URL}/food/{fdc_id}"
        params = {"api_key": api_key}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url, params=params)
                if res.status_code != 200:
                    logger.warning(f"USDA get food {fdc_id} failed: {res.status_code}")
                    return None
                data = res.json()
                return cls._normalize_food_item(data)
        except Exception as e:
            logger.error(f"Error retrieving USDA food {fdc_id}: {e}")
            return None

    @staticmethod
    def _normalize_food_item(item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        fdc_id = item.get("fdcId")
        description = item.get("description", "")
        if not fdc_id or not description:
            return None

        nutrients = item.get("foodNutrients", [])
        nut_map: Dict[str, float] = {}

        for n in nutrients:
            name = (n.get("nutrientName") or "").lower()
            num = str(n.get("nutrientNumber") or "")
            val = float(n.get("value") or 0.0)

            # Energy (kcal)
            if num in ["208", "1008"] or ("energy" in name and "kcal" in (n.get("unitName") or "").lower()):
                nut_map["energy_kcal"] = val
            # Protein
            elif num in ["203", "1003"] or "protein" in name:
                nut_map["protein_g"] = val
            # Fat
            elif num in ["204", "1004"] or "total lipid" in name:
                nut_map["fat_g"] = val
            # Carbohydrates
            elif num in ["205", "1005"] or "carbohydrate" in name:
                nut_map["carbohydrate_g"] = val
            # Dietary Fiber
            elif num in ["291", "1079"] or "fiber" in name:
                nut_map["fibre_g"] = val
            # Calcium
            elif num in ["301", "1087"] or "calcium" in name:
                nut_map["calcium_mg"] = val
            # Iron
            elif num in ["303", "1089"] or "iron" in name:
                nut_map["iron_mg"] = val
            # Sodium
            elif num in ["307", "1093"] or "sodium" in name:
                nut_map["sodium_mg"] = val
            # Potassium
            elif num in ["306", "1092"] or "potassium" in name:
                nut_map["potassium_mg"] = val
            # Vitamin C
            elif num in ["401", "1162"] or "vitamin c" in name:
                nut_map["vitamin_c_mg"] = val

        return {
            "food_id": f"USDA-FDC-{fdc_id}",
            "food_name_en": description,
            "food_name_bn": description,
            "scientific_name": item.get("scientificName"),
            "category": item.get("foodCategory", "International"),
            "data_source_id": "11111111-1111-1111-1111-111111111102",
            "fct_provenance_id": f"USDA-FDC-{fdc_id}",
            "energy_kcal": round(nut_map.get("energy_kcal", 0.0), 1),
            "protein_g": round(nut_map.get("protein_g", 0.0), 2),
            "fat_g": round(nut_map.get("fat_g", 0.0), 2),
            "carbohydrate_g": round(nut_map.get("carbohydrate_g", 0.0), 2),
            "fibre_g": round(nut_map.get("fibre_g", 0.0), 2),
            "calcium_mg": round(nut_map.get("calcium_mg", 0.0), 1),
            "iron_mg": round(nut_map.get("iron_mg", 0.0), 2),
            "sodium_mg": round(nut_map.get("sodium_mg", 0.0), 1),
            "potassium_mg": round(nut_map.get("potassium_mg", 0.0), 1),
            "vitamin_c_mg": round(nut_map.get("vitamin_c_mg", 0.0), 2),
        }
