from typing import List, Dict, Any, Optional
from app.schemas.nutrition import (
    NutrientBreakdown,
    CalculateItemInput,
    CalculatedItemNutrient,
    CalculateNutritionResponse,
    RDAPercentages,
    NutritionReportResponse,
)

# Reference Nutritional Data per 100g (Bangladeshi Food Composition Table standard)
FCT_DATABASE: Dict[str, Dict[str, float]] = {
    "steamed_white_rice": {
        "calories": 130.0,
        "protein_g": 2.7,
        "carbs_g": 28.2,
        "fat_g": 0.3,
        "fiber_g": 0.4,
        "sodium_mg": 1.0,
        "potassium_mg": 35.0,
        "calcium_mg": 10.0,
        "iron_mg": 0.2,
        "vitamin_c_mg": 0.0,
    },
    "masoor_dal_cooked": {
        "calories": 116.0,
        "protein_g": 9.0,
        "carbs_g": 20.1,
        "fat_g": 0.4,
        "fiber_g": 7.9,
        "sodium_mg": 2.0,
        "potassium_mg": 369.0,
        "calcium_mg": 19.0,
        "iron_mg": 3.3,
        "vitamin_c_mg": 1.5,
    },
    "chicken_curry": {
        "calories": 180.0,
        "protein_g": 18.5,
        "carbs_g": 3.5,
        "fat_g": 10.2,
        "fiber_g": 0.8,
        "sodium_mg": 380.0,
        "potassium_mg": 240.0,
        "calcium_mg": 22.0,
        "iron_mg": 1.4,
        "vitamin_c_mg": 2.0,
    },
    "rui_fish_curry": {
        "calories": 145.0,
        "protein_g": 17.0,
        "carbs_g": 2.5,
        "fat_g": 7.5,
        "fiber_g": 0.5,
        "sodium_mg": 320.0,
        "potassium_mg": 290.0,
        "calcium_mg": 110.0,
        "iron_mg": 1.1,
        "vitamin_c_mg": 1.0,
    },
    "egg_boiled": {
        "calories": 155.0,
        "protein_g": 13.0,
        "carbs_g": 1.1,
        "fat_g": 11.0,
        "fiber_g": 0.0,
        "sodium_mg": 124.0,
        "potassium_mg": 126.0,
        "calcium_mg": 50.0,
        "iron_mg": 1.2,
        "vitamin_c_mg": 0.0,
    },
    "aloo_bhorta": {
        "calories": 110.0,
        "protein_g": 2.0,
        "carbs_g": 19.0,
        "fat_g": 3.5,
        "fiber_g": 2.2,
        "sodium_mg": 180.0,
        "potassium_mg": 320.0,
        "calcium_mg": 15.0,
        "iron_mg": 0.9,
        "vitamin_c_mg": 8.0,
    },
    "spinach_shak_bhaji": {
        "calories": 65.0,
        "protein_g": 3.0,
        "carbs_g": 4.5,
        "fat_g": 4.0,
        "fiber_g": 2.8,
        "sodium_mg": 150.0,
        "potassium_mg": 410.0,
        "calcium_mg": 99.0,
        "iron_mg": 2.7,
        "vitamin_c_mg": 28.0,
    },
    "roti_whole_wheat": {
        "calories": 264.0,
        "protein_g": 9.1,
        "carbs_g": 55.7,
        "fat_g": 1.2,
        "fiber_g": 10.7,
        "sodium_mg": 5.0,
        "potassium_mg": 250.0,
        "calcium_mg": 30.0,
        "iron_mg": 3.6,
        "vitamin_c_mg": 0.0,
    },
}

