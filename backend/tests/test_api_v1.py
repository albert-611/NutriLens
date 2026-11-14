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

def test_food_recognition_flow(client, auth_headers):
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
    payload = {
        "message": "What is the best budget protein source in Dhaka?"
    }
    response = client.post("/api/v1/assistant/chat", json=payload, headers=auth_headers)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "reply" in res["data"]
    assert len(res["data"]["citations"]) > 0
