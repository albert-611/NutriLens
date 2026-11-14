from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, Any, List

T = TypeVar("T")

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None

class ErrorEnvelope(BaseModel):
    success: bool = False
    error: ErrorDetail

class ResponseEnvelope(BaseModel, Generic[T]):
    success: bool = True
    data: T
    error: Optional[ErrorDetail] = None
