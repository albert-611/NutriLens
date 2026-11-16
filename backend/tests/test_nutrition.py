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


def test_daily_nutrition_dataset_calculation():
    # Test foods ingested from Daily Food and Nutrition Dataset (Kaggle/HF)
    items = [
        CalculateItemInput(food_name="Whole Wheat Toast (1 slice)", portion_grams=35.0, preparation_state="commercial"),
        CalculateItemInput(food_name="Quinoa (1 cup cooked)", portion_grams=160.0, preparation_state="boiled"),
    ]
    res = NutritionService.calculate_items_nutrition(items)
    assert len(res.items) == 2
    toast = next(i for i in res.items if "Toast" in i.food_name)
    assert toast.nutrients.calories > 60.0
    quinoa = next(i for i in res.items if "Quinoa" in i.food_name)
    assert quinoa.nutrients.protein_g > 3.0



def test_serving_conversion_eggs():
    # 2 eggs converted using verified FCTB serving (55g per egg = 110g)
    conv = NutritionService.convert_serving_to_grams(food_name="Boiled Egg", unit="egg", quantity=2)
    assert conv["grams"] == 110.0
    assert conv["is_verified"] is True
    assert conv["requires_weight_input"] is False

    # Calculate nutrition for 2 eggs (110g)
    items = [CalculateItemInput(food_name="Boiled Egg", portion_grams=conv["grams"], preparation_state="boiled")]
    res = NutritionService.calculate_items_nutrition(items)
    # 155 cal / 100g * 1.1 = 170.5 kcal
    assert res.total_nutrients.calories == round(155.0 * 1.1, 1)
    assert res.total_nutrients.protein_g > 14.0

def test_serving_conversion_bananas():
    # 3 bananas -> 300g
    conv3 = NutritionService.convert_serving_to_grams(food_name="Banana", unit="banana", quantity=3)
    assert conv3["grams"] == 300.0
    assert conv3["is_verified"] is True

    # User adjusts from 3 to 2 bananas -> 200g
    conv2 = NutritionService.convert_serving_to_grams(food_name="Banana", unit="banana", quantity=2)
    assert conv2["grams"] == 200.0

def test_serving_conversion_biscuit_packet():
    # 1 packet of biscuits without known weight requires weight input
    conv_unknown = NutritionService.convert_serving_to_grams(food_name="Biscuits", unit="packet", quantity=1)
    assert conv_unknown["requires_weight_input"] is True
    assert conv_unknown["grams"] == 0.0

    # User specifies 75g package net weight
    conv_confirmed = NutritionService.convert_serving_to_grams(
        food_name="Biscuits", unit="packet", quantity=1, custom_weight_per_unit=75.0
    )
    assert conv_confirmed["grams"] == 75.0
    assert conv_confirmed["is_verified"] is True
    assert conv_confirmed["requires_weight_input"] is False

def test_serving_conversion_bread_slices():
    # 2 slices of bread (38g per slice = 76g)
    conv = NutritionService.convert_serving_to_grams(food_name="White Bread", unit="slice", quantity=2)
    assert conv["grams"] == 76.0
    assert conv["is_verified"] is True

def test_manual_rice_gram_adjustment():
    # Rice adjusted from 200g to 250g
    calc_200 = NutritionService.calculate_items_nutrition([
        CalculateItemInput(food_name="Steamed White Rice", portion_grams=200.0, preparation_state="boiled")
    ])
    calc_250 = NutritionService.calculate_items_nutrition([
        CalculateItemInput(food_name="Steamed White Rice", portion_grams=250.0, preparation_state="boiled")
    ])
    assert calc_200.total_nutrients.calories == 260.0
    # 130 cal/100g * 2.5 = 325.0 kcal
    assert calc_250.total_nutrients.calories == 325.0
    assert calc_250.total_nutrients.carbs_g == round(28.2 * 2.5, 1)

def test_preparation_method_preserves_weight_with_oil_multiplier():
    # 1 egg boiled (55g) vs 1 egg fried (55g)
    conv = NutritionService.convert_serving_to_grams(food_name="Egg", unit="egg", quantity=1)
    boiled = NutritionService.calculate_items_nutrition([
        CalculateItemInput(food_name="Egg", portion_grams=conv["grams"], preparation_state="boiled")
    ])
    fried = NutritionService.calculate_items_nutrition([
        CalculateItemInput(food_name="Egg", portion_grams=conv["grams"], preparation_state="fried")
    ])
    assert boiled.items[0].portion_grams == fried.items[0].portion_grams == 55.0
    assert fried.total_nutrients.fat_g > boiled.total_nutrients.fat_g
    assert fried.total_nutrients.calories > boiled.total_nutrients.calories

def test_serving_conversion_samosa_and_onion_rings():
    # 1 samosa defaults to 40g (not rigid 100g)
    conv_samosa = NutritionService.convert_serving_to_grams(food_name="Samosa", unit="piece", quantity=1)
    assert conv_samosa["grams"] == 40.0
    assert conv_samosa["is_verified"] is True

    # 4 onion rings default to 20g each = 80g (not rigid 200g)
    conv_onion = NutritionService.convert_serving_to_grams(food_name="Onion Rings", unit="piece", quantity=4)
    assert conv_onion["grams"] == 80.0
    assert conv_onion["is_verified"] is True

def test_serving_conversion_custom_unit_weight_override():
    # User overrides 1 piece samosa weight to 45g: 2 pieces = 90g
    conv = NutritionService.convert_serving_to_grams(
        food_name="Samosa", unit="piece", quantity=2, custom_weight_per_unit=45.0
    )
    assert conv["grams"] == 90.0
    assert conv["custom_weight_per_unit"] == 45.0
    assert conv["is_verified"] is True

def test_serving_conversion_cup_weight_override():
    # User overrides cup weight to 180g: 1.5 cups = 270g
    conv = NutritionService.convert_serving_to_grams(
        food_name="Lentil Soup (Dal)", unit="cup", quantity=1.5, custom_weight_per_unit=180.0
    )
    assert conv["grams"] == 270.0
    assert conv["custom_weight_per_unit"] == 180.0
    assert conv["is_verified"] is True

