from app.core.config import settings


META_AUTHORIZATION_URL = (
    "https://www.facebook.com/v23.0/dialog/oauth"
)

META_TOKEN_URL = (
    "https://graph.facebook.com/v23.0/oauth/access_token"
)

LINKEDIN_AUTHORIZATION_URL = (
    "https://www.linkedin.com/oauth/v2/authorization"
)

LINKEDIN_TOKEN_URL = (
    "https://www.linkedin.com/oauth/v2/accessToken"
)

X_AUTHORIZATION_URL = (
    "https://x.com/i/oauth2/authorize"
)

X_TOKEN_URL = (
    "https://api.x.com/2/oauth2/token"
)

TIKTOK_AUTHORIZATION_URL = (
    "https://www.tiktok.com/v2/auth/authorize/"
)

TIKTOK_TOKEN_URL = (
    "https://open.tiktokapis.com/v2/oauth/token/"
)

YOUTUBE_AUTHORIZATION_URL = (
    "https://accounts.google.com/o/oauth2/v2/auth"
)

YOUTUBE_TOKEN_URL = (
    "https://oauth2.googleapis.com/token"
)


def _scopes(value: str) -> list[str]:
    if not value:
        return []

    value = value.replace(",", " ")

    return [
        item.strip()
        for item in value.split()
        if item.strip()
    ]


def get_oauth_config(
    platform_key: str,
):
    platform = (
        platform_key
        .lower()
        .strip()
    )

    if platform == "linkedin":
        return {
            "key": "linkedin",
            "name": "LinkedIn",
            "authorization_url":
                LINKEDIN_AUTHORIZATION_URL,
            "token_url":
                LINKEDIN_TOKEN_URL,
            "client_id":
                settings.LINKEDIN_CLIENT_ID,
            "client_secret":
                settings.LINKEDIN_CLIENT_SECRET,
            "scopes":
                _scopes(settings.LINKEDIN_SCOPES),
            "api_base_url":
                "https://api.linkedin.com",
        }

    if platform in {
        "facebook",
        "instagram",
    }:
        return {
            "key": platform,
            "name": (
                "Instagram"
                if platform == "instagram"
                else "Facebook"
            ),
            "authorization_url":
                META_AUTHORIZATION_URL,
            "token_url":
                META_TOKEN_URL,
            "client_id":
                settings.META_CLIENT_ID,
            "client_secret":
                settings.META_CLIENT_SECRET,
            "scopes":
                _scopes(settings.META_SCOPES),
            "api_base_url":
                "https://graph.facebook.com/v23.0",
        }

    if platform in {
        "x",
        "twitter",
    }:
        return {
            "key": "x",
            "name": "X",
            "authorization_url":
                X_AUTHORIZATION_URL,
            "token_url":
                X_TOKEN_URL,
            "client_id":
                settings.X_CLIENT_ID,
            "client_secret":
                settings.X_CLIENT_SECRET,
            "scopes":
                _scopes(settings.X_SCOPES),
            "api_base_url":
                "https://api.x.com/2",
        }

    if platform in {"youtube", "google-youtube"}:
        return {
            "key": "youtube",
            "name": "YouTube",
            "authorization_url": YOUTUBE_AUTHORIZATION_URL,
            "token_url": YOUTUBE_TOKEN_URL,
            "client_id": settings.YOUTUBE_CLIENT_ID,
            "client_secret": settings.YOUTUBE_CLIENT_SECRET,
            "scopes": _scopes(settings.YOUTUBE_SCOPES),
            "api_base_url": "https://www.googleapis.com/youtube/v3",
        }

    if platform == "tiktok":
        return {
            "key": "tiktok",
            "name": "TikTok",
            "authorization_url":
                TIKTOK_AUTHORIZATION_URL,
            "token_url":
                TIKTOK_TOKEN_URL,

            # TikTok calls this "client_key", not
            # "client_id" - stored under "client_id"
            # here anyway so validate_oauth_config()'s
            # generic required-fields check still works.
            # The platform-specific branches in
            # oauth_service.py / oauth_token_service.py
            # rename it to "client_key" when actually
            # building requests.
            "client_id":
                settings.TIKTOK_CLIENT_KEY,
            "client_secret":
                settings.TIKTOK_CLIENT_SECRET,
            "scopes":
                _scopes(settings.TIKTOK_SCOPES),
            "api_base_url":
                "https://open.tiktokapis.com/v2",
        }

    return None


def validate_oauth_config(
    platform: dict,
):
    required = [
        "authorization_url",
        "token_url",
        "client_id",
        "client_secret",
    ]

    missing = [
        field
        for field in required
        if not platform.get(field)
    ]

    if missing:
        raise ValueError(
            "OAuth configuration is incomplete. "
            f"Missing: {', '.join(missing)}"
        )

    return True