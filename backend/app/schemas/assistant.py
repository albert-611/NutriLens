from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ChatMessageItem(BaseModel):
    id: str
    role: str # 'user' | 'assistant' | 'system'
    content: str
    created_at: str
    metadata: Optional[Dict[str, Any]] = None

class AssistantChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_id: Optional[str] = None
    client_context: Optional[Dict[str, Any]] = None

class AssistantChatResponse(BaseModel):
    reply: str
    conversation_id: str
    message_id: str
    citations: List[str] = []
    suggested_actions: List[str] = []
    model_used: Optional[str] = None
    provider: Optional[str] = None
    created_at: Optional[str] = None

class ConversationSummary(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    last_message_preview: Optional[str] = None

class ConversationDetail(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    messages: List[ChatMessageItem] = []

class CreateConversationRequest(BaseModel):
    title: Optional[str] = Field("New Conversation", max_length=120)

class UpdateConversationRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