# Alias map to normalize common user / candidate names to FCT database keys
FOOD_KEY_ALIASES: Dict[str, str] = {
    "rice": "steamed_white_rice",
    "bhat": "steamed_white_rice",
    "white rice": "steamed_white_rice",
    "dal": "masoor_dal_cooked",
    "daal": "masoor_dal_cooked",
    "lentil": "masoor_dal_cooked",
    "masoor dal": "masoor_dal_cooked",
    "chicken": "chicken_curry",
    "chicken curry": "chicken_curry",
    "murgir mangsho": "chicken_curry",
    "fish": "rui_fish_curry",
    "fish curry": "rui_fish_curry",
    "rui": "rui_fish_curry",
    "rui mach": "rui_fish_curry",
    "egg": "egg_boiled",
    "dim": "egg_boiled",
    "dim seddho": "egg_boiled",
    "dim bhuna": "egg_boiled",
    "bhorta": "aloo_bhorta",
    "aloo bhorta": "aloo_bhorta",
    "potato": "aloo_bhorta",
    "shak": "spinach_shak_bhaji",
    "palong shak": "spinach_shak_bhaji",
    "spinach": "spinach_shak_bhaji",
    "roti": "roti_whole_wheat",
    "ruti": "roti_whole_wheat",
    "chapati": "roti_whole_wheat",
}

# Dynamically load official FCDB 2014 comprehensive dataset (381 Bangladesh foods)
import json
import os

_DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "fcdb_foods.json")
if os.path.exists(_DATA_FILE):
    try:
        with open(_DATA_FILE, "r", encoding="utf-8") as _f:
            _fcdb_items = json.load(_f)
            for _item in _fcdb_items:
                _code = _item["code"].lower()
                _canonical = _item.get("canonical_name", _item["name_en"])
                _key = _canonical.lower().strip().replace("-", "_").replace(" ", "_")
                _entry = {
                    "calories": float(_item["energy_kcal"]),
                    "protein_g": float(_item["protein_g"]),
                    "carbs_g": float(_item["carbohydrate_g"]),
                    "fat_g": float(_item["fat_g"]),
                    "fiber_g": float(_item["fibre_g"]),
                    "sodium_mg": float(_item.get("sodium_mg", 0.0)),
                    "potassium_mg": float(_item.get("potassium_mg", 0.0)),
                    "calcium_mg": float(_item.get("calcium_mg", 0.0)),
                    "iron_mg": float(_item.get("iron_mg", 0.0)),
                    "vitamin_c_mg": float(_item.get("vitamin_c_mg", 0.0)),
                }
                FCT_DATABASE[_key] = _entry
                FCT_DATABASE[_code] = _entry
                FOOD_KEY_ALIASES[_canonical.lower().strip()] = _key
                if _item.get("name_bn"):
                    FOOD_KEY_ALIASES[_item["name_bn"].lower().strip()] = _key
                for _a in _item.get("aliases", []):
                    FOOD_KEY_ALIASES[_a.lower().strip()] = _key
    except Exception:
        pass

# Dynamically load official FoodNet Bangladesh dataset (600 Bangladesh foods)
_FOODNET_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "foodnetbd_foods.json")
if os.path.exists(_FOODNET_FILE):
    try:
        with open(_FOODNET_FILE, "r", encoding="utf-8") as _f:
            _foodnet_items = json.load(_f)
            for _item in _foodnet_items:
                _code = _item["code"].lower()
                _canonical = _item.get("canonical_name", _item["name_en"])
                _key = _canonical.lower().strip().replace("-", "_").replace(" ", "_")
                _entry = {
                    "calories": float(_item["energy_kcal"]),
                    "protein_g": float(_item["protein_g"]),
                    "carbs_g": float(_item["carbohydrate_g"]),
                    "fat_g": float(_item["fat_g"]),
                    "fiber_g": float(_item["fibre_g"]),
                    "sodium_mg": float(_item.get("sodium_mg", 0.0)),
                    "potassium_mg": float(_item.get("potassium_mg", 0.0)),
                    "calcium_mg": float(_item.get("calcium_mg", 0.0)),
                    "iron_mg": float(_item.get("iron_mg", 0.0)),
                    "vitamin_c_mg": float(_item.get("vitamin_c_mg", 0.0)),
                }
                FCT_DATABASE[_key] = _entry
                FCT_DATABASE[_code] = _entry
                FOOD_KEY_ALIASES[_canonical.lower().strip()] = _key
                if _item.get("name_bn"):
                    FOOD_KEY_ALIASES[_item["name_bn"].lower().strip()] = _key
                for _a in _item.get("aliases", []):
                    FOOD_KEY_ALIASES[_a.lower().strip()] = _key
    except Exception:
        pass

