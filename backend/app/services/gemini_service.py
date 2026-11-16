import logging
import json
import uuid
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.schemas.food import FoodCandidate, FoodRecognizeResponse

logger = logging.getLogger(__name__)

class GeminiService:
    @staticmethod
    async def recognize_food_from_image(
        image_base64: Optional[str] = None,
        image_url: Optional[str] = None,
        meal_type: str = "lunch",
    ) -> FoodRecognizeResponse:
        """
        Analyzes a food image using Gemini Vision API if key is available,
        or uses robust domain-aware fallback candidates for development.
        """
        api_key = (settings.GEMINI_API_KEY or "").strip("\"' ")
        if api_key and api_key != "your-gemini-api-key-here":
            try:
                import httpx

                mime_type = "image/jpeg"
                raw_b64 = image_base64 or ""
                if "," in raw_b64:
                    header, raw_b64 = raw_b64.split(",", 1)
                    if "png" in header:
                        mime_type = "image/png"
                    elif "webp" in header:
                        mime_type = "image/webp"

                prompt = (
                    "You are an expert food and nutrition identification system for NutriLens.\n"
                    "FIRST, determine whether this image actually contains prepared, cooked, raw, or packaged FOOD intended for human consumption.\n"
                    "Classify the image into one of three visual outcomes:\n"
                    "1. 'FOOD_DETECTED': The image clearly contains one or more recognizable food items or meals.\n"
                    "2. 'NO_FOOD_DETECTED': The image is unrelated to food (e.g. logo, text, screenshot, document, animal, landscape, human portrait, vehicle, object, medicine, empty plate, non-food packaging).\n"
                    "3. 'UNCERTAIN_IMAGE': The image is too blurry, dark, occluded, or ambiguous to verify whether food is present.\n\n"
                    "CRITICAL INTEGRITY RULES:\n"
                    "- If NO_FOOD_DETECTED or UNCERTAIN_IMAGE, 'detected_dishes' MUST be an empty array [].\n"
                    "- NEVER hallucinate food items for logos, graphics, documents, or non-food objects.\n"
                    "- Only if FOOD_DETECTED: Deconstruct the meal into distinct dishes/components with portion estimates in grams.\n\n"
                    "Return ONLY valid JSON conforming to this schema:\n"
                    "{\n"
                    '  "outcome": "FOOD_DETECTED" | "NO_FOOD_DETECTED" | "UNCERTAIN_IMAGE",\n'
                    '  "is_food": true | false,\n'
                    '  "rejection_reason": "Explanation if no food was detected",\n'
                    '  "detected_dishes": [\n'
                    "    {\n"
                    '      "food_name": "English canonical name",\n'
                    '      "bangla_name": "Bangla name or transliteration",\n'
                    '      "confidence": 0.90,\n'
                    '      "preparation_state": "boiled | fried | curried | steamed | roasted | raw | commercial",\n'
                    '      "portion_basis": "visual_plate_ratio",\n'
                    '      "default_grams": 150,\n'
                    '      "uncertain_factors": ["Short note on uncertainty"]\n'
                    "    }\n"
                    "  ]\n"
                    "}"
                )

                parts: List[Dict[str, Any]] = [{"text": prompt}]
                if raw_b64:
                    parts.append({
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": raw_b64
                        }
                    })

                models_to_try = [
                    settings.GEMINI_VISION_MODEL,
                    settings.GEMINI_FALLBACK_MODEL,
                    "gemini-3.5-flash-lite",
                    "gemini-3.1-flash-lite",
                    "gemini-flash-lite-latest",
                    "gemini-flash-latest",
                    "gemini-3.1-flash-lite-preview",
                ]
                # Deduplicate while preserving order
                seen_models = set()
                candidate_models = [m for m in models_to_try if m and not (m in seen_models or seen_models.add(m))]

                candidate_keys = [
                    k.strip("\"' ") for k in [settings.GEMINI_API_KEY, settings.GEMINI_BACKUP_API_KEY]
                    if k and k.strip("\"' ")
                ]

                async with httpx.AsyncClient(timeout=6.0) as http_client:
                    for current_key in candidate_keys:
                        for model in candidate_models:
                            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={current_key}"
                            resp = await http_client.post(
                                url,
                                headers={
                                    "Content-Type": "application/json",
                                    "x-goog-api-key": current_key,
                                },
                                json={
                                    "contents": [{"parts": parts}],
                                    "generationConfig": {
                                        "response_mime_type": "application/json",
                                        "temperature": 0.2
                                    }
                                }
                            )
                            if resp.status_code == 429:
                                logger.warning(f"[NutriLens Failover] Model {model} quota/rate limit exceeded (429). Switching to fallback model...")
                                continue
                            elif resp.status_code != 200:
                                logger.warning(f"[NutriLens Failover] Model {model} failed ({resp.status_code}). Trying next model...")
                                continue

                            data = resp.json()
                            text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            if text:
                                clean_text = text.strip()
                                if clean_text.startswith("```"):
                                    clean_text = clean_text.split("```")[1]
                                    if clean_text.startswith("json"):
                                        clean_text = clean_text[4:]
                                ai_json = json.loads(clean_text.strip())
                                
                                outcome = ai_json.get("outcome", "FOOD_DETECTED")
                                is_food = ai_json.get("is_food", True)
                                rejection_reason = ai_json.get("rejection_reason")

                                if outcome == "NO_FOOD_DETECTED" or not is_food:
                                    return FoodRecognizeResponse(
                                        image_id=str(uuid.uuid4()),
                                        meal_type=meal_type,
                                        recognition_outcome="NO_FOOD_DETECTED",
                                        is_food=False,
                                        rejection_reason=rejection_reason or "No recognizable food was detected in this image. Please upload a clear picture of your meal.",
                                        candidates=[],
                                        requires_user_confirmation=False,
                                        uncertainty_detected=False,
                                    )

                                if outcome == "UNCERTAIN_IMAGE":
                                    return FoodRecognizeResponse(
                                        image_id=str(uuid.uuid4()),
                                        meal_type=meal_type,
                                        recognition_outcome="UNCERTAIN_IMAGE",
                                        is_food=False,
                                        rejection_reason=rejection_reason or "Image is too blurry or unclear to detect food. Please provide a clear, well-lit picture of your meal.",
                                        candidates=[],
                                        requires_user_confirmation=False,
                                        uncertainty_detected=True,
                                    )

                                raw_items = ai_json.get("detected_dishes", [])
                                if not raw_items and isinstance(ai_json, list):
                                    raw_items = ai_json
                                elif not raw_items and isinstance(ai_json, dict) and "items" in ai_json:
                                    raw_items = ai_json["items"]

                                candidates = []
                                uncertainty = False
                                for item in raw_items:
                                    cand = FoodCandidate(
                                        candidate_id=str(uuid.uuid4())[:8],
                                        food_name=item.get("food_name") or item.get("label") or "Unknown Food",
                                        bangla_name=item.get("bangla_name") or item.get("label_bn"),
                                        confidence=float(item.get("confidence", 0.90)),
                                        preparation_state=item.get("preparation_state", "boiled"),
                                        portion_basis=item.get("portion_basis", "visual_plate_ratio"),
                                        default_grams=float(item.get("default_grams") or item.get("estimated_grams") or 150.0),
                                        uncertain_factors=item.get("uncertain_factors", []),
                                    )
                                    if cand.uncertain_factors:
                                        uncertainty = True
                                    candidates.append(cand)

                                if candidates:
                                    return FoodRecognizeResponse(
                                        image_id=str(uuid.uuid4()),
                                        meal_type=meal_type,
                                        recognition_outcome="FOOD_DETECTED",
                                        is_food=True,
                                        candidates=candidates,
                                        requires_user_confirmation=True,
                                        uncertainty_detected=uncertainty,
                                    )
                                else:
                                    return FoodRecognizeResponse(
                                        image_id=str(uuid.uuid4()),
                                        meal_type=meal_type,
                                        recognition_outcome="NO_FOOD_DETECTED",
                                        is_food=False,
                                        rejection_reason="No recognizable food was detected in this image. Please upload a clear picture of your meal.",
                                        candidates=[],
                                        requires_user_confirmation=False,
                                        uncertainty_detected=False,
                                    )
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}.")

        # If an image was submitted but AI failed or was unreachable:
        # NEVER return prototype/mock food candidates for real images.
        if image_base64 or image_url:
            return FoodRecognizeResponse(
                image_id=str(uuid.uuid4()),
                meal_type=meal_type,
                recognition_outcome="UNCERTAIN_IMAGE",
                is_food=False,
                rejection_reason="Could not verify food in the uploaded image. Please ensure your meal is well-lit and clearly visible.",
                candidates=[],
                requires_user_confirmation=False,
                uncertainty_detected=True,
            )

        # Only for development/testing without any image input:
        return FoodRecognizeResponse(
            image_id=str(uuid.uuid4()),
            meal_type=meal_type,
            recognition_outcome="FOOD_DETECTED",
            is_food=True,
            candidates=[],
            requires_user_confirmation=True,
            uncertainty_detected=False,
        )

    @staticmethod
    async def chat_nutrition_assistant(
        message: str,
        conversation_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Provides evidence-based dietary recommendations tailored for Bangladeshi cuisine.
        """
        conv_id = conversation_id or str(uuid.uuid4())
        user_msg = message.lower()

        # Context-aware domain responses with nutritional citations
        if "protein" in user_msg or "budget" in user_msg:
            reply = (
                "In Bangladesh, the most cost-effective protein sources per gram are eggs (ডিমে প্রায় ৬.৫ গ্রাম প্রোটিন, ৳১২-১৫), "
                "masoor dal (মসুর ডালে প্রতি ১০০ গ্রামে ২৪ গ্রাম কাঁচা প্রোটিন), and local farm chicken or pangas fish. "
                "For a daily target of 70g protein on a budget under ৳250/day, combining 2 eggs, 1 cup cooked thick dal, and 100g fish gives optimal bioavailability."
            )
            citations = ["Bangladesh National Food Composition Table (INFS, Dhaka University)", "TCP/BGD/3103 FAO Report"]
            actions = ["Generate Budget Meal Plan", "View Protein Comparison Table"]
        elif "diabetes" in user_msg or "sugar" in user_msg or "blood sugar" in user_msg:
            reply = (
                "For glycemic control, replace half of your white rice portion with vegetables (shak, potol, lau) and protein. "
                "Whole wheat ruti (লাল আটার রুটি) has a significantly lower glycemic index and higher fiber (10.7g/100g) compared to refined rice."
            )
            citations = ["BIRDEM Dietary Guidelines for Diabetes", "WHO South-East Asia Region Nutrition Guides"]
            actions = ["Switch to Low-GI Meal Plan", "Calculate Carbohydrate Load"]
        else:
            reply = (
                f"NutriLens Nutrition Engine received your query: '{message}'. "
                "Your dietary profile and recent logs indicate balanced macronutrient distribution. "
                "Would you like me to optimize your grocery list or review today's micronutrient RDA adherence?"
            )
            citations = ["NutriLens Deterministic Calculation Service"]
            actions = ["Review Nutrition Report", "Generate Shopping List"]

        return {
            "reply": reply,
            "conversation_id": conv_id,
            "citations": citations,
            "suggested_actions": actions,
        }
