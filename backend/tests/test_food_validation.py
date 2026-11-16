import inspect
import json
from unittest.mock import AsyncMock, patch
import pytest
from app.core.dependencies import CurrentUser
from app.api.v1.food_recognition import recognize_food
from app.schemas.food import FoodRecognizeRequest, FoodRecognizeResponse, FoodCandidate

USER = CurrentUser(id="00000000-0000-0000-0000-000000000001", email="user@nutrilens.app", role="authenticated")

def run_sync(coro):
    stack = [coro]
    val = None
    while stack:
        top = stack[-1]
        try:
            nxt = top.send(val)
            if inspect.iscoroutine(nxt):
                stack.append(nxt)
                val = None
            else:
                val = nxt
        except StopIteration as e:
            stack.pop()
            val = e.value
    return val

# Scenario 1: NutriLens Logo
def test_scenario_1_nutrilens_logo_rejected():
    mock_resp = FoodRecognizeResponse(
        image_id="logo-1",
        meal_type="lunch",
        recognition_outcome="NO_FOOD_DETECTED",
        is_food=False,
        rejection_reason="Image appears to be a brand logo or graphic graphic, not food.",
        candidates=[],
        requires_user_confirmation=False,
    )
    with patch("app.api.v1.food_recognition.GeminiService.recognize_food_from_image", new_callable=AsyncMock) as mock_fn:
        mock_fn.return_value = mock_resp
        req = FoodRecognizeRequest(image_base64="data:image/png;base64,nutrilenslogo", meal_type="lunch")
        res = run_sync(recognize_food(request=req, current_user=USER))
        assert res.status_code == 422
        body = json.loads(res.body.decode("utf-8"))
        assert body["status"] == "NON_FOOD_IMAGE"
        assert body["data"]["food_items"] == []
        assert body["data"]["candidate_count"] == 0

# Scenario 2: Random Screenshot
def test_scenario_2_screenshot_rejected():
    mock_resp = FoodRecognizeResponse(
        image_id="screenshot-2",
        meal_type="lunch",
        recognition_outcome="NO_FOOD_DETECTED",
        is_food=False,
        rejection_reason="Image is an operating system UI or app screenshot.",
        candidates=[],
    )
    with patch("app.api.v1.food_recognition.GeminiService.recognize_food_from_image", new_callable=AsyncMock) as mock_fn:
        mock_fn.return_value = mock_resp
        req = FoodRecognizeRequest(image_base64="data:image/png;base64,screenshot", meal_type="lunch")
        res = run_sync(recognize_food(request=req, current_user=USER))
        assert res.status_code == 422
        body = json.loads(res.body.decode("utf-8"))
        assert body["status"] == "NON_FOOD_IMAGE"
        assert body["data"]["candidate_count"] == 0

# Scenario 3: PDF / Document Image
def test_scenario_3_document_pdf_rejected():
    mock_resp = FoodRecognizeResponse(
        image_id="doc-3",
        meal_type="lunch",
        recognition_outcome="NO_FOOD_DETECTED",
        is_food=False,
        rejection_reason="Image contains paper text, printed document, or book page.",
        candidates=[],
    )
    with patch("app.api.v1.food_recognition.GeminiService.recognize_food_from_image", new_callable=AsyncMock) as mock_fn:
        mock_fn.return_value = mock_resp
        req = FoodRecognizeRequest(image_base64="data:image/png;base64,document", meal_type="lunch")
        res = run_sync(recognize_food(request=req, current_user=USER))
        assert res.status_code == 422
        body = json.loads(res.body.decode("utf-8"))
        assert body["status"] == "NON_FOOD_IMAGE"

# Scenario 4: Human Portrait / Selfie
def test_scenario_4_human_portrait_rejected():
    mock_resp = FoodRecognizeResponse(
        image_id="portrait-4",
        meal_type="lunch",
        recognition_outcome="NO_FOOD_DETECTED",
        is_food=False,
        rejection_reason="Image is a human portrait without visible meal.",
        candidates=[],
    )
    with patch("app.api.v1.food_recognition.GeminiService.recognize_food_from_image", new_callable=AsyncMock) as mock_fn:
        mock_fn.return_value = mock_resp
        req = FoodRecognizeRequest(image_base64="data:image/jpeg;base64,portrait", meal_type="lunch")
        res = run_sync(recognize_food(request=req, current_user=USER))
        assert res.status_code == 422
        body = json.loads(res.body.decode("utf-8"))
        assert body["status"] == "NON_FOOD_IMAGE"

# Scenario 5: Landscape Photograph
def test_scenario_5_landscape_photograph_rejected():
    mock_resp = FoodRecognizeResponse(
        image_id="landscape-5",
        meal_type="lunch",
        recognition_outcome="NO_FOOD_DETECTED",
        is_food=False,
        rejection_reason="Image shows outdoor nature landscape.",
        candidates=[],
    )
    with patch("app.api.v1.food_recognition.GeminiService.recognize_food_from_image", new_callable=AsyncMock) as mock_fn:
        mock_fn.return_value = mock_resp
        req = FoodRecognizeRequest(image_base64="data:image/jpeg;base64,mountain", meal_type="lunch")
        res = run_sync(recognize_food(request=req, current_user=USER))
        assert res.status_code == 422
        body = json.loads(res.body.decode("utf-8"))
        assert body["status"] == "NON_FOOD_IMAGE"

