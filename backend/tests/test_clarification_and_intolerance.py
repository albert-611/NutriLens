import pytest
from app.services.clarification_service import ClarificationService
from app.services.intolerance_service import IntoleranceService
from app.schemas.food import ClarificationAnswerInput, ConfirmedFoodItem

# ==============================================================================
# CLARIFICATION QUESTION TESTS
# ==============================================================================

def test_clarification_question_generation_for_cooked_dishes():
    candidates = [
        {"food_name": "Cooked White Rice (Parboiled)", "preparation_state": "boiled"},
        {"food_name": "Rohu Fish Curry", "preparation_state": "curried"},
    ]
    questions = ClarificationService.generate_clarification_questions(candidates)
    assert len(questions) >= 1
    # Check cooking oil question
    oil_q = next((q for q in questions if q.question_id == "q_cooking_oil"), None)
    assert oil_q is not None
    assert oil_q.answer_type == "multi_select_with_custom"
    assert "Mustard oil (সরিষার তেল)" in oil_q.options
    assert "Ghee (ঘি)" in oil_q.options
    assert "Not sure" in oil_q.options

def test_clarification_user_selects_single_cooking_oil():
    items = [
        ConfirmedFoodItem(food_name="Cooked White Rice", portion_grams=200, preparation_state="boiled")
    ]
    answers = [
        ClarificationAnswerInput(
            question_id="q_cooking_oil",
            selected_answers=["Mustard oil (সরিষার তেল)"],
        )
    ]
    res = ClarificationService.interpret_answers(answers, items)
    assert "Mustard oil" in res["user_reported_ingredients"]
    assert res["oil_multiplier"] == 1.15
    assert not res["uncertainty_preserved"]

def test_clarification_user_selects_multiple_cooking_oils():
    items = [
        ConfirmedFoodItem(food_name="Polao", portion_grams=200, preparation_state="curried")
    ]
    answers = [
        ClarificationAnswerInput(
            question_id="q_cooking_oil",
            selected_answers=["Soybean oil (সয়াবিন তেল)", "Ghee (ঘি)"],
        )
    ]
    res = ClarificationService.interpret_answers(answers, items)
    assert "Soybean oil" in res["user_reported_ingredients"]
    assert "Ghee (Dairy/Lactose)" in res["user_reported_ingredients"]
    assert res["oil_multiplier"] == 1.25

def test_clarification_user_selects_not_sure():
    items = [
        ConfirmedFoodItem(food_name="Curried Chicken", portion_grams=180, preparation_state="curried")
    ]
    answers = [
        ClarificationAnswerInput(
            question_id="q_cooking_oil",
            selected_answers=["Not sure"],
        )
    ]
    res = ClarificationService.interpret_answers(answers, items)
    assert res["uncertainty_preserved"] is True
    assert len(res["user_reported_ingredients"]) == 0

def test_clarification_user_enters_custom_ingredient():
    items = [
        ConfirmedFoodItem(food_name="Mixed Vegetable Curry", portion_grams=150, preparation_state="curried")
    ]
    answers = [
        ClarificationAnswerInput(
            question_id="q_cooking_oil",
            selected_answers=[],
            custom_answer="Cooked with pure organic cow ghee from Pabna",
        )
    ]
    res = ClarificationService.interpret_answers(answers, items)
    assert any("Ghee" in ing for ing in res["user_reported_ingredients"])

def test_clarification_user_selects_option_and_custom_details():
    items = [
        ConfirmedFoodItem(food_name="Special Fried Rice", portion_grams=250, preparation_state="fried")
    ]
    answers = [
        ClarificationAnswerInput(
            question_id="q_cooking_oil",
            selected_answers=["Soybean oil (সয়াবিন তেল)"],
            custom_answer="Added a little butter for aroma",
        )
    ]
    res = ClarificationService.interpret_answers(answers, items)
    assert "Soybean oil" in res["user_reported_ingredients"]
    assert any("butter" in ing.lower() or "User note" in ing for ing in res["user_reported_ingredients"])

