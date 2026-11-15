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

def test_international_foods_calculation():
    # Test Western & International dishes from USDA dataset
    items = [
        CalculateItemInput(food_name="Pizza", portion_grams=100.0, preparation_state="roasted"),
        CalculateItemInput(food_name="Cheeseburger", portion_grams=160.0, preparation_state="commercial"),
        CalculateItemInput(food_name="Grilled Chicken Breast", portion_grams=150.0, preparation_state="roasted"),
    ]
    res = NutritionService.calculate_items_nutrition(items)

    assert len(res.items) == 3
    # Check that high-protein grilled chicken is recognized
    chicken_item = next(i for i in res.items if "Chicken" in i.food_name)
    assert chicken_item.nutrients.protein_g > 40.0 # 31g/100g * 1.5 = 46.5g
    assert res.total_nutrients.calories > 800.0

def test_foodnetbd_dataset_foods_calculation():
    # Test items loaded from FoodNetBD dataset (600 entries)
    items = [
        CalculateItemInput(food_name="Strawberry", portion_grams=100.0, preparation_state="raw"),
        CalculateItemInput(food_name="Chanachur (Spiced Mix)", portion_grams=50.0, preparation_state="cooked"),
        CalculateItemInput(food_name="Watermelon (Tarmuj)", portion_grams=150.0, preparation_state="raw"),
    ]
    res = NutritionService.calculate_items_nutrition(items)

    assert len(res.items) == 3
    # Strawberry should be resolved from FoodNetBD (FNBD_0269)
    strawberry_item = next(i for i in res.items if "Strawberry" in i.food_name)
    assert strawberry_item.nutrients.calories > 20.0
    # Chanachur is energy dense (~485 cal/100g -> ~242 cal for 50g)
    chanachur_item = next(i for i in res.items if "Chanachur" in i.food_name)
    assert chanachur_item.nutrients.calories > 200.0