# Scenario 6: Empty or Corrupted Image
def test_scenario_6_empty_or_corrupted_image_rejected():
    mock_resp = FoodRecognizeResponse(
        image_id="corrupt-6",
        meal_type="lunch",
        recognition_outcome="UNCERTAIN_IMAGE",
        is_food=False,
        rejection_reason="Image is empty, unreadable, or corrupted.",
        candidates=[],
        uncertainty_detected=True,
    )
    with patch("app.api.v1.food_recognition.GeminiService.recognize_food_from_image", new_callable=AsyncMock) as mock_fn:
        mock_fn.return_value = mock_resp
        req = FoodRecognizeRequest(image_base64="data:image/jpeg;base64,corrupt", meal_type="lunch")
        res = run_sync(recognize_food(request=req, current_user=USER))
        assert res.status_code == 422
        body = json.loads(res.body.decode("utf-8"))
        assert body["status"] == "UNCERTAIN_IMAGE"
        assert body["data"]["candidate_count"] == 0

# Scenario 7: Clear photograph of single food
def test_scenario_7_single_food_success():
    mock_resp = FoodRecognizeResponse(
        image_id="apple-7",
        meal_type="snack",
        recognition_outcome="FOOD_DETECTED",
        is_food=True,
        candidates=[
            FoodCandidate(
                candidate_id="cand-apple",
                food_name="Fresh Red Apple",
                bangla_name="আপেল",
                confidence=0.98,
                preparation_state="raw",
                default_grams=180.0,
            )
        ],
        requires_user_confirmation=True,
    )
    with patch("app.api.v1.food_recognition.GeminiService.recognize_food_from_image", new_callable=AsyncMock) as mock_fn:
        mock_fn.return_value = mock_resp
        req = FoodRecognizeRequest(image_base64="data:image/jpeg;base64,apple", meal_type="snack")
        res = run_sync(recognize_food(request=req, current_user=USER))
        assert res.data.recognition_outcome == "FOOD_DETECTED"
        assert len(res.data.candidates) == 1
        assert res.data.candidates[0].food_name == "Fresh Red Apple"

# Scenario 8: Clear photograph containing multiple foods
def test_scenario_8_multiple_foods_success():
    mock_resp = FoodRecognizeResponse(
        image_id="thali-8",
        meal_type="lunch",
        recognition_outcome="FOOD_DETECTED",
        is_food=True,
        candidates=[
            FoodCandidate(
                candidate_id="cand-rice",
                food_name="Steamed White Rice",
                bangla_name="সিদ্ধ সাদা ভাত",
                confidence=0.96,
                preparation_state="boiled",
                default_grams=200.0,
            ),
            FoodCandidate(
                candidate_id="cand-fish",
                food_name="Rohu Fish Curry",
                bangla_name="রুই মাছের ঝোল",
                confidence=0.92,
                preparation_state="curried",
                default_grams=180.0,
            ),
        ],
        requires_user_confirmation=True,
    )
    with patch("app.api.v1.food_recognition.GeminiService.recognize_food_from_image", new_callable=AsyncMock) as mock_fn:
        mock_fn.return_value = mock_resp
        req = FoodRecognizeRequest(image_base64="data:image/jpeg;base64,thali", meal_type="lunch")
        res = run_sync(recognize_food(request=req, current_user=USER))
        assert res.data.recognition_outcome == "FOOD_DETECTED"
        assert len(res.data.candidates) == 2

# Scenario 9: Blurry photograph of food
def test_scenario_9_blurry_food_photograph_rejected():
    mock_resp = FoodRecognizeResponse(
        image_id="blurry-9",
        meal_type="dinner",
        recognition_outcome="UNCERTAIN_IMAGE",
        is_food=False,
        rejection_reason="Image is severely out of focus or motion-blurred.",
        candidates=[],
        uncertainty_detected=True,
    )
    with patch("app.api.v1.food_recognition.GeminiService.recognize_food_from_image", new_callable=AsyncMock) as mock_fn:
        mock_fn.return_value = mock_resp
        req = FoodRecognizeRequest(image_base64="data:image/jpeg;base64,blurry", meal_type="dinner")
        res = run_sync(recognize_food(request=req, current_user=USER))
        assert res.status_code == 422
        body = json.loads(res.body.decode("utf-8"))
        assert body["status"] == "UNCERTAIN_IMAGE"
        assert body["data"]["candidate_count"] == 0