def test_clarification_user_edits_answers():
    items = [
        ConfirmedFoodItem(food_name="Chicken Biryani", portion_grams=350, preparation_state="cooked")
    ]
    # First submission: user said "No added oil"
    answers_v1 = [
        ClarificationAnswerInput(question_id="q_cooking_oil", selected_answers=["No added oil / Boiled plain"])
    ]
    res_v1 = ClarificationService.interpret_answers(answers_v1, items)
    assert res_v1["oil_multiplier"] == 1.0

    # Edited submission: user changed to Ghee
    answers_v2 = [
        ClarificationAnswerInput(question_id="q_cooking_oil", selected_answers=["Ghee (ঘি)"])
    ]
    res_v2 = ClarificationService.interpret_answers(answers_v2, items)
    assert res_v2["oil_multiplier"] == 1.25
    assert "Ghee (Dairy/Lactose)" in res_v2["user_reported_ingredients"]


# ==============================================================================
# PERSONAL INTOLERANCE & ALLERGY AUDIT TESTS
# ==============================================================================

def test_scenario_peanut_allergy_matches_peanut_biscuits():
    foods = [
        {"id": "food-1", "food_name": "Peanut Biscuits", "name_bn": "বাদাম বিস্কুট"}
    ]
    user_allergies = ["Peanuts"]
    user_intolerances = []

    res = IntoleranceService.audit_food_safety(foods, user_allergies, user_intolerances)
    assert res["has_allergy_conflict"] is True
    assert len(res["allergy_warnings"]) == 1
    warning = res["allergy_warnings"][0]
    assert warning["food_name"] == "Peanut Biscuits"
    assert warning["matched_allergen"] == "Peanuts"
    assert "Peanut" in warning["reason"] or "peanuts" in warning["reason"]

def test_scenario_lactose_intolerance_matches_milk_tea():
    foods = [
        {"id": "food-1", "food_name": "Milk Tea", "name_bn": "দুধ চা"}
    ]
    user_allergies = []
    user_intolerances = ["Lactose intolerance"]

    res = IntoleranceService.audit_food_safety(foods, user_allergies, user_intolerances)
    assert res["has_intolerance_conflict"] is True
    assert len(res["intolerance_notes"]) == 1
    note = res["intolerance_notes"][0]
    assert note["food_name"] == "Milk Tea"
    assert note["matched_allergen"] == "Lactose intolerance"
    assert note["evidence_level"] == "confirmed_ingredient"

def test_scenario_green_chili_never_matches_caffeine_sensitivity():
    """
    CRITICAL BUG REGRESSION TEST:
    Green Chili (কাঁচা মরিচ) must NEVER trigger a Caffeine Sensitivity warning.
    """
    foods = [
        {"id": "food-green-chili", "food_name": "Green Chili", "name_bn": "কাঁচা মরিচ"}
    ]
    user_allergies = []
    user_intolerances = ["Caffeine sensitivity"]

    res = IntoleranceService.audit_food_safety(foods, user_allergies, user_intolerances)
    # MUST BE ZERO WARNINGS!
    assert res["has_intolerance_conflict"] is False
    assert len(res["intolerance_notes"]) == 0
    assert res["no_conflict_notice"] is not None
    assert "No known conflicts were identified" in res["no_conflict_notice"]

def test_scenario_same_food_multiple_matching_ingredients_deduplicates():
    """
    If a dish contains multiple dairy ingredients (e.g. Milk and Ghee),
    it must produce only ONE card, not duplicate cards.
    """
    foods = [
        {
            "id": "food-shahi-dish",
            "food_name": "Shahi Paneer",
            "name_bn": "শাহী পনির",
            "confirmed_ingredients": ["Milk", "Ghee"],
        }
    ]
    user_allergies = []
    user_intolerances = ["Lactose intolerance"]

    res = IntoleranceService.audit_food_safety(foods, user_allergies, user_intolerances)
    assert len(res["intolerance_notes"]) == 1
    note = res["intolerance_notes"][0]
    assert note["id"] == "food-shahi-dish::intolerance::lactose intolerance"
    # Contributing ingredients are combined into one note
    assert len(note["contributing_ingredients"]) >= 1