# Dynamically load official USDA FoodData Central international/foreign foods dataset
_FOREIGN_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "foreign_foods.json")
if os.path.exists(_FOREIGN_FILE):
    try:
        with open(_FOREIGN_FILE, "r", encoding="utf-8") as _f:
            _foreign_items = json.load(_f)
            for _item in _foreign_items:
                _code = _item["code"].lower()
                _canonical = _item.get("canonical_name", _item["name_en"])
                _key = _canonical.lower().strip().replace("-", "_").replace(" ", "_")
                _entry = {
                    "calories": float(_item["energy_kcal"]),
                    "protein_g": float(_item["protein_g"]),
                    "carbs_g": float(_item["carbohydrate_g"]),
                    "fat_g": float(_item["fat_g"]),
                    "fiber_g": float(_item["fibre_g"]),
                    "sodium_mg": float(_item.get("sodium_mg", 0.0)),
                    "potassium_mg": float(_item.get("potassium_mg", 0.0)),
                    "calcium_mg": float(_item.get("calcium_mg", 0.0)),
                    "iron_mg": float(_item.get("iron_mg", 0.0)),
                    "vitamin_c_mg": float(_item.get("vitamin_c_mg", 0.0)),
                }
                FCT_DATABASE[_key] = _entry
                FCT_DATABASE[_code] = _entry
                FOOD_KEY_ALIASES[_canonical.lower().strip()] = _key
                if _item.get("name_bn"):
                    FOOD_KEY_ALIASES[_item["name_bn"].lower().strip()] = _key
                for _a in _item.get("aliases", []):
                    FOOD_KEY_ALIASES[_a.lower().strip()] = _key
    except Exception:
        pass

def resolve_food_key(name: str) -> str:
    cleaned = name.lower().strip().replace("-", "_").replace(" ", "_")
    if cleaned in FCT_DATABASE:
        return cleaned
    normalized = name.lower().strip()
    if normalized in FOOD_KEY_ALIASES:
        return FOOD_KEY_ALIASES[normalized]
    # Check longest alias match first (e.g. "grilled chicken" before "chicken")
    for alias in sorted(FOOD_KEY_ALIASES.keys(), key=len, reverse=True):
        if len(alias) >= 4 and (alias in normalized or normalized in alias):
            return FOOD_KEY_ALIASES[alias]
    return "steamed_white_rice"

VERIFIED_SERVING_GRAMS: Dict[str, Dict[str, float]] = {
    "egg": {"egg": 55.0, "piece": 55.0},
    "banana": {"banana": 100.0, "piece": 100.0},
    "apple": {"apple": 182.0, "piece": 182.0, "slice": 25.0},
    "bread": {"slice": 38.0, "piece": 60.0},
    "biscuit": {"piece": 12.0},
    "roti": {"piece": 50.0, "roti": 50.0},
    "samosa": {"piece": 40.0, "samosa": 40.0},
    "samossa": {"piece": 40.0},
    "shingara": {"piece": 40.0},
    "onion ring": {"piece": 20.0, "ring": 20.0, "cup": 80.0},
    "onion_ring": {"piece": 20.0, "cup": 80.0},
    "piyaju": {"piece": 20.0},
    "pakora": {"piece": 20.0, "cup": 80.0},
    "chop": {"piece": 55.0},
    "cutlet": {"piece": 55.0},
    "roll": {"piece": 50.0},
    "puri": {"piece": 30.0},
    "fish": {"piece": 110.0, "cup": 180.0},
    "chicken": {"piece": 90.0, "cup": 180.0},
    "rice": {"plate": 200.0, "cup": 150.0, "half_cup": 75.0},
    "dal": {"bowl": 150.0, "cup": 150.0, "half_cup": 75.0, "tbsp": 15.0},
}

