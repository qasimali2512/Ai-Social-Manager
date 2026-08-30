from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str

    DEMO_USER_ID: str = "00000000-0000-0000-0000-000000000001"

    FRONTEND_URL: str = "http://localhost:5173"

    N8N_CONTENT_WEBHOOK_URL: str = (
        "http://localhost:5678/webhook/generate-content"
    )

    N8N_APPROVAL_WEBHOOK_URL: str = (
        "http://localhost:5678/webhook/approval"
    )

    REQUIRE_AUTH: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()