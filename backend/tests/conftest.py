import pytest
import jwt
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.core.config import settings
from app.main import app

@pytest.fixture(autouse=True)
def mock_external_services():
    # 1. Mock Supabase client
    mock_client = MagicMock()
    mock_table = MagicMock()
    mock_query = MagicMock()
    mock_res = MagicMock()
    mock_res.data = [{
        "id": "00000000-0000-0000-0000-000000000001",
        "email": "testuser@nutrilens.app",
        "full_name": "Test User",
        "age": 28,
        "daily_calorie_target": 2000,
    }]
    mock_query.execute.return_value = mock_res
    mock_query.eq.return_value = mock_query
    mock_table.select.return_value = mock_query
    mock_table.update.return_value = mock_query
    mock_table.insert.return_value = mock_query
    mock_client.table.return_value = mock_table

    # 2. Disable network AI API calls during tests to avoid socket hangs
    original_gemini_key = settings.GEMINI_API_KEY
    original_backup_key = settings.GEMINI_BACKUP_API_KEY
    settings.GEMINI_API_KEY = ""
    settings.GEMINI_BACKUP_API_KEY = ""

    with patch("app.integrations.supabase.get_supabase_client", return_value=mock_client), \
         patch("app.api.v1.users.get_supabase_client", return_value=mock_client), \
         patch("app.api.v1.assistant.get_supabase_client", return_value=mock_client), \
         patch("app.services.personal_context_service.get_supabase_client", return_value=mock_client), \
         patch("app.api.v1.food_recognition.get_supabase_client", return_value=mock_client):
        yield mock_client

    settings.GEMINI_API_KEY = original_gemini_key
    settings.GEMINI_BACKUP_API_KEY = original_backup_key

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def mock_user_token():
    payload = {
        "sub": "00000000-0000-0000-0000-000000000001",
        "email": "testuser@nutrilens.app",
        "role": "authenticated",
        "aud": "authenticated",
        "exp": 2500000000,  # Far future
    }
    # Use 32+ byte secret to avoid HMAC key length warning
    return jwt.encode(payload, "super-secure-32-byte-secret-key-for-test-suite", algorithm="HS256")

@pytest.fixture
def auth_headers(mock_user_token):
    return {"Authorization": f"Bearer {mock_user_token}"}
