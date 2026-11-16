from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "NutriLens API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app",
    ]

    # Supabase Managed Infrastructure
    SUPABASE_URL: str = "https://ysukhcfigyosuatdpkji.supabase.co"
    SUPABASE_ANON_KEY: str = "sb_publishable_4BTp6dN2YXFZq7-gKq3bsw_EBVLrrGE"
    SUPABASE_JWT_SECRET: str = "your-supabase-jwt-secret-from-dashboard"
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Google Gemini & Gemma API (Dual Model & Failover Support)
    GEMINI_API_KEY: str = ""
    GEMINI_BACKUP_API_KEY: str = ""
    GEMINI_VISION_MODEL: str = "gemini-3.5-flash-lite"
    GEMINI_FALLBACK_MODEL: str = "gemini-3.1-flash-lite"
    GEMINI_CHAT_MODEL: str = "gemma-4-26b"

    # USDA FoodData Central API
    USDA_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
