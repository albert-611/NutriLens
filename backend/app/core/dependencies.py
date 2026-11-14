from dataclasses import dataclass
from typing import Optional
from fastapi import Header, Depends
from app.core.security import verify_supabase_jwt
from app.core.exceptions import UnauthorizedException

@dataclass
class CurrentUser:
    id: str
    email: Optional[str] = None
    role: Optional[str] = None
    raw_token: Optional[str] = None

async def get_current_user(
    authorization: Optional[str] = Header(None, description="Bearer <token>")
) -> CurrentUser:
    """
    Extracts Bearer token from Authorization header and verifies the Supabase JWT.
    Returns CurrentUser object containing user ID and claims.
    """
    if not authorization:
        raise UnauthorizedException("Missing Authorization header")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise UnauthorizedException("Invalid Authorization format. Expected 'Bearer <token>'")

    token = parts[1]
    payload = verify_supabase_jwt(token)

    return CurrentUser(
        id=payload.get("sub"),
        email=payload.get("email"),
        role=payload.get("role", "authenticated"),
        raw_token=token,
    )

async def get_optional_user(
    authorization: Optional[str] = Header(None, description="Bearer <token>")
) -> Optional[CurrentUser]:
    """
    Optional user dependency for public endpoints that enhance behavior when authenticated.
    """
    if not authorization:
        return None
    try:
        return await get_current_user(authorization)
    except UnauthorizedException:
        return None