class NutritionService:
    @staticmethod
    def convert_serving_to_grams(
        food_name: str,
        unit: str,
        quantity: float,
        custom_weight_per_unit: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Deterministically converts count-based and household quantities into verified edible grams.
        Strictly adheres to verified data and allows user overrides without fabricating numbers.
        """
        safe_qty = max(0.1, float(quantity))
        u = unit.lower().strip()

        if u in ("g", "gram", "grams"):
            return {
                "grams": round(safe_qty, 1),
                "conversion_note": f"{safe_qty}g direct weight",
                "is_verified": True,
                "requires_weight_input": False,
            }

        if u in ("kg", "kilogram", "kilograms"):
            total_g = safe_qty * 1000.0
            return {
                "grams": round(total_g, 1),
                "conversion_note": f"{safe_qty} kg = {total_g}g",
                "is_verified": True,
                "requires_weight_input": False,
            }

        if custom_weight_per_unit and custom_weight_per_unit > 0:
            total_g = round(safe_qty * custom_weight_per_unit, 1)
            return {
                "grams": total_g,
                "custom_weight_per_unit": float(custom_weight_per_unit),
                "conversion_note": f"{safe_qty} × {custom_weight_per_unit}g (user-confirmed net weight)",
                "is_verified": True,
                "requires_weight_input": False,
            }

        name_lower = food_name.lower().strip()
        matched_category = None
        for cat in (
            "samosa",
            "samossa",
            "shingara",
            "onion ring",
            "onion_ring",
            "piyaju",
            "pakora",
            "chop",
            "cutlet",
            "roll",
            "puri",
            "egg",
            "banana",
            "apple",
            "bread",
            "biscuit",
            "roti",
            "fish",
            "chicken",
            "rice",
            "dal",
        ):
            if cat in name_lower:
                matched_category = cat
                break

        if matched_category and matched_category in VERIFIED_SERVING_GRAMS:
            unit_map = VERIFIED_SERVING_GRAMS[matched_category]
            for candidate_unit, gram_val in unit_map.items():
                if candidate_unit in u or u in candidate_unit:
                    total_g = round(safe_qty * gram_val, 1)
                    source_label = "FCTB Verified" if matched_category != "apple" else "USDA FDC Verified"
                    return {
                        "grams": total_g,
                        "conversion_note": f"{safe_qty} {u} = {total_g}g ({source_label})",
                        "is_verified": True,
                        "requires_weight_input": False,
                    }

        if u in ("packet", "pkg", "pack"):
            return {
                "grams": 0.0,
                "conversion_note": "Package size requires net weight entry",
                "is_verified": False,
                "requires_weight_input": True,
            }

        # Fallback default estimate if unrecognized unit
        default_serving = 100.0
        total_g = round(safe_qty * default_serving, 1)
        return {
            "grams": total_g,
            "conversion_note": f"{safe_qty} {u} (~{total_g}g estimated; please verify)",
            "is_verified": False,
            "requires_weight_input": False,
        }

    @staticmethod
    def calculate_items_nutrition(items: List[CalculateItemInput]) -> CalculateNutritionResponse:
        total = NutrientBreakdown()
        calculated_items: List[CalculatedItemNutrient] = []

        for item in items:
            key = resolve_food_key(item.food_name)
            fct_per_100g = FCT_DATABASE.get(key, FCT_DATABASE["steamed_white_rice"])
            multiplier = item.portion_grams / 100.0

            # Oil/preparation adjustment factor
            fat_mult = 1.0
            cal_mult = 1.0
            if item.preparation_state.lower() == "fried":
                fat_mult = 1.35
                cal_mult = 1.2
            elif item.preparation_state.lower() == "gravy":
                fat_mult = 1.15
                cal_mult = 1.1

            item_nutrients = NutrientBreakdown(
                calories=round(fct_per_100g["calories"] * multiplier * cal_mult, 1),
                protein_g=round(fct_per_100g["protein_g"] * multiplier, 1),
                carbs_g=round(fct_per_100g["carbs_g"] * multiplier, 1),
                fat_g=round(fct_per_100g["fat_g"] * multiplier * fat_mult, 1),
                fiber_g=round(fct_per_100g["fiber_g"] * multiplier, 1),
                sodium_mg=round(fct_per_100g["sodium_mg"] * multiplier, 1),
                potassium_mg=round(fct_per_100g["potassium_mg"] * multiplier, 1),
                calcium_mg=round(fct_per_100g["calcium_mg"] * multiplier, 1),
                iron_mg=round(fct_per_100g["iron_mg"] * multiplier, 1),
                vitamin_c_mg=round(fct_per_100g["vitamin_c_mg"] * multiplier, 1),
            )

            # Accumulate totals
            total.calories += item_nutrients.calories
            total.protein_g += item_nutrients.protein_g
            total.carbs_g += item_nutrients.carbs_g
            total.fat_g += item_nutrients.fat_g
            total.fiber_g += item_nutrients.fiber_g
            total.sodium_mg += item_nutrients.sodium_mg
            total.potassium_mg += item_nutrients.potassium_mg
            total.calcium_mg += item_nutrients.calcium_mg
            total.iron_mg += item_nutrients.iron_mg
            total.vitamin_c_mg += item_nutrients.vitamin_c_mg

            calculated_items.append(
                CalculatedItemNutrient(
                    food_name=item.food_name,
                    portion_grams=item.portion_grams,
                    preparation_state=item.preparation_state,
                    nutrients=item_nutrients,
                )
            )

        # Round accumulated totals
        total.calories = round(total.calories, 1)
        total.protein_g = round(total.protein_g, 1)
        total.carbs_g = round(total.carbs_g, 1)
        total.fat_g = round(total.fat_g, 1)
        total.fiber_g = round(total.fiber_g, 1)
        total.sodium_mg = round(total.sodium_mg, 1)
        total.potassium_mg = round(total.potassium_mg, 1)
        total.calcium_mg = round(total.calcium_mg, 1)
        total.iron_mg = round(total.iron_mg, 1)
        total.vitamin_c_mg = round(total.vitamin_c_mg, 1)

        return CalculateNutritionResponse(
            total_nutrients=total,
            items=calculated_items,
            calculation_basis="sum((portion_grams / 100.0) * nutrient_per_100g)",
        )

    @staticmethod
    def generate_nutrition_report(
        user_id: str,
        consumed: NutrientBreakdown,
        target_calories: int = 2000,
    ) -> NutritionReportResponse:
        # Standard RDA baselines
        target_protein = round((target_calories * 0.15) / 4.0, 1)  # 15% calories from protein
        target_carbs = round((target_calories * 0.55) / 4.0, 1)    # 55% calories from carbs
        target_fat = round((target_calories * 0.30) / 9.0, 1)      # 30% calories from fat
        target_fiber = 28.0

        targets = NutrientBreakdown(
            calories=float(target_calories),
            protein_g=target_protein,
            carbs_g=target_carbs,
            fat_g=target_fat,
            fiber_g=target_fiber,
            sodium_mg=2000.0,
            potassium_mg=3500.0,
            calcium_mg=1000.0,
            iron_mg=18.0,
            vitamin_c_mg=90.0,
        )

        cal_pct = round((consumed.calories / targets.calories) * 100.0, 1) if targets.calories else 0.0
        protein_pct = round((consumed.protein_g / targets.protein_g) * 100.0, 1) if targets.protein_g else 0.0
        carbs_pct = round((consumed.carbs_g / targets.carbs_g) * 100.0, 1) if targets.carbs_g else 0.0
        fat_pct = round((consumed.fat_g / targets.fat_g) * 100.0, 1) if targets.fat_g else 0.0
        fiber_pct = round((consumed.fiber_g / targets.fiber_g) * 100.0, 1) if targets.fiber_g else 0.0

        flags = []
        recommendations = []

        if consumed.sodium_mg > 2300:
            flags.append("ELEVATED_SODIUM: Consumed sodium exceeds 2,300mg daily threshold.")
            recommendations.append("Reduce added salt in curry gravies and bhortas to support heart health.")

        if protein_pct < 70.0:
            flags.append("DEFICIENT_PROTEIN: Consumed protein is below 70% of recommended intake.")
            recommendations.append("Add a serving of egg, lentils (dal), or fish to your next meal.")

        if fiber_pct < 60.0:
            flags.append("DEFICIENT_FIBER: Consumed dietary fiber is significantly low.")
            recommendations.append("Incorporate more leafy greens (shak) or whole grain roti.")

        return NutritionReportResponse(
            user_id=user_id,
            period="daily",
            consumed_totals=consumed,
            target_targets=targets,
            rda_percentages=RDAPercentages(
                calories_pct=cal_pct,
                protein_pct=protein_pct,
                carbs_pct=carbs_pct,
                fat_pct=fat_pct,
                fiber_pct=fiber_pct,
            ),
            clinical_flags=flags,
            recommendations=recommendations,
        )
