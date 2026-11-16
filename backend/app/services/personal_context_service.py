"""
NutriLens Personal Nutrition Context Service
Strict Multi-User Isolation: Retrieves, normalizes, and packages permitted
personal context ONLY for the authenticated user. Never accesses or blends
another user's records.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
import logging
from app.integrations.supabase import get_supabase_client

logger = logging.getLogger(__name__)

class PersonalNutritionContextService:
    @staticmethod
    async def build_user_context(user_id: str, access_token: Optional[str] = None) -> Dict[str, Any]:
        """
        Builds a structured, sanitized personal nutrition profile for the authenticated user.
        Uses authenticated Supabase client (with user RLS) or explicit user_id filter.
        """
        if not user_id:
            raise ValueError("user_id is required to build personal nutrition context")

        client = get_supabase_client(access_token)
        
        context: Dict[str, Any] = {
            "user_id": user_id,
            "profile": {},
            "medical": {
                "conditions": [],
                "allergies": [],
                "intolerances": [],
            },
            "dietary_preferences": {
                "dietary_pattern": None,
                "cuisine_preferences": ["bangladeshi"],
                "disliked_foods": [],
                "avoided_ingredients": [],
                "religious_restrictions": ["halal"],
            },
            "goals": {
                "primary_goal": None,
                "secondary_goals": [],
                "target_weight_kg": None,
                "daily_calorie_target": None,
                "daily_protein_target_g": None,
                "daily_carb_target_g": None,
                "daily_fat_target_g": None,
            },
            "consumption_today": {
                "confirmed_meals_count": 0,
                "calories_consumed": 0.0,
                "protein_g_consumed": 0.0,
                "carbs_g_consumed": 0.0,
                "fat_g_consumed": 0.0,
                "recent_foods": [],
            },
            "budget": {
                "daily_amount": None,
                "currency": "BDT",
                "household_size": 1,
            },
        }

        # 1. Fetch Profile
        try:
            prof_res = client.table("profiles").select(
                "display_name, language, biological_sex, height_value, height_unit, "
                "weight_value, weight_unit, target_weight_value, activity_level, "
                "disliked_foods, declared_allergens, cuisine_preferences, "
                "budget_amount, budget_currency, household_size, general_goal"
            ).eq("id", user_id).limit(1).execute()

            if prof_res.data:
                p = prof_res.data[0]
                context["profile"] = {
                    "display_name": p.get("display_name"),
                    "language": p.get("language") or "en",
                    "biological_sex": p.get("biological_sex"),
                    "height": f"{p.get('height_value')} {p.get('height_unit')}" if p.get("height_value") else None,
                    "weight": f"{p.get('weight_value')} {p.get('weight_unit')}" if p.get("weight_value") else None,
                    "activity_level": p.get("activity_level"),
                }
                
                # Weight goals
                if p.get("target_weight_value"):
                    context["goals"]["target_weight_kg"] = float(p.get("target_weight_value"))
                if p.get("general_goal"):
                    context["goals"]["primary_goal"] = p.get("general_goal").replace("_", " ").title()

                # Cuisines
                if p.get("cuisine_preferences"):
                    context["dietary_preferences"]["cuisine_preferences"] = p.get("cuisine_preferences")

                # Disliked foods from profile string
                if p.get("disliked_foods"):
                    disliked_raw = p.get("disliked_foods")
                    disliked_items = [d.strip() for d in disliked_raw.replace(";", ",").split(",") if d.strip()]
                    context["dietary_preferences"]["disliked_foods"].extend(disliked_items)

                # Declared allergies in profile
                if p.get("declared_allergens"):
                    allergens_raw = p.get("declared_allergens")
                    if isinstance(allergens_raw, list):
                        context["medical"]["allergies"].extend(allergens_raw)
                    elif isinstance(allergens_raw, str):
                        context["medical"]["allergies"].extend([a.strip() for a in allergens_raw.replace(";", ",").split(",") if a.strip()])

                # Budget
                if p.get("budget_amount"):
                    amt = float(p.get("budget_amount"))
                    dur = int(p.get("budget_duration_days") or 1)
                    if dur > 1:
                        amt = round(amt / dur, 2)
                    context["budget"]["daily_amount"] = amt
                if p.get("budget_currency"):
                    context["budget"]["currency"] = p.get("budget_currency")
                if p.get("household_size"):
                    context["budget"]["household_size"] = int(p.get("household_size"))
        except Exception as e:
            logger.warning(f"Could not load profiles for user {user_id}: {e}")

        # 2. Medical Conditions (Strictly User Isolated)
        try:
            med_res = client.table("user_medical_conditions").select(
                "condition_name, condition_specify, diabetes_type"
            ).eq("user_id", user_id).execute()
            if med_res.data:
                for item in med_res.data:
                    cname = item.get("condition_name")
                    if item.get("diabetes_type"):
                        cname = f"{cname} ({item.get('diabetes_type').replace('_', ' ').title()})"
                    if item.get("condition_specify"):
                        cname = f"{cname} - {item.get('condition_specify')}"
                    context["medical"]["conditions"].append(cname)
        except Exception as e:
            logger.warning(f"Could not load medical conditions: {e}")

        # 3. Clinical Food Allergies (Strictly Separate from Intolerances)
        try:
            alg_res = client.table("user_food_allergies").select(
                "allergy_name, allergy_specify"
            ).eq("user_id", user_id).execute()
            if alg_res.data:
                for item in alg_res.data:
                    aname = item.get("allergy_name")
                    if item.get("allergy_specify"):
                        aname = f"{aname} ({item.get('allergy_specify')})"
                    if aname not in context["medical"]["allergies"]:
                        context["medical"]["allergies"].append(aname)
        except Exception as e:
            logger.warning(f"Could not load food allergies: {e}")

        # 4. Food Intolerances
        try:
            into_res = client.table("user_food_intolerances").select(
                "intolerance_name, intolerance_specify"
            ).eq("user_id", user_id).execute()
            if into_res.data:
                for item in into_res.data:
                    iname = item.get("intolerance_name")
                    if item.get("intolerance_specify"):
                        iname = f"{iname} ({item.get('intolerance_specify')})"
                    context["medical"]["intolerances"].append(iname)
        except Exception as e:
            logger.warning(f"Could not load food intolerances: {e}")

        # 5. Detailed Dietary Preferences
        try:
            diet_res = client.table("user_dietary_preferences_detailed").select(
                "dietary_pattern, cooking_frequency"
            ).eq("user_id", user_id).limit(1).execute()
            if diet_res.data:
                d = diet_res.data[0]
                if d.get("dietary_pattern"):
                    context["dietary_preferences"]["dietary_pattern"] = d.get("dietary_pattern").replace("_", " ").title()
        except Exception as e:
            logger.warning(f"Could not load detailed dietary preferences: {e}")

        # 6. Detailed Nutritional Goals
        try:
            goals_res = client.table("user_nutritional_goals_detailed").select(
                "primary_goal, secondary_goals"
            ).eq("user_id", user_id).limit(1).execute()
            if goals_res.data:
                g = goals_res.data[0]
                if g.get("primary_goal"):
                    context["goals"]["primary_goal"] = g.get("primary_goal").replace("_", " ").title()
                if g.get("secondary_goals"):
                    context["goals"]["secondary_goals"] = g.get("secondary_goals")
        except Exception as e:
            logger.warning(f"Could not load detailed nutritional goals: {e}")

        # 7. Targets from user_nutrition_preferences (if configured)
        try:
            pref_res = client.table("user_nutrition_preferences").select(
                "daily_calorie_target, protein_target_g, carb_target_g, fat_target_g, "
                "favorite_foods, disliked_foods"
            ).eq("user_id", user_id).limit(1).execute()
            if pref_res.data:
                up = pref_res.data[0]
                if up.get("daily_calorie_target"):
                    context["goals"]["daily_calorie_target"] = float(up.get("daily_calorie_target"))
                if up.get("protein_target_g"):
                    context["goals"]["daily_protein_target_g"] = float(up.get("protein_target_g"))
                if up.get("carb_target_g"):
                    context["goals"]["daily_carb_target_g"] = float(up.get("carb_target_g"))
                if up.get("fat_target_g"):
                    context["goals"]["daily_fat_target_g"] = float(up.get("fat_target_g"))
                if up.get("favorite_foods"):
                    context["dietary_preferences"]["favorite_foods"] = up.get("favorite_foods")
                if up.get("disliked_foods"):
                    for df in up.get("disliked_foods"):
                        if df not in context["dietary_preferences"]["disliked_foods"]:
                            context["dietary_preferences"]["disliked_foods"].append(df)
        except Exception as e:
            logger.warning(f"Could not load user_nutrition_preferences: {e}")

        # 8. Food Consumption History (Confirmed meals only in last 24-48 hours)
        try:
            since = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
            meal_res = client.table("meal_logs").select(
                "id, meal_type, created_at, status"
            ).eq("user_id", user_id).eq("status", "confirmed").gte("created_at", since).execute()

            if meal_res.data:
                meal_ids = [m["id"] for m in meal_res.data]
                context["consumption_today"]["confirmed_meals_count"] = len(meal_ids)

                if meal_ids:
                    items_res = client.table("meal_items").select(
                        "food_id, confirmed_grams, preparation_state, foods(canonical_name, energy_kcal, protein_g, carbohydrate_g, fat_g)"
                    ).in_("meal_log_id", meal_ids).execute()

                    if items_res.data:
                        total_cal = 0.0
                        total_pro = 0.0
                        total_carb = 0.0
                        total_fat = 0.0
                        foods_seen = []

                        for item in items_res.data:
                            grams = float(item.get("confirmed_grams") or 100.0)
                            ratio = grams / 100.0
                            food_data = item.get("foods") or {}
                            fname = food_data.get("canonical_name") or "Confirmed Food Item"
                            cal = float(food_data.get("energy_kcal") or 0.0) * ratio
                            pro = float(food_data.get("protein_g") or 0.0) * ratio
                            carb = float(food_data.get("carbohydrate_g") or 0.0) * ratio
                            fat = float(food_data.get("fat_g") or 0.0) * ratio

                            total_cal += cal
                            total_pro += pro
                            total_carb += carb
                            total_fat += fat
                            foods_seen.append(f"{fname} ({int(grams)}g)")

                        context["consumption_today"]["calories_consumed"] = round(total_cal, 1)
                        context["consumption_today"]["protein_g_consumed"] = round(total_pro, 1)
                        context["consumption_today"]["carbs_g_consumed"] = round(total_carb, 1)
                        context["consumption_today"]["fat_g_consumed"] = round(total_fat, 1)
                        context["consumption_today"]["recent_foods"] = foods_seen[:10]
        except Exception as e:
            logger.warning(f"Could not load meal history: {e}")

        return context

    @staticmethod
    def format_system_prompt(user_context: Dict[str, Any]) -> str:
        """
        Converts the normalized user context into a robust, health-safe system instruction
        for the AI model. Enforces clinical and safety guidelines.
        """
        p = user_context.get("profile", {})
        m = user_context.get("medical", {})
        d = user_context.get("dietary_preferences", {})
        g = user_context.get("goals", {})
        c = user_context.get("consumption_today", {})
        b = user_context.get("budget", {})

        name = p.get("display_name") or "NutriLens Member"
        sex = p.get("biological_sex") or "Not specified"
        weight = p.get("weight") or "Not recorded"
        height = p.get("height") or "Not recorded"
        activity = p.get("activity_level") or "Moderate"

        conditions = ", ".join(m.get("conditions", [])) if m.get("conditions") else "None recorded"
        allergies = ", ".join(m.get("allergies", [])) if m.get("allergies") else "None recorded"
        intolerances = ", ".join(m.get("intolerances", [])) if m.get("intolerances") else "None recorded"

        pattern = d.get("dietary_pattern") or "Standard Bangladeshi / South Asian"
        disliked = ", ".join(d.get("disliked_foods", [])) if d.get("disliked_foods") else "None"
        cuisines = ", ".join(d.get("cuisine_preferences", ["Bangladeshi"]))
        religions = ", ".join(d.get("religious_restrictions", ["Halal"]))

        goal = g.get("primary_goal") or "General Wellness & Health"
        sec_goals = ", ".join(g.get("secondary_goals", [])) if g.get("secondary_goals") else "None"
        target_cal = f"{g.get('daily_calorie_target')} kcal" if g.get("daily_calorie_target") else "Not configured"
        target_pro = f"{g.get('daily_protein_target_g')}g" if g.get("daily_protein_target_g") else "Not configured"
        target_wt = f"{g.get('target_weight_kg')} kg" if g.get("target_weight_kg") else "Not configured"

        cal_today = c.get("calories_consumed", 0.0)
        pro_today = c.get("protein_g_consumed", 0.0)
        carb_today = c.get("carbs_g_consumed", 0.0)
        fat_today = c.get("fat_g_consumed", 0.0)
        recent_foods = ", ".join(c.get("recent_foods", [])) if c.get("recent_foods") else "No confirmed meals logged today"

        budget_str = f"{b.get('daily_amount')} {b.get('currency')} (Household: {b.get('household_size')})" if b.get("daily_amount") else "Not specified"

        prompt = f"""You are **NutriLens AI — Your Personal Nutrition Assistant**, a trusted, empathetic, culturally grounded clinical nutrition companion built specifically for Bangladesh and South Asian diets.