# Scenario 10: Food packaging rather than prepared food
def test_scenario_10_food_packaging_rejection():
    mock_resp = FoodRecognizeResponse(
        image_id="box-10",
        meal_type="snack",
        recognition_outcome="UNCERTAIN_IMAGE",
        is_food=False,
        rejection_reason="Image shows unopened commercial packaging or cardboard box rather than prepared edible food.",
        candidates=[],
        uncertainty_detected=True,
    )
    with patch("app.api.v1.food_recognition.GeminiService.recognize_food_from_image", new_callable=AsyncMock) as mock_fn:
        mock_fn.return_value = mock_resp
        req = FoodRecognizeRequest(image_base64="data:image/jpeg;base64,box", meal_type="snack")
        res = run_sync(recognize_food(request=req, current_user=USER))
        assert res.status_code == 422
        body = json.loads(res.body.decode("utf-8"))
        assert body["status"] == "UNCERTAIN_IMAGE"
        assert body["data"]["candidate_count"] == 0


# Scenario 11: AI Detects 2 Visible Eggs
def test_scenario_11_ai_detects_two_eggs():
    mock_resp = FoodRecognizeResponse(
        image_id="eggs-11",
        meal_type="breakfast",
        recognition_outcome="FOOD_DETECTED",
        is_food=True,
        candidates=[
            FoodCandidate(
                candidate_id="cand-eggs",
                food_name="Boiled Chicken Egg",
                bangla_name="সিদ্ধ ডিম",
                confidence=0.96,
                preparation_state="boiled",
                default_grams=110.0,
                is_countable=True,
                detected_count=2.0,
                count_unit="egg",
                identity_confidence=0.98,
                count_confidence=0.95,
                weight_confidence=0.90,
            )
        ],
        requires_user_confirmation=True,
    )
    with patch("app.api.v1.food_recognition.GeminiService.recognize_food_from_image", new_callable=AsyncMock) as mock_fn:
        mock_fn.return_value = mock_resp
        req = FoodRecognizeRequest(image_base64="data:image/jpeg;base64,twoeggs", meal_type="breakfast")
        res = run_sync(recognize_food(request=req, current_user=USER))
        assert res.data.recognition_outcome == "FOOD_DETECTED"
        cand = res.data.candidates[0]
        assert cand.is_countable is True
        assert cand.detected_count == 2.0
        assert cand.count_unit == "egg"
        assert cand.default_grams == 110.0

# Scenario 12: AI Detects 3 Bananas
def test_scenario_12_ai_detects_three_bananas():
    mock_resp = FoodRecognizeResponse(
        image_id="bananas-12",
        meal_type="snack",
        recognition_outcome="FOOD_DETECTED",
        is_food=True,
        candidates=[
            FoodCandidate(
                candidate_id="cand-banana",
                food_name="Banana (Sagor Kola)",
                bangla_name="সাগর কলা",
                confidence=0.95,
                preparation_state="raw",
                default_grams=300.0,
                is_countable=True,
                detected_count=3.0,
                count_unit="banana",
                identity_confidence=0.96,
                count_confidence=0.92,
                weight_confidence=0.85,
            )
        ],
        requires_user_confirmation=True,
    )
    with patch("app.api.v1.food_recognition.GeminiService.recognize_food_from_image", new_callable=AsyncMock) as mock_fn:
        mock_fn.return_value = mock_resp
        req = FoodRecognizeRequest(image_base64="data:image/jpeg;base64,threebananas", meal_type="snack")
        res = run_sync(recognize_food(request=req, current_user=USER))
        cand = res.data.candidates[0]
        assert cand.is_countable is True
        assert cand.detected_count == 3.0
        assert cand.default_grams == 300.0

# Scenario 13: AI Detects Biscuit Packet (Packaging detected, net weight not assumed)
def test_scenario_13_ai_detects_biscuit_packet():
    mock_resp = FoodRecognizeResponse(
        image_id="biscuit-pkg-13",
        meal_type="snack",
        recognition_outcome="FOOD_DETECTED",
        is_food=True,
        candidates=[
            FoodCandidate(
                candidate_id="cand-biscuit-pkg",
                food_name="Biscuits, packaged",
                bangla_name="বিস্কুট প্যাকেট",
                confidence=0.92,
                preparation_state="commercial",
                default_grams=75.0,
                is_countable=True,
                detected_count=1.0,
                count_unit="packet",
                packaging_detected=True,
                package_net_weight_grams=None,  # User must confirm net weight!
                uncertain_factors=["Packet net weight unverified on label; confirm package size in grams"],
            )
        ],
        requires_user_confirmation=True,
        uncertainty_detected=True,
    )
    with patch("app.api.v1.food_recognition.GeminiService.recognize_food_from_image", new_callable=AsyncMock) as mock_fn:
        mock_fn.return_value = mock_resp
        req = FoodRecognizeRequest(image_base64="data:image/jpeg;base64,biscuitpack", meal_type="snack")
        res = run_sync(recognize_food(request=req, current_user=USER))
        cand = res.data.candidates[0]
        assert cand.packaging_detected is True
        assert cand.count_unit == "packet"
        assert cand.package_net_weight_grams is None
        assert "Packet net weight unverified" in cand.uncertain_factors[0]
