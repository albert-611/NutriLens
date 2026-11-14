from fastapi import APIRouter, Depends
from app.schemas.common import ResponseEnvelope
from app.schemas.user import UserResponse, UserProfileUpdate
from app.core.dependencies import get_current_user, CurrentUser
from app.integrations.supabase import get_supabase_client

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=ResponseEnvelope[UserResponse])
async def get_current_user_profile(
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Retrieve current authenticated user profile using their Supabase JWT.
    Enforces RLS through client token authentication.
    """
    supabase = get_supabase_client(current_user.raw_token)
    profile_data = {}
    try:
        res = supabase.table("profiles").select("*").eq("id", current_user.id).execute()
        if res.data:
            profile_data = res.data[0]
    except Exception:
        # Fallback to token claims if table query encounters error in local development
        profile_data = {"id": current_user.id, "email": current_user.email}

    user_resp = UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        profile=profile_data,
    )
    return ResponseEnvelope(data=user_resp)

@router.patch("/me", response_model=ResponseEnvelope[UserResponse])
async def update_current_user_profile(
    update_data: UserProfileUpdate,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Update the authenticated user's profile and nutritional preferences.
    """
    supabase = get_supabase_client(current_user.raw_token)
    payload = update_data.model_dump(exclude_unset=True)

    profile_data = payload
    try:
        res = supabase.table("profiles").update(payload).eq("id", current_user.id).execute()
        if res.data:
            profile_data = res.data[0]
    except Exception:
        profile_data["id"] = current_user.id

    user_resp = UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        profile=profile_data,
    )
    return ResponseEnvelope(data=user_resp)
