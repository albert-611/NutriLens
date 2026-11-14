import pytest
from app.services.nutrition_service import NutritionService
from app.schemas.nutrition import CalculateItemInput

def test_deterministic_nutrition_rice_calculation():
    items = [
        CalculateItemInput(
            food_name="Steamed White Rice",
            portion_grams=200.0,
            preparation_state="boiled",
        )
    ]
    res = NutritionService.calculate_items_nutrition(items)

    # 100g rice = 130 cal, 2.7g protein, 28.2g carbs
    # 200g rice = 260 cal, 5.4g protein, 56.4g carbs
    assert res.total_nutrients.calories == 260.0
    assert res.total_nutrients.protein_g == 5.4
    assert res.total_nutrients.carbs_g == 56.4
    assert len(res.items) == 1

def test_mixed_meal_nutrition_accumulation():
    items = [
        CalculateItemInput(food_name="Steamed White Rice", portion_grams=200.0, preparation_state="boiled"),
        CalculateItemInput(food_name="Masoor Dal Cooked", portion_grams=100.0, preparation_state="cooked"),
        CalculateItemInput(food_name="Egg Boiled", portion_grams=60.0, preparation_state="boiled"),
    ]
    res = NutritionService.calculate_items_nutrition(items)

    # Rice 260 cal + Dal 116 cal + Egg (155 * 0.6 = 93.0 cal) = 469.0 cal
    expected_calories = round(260.0 + 116.0 + (155.0 * 0.6), 1)
    assert res.total_nutrients.calories == expected_calories
    assert res.total_nutrients.protein_g > 20.0

def test_preparation_state_fried_multiplier():
    boiled_item = [CalculateItemInput(food_name="Rui Fish", portion_grams=100.0, preparation_state="boiled")]
    fried_item = [CalculateItemInput(food_name="Rui Fish", portion_grams=100.0, preparation_state="fried")]

    res_boiled = NutritionService.calculate_items_nutrition(boiled_item)
    res_fried = NutritionService.calculate_items_nutrition(fried_item)

    assert res_fried.total_nutrients.fat_g > res_boiled.total_nutrients.fat_g
    assert res_fried.total_nutrients.calories > res_boiled.total_nutrients.calories
