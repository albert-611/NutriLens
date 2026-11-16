from typing import List, Optional, Dict, Any
from app.schemas.food import ClarificationQuestion, ClarificationAnswerInput, ConfirmedFoodItem

class ClarificationService:
    @staticmethod
    def generate_clarification_questions(
        candidates: List[Dict[str, Any]],
        raw_questions: Optional[List[str]] = None,
    ) -> List[ClarificationQuestion]:
        """
        Generates structured clarification questions for recognized food candidates.
        """
        questions: List[ClarificationQuestion] = []
        food_names = " ".join([
            (c.get("food_name") or c.get("label") or "").lower()
            for c in candidates
        ])

        has_cooked_or_curried = any([
            (c.get("preparation_state") or "").lower() in ["cooked", "curried", "fried", "roasted"]
            or any(k in (c.get("food_name") or c.get("label") or "").lower() for k in ["rice", "dal", "curry", "jhol", "biryani", "bhaji"])
            for c in candidates
        ])

        has_biryani = any(k in food_names for k in ["biryani", "polao", "pulao", "tehari", "khichuri"])
        has_tea_coffee = any(k in food_names for k in ["tea", "cha", "coffee", "latte"])
        has_curry = any(k in food_names for k in ["curry", "jhol", "korma", "rezala", "gravy"])

        if has_cooked_or_curried:
            questions.append(ClarificationQuestion(
                question_id="q_cooking_oil",
                question="Which cooking oil or fat was used in preparing the meal?",
                answer_type="multi_select_with_custom",
                required=False,
                options=[
                    "Soybean oil (সয়াবিন তেল)",
                    "Mustard oil (সরিষার তেল)",
                    "Ghee (ঘি)",
                    "Sunflower oil (সূর্যমুখী তেল)",
                    "Vegetable oil (ভেজিটেবল তেল)",
                    "No added oil / Boiled plain",
                    "Not sure",
                ],
                allow_custom_answer=True,
                custom_answer_placeholder="e.g. Mostly soybean oil with a spoonful of ghee...",
                selected_answers=[],
            ))

        if has_biryani:
            questions.append(ClarificationQuestion(
                question_id="q_biryani_potato_egg",
                question="Were any potatoes or boiled eggs included inside the dish?",
                answer_type="single_select",
                required=False,
                options=[
                    "Potato included (আলু)",
                    "Boiled egg included (ডিম)",
                    "Both potato and egg included",
                    "Neither (meat and rice only)",
                    "Not sure",
                ],
                allow_custom_answer=True,
                custom_answer_placeholder="e.g. 1 medium potato piece...",
                selected_answers=[],
            ))

        if has_tea_coffee:
            questions.append(ClarificationQuestion(
                question_id="q_tea_additions",
                question="Did this beverage include milk or added sugar?",
                answer_type="multi_select_with_custom",
                required=False,
                options=[
                    "Cow's milk (দুধ)",
                    "Condensed milk",
                    "Powdered milk",
                    "Sugar added (চিনি)",
                    "Black / plain (no milk or sugar)",
                    "Not sure",
                ],
                allow_custom_answer=True,
                custom_answer_placeholder="e.g. 1 tsp sugar, 2 tbsp cow milk...",
                selected_answers=[],
            ))

        if has_curry and not has_biryani:
            questions.append(ClarificationQuestion(
                question_id="q_curry_thickener",
                question="Was dairy (doi/cream) or nut paste used in this gravy?",
                answer_type="single_select",
                required=False,
                options=[
                    "Plain onion-ginger gravy (no dairy or nuts)",
                    "Yogurt/Doi added (দই)",
                    "Nut paste added (বাদাম বাটা)",
                    "Heavy cream or malai added",
                    "Not sure",
                ],
                allow_custom_answer=True,
                custom_answer_placeholder="Describe any special gravy ingredients...",
                selected_answers=[],
            ))

        if raw_questions:
            for idx, q in enumerate(raw_questions):
                q_lower = q.lower()
                if "oil" in q_lower and any(eq.question_id == "q_cooking_oil" for eq in questions):
                    continue
                if ("potato" in q_lower or "egg" in q_lower) and any(eq.question_id == "q_biryani_potato_egg" for eq in questions):
                    continue
                if ("milk" in q_lower or "sugar" in q_lower) and any(eq.question_id == "q_tea_additions" for eq in questions):
                    continue

                is_yes_no = any(q_lower.startswith(w) for w in ["was ", "were ", "did ", "is "])
                questions.append(ClarificationQuestion(
                    question_id=f"q_ai_custom_{idx + 1}",
                    question=q,
                    answer_type="yes_no" if is_yes_no else "multi_select_with_custom",
                    required=False,
                    options=["Yes", "No", "Not sure"] if is_yes_no else ["Standard preparation", "Special preparation", "Not sure"],
                    allow_custom_answer=True,
                    custom_answer_placeholder="Describe details or other ingredients...",
                    selected_answers=[],
                ))

        return questions

    @staticmethod
    def interpret_answers(
        answers: List[ClarificationAnswerInput],
        items: List[ConfirmedFoodItem],
    ) -> Dict[str, Any]:
        """
        Interprets clarification answers, updating confirmed ingredients and oil multipliers.
        """
        user_ingredients = []
        oil_multiplier = 1.0
        oil_preference = None
        uncertainty_preserved = False

        for ans in answers:
            sel = ans.selected_answers or []
            cust = (ans.custom_answer or "").strip()

            if "Not sure" in sel:
                uncertainty_preserved = True

            if ans.question_id == "q_cooking_oil":
                if any("Ghee" in s for s in sel):
                    user_ingredients.append("Ghee (Dairy/Lactose)")
                    oil_preference = "ghee"
                    oil_multiplier = max(oil_multiplier, 1.25)
                if any("Mustard oil" in s for s in sel):
                    user_ingredients.append("Mustard oil")
                    if not oil_preference:
                        oil_preference = "mustard"
                    oil_multiplier = max(oil_multiplier, 1.15)
                if any("Soybean oil" in s for s in sel):
                    user_ingredients.append("Soybean oil")
                    if not oil_preference:
                        oil_preference = "soybean"
                    oil_multiplier = max(oil_multiplier, 1.15)
                if any("No added oil" in s for s in sel):
                    if not oil_preference:
                        oil_preference = "none"
                        oil_multiplier = 1.0

            if ans.question_id == "q_tea_additions":
                if any("Cow's milk" in s or "Condensed milk" in s or "Powdered milk" in s for s in sel):
                    user_ingredients.append("Cow's milk (Dairy/Lactose)")
                if any("Sugar" in s for s in sel):
                    user_ingredients.append("Refined sugar")

            if ans.question_id == "q_curry_thickener":
                if any("Yogurt/Doi" in s or "cream" in s for s in sel):
                    user_ingredients.append("Yogurt/Doi (Dairy/Lactose)")
                if any("Nut paste" in s for s in sel):
                    user_ingredients.append("Nut paste (Tree nuts / Peanuts)")

            if cust:
                user_ingredients.append(f'User note: "{cust}"')
                c_low = cust.lower()
                if "ghee" in c_low:
                    user_ingredients.append("Ghee (Dairy/Lactose)")
                if "mustard" in c_low:
                    user_ingredients.append("Mustard oil")
                if "milk" in c_low or "dudh" in c_low:
                    user_ingredients.append("Cow's milk (Dairy/Lactose)")
                if "peanut" in c_low or "badam" in c_low:
                    user_ingredients.append("Peanut / Nut product")

        # Update confirmed_ingredients on items
        updated_items = []
        for it in items:
            it_dict = it.model_dump()
            existing_ing = set(it_dict.get("confirmed_ingredients", []))
            for ing in user_ingredients:
                existing_ing.add(ing)
            it_dict["confirmed_ingredients"] = list(existing_ing)
            updated_items.append(ConfirmedFoodItem(**it_dict))

        return {
            "updated_items": updated_items,
            "user_reported_ingredients": list(set(user_ingredients)),
            "oil_multiplier": oil_multiplier,
            "oil_preference": oil_preference,
            "uncertainty_preserved": uncertainty_preserved,
        }
