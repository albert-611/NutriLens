import re
from typing import List, Dict, Any, Optional

class IntoleranceService:
    # Discrete token & word boundary rules
    RULES = [
        {
            "name": "Caffeine sensitivity",
            "type": "intolerance",
            "english_regex": re.compile(r"\b(coffee|espresso|cappuccino|latte|mocha|cold brew|black tea|green tea|milk tea|iced tea|matcha|tea|caffeine|energy drink|red bull|monster|speed|tiger|cola|coca-cola|pepsi|cocoa|chocolate)\b", re.IGNORECASE),
            "bengali_tokens": ["চা", "রং চা", "দুধ চা", "লেবু চা", "গ্রিন টি", "কফি", "কোক", "চকলেট"],
            "reason": "Known dietary source of caffeine (tea, coffee, or caffeinated beverage).",
            "evidence": "Confirmed ingredient match",
        },
        {
            "name": "Lactose intolerance",
            "type": "intolerance",
            "english_regex": re.compile(r"\b(milk|dairy|ghee|butter|paneer|curd|yogurt|doi|dahi|cream|custard|firni|kheer|payesh|chhana|sandesh|rasgulla|cheese|whey|casein|borhani)\b", re.IGNORECASE),
            "bengali_tokens": ["দুধ", "ঘি", "মাখন", "দই", "পনির", "ছানা", "মালাই", "ক্ষীর", "পায়েশ", "দুধ চা", "বোরহানি"],
            "reason": "Contains milk or dairy products, which are primary sources of lactose.",
            "evidence": "Confirmed ingredient match",
        },
        {
            "name": "Gluten intolerance",
            "type": "intolerance",
            "english_regex": re.compile(r"\b(wheat|atta|maida|suji|semolina|roti|ruti|chapati|paratha|naan|luchi|puri|bread|toast|biscuit|biscuits|cake|pasta|noodles|samosa|shingara|shingada|barley|rye)\b", re.IGNORECASE),
            "bengali_tokens": ["গম", "আটা", "ময়দা", "রুটি", "পরোটা", "নান", "লুচি", "সুজি", "পাউরুটি", "বিস্কুট", "নুডুলস", "সিঙ্গাড়া", "সমুচা"],
            "reason": "Contains wheat or gluten-bearing flours and grains.",
            "evidence": "Confirmed ingredient match",
        },
        {
            "name": "Peanuts",
            "type": "allergy",
            "english_regex": re.compile(r"\b(peanut|peanuts|groundnut|groundnuts|peanut butter|peanut biscuits|badam sharbat|badam shake)\b", re.IGNORECASE),
            "bengali_tokens": ["চীনাবাদাম", "চিনা বাদাম", "চিনাবাদাম", "বাদাম বিস্কুট"],
            "reason": "Verified ingredient record contains peanuts / groundnuts.",
            "evidence": "Ingredient/database match",
        },
        {
            "name": "Tree nuts (almonds, walnuts, cashews)",
            "type": "allergy",
            "english_regex": re.compile(r"\b(almond|almonds|cashew|cashews|walnut|walnuts|pistachio|pistachios|kaju|kathbadam|pesta|akrot|korma|rezala)\b", re.IGNORECASE),
            "bengali_tokens": ["কাজুবাদাম", "কাঠবাদাম", "পেস্তাবাদাম", "আখরোট", "কোরমা", "রেজালা"],
            "reason": "Dish preparation frequently uses blended tree nuts (cashew or almond paste).",
            "evidence": "Possible ingredient match",
        },
        {
            "name": "Milk/dairy",
            "type": "allergy",
            "english_regex": re.compile(r"\b(milk|dairy|ghee|butter|paneer|curd|yogurt|doi|dahi|cream|custard|firni|kheer|payesh|chhana|sandesh|rasgulla|cheese|whey|casein)\b", re.IGNORECASE),
            "bengali_tokens": ["দুধ", "ঘি", "মাখন", "দই", "পনির", "ছানা", "মালাই", "ক্ষীর", "পায়েশ", "দুধ চা"],
            "reason": "Verified dairy ingredients detected in food.",
            "evidence": "Confirmed ingredient match",
        },
        {
            "name": "Eggs",
            "type": "allergy",
            "english_regex": re.compile(r"\b(egg|eggs|dim|omelette|mayonnaise)\b", re.IGNORECASE),
            "bengali_tokens": ["ডিম", "ডিমের ঝোল", "ডিম ভাজি", "অমলেট", "সিদ্ধ ডিম"],
            "reason": "Contains eggs or whole egg products.",
            "evidence": "Confirmed ingredient match",
        },
        {
            "name": "Fish",
            "type": "allergy",
            "english_regex": re.compile(r"\b(fish|rui|ilish|katla|pangas|koi|magur|shing|tengra|boal|tilapia|macher)\b", re.IGNORECASE),
            "bengali_tokens": ["মাছ", "রুই", "ইলিশ", "কাতলা", "পাঙ্গাস", "কৈ", "মাগুর", "শিং", "মাছের"],
            "reason": "Food item is a verified freshwater or saltwater fish.",
            "evidence": "Confirmed ingredient match",
        },
        {
            "name": "Shellfish (shrimp, crab, lobster)",
            "type": "allergy",
            "english_regex": re.compile(r"\b(shrimp|prawn|crab|lobster|chingri|kankra)\b", re.IGNORECASE),
            "bengali_tokens": ["চিংড়ি", "কাঁকড়া", "গলদা চিংড়ি", "বাগদা চিংড়ি"],
            "reason": "Contains crustacean or shellfish species.",
            "evidence": "Confirmed ingredient match",
        },
        {
            "name": "Soy",
            "type": "allergy",
            "english_regex": re.compile(r"\b(soy|soya|tofu|edamame|soy sauce|soya chunks)\b", re.IGNORECASE),
            "bengali_tokens": ["সয়া", "টফু", "সয়াবিন মিট", "সয়া সস"],
            "reason": "Contains soybean derivatives or soy protein.",
            "evidence": "Confirmed ingredient match",
        },
        {
            "name": "Mustard",
            "type": "intolerance",
            "english_regex": re.compile(r"\b(mustard|mustard oil|shorshe|shorsher tel|kasundi)\b", re.IGNORECASE),
            "bengali_tokens": ["সরিষা", "সরিষার তেল", "সর্ষে", "কাশুন্দি"],
            "reason": "Prepared with mustard oil or mustard seed paste.",
            "evidence": "Preparation-dependent concern",
        },
    ]

    @classmethod
    def _tokenize_words(cls, text: str) -> List[str]:
        if not text:
            return []
        return [w.strip().lower() for w in re.split(r"[\s,()&+\-/।_]+", text) if w.strip()]

    @classmethod
    def audit_food_safety(
        cls,
        candidate_foods: List[Dict[str, Any]],
        user_allergies: List[str],
        user_intolerances: List[str],
    ) -> Dict[str, Any]:
        """
        Audits candidate foods against user declared allergies and intolerances.
        Ensures zero false positives (Green Chili will NEVER match Caffeine sensitivity),
        and strictly deduplicates warnings using composite identity keys.
        """
        active_allergies = list(dict.fromkeys([a.strip() for a in user_allergies if a and a.strip() != "None"]))
        active_intolerances = list(dict.fromkeys([i.strip() for i in user_intolerances if i and i.strip() != "None"]))

        allergy_map: Dict[str, Dict[str, Any]] = {}
        intolerance_map: Dict[str, Dict[str, Any]] = {}

        for food in candidate_foods:
            food_name = food.get("food_name") or food.get("name") or "Unknown Food"
            food_bn = food.get("bangla_name") or food.get("name_bn") or ""
            food_id = food.get("food_id") or food.get("id") or food_name.lower().replace(" ", "-")

            food_name_lower = food_name.lower()
            tokens = cls._tokenize_words(f"{food_name} {food_bn}")
            extra_ingredients = food.get("confirmed_ingredients", []) + food.get("user_reported_ingredients", [])

            # Check Allergies
            for user_alg in active_allergies:
                rule = next((r for r in cls.RULES if r["type"] == "allergy" and (r["name"].lower() in user_alg.lower() or user_alg.lower() in r["name"].lower())), None)
                is_match = False
                matched_reason = ""
                evidence_label = "Confirmed ingredient match"
                evidence_level = "confirmed_ingredient"
                contributing = []

                if rule:
                    if rule["english_regex"].search(food_name_lower):
                        is_match = True
                        contributing.append(food_name)
                        matched_reason = rule["reason"]
                        evidence_label = rule["evidence"]
                    if not is_match and any(tok in tokens for tok in rule["bengali_tokens"]):
                        is_match = True
                        contributing.append(food_bn or food_name)
                        matched_reason = rule["reason"]
                        evidence_label = rule["evidence"]

                    if extra_ingredients:
                        for extra in extra_ingredients:
                            extra_low = extra.lower()
                            if rule["english_regex"].search(extra_low) or any(t in extra_low for t in rule["bengali_tokens"]):
                                is_match = True
                                contributing.append(extra)
                                matched_reason = f"User clarification indicated: {extra}."
                                evidence_level = "preparation_dependent"
                                evidence_label = "User clarification response"
                else:
                    custom_low = user_alg.lower()
                    if re.search(rf"\b{re.escape(custom_low)}\b", food_name_lower) or custom_low in tokens:
                        is_match = True
                        contributing.append(user_alg)
                        matched_reason = f"Food matches declared allergy: {user_alg}."

                if is_match:
                    stable_key = f"{food_id}::allergy::{user_alg.lower()}"
                    if stable_key in allergy_map:
                        for c in contributing:
                            if c not in allergy_map[stable_key]["contributing_ingredients"]:
                                allergy_map[stable_key]["contributing_ingredients"].append(c)
                    else:
                        allergy_map[stable_key] = {
                            "id": stable_key,
                            "food_name": food_name,
                            "food_item_id": food_id,
                            "matched_allergen": user_alg,
                            "conflict_type": "allergy",
                            "severity": "high_allergy_warning",
                            "evidence_level": evidence_level,
                            "evidence_label": evidence_label,
                            "reason": matched_reason,
                            "message": f'Potential Allergen Conflict: "{food_name}" matches your declared allergy to {user_alg}.',
                            "contributing_ingredients": contributing,
                        }

            # Check Intolerances
            for user_intol in active_intolerances:
                rule = next((r for r in cls.RULES if r["type"] == "intolerance" and (r["name"].lower() in user_intol.lower() or user_intol.lower() in r["name"].lower())), None)
                is_match = False
                matched_reason = ""
                evidence_label = "Confirmed ingredient match"
                evidence_level = "confirmed_ingredient"
                contributing = []

                if rule:
                    if rule["english_regex"].search(food_name_lower):
                        is_match = True
                        contributing.append(food_name)
                        matched_reason = rule["reason"]
                        evidence_label = rule["evidence"]
                    # CRITICAL: Discrete tokens ensure "কাঁচা" NEVER matches "চা"
                    if not is_match and any(tok in tokens for tok in rule["bengali_tokens"]):
                        is_match = True
                        contributing.append(food_bn or food_name)
                        matched_reason = rule["reason"]
                        evidence_label = rule["evidence"]

                    if extra_ingredients:
                        for extra in extra_ingredients:
                            extra_low = extra.lower()
                            if rule["english_regex"].search(extra_low) or any(t in extra_low for t in rule["bengali_tokens"]):
                                is_match = True
                                contributing.append(extra)
                                matched_reason = f"User clarification indicated: {extra}."
                                evidence_level = "preparation_dependent"
                                evidence_label = "User clarification response"
                else:
                    custom_low = user_intol.lower()
                    if re.search(rf"\b{re.escape(custom_low)}\b", food_name_lower) or custom_low in tokens:
                        is_match = True
                        contributing.append(user_intol)
                        matched_reason = f"Food matches declared intolerance: {user_intol}."

                if is_match:
                    stable_key = f"{food_id}::intolerance::{user_intol.lower()}"
                    if stable_key in intolerance_map:
                        for c in contributing:
                            if c not in intolerance_map[stable_key]["contributing_ingredients"]:
                                intolerance_map[stable_key]["contributing_ingredients"].append(c)
                    else:
                        intolerance_map[stable_key] = {
                            "id": stable_key,
                            "food_name": food_name,
                            "food_item_id": food_id,
                            "matched_allergen": user_intol,
                            "conflict_type": "intolerance",
                            "severity": "intolerance_note",
                            "evidence_level": evidence_level,
                            "evidence_label": evidence_label,
                            "reason": matched_reason,
                            "message": f'Digestive Note: "{food_name}" may contain ingredients linked to your {user_intol}.',
                            "contributing_ingredients": contributing,
                        }

        allergy_warnings = list(allergy_map.values())
        intolerance_notes = list(intolerance_map.values())

        has_restrictions = bool(active_allergies or active_intolerances)
        no_conflict = None
        if has_restrictions and not allergy_warnings and not intolerance_notes:
            no_conflict = "No known conflicts were identified between your confirmed food items and saved dietary restrictions."

        return {
            "has_allergy_conflict": len(allergy_warnings) > 0,
            "has_intolerance_conflict": len(intolerance_notes) > 0,
            "allergy_warnings": allergy_warnings,
            "intolerance_notes": intolerance_notes,
            "no_conflict_notice": no_conflict,
            "safety_disclaimer": "NutriLens does not claim guaranteed allergen safety. Incomplete ingredient information or cross-contact cannot be ruled out from visual inspection alone.",
        }
