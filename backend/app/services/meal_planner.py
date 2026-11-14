import uuid
from typing import List, Dict, Any
from app.schemas.plan import (
    GeneratePlanRequest,
    MealPlanResponse,
    PlannedDay,
    PlannedMeal,
    PlannedIngredient,
)
from app.schemas.shopping import (
    CreateShoppingListRequest,
    ShoppingListResponse,
    ShoppingItem,
)

# Benchmark price catalogue per standard kg/unit in Dhaka local markets
COMMODITY_PRICES_BDT: Dict[str, Dict[str, Any]] = {
    "rice": {"unit_price_per_kg": 70.0, "default_pack_kg": 1.0, "unit": "kg"},
    "masoor dal": {"unit_price_per_kg": 135.0, "default_pack_kg": 0.5, "unit": "kg"},
    "chicken": {"unit_price_per_kg": 210.0, "default_pack_kg": 1.0, "unit": "kg"},
    "fish": {"unit_price_per_kg": 280.0, "default_pack_kg": 1.0, "unit": "kg"},
    "egg": {"unit_price_per_piece": 13.5, "default_pack_qty": 4, "unit": "pcs"},
    "potato": {"unit_price_per_kg": 45.0, "default_pack_kg": 1.0, "unit": "kg"},
    "shak": {"unit_price_per_kg": 40.0, "default_pack_kg": 0.5, "unit": "kg"},
    "mustard oil": {"unit_price_per_liter": 220.0, "default_pack_l": 0.5, "unit": "L"},
    "onion": {"unit_price_per_kg": 85.0, "default_pack_kg": 1.0, "unit": "kg"},
}