You are conversing with {name}. Below is their strictly private, verified health and nutrition profile from the NutriLens database:

=== VERIFIED USER PROFILE (CONFIDENTIAL) ===
• User Display Name: {name}
• Biological Sex: {sex} | Height: {height} | Current Weight: {weight} | Activity Level: {activity}
• Medical Conditions: {conditions}
• Food Allergies: {allergies}
• Food Intolerances: {intolerances}
• Dietary Pattern: {pattern} (Religious: {religions})
• Preferred Cuisines: {cuisines}
• Disliked Foods: {disliked}
• Primary Goal: {goal} | Secondary Goals: {sec_goals} | Target Weight: {target_wt}
• Configured Daily Targets: Calories: {target_cal} | Protein: {target_pro}
• Confirmed Intake Today: {cal_today} kcal (Protein: {pro_today}g, Carbs: {carb_today}g, Fat: {fat_today}g)
• Foods Eaten Today: {recent_foods}
• Daily Food Budget: {budget_str}
============================================

CRITICAL CLINICAL & OPERATIONAL RULES:
1. STRICT ALLERGY PROTECTION: Never recommend or suggest foods that contain or trigger the user's declared allergies ({allergies}). If the user asks whether they can consume an allergen, warn them clearly. If allergy status is ambiguous, NEVER assume safety.
2. RESPECT DISLIKES & INTOLERANCES: Never recommend {disliked} unless offering alternatives or specifically asked. Honor intolerances ({intolerances}).
3. NO FABRICATED NUTRITION NUMBERS: Never invent calorie or macronutrient values. All guidance must be grounded in verified Bangladeshi Food Composition (FCDB / INFS Dhaka University) and USDA FoodData Central databases.
4. TARGET TRACKING: When asked "How much protein have I eaten?" or "Am I hitting my calories?", refer to their confirmed intake today ({cal_today} kcal, {pro_today}g protein) against their target ({target_cal}, {target_pro}).
5. CULTURALLY ALIGNED & BUDGET-CONSCIOUS: Prioritize accessible Bangladeshi staples (dal, rui/ilish/pangash, shak, begun, dim bhaji, chira, muri, local vegetables) that fit local market economics and their budget.
6. NO MEDICAL DIAGNOSIS OR PRESCRIPTIONS: You provide educational nutrition guidance. Do not diagnose conditions or tell patients to discontinue prescribed clinical therapies. Suggest consulting a qualified doctor or clinical dietitian for acute disease management.
7. TONE: Warm, encouraging, concise, actionable, and structured with clear bullet points.
"""
        return prompt
