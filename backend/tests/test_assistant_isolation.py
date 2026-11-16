import inspect
from unittest.mock import MagicMock, patch, AsyncMock
import pytest
from fastapi import HTTPException
from app.core.dependencies import CurrentUser
from app.services.personal_context_service import PersonalNutritionContextService
from app.services.ai_provider_service import AIProviderService
from app.api.v1.assistant import (
    chat_with_assistant,
    list_conversations,
    create_conversation,
    get_conversation,
    rename_conversation,
    delete_conversation,
)
from app.schemas.assistant import (
    AssistantChatRequest,
    CreateConversationRequest,
    UpdateConversationRequest,
)

USER_A_ID = "00000000-0000-0000-0000-000000000001"
USER_B_ID = "00000000-0000-0000-0000-000000000002"

user_a = CurrentUser(id=USER_A_ID, email="user_a@nutrilens.app", role="authenticated")
user_b = CurrentUser(id=USER_B_ID, email="user_b@nutrilens.app", role="authenticated")

def run_sync(coro):
    """
    Lightweight, deterministic coroutine runner that avoids socket-pair
    deadlocks in sandbox environments.
    """
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

@pytest.fixture(autouse=True)
def mock_supabase_and_ai():
    mock_client = MagicMock()
    mock_client.table.side_effect = Exception("Offline testing mode")

    mock_ai_response = {
        "reply": "Based on your verified nutrition goals and personal preferences, I recommend Masoor Dal with steamed rice.",
        "provider": "test_mock",
        "model": "test-model",
        "input_tokens": 120,
        "output_tokens": 45,
        "status": "success",
    }

    async_ai_mock = AsyncMock(return_value=mock_ai_response)

    with patch("supabase.create_client", return_value=mock_client), \
         patch("app.integrations.supabase.get_supabase_client", return_value=mock_client), \
         patch("app.api.v1.assistant.get_supabase_client", return_value=mock_client), \
         patch("app.services.personal_context_service.get_supabase_client", return_value=mock_client), \
         patch.object(AIProviderService, "generate_chat_response", new=async_ai_mock):
        yield

def test_user_a_creates_and_lists_own_conversations():
    """User A creates a conversation and it appears in their own conversation list."""
    async def _test():
        req = CreateConversationRequest(title="User A Private Chat")
        created = await create_conversation(req, current_user=user_a)
        assert created.data.title == "User A Private Chat"
        conv_id = created.data.id

        # List conversations for User A
        listing_a = await list_conversations(current_user=user_a)
        user_a_ids = [c.id for c in listing_a.data]
        assert conv_id in user_a_ids

        # List conversations for User B — User A's conversation MUST NOT be in User B's list
        listing_b = await list_conversations(current_user=user_b)
        user_b_ids = [c.id for c in listing_b.data]
        assert conv_id not in user_b_ids

    run_sync(_test())

def test_cross_user_isolation_rejects_unauthorized_access():
    """
    User A cannot view, retrieve, modify, post to, or delete User B's conversation.
    Supplying User B's conversation ID to User A returns 404 (Access Denied).
    """
    async def _test():
        # 1. User B creates a confidential conversation
        req_b = CreateConversationRequest(title="User B Medical Discussion")
        res_b = await create_conversation(req_b, current_user=user_b)
        conv_b_id = res_b.data.id

        # 2. User A attempts direct retrieval of User B's conversation -> 404
        with pytest.raises(HTTPException) as exc_info:
            await get_conversation(conv_b_id, current_user=user_a)
        assert exc_info.value.status_code == 404

        # 3. User A attempts to send a chat message into User B's conversation -> 404
        with pytest.raises(HTTPException) as exc_info:
            await chat_with_assistant(
                AssistantChatRequest(conversation_id=conv_b_id, message="Attacking conversation"),
                current_user=user_a,
            )
        assert exc_info.value.status_code == 404

        # 4. User A attempts to rename User B's conversation -> 404
        with pytest.raises(HTTPException) as exc_info:
            await rename_conversation(
                conv_b_id,
                UpdateConversationRequest(title="Tampered Title"),
                current_user=user_a,
            )
        assert exc_info.value.status_code == 404

        # 5. User A attempts to delete User B's conversation -> 404
        with pytest.raises(HTTPException) as exc_info:
            await delete_conversation(conv_b_id, current_user=user_a)
        assert exc_info.value.status_code == 404

        # 6. User B can view their conversation unharmed
        conv_detail = await get_conversation(conv_b_id, current_user=user_b)
        assert conv_detail.data.id == conv_b_id
        assert conv_detail.data.title == "User B Medical Discussion"

    run_sync(_test())

def test_chat_interaction_flow_for_user_a():
    """User A sends a nutrition question and receives a personalized response."""
    async def _test():
        chat_req = AssistantChatRequest(message="What should I eat for a high-protein lunch?")
        resp = await chat_with_assistant(chat_req, current_user=user_a)
        assert resp.data.conversation_id is not None
        assert len(resp.data.reply) > 10
        assert len(resp.data.citations) > 0

    run_sync(_test())

def test_personal_context_sanitization_and_allergy_rules():
    """Context builder format_system_prompt strictly enforces clinical boundaries and allergy rules."""
    context = {
        "user_id": USER_A_ID,
        "profile": {"display_name": "Farhan", "biological_sex": "male", "weight": "68 kg"},
        "medical": {"allergies": ["Peanuts", "Shrimp"], "conditions": ["Prediabetes"]},
        "dietary_preferences": {"disliked_foods": ["Fish Curry"]},
        "goals": {"daily_calorie_target": 2000, "daily_protein_target_g": 100},
        "consumption_today": {"calories_consumed": 650, "protein_g_consumed": 42},
    }

    prompt = PersonalNutritionContextService.format_system_prompt(context)
    assert "Farhan" in prompt
    assert "Peanuts" in prompt
    assert "Shrimp" in prompt
    assert "Prediabetes" in prompt
    assert "Fish Curry" in prompt
    assert "2000 kcal" in prompt
    assert "100g" in prompt
    assert "650 kcal" in prompt
    assert "STRICT ALLERGY PROTECTION" in prompt
    assert "NO MEDICAL DIAGNOSIS OR PRESCRIPTIONS" in prompt

def test_offline_domain_knowledge_allergy_alert():
    """Domain knowledge engine immediately issues warnings when declared allergens are mentioned."""
    system_prompt = "User has declared allergy: Peanut."
    reply = AIProviderService._domain_knowledge_reply("Can I eat peanut butter?", system_prompt)
    assert "Allergy Alert" in reply
    assert "peanut" in reply.lower()
