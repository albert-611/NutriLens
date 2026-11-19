import pytest
from app.schemas.meal_rescue import (
    IngredientItemInput,
    MealRescueAnalyzeRequest,
    MealRescueRecommendRequest,
    MealRescueRecalculateRequest,
    MealRescueShoppingRequest,
)
from app.services.meal_rescue_service import MealRescueService

def test_meal_rescue_analyze_heavy_meal():
    request = MealRescueAnalyzeRequest(
        meal_name="Heavy Beef Bhuna and Rice",
        items=[
            IngredientItemInput(food_name="Steamed White Rice", portion_grams=300.0, preparation_state="boiled"),
            IngredientItemInput(food_name="Beef Bhuna", portion_grams=200.0, preparation_state="gravy"),
        ],
        cuisine_preference="bangladeshi",
    )
    res = MealRescueService.analyze_meal(request)

    assert res.meal_name == "Heavy Beef Bhuna and Rice"
    assert res.nutrition.calories > 600.0
    assert res.nutrition.protein_g > 20.0
    assert res.cuisine_detected == "bangladeshi"
    assert len(res.identified_opportunities) > 0

def test_meal_rescue_recommend_excludes_allergens():
    # User is allergic to eggs
    request = MealRescueRecommendRequest(
        original_meal_name="Beef Curry with Rice",
        items=[
            IngredientItemInput(food_name="Steamed White Rice", portion_grams=200.0),
        ],
        objective="lower_cost",
        excluded_ingredients=["egg", "eggs", "ডিম"],
        servings=1,
    )
    res = MealRescueService.recommend_rescues(request)

    assert res.hard_constraints_checked is True
    # Verify no recommended option contains egg
    for rec in res.recommendations:
        for ing in rec.ingredients:
            assert "egg" not in ing["name"].lower()
            assert "ডিম" not in ing.get("name_bn", "")

def test_meal_rescue_recommend_objective_high_protein():
    request = MealRescueRecommendRequest(
        original_meal_name="Rice and Shak",
        items=[
            IngredientItemInput(food_name="Steamed White Rice", portion_grams=200.0),
        ],
        objective="high_protein",
        servings=1,
    )
    res = MealRescueService.recommend_rescues(request)

    assert len(res.recommendations) > 0
    # First option should have high protein
    first = res.recommendations[0]
    assert first.rescued_nutrition.protein_g >= 20.0

def test_meal_rescue_recalculate_portions():
    request = MealRescueRecalculateRequest(
        items=[
            IngredientItemInput(food_name="Steamed White Rice", portion_grams=150.0, preparation_state="boiled"),
            IngredientItemInput(food_name="Cooked Masoor Dal", portion_grams=100.0, preparation_state="boiled"),
        ],
        servings=2,
    )
    res = MealRescueService.recalculate_meal(request)

    # Nutrition for 2 servings should be double of 1 serving
    assert res.nutrition.calories == round(res.per_serving_nutrition.calories * 2, 1)
    assert res.nutrition.protein_g == round(res.per_serving_nutrition.protein_g * 2, 1)
    assert res.is_safe is True

def test_meal_rescue_shopping_basket_pantry_deduction():
    # 2 servings of Dim Bhuna: 2 eggs per serving = 4 eggs (200g)
    # If user has eggs in pantry, cash cost for eggs is 0
    request_with_pantry = MealRescueShoppingRequest(
        recipe_name="Dim Bhuna with Rice",
        ingredients=[
            {
                "name": "Farm Fresh Eggs",
                "grams": 100.0,
                "pack_size_g": 200.0,
                "pack_price_bdt": 50.0,
                "kg_price_bdt": 250.0,
            },
            {
                "name": "Steamed White Rice",
                "grams": 200.0,
                "pack_size_g": 1000.0,
                "pack_price_bdt": 70.0,
                "kg_price_bdt": 70.0,
            },
        ],
        servings=1,
        pantry_inventory=["eggs", "egg"],
    )
    res_pantry = MealRescueService.generate_shopping_basket(request_with_pantry)

    egg_item = next(i for i in res_pantry.items if "Eggs" in i.item_name)
    assert egg_item.in_pantry is True
    assert egg_item.package_count == 0
    assert egg_item.cash_checkout_cost_bdt == 0.0

    # Without pantry: user needs to buy 1 pack of eggs (50 BDT) and 1 pack of rice (70 BDT)
    request_no_pantry = MealRescueShoppingRequest(
        recipe_name="Dim Bhuna with Rice",
        ingredients=[
            {
                "name": "Farm Fresh Eggs",
                "grams": 100.0,
                "pack_size_g": 200.0,
                "pack_price_bdt": 50.0,
                "kg_price_bdt": 250.0,
            },
            {
                "name": "Steamed White Rice",
                "grams": 200.0,
                "pack_size_g": 1000.0,
                "pack_price_bdt": 70.0,
                "kg_price_bdt": 70.0,
            },
        ],
        servings=1,
        pantry_inventory=[],
    )
    res_no_pantry = MealRescueService.generate_shopping_basket(request_no_pantry)

    egg_no_pantry = next(i for i in res_no_pantry.items if "Eggs" in i.item_name)
    assert egg_no_pantry.in_pantry is False
    assert egg_no_pantry.package_count == 1
    assert egg_no_pantry.cash_checkout_cost_bdt == 50.0
    assert res_no_pantry.total_cash_checkout_bdt == 120.0