def test_scenario_two_different_foods_produce_separate_entries():
    foods = [
        {"id": "food-1", "food_name": "Milk Tea", "name_bn": "দুধ চা"},
        {"id": "food-2", "food_name": "Misti Doi", "name_bn": "মিষ্টি দই"},
    ]
    user_allergies = []
    user_intolerances = ["Lactose intolerance"]

    res = IntoleranceService.audit_food_safety(foods, user_allergies, user_intolerances)
    assert len(res["intolerance_notes"]) == 2
    names = [n["food_name"] for n in res["intolerance_notes"]]
    assert "Milk Tea" in names
    assert "Misti Doi" in names

def test_scenario_no_restrictions_match_scanned_food():
    foods = [
        {"id": "food-1", "food_name": "Cooked White Rice", "name_bn": "সিদ্ধ সাদা ভাত"},
        {"id": "food-2", "food_name": "Red Lentils (Masoor Dal)", "name_bn": "মসুর ডাল"},
    ]
    user_allergies = ["Fish", "Shellfish (shrimp, crab, lobster)"]
    user_intolerances = ["Lactose intolerance", "Caffeine sensitivity"]

    res = IntoleranceService.audit_food_safety(foods, user_allergies, user_intolerances)
    assert res["has_allergy_conflict"] is False
    assert res["has_intolerance_conflict"] is False
    assert res["no_conflict_notice"] == "No known conflicts were identified between your confirmed food items and saved dietary restrictions."

def test_scenario_clarification_answers_influence_subsequent_intolerance_audit():
    """
    Cooked rice initially has no dairy.
    When user answers clarification that Ghee was used,
    intolerance audit refreshes and flags Lactose Intolerance as preparation_dependent!
    """
    foods_before = [
        {"id": "rice-1", "food_name": "Cooked White Rice", "name_bn": "সিদ্ধ সাদা ভাত"}
    ]
    user_intolerances = ["Lactose intolerance"]

    # Before answering: Clean
    audit_before = IntoleranceService.audit_food_safety(foods_before, [], user_intolerances)
    assert audit_before["has_intolerance_conflict"] is False

    # User answers: Ghee was used
    foods_after = [
        {
            "id": "rice-1",
            "food_name": "Cooked White Rice",
            "name_bn": "সিদ্ধ সাদা ভাত",
            "user_reported_ingredients": ["Ghee (Dairy/Lactose)"],
        }
    ]
    audit_after = IntoleranceService.audit_food_safety(foods_after, [], user_intolerances)
    assert audit_after["has_intolerance_conflict"] is True
    assert len(audit_after["intolerance_notes"]) == 1
    note = audit_after["intolerance_notes"][0]
    assert note["evidence_level"] == "preparation_dependent"
    assert "clarification" in note["reason"].lower() or "ghee" in note["reason"].lower()

def test_scenario_user_removes_item_removes_warning():
    foods = [
        {"id": "food-1", "food_name": "Milk Tea", "name_bn": "দুধ চা"},
        {"id": "food-2", "food_name": "Cooked White Rice", "name_bn": "সিদ্ধ সাদা ভাত"},
    ]
    audit_initial = IntoleranceService.audit_food_safety(foods, [], ["Lactose intolerance"])
    assert len(audit_initial["intolerance_notes"]) == 1

    # User deletes Milk Tea
    foods_remaining = [
        {"id": "food-2", "food_name": "Cooked White Rice", "name_bn": "সিদ্ধ সাদা ভাত"}
    ]
    audit_updated = IntoleranceService.audit_food_safety(foods_remaining, [], ["Lactose intolerance"])
    assert len(audit_updated["intolerance_notes"]) == 0
    assert audit_updated["no_conflict_notice"] is not None
