import pytest

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_unauthorized_access_rejected(client):
    # Endpoints under /api/v1 require Authorization header
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
    err = response.json()
    assert err["success"] is False
    assert err["error"]["code"] == "UNAUTHORIZED"

def test_get_current_user_authenticated(client, auth_headers):
    response = client.get("/api/v1/users/me", headers=auth_headers)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["data"]["id"] == "00000000-0000-0000-0000-000000000001"

from unittest.mock import AsyncMock, patch
from app.schemas.food import FoodRecognizeResponse, FoodCandidate

def test_food_recognition_flow(client, auth_headers):
    mock_resp = FoodRecognizeResponse(
        image_id="test-img-001",
        meal_type="lunch",
        recognition_outcome="FOOD_DETECTED",
        is_food=True,
        candidates=[
            FoodCandidate(
                candidate_id="cand-1",
                food_name="Steamed White Rice",
                bangla_name="সাদা ভাত",
                confidence=0.95,
                preparation_state="boiled",
                portion_basis="visual_plate_ratio",
                default_grams=200.0,
                uncertain_factors=["Camera depth uncalibrated"],
            )
        ],
        requires_user_confirmation=True,
        uncertainty_detected=True,
    )
    with patch("app.api.v1.food_recognition.GeminiService.recognize_food_from_image", new_callable=AsyncMock) as mock_recognize:
        mock_recognize.return_value = mock_resp
        payload = {
            "meal_type": "lunch",
            "notes": "Testing camera capture intake"
        }
        response = client.post("/api/v1/food/recognize", json=payload, headers=auth_headers)
        assert response.status_code == 200
        res = response.json()
        assert res["success"] is True
        candidates = res["data"]["candidates"]
        assert len(candidates) > 0
        assert res["data"]["requires_user_confirmation"] is True
        assert res["data"]["recognition_outcome"] == "FOOD_DETECTED"
        assert res["data"]["is_food"] is True

def test_food_recognition_non_food_image_rejected(client, auth_headers):
    # Non-food image (e.g. NutriLens logo, document, selfie, screenshot) must return HTTP 422
    mock_non_food = FoodRecognizeResponse(
        image_id="test-img-logo",
        meal_type="lunch",
        recognition_outcome="NO_FOOD_DETECTED",
        is_food=False,
        rejection_reason="No recognizable food was detected in this image. Please upload a clear picture of your meal.",
        candidates=[],
        requires_user_confirmation=False,
        uncertainty_detected=False,
    )
    with patch("app.api.v1.food_recognition.GeminiService.recognize_food_from_image", new_callable=AsyncMock) as mock_recognize:
        mock_recognize.return_value = mock_non_food
        payload = {
            "image_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "meal_type": "lunch",
        }
        response = client.post("/api/v1/food/recognize", json=payload, headers=auth_headers)
        assert response.status_code == 422
        res = response.json()
        assert res["success"] is False
        assert res["status"] == "NON_FOOD_IMAGE"
        assert res["message"] == "No recognizable food was detected in this image. Please upload a clear picture of your meal."
        assert res["data"]["food_items"] == []
        assert res["data"]["candidate_count"] == 0
        assert res["data"]["nutrition"] is None

def test_food_recognition_uncertain_image_rejected(client, auth_headers):
    mock_uncertain = FoodRecognizeResponse(
        image_id="test-img-blurry",
        meal_type="lunch",
        recognition_outcome="UNCERTAIN_IMAGE",
        is_food=False,
        rejection_reason="Image is too blurry or unclear to detect food. Please provide a clear, well-lit picture of your meal.",
        candidates=[],
        requires_user_confirmation=False,
        uncertainty_detected=True,
    )
    with patch("app.api.v1.food_recognition.GeminiService.recognize_food_from_image", new_callable=AsyncMock) as mock_recognize:
        mock_recognize.return_value = mock_uncertain
        payload = {
            "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
            "meal_type": "lunch",
        }
        response = client.post("/api/v1/food/recognize", json=payload, headers=auth_headers)
        assert response.status_code == 422
        res = response.json()
        assert res["success"] is False
        assert res["status"] == "UNCERTAIN_IMAGE"
        assert res["data"]["candidate_count"] == 0

def test_nutrition_calculate_endpoint(client, auth_headers):
    payload = {
        "items": [
            {
                "food_name": "Steamed White Rice",
                "portion_grams": 150.0,
                "preparation_state": "boiled"
            },
            {
                "food_name": "Chicken Curry",
                "portion_grams": 120.0,
                "preparation_state": "gravy"
            }
        ]
    }
    response = client.post("/api/v1/nutrition/calculate", json=payload, headers=auth_headers)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["data"]["total_nutrients"]["calories"] > 0
    assert len(res["data"]["items"]) == 2

def test_meal_plan_generation(client, auth_headers):
    payload = {
        "days": 7,
        "target_calories_daily": 2100,
        "weekly_budget_bdt": 2200.0,
    }
    response = client.post("/api/v1/meal-plans/generate", json=payload, headers=auth_headers)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert len(res["data"]["days"]) == 7
    assert res["data"]["total_cost_bdt"] > 0

def test_markets_and_prices(client, auth_headers):
    # Markets list
    res_mkt = client.get("/api/v1/markets", headers=auth_headers)
    assert res_mkt.status_code == 200
    assert len(res_mkt.json()["data"]) >= 5

    # Prices list
    res_prices = client.get("/api/v1/markets/prices", headers=auth_headers)
    assert res_prices.status_code == 200
    assert len(res_prices.json()["data"]) >= 5

def test_assistant_chat(client, auth_headers):
    mock_ai_res = {
        "reply": "Based on your verified nutrition goals and personal preferences, I recommend Masoor Dal with steamed rice.",
        "model": "test-model",
        "provider": "mock",
    }
    with patch("app.api.v1.assistant.AIProviderService.generate_chat_response", new_callable=AsyncMock) as mock_chat:
        mock_chat.return_value = mock_ai_res
        payload = {
            "message": "What is the best budget protein source in Dhaka?"
        }
        response = client.post("/api/v1/assistant/chat", json=payload, headers=auth_headers)
        assert response.status_code == 200
        res = response.json()
        assert res["success"] is True
        assert "reply" in res["data"]
