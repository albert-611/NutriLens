from typing import Optional
from supabase import create_client, Client
from app.core.config import settings

def get_supabase_client(access_token: Optional[str] = None) -> Client:
    """
    Returns a Supabase client. If access_token is provided, sets the Authorization header
    so that queries are executed under the user's RLS context.
    """
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    if access_token:
        client.postgrest.auth(access_token)
    return client

def get_service_role_client() -> Optional[Client]:
    """
    Returns a privileged service-role client for background/system operations.
    Returns None if SUPABASE_SERVICE_ROLE_KEY is not configured.
    """
    if not settings.SUPABASE_SERVICE_ROLE_KEY:
        return None
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
