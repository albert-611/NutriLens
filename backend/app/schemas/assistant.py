from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AssistantChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: Optional[str] = None
    client_context: Optional[Dict[str, Any]] = None

class AssistantChatResponse(BaseModel):
    reply: str
    conversation_id: str
    citations: List[str] = []
    suggested_actions: List[str] = []
