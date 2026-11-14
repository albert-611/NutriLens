from fastapi import APIRouter, Depends
from app.schemas.common import ResponseEnvelope
from app.schemas.assistant import AssistantChatRequest, AssistantChatResponse
from app.core.dependencies import get_current_user, CurrentUser
from app.services.gemini_service import GeminiService

router = APIRouter(prefix="/assistant", tags=["Nutrition Assistant"])

@router.post("/chat", response_model=ResponseEnvelope[AssistantChatResponse])
async def chat_with_assistant(
    request: AssistantChatRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Context-aware nutrition assistant providing culturally aligned guidance
    for Bangladeshi diets, diabetes management, and budget meal planning.
    """
    res = await GeminiService.chat_nutrition_assistant(
        message=request.message,
        conversation_id=request.conversation_id,
        context=request.client_context,
    )
    return ResponseEnvelope(
        data=AssistantChatResponse(
            reply=res["reply"],
            conversation_id=res["conversation_id"],
            citations=res["citations"],
            suggested_actions=res["suggested_actions"],
        )
    )
