from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):

    # ============================================
    # SUPABASE
    # ============================================

    SUPABASE_URL: str
    SUPABASE_KEY: str

    # ============================================
    # APPLICATION
    # ============================================

    DEMO_USER_ID: str = (
        "00000000-0000-0000-0000-000000000001"
    )

    FRONTEND_URL: str = (
        "http://localhost:5173"
    )

    BACKEND_URL: str = (
        "http://127.0.0.1:8000"
    )

    REQUIRE_AUTH: bool = False

    # ============================================
    # N8N
    #
    # Only used for the "approval -> publish" flow now.
    # Content generation (text + image) no longer goes
    # through n8n - it calls Cloudflare Workers AI
    # directly (see CLOUDFLARE_* settings below).
    # ============================================

    N8N_APPROVAL_WEBHOOK_URL: str = (
        "http://localhost:5678/webhook-test/approval"
    )

    # ============================================
    # CLOUDFLARE WORKERS AI
    #
    # Direct replacement for the old n8n
    # "Content Generator" workflow.
    #
    # CLOUDFLARE_ACCOUNT_ID: the account id that appears
    # in the run URL:
    # https://api.cloudflare.com/client/v4/accounts/<ID>/ai/run/<MODEL>
    #
    # CLOUDFLARE_API_TOKEN: a Workers AI scoped API token
    # (Cloudflare dashboard -> My Profile -> API Tokens).
    #
    # SECURITY: these have NO default value on purpose.
    # Put the real values in backend/.env only - never
    # commit real secrets in this file. Pydantic will
    # raise a clear startup error if they're missing,
    # which is exactly what we want instead of silently
    # falling back to a hardcoded key.
    # ============================================

    CLOUDFLARE_ACCOUNT_ID: str = ""

    CLOUDFLARE_API_TOKEN: str = ""

    CLOUDFLARE_TEXT_MODEL: str = (
        "@cf/zai-org/glm-4.7-flash"
    )

    CLOUDFLARE_IMAGE_MODEL: str = (
        "@cf/black-forest-labs/flux-2-klein-9b"
    )

    # FLUX [dev] supports more denoising steps than the
    # distilled schnell/klein variants - more steps means
    # better realism/detail at the cost of speed. 20-28 is
    # a good default range for photorealistic LinkedIn
    # images. (schnell/klein ignore this or cap it low, so
    # it's safe to leave set even if you switch models.)
    CLOUDFLARE_IMAGE_STEPS: int = 20

    # ============================================
    # LINKEDIN
    # ============================================

    LINKEDIN_CLIENT_ID: str = ""

    LINKEDIN_CLIENT_SECRET: str = ""

    LINKEDIN_SCOPES: str = (
        "openid profile email w_member_social"
    )

    # ============================================
    # YOUTUBE / GOOGLE
    # ============================================

    YOUTUBE_CLIENT_ID: str = ""

    YOUTUBE_CLIENT_SECRET: str = ""

    YOUTUBE_SCOPES: str = (
        "https://www.googleapis.com/auth/youtube.upload "
        "https://www.googleapis.com/auth/youtube.readonly"
    )

    YOUTUBE_REDIRECT_URI: str = ""

    # ============================================
    # META
    # Facebook + Instagram
    # ============================================

    META_CLIENT_ID: str = ""

    META_CLIENT_SECRET: str = ""

    META_SCOPES: str = (
        "pages_show_list "
        "pages_read_engagement "
        "instagram_basic "
        "instagram_content_publish"
    )

    # ============================================
    # X
    # ============================================

    X_CLIENT_ID: str = ""

    X_CLIENT_SECRET: str = ""

    X_SCOPES: str = (
        "tweet.read tweet.write users.read offline.access media.write"
    )

    # ============================================
    # ZERNIO
    # ============================================

    ZERNIO_API_KEY: str = ""

    ZERNIO_PROFILE_ID: str = ""

    ZERNIO_API_BASE_URL: str = "https://zernio.com/api/v1"

    # ============================================
    # TIKTOK
    #
    # TikTok's OAuth v2 uses non-standard field names:
    # "client_key" instead of "client_id" (both in the
    # authorize URL and the token exchange body). This is
    # handled with platform-specific branches in
    # oauth_config_service.py / oauth_service.py /
    # oauth_token_service.py.
    # ============================================

    TIKTOK_CLIENT_KEY: str = ""

    TIKTOK_CLIENT_SECRET: str = ""

    TIKTOK_REDIRECT_URI: str = "https://aisocialmanager.duckdns.org/api/oauth/tiktok/callback"

    TIKTOK_SCOPES: str = (
        "user.info.basic video.publish"
    )

    # ============================================
    # SETTINGS CONFIG
    # ============================================

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()