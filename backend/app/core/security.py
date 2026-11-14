import logging
import jwt
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.core.config import settings
from app.core.exceptions import UnauthorizedException

logger = logging.getLogger(__name__)

def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Verifies and decodes a Supabase JWT.
    Extracts claims: sub (user_id), email, role, exp.
    """
    if not token:
        raise UnauthorizedException("No bearer token provided")

    jwt_secret = settings.SUPABASE_JWT_SECRET
    is_placeholder_secret = (
        not jwt_secret or 
        jwt_secret == "your-supabase-jwt-secret-from-dashboard"
    )

    try:
        if not is_placeholder_secret:
            # Full cryptographically verified decode
            # Supabase JWTs typically use HS256 with project JWT secret
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                },
                audience="authenticated",
            )
        else:
            # Development fallback when secret is not yet configured in .env
            logger.warning(
                "SUPABASE_JWT_SECRET is unset or using placeholder. "
                "Decoding token without cryptographic signature verification for local testing."
            )
            payload = jwt.decode(
                token,
                options={
                    "verify_signature": False,
                    "verify_exp": True,
                },
            )

        # Validate subject (UUID)
        user_id = payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Token missing 'sub' claim")

        # Check expiration manually as double check
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(timezone.utc):
            raise UnauthorizedException("Token has expired")

        return payload

    except jwt.ExpiredSignatureError:
        raise UnauthorizedException("Authentication token has expired")
    except jwt.InvalidTokenError as e:
        raise UnauthorizedException(f"Invalid authentication token: {str(e)}")
    except Exception as e:
        raise UnauthorizedException(f"Authentication verification failed: {str(e)}")