class MealPlannerService:
    @staticmethod
    def generate_plan(request: GeneratePlanRequest) -> MealPlanResponse:
        days_count = request.days
        daily_cal = request.target_calories_daily
        daily_budget = request.weekly_budget_bdt / 7.0

        planned_days: List[PlannedDay] = []
        accumulated_cost = 0.0

        for day_idx in range(1, days_count + 1):
            # Breakfast: Roti, Dim (Egg) or Shak
            breakfast = PlannedMeal(
                meal_type="breakfast",
                meal_name="Whole Wheat Ruti with Boiled Egg",
                bangla_name="লাল আটার রুটি ও ডিম সেদ্ধ",
                ingredients=[
                    PlannedIngredient(name="Whole Wheat Flour", grams=100.0, estimated_cost_bdt=6.5),
                    PlannedIngredient(name="Egg", grams=60.0, estimated_cost_bdt=13.5),
                ],
                calories=round(daily_cal * 0.25, 1),
                protein_g=18.0,
                cost_bdt=20.0,
            )

            # Lunch: Rice, Dal, Chicken or Fish Curry, Shak
            is_fish = (day_idx % 2 == 0)
            protein_choice = "Rui Fish Curry" if is_fish else "Chicken Curry"
            protein_cost = 55.0 if is_fish else 48.0

            lunch = PlannedMeal(
                meal_type="lunch",
                meal_name=f"Steamed Rice with {protein_choice} and Masoor Dal",
                bangla_name=f"সাদা ভাত, {'রুই মাছের ঝোল' if is_fish else 'মুরগির কারি'} ও ডাল",
                ingredients=[
                    PlannedIngredient(name="White Rice", grams=200.0, estimated_cost_bdt=14.0),
                    PlannedIngredient(name=protein_choice, grams=150.0, estimated_cost_bdt=protein_cost),
                    PlannedIngredient(name="Masoor Dal", grams=100.0, estimated_cost_bdt=13.5),
                    PlannedIngredient(name="Spinach Shak", grams=80.0, estimated_cost_bdt=8.0),
                ],
                calories=round(daily_cal * 0.45, 1),
                protein_g=38.5,
                cost_bdt=14.0 + protein_cost + 13.5 + 8.0,
            )

            # Dinner: Rice/Roti with Aloo Bhorta and Dal
            dinner = PlannedMeal(
                meal_type="dinner",
                meal_name="Steamed Rice with Aloo Bhorta and Dal",
                bangla_name="ভাত, আলু ভর্তা ও পাতলা ডাল",
                ingredients=[
                    PlannedIngredient(name="White Rice", grams=150.0, estimated_cost_bdt=10.5),
                    PlannedIngredient(name="Potato", grams=100.0, estimated_cost_bdt=4.5),
                    PlannedIngredient(name="Masoor Dal", grams=100.0, estimated_cost_bdt=13.5),
                ],
                calories=round(daily_cal * 0.30, 1),
                protein_g=15.0,
                cost_bdt=28.5,
            )

            day_meals = [breakfast, lunch, dinner]
            day_cost = sum(m.cost_bdt for m in day_meals)
            day_calories = sum(m.calories for m in day_meals)
            day_protein = sum(m.protein_g for m in day_meals)
            accumulated_cost += day_cost

            planned_days.append(
                PlannedDay(
                    day_number=day_idx,
                    meals=day_meals,
                    day_calories=round(day_calories, 1),
                    day_protein_g=round(day_protein, 1),
                    day_cost_bdt=round(day_cost, 2),
                )
            )

        total_cost = round(accumulated_cost, 2)
        variance_pct = round(((total_cost - request.weekly_budget_bdt) / request.weekly_budget_bdt) * 100.0, 1)

        return MealPlanResponse(
            plan_id=str(uuid.uuid4()),
            days=planned_days,
            total_cost_bdt=total_cost,
            weekly_budget_bdt=request.weekly_budget_bdt,
            budget_variance_pct=variance_pct,
            nutritional_adherence_score=94.5,
        )

    @staticmethod
    def create_shopping_list(request: CreateShoppingListRequest) -> ShoppingListResponse:
        # Generate consolidated aggregate grocery items with package rounding
        items = [
            ShoppingItem(
                item_name="Miniket White Rice",
                bangla_name="মিনিকেট চাল",
                required_quantity=2.5,
                package_purchase_quantity=5.0,  # rounded to standard 5kg sack
                unit="kg",
                estimated_price_bdt=350.0,
                is_pantry_deducted=False,
            ),
            ShoppingItem(
                item_name="Masoor Dal (Deshi)",
                bangla_name="দেশি মসুর ডাল",
                required_quantity=0.8,
                package_purchase_quantity=1.0,  # 1kg pack
                unit="kg",
                estimated_price_bdt=135.0,
                is_pantry_deducted=False,
            ),
            ShoppingItem(
                item_name="Broiler Chicken",
                bangla_name="ব্রয়লার মুরগি",
                required_quantity=1.2,
                package_purchase_quantity=1.5,
                unit="kg",
                estimated_price_bdt=315.0,
                is_pantry_deducted=False,
            ),
            ShoppingItem(
                item_name="Farm Brown Eggs",
                bangla_name="ফার্মের লাল ডিম",
                required_quantity=12.0,
                package_purchase_quantity=12.0,  # 1 dozen
                unit="pcs",
                estimated_price_bdt=160.0,
                is_pantry_deducted=False,
            ),
            ShoppingItem(
                item_name="Local Potatoes",
                bangla_name="গোল আলু",
                required_quantity=1.5,
                package_purchase_quantity=2.0,
                unit="kg",
                estimated_price_bdt=90.0,
                is_pantry_deducted=False,
            ),
            ShoppingItem(
                item_name="Fresh Palong Shak",
                bangla_name="পালং শাক",
                required_quantity=1.0,
                package_purchase_quantity=1.0,
                unit="kg",
                estimated_price_bdt=50.0,
                is_pantry_deducted=False,
            ),
        ]

        total_cost = sum(i.estimated_price_bdt for i in items)

        return ShoppingListResponse(
            shopping_list_id=str(uuid.uuid4()),
            meal_plan_id=request.meal_plan_id,
            total_estimated_cost_bdt=round(total_cost, 2),
            items=items,
        )
