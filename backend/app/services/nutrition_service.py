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

def resolve_food_key(name: str) -> str:
    cleaned = name.lower().strip().replace("-", "_").replace(" ", "_")
    if cleaned in FCT_DATABASE:
        return cleaned
    normalized = name.lower().strip()
    return FOOD_KEY_ALIASES.get(normalized, "steamed_white_rice")

class NutritionService:
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
