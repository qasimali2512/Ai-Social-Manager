import logging
from urllib.parse import urlencode

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)
from fastapi.responses import RedirectResponse

from app.core.config import settings

from app.services.oauth_service import (
    build_authorization_url,
)

from app.services.oauth_state_service import (
    create_state,
    validate_state,
    create_code_verifier,
    create_code_challenge,
)

from app.services.oauth_token_service import (
    exchange_code_for_token,
)

from app.services.platform_adapter_manager import (
    get_platform_profile,
)

from app.services.social_account_service import (
    save_oauth_account,
)


router = APIRouter(
    prefix="/api/oauth",
    tags=["OAuth"],
)


logger = logging.getLogger("oauth")


# ============================================
# REDIRECT HELPERS
# ============================================
#
# IMPORTANT: error/status messages are put through
# urlencode() before being appended to the redirect
# URL. Providers (LinkedIn, Meta, X) can return error
# text containing spaces, "&", ":" etc. Without
# encoding, that text corrupts the query string and
# the frontend can silently fail to parse "oauth" /
# "message", which looks like "nothing happens" after
# the redirect even though the backend did try to
# report an error.

def _redirect(params: dict) -> RedirectResponse:
    query = urlencode(params)

    return RedirectResponse(
        url=(
            f"{settings.FRONTEND_URL}"
            f"/accounts?{query}"
        )
    )


def _error_redirect(
    message: str,
    platform: str | None = None,
) -> RedirectResponse:
    # Log to the server console so the real
    # failure reason is visible in the uvicorn
    # output, not just buried in a redirect URL
    # that the frontend strips right away.
    logger.warning(
        f"OAuth failed for platform="
        f"'{platform}': {message}"
    )

    params = {
        "oauth": "error",
        "message": message,
    }

    if platform:
        params["platform"] = platform

    return _redirect(params)


def _success_redirect(
    platform: str,
) -> RedirectResponse:
    logger.warning(
        f"OAuth succeeded for platform="
        f"'{platform}'"
    )

    return _redirect({
        "oauth": "success",
        "platform": platform,
    })


# ============================================
# START OAUTH
# ============================================

@router.get("/{platform}/connect")
def connect_platform(
    platform: str,
):
    platform = (
        platform
        .lower()
        .strip()
    )

    supported = {
        "linkedin",
        "facebook",
        "instagram",
        "x",
        "twitter",
        "tiktok",
        "youtube",
    }

    if platform not in supported:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported OAuth platform."
            ),
        )

    # Temporary development user.
    # Later this should come from the
    # authenticated Supabase user.
    user_id = settings.DEMO_USER_ID

    code_verifier = None
    code_challenge = None

    # X and TikTok both require PKCE on their OAuth 2.0
    # authorize step. TikTok's own error ("code_challenge"
    # missing) confirms this - it was only being generated
    # for X before.
    if platform in {
        "x",
        "twitter",
        "tiktok",
    }:
        code_verifier = (
            create_code_verifier()
        )

        code_challenge = (
            create_code_challenge(
                code_verifier
            )
        )

    state = create_state(
        user_id=user_id,
        platform=platform,
        code_verifier=code_verifier,
    )

    redirect_uri = (
        f"{settings.BACKEND_URL}"
        f"/api/oauth/"
        f"{platform}/callback"
    )

    try:
        authorization_url = (
            build_authorization_url(
                platform_key=platform,
                redirect_uri=redirect_uri,
                state=state,
                code_challenge=code_challenge,
            )
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    logger.warning(
        f"OAuth authorize URL for "
        f"'{platform}': {authorization_url}"
    )

    return {
        "success": True,
        "platform": platform,
        "authorization_url":
            authorization_url,
    }


# ============================================
# CALLBACK
# ============================================

@router.get("/{platform}/callback")
async def oauth_callback(
    platform: str,
    code: str | None = Query(None),
    state: str | None = Query(None),
    error: str | None = Query(None),
    error_description: str | None = Query(None),
):

    platform = (
        platform
        .lower()
        .strip()
    )

    # ----------------------------------------
    # Provider error
    # ----------------------------------------

    if error:
        return _error_redirect(
            error_description or error,
            platform=platform,
        )

    if not code:
        return _error_redirect(
            "missing_code",
            platform=platform,
        )

    if not state:
        return _error_redirect(
            "missing_state",
            platform=platform,
        )

    # ----------------------------------------
    # Validate state
    # ----------------------------------------

    state_data = validate_state(
        state=state,
        platform=platform,
    )

    if not state_data:
        return _error_redirect(
            "invalid_state",
            platform=platform,
        )

    user_id = state_data[
        "user_id"
    ]

    code_verifier = state_data.get(
        "code_verifier"
    )

    # ----------------------------------------
    # Redirect URI
    # ----------------------------------------

    redirect_uri = (
        f"{settings.BACKEND_URL}"
        f"/api/oauth/"
        f"{platform}/callback"
    )

    # ----------------------------------------
    # Exchange code
    # ----------------------------------------

    try:

        token_data = (
            await exchange_code_for_token(
                platform_key=platform,
                code=code,
                redirect_uri=redirect_uri,
                code_verifier=code_verifier,
            )
        )

    except Exception as exc:

        return _error_redirect(
            str(exc),
            platform=platform,
        )

    access_token = token_data.get(
        "access_token"
    )

    if not access_token:
        return _error_redirect(
            "no_access_token",
            platform=platform,
        )

    # ----------------------------------------
    # Get provider profile
    # ----------------------------------------

    try:

        profile = (
            await get_platform_profile(
                platform=platform,
                access_token=access_token,
            )
        )

    except Exception as exc:

        return _error_redirect(
            str(exc),
            platform=platform,
        )

    # ----------------------------------------
    # Save account
    # ----------------------------------------

    try:

        account = save_oauth_account(
            user_id=user_id,
            platform=platform,
            token_data=token_data,
            profile=profile,
        )

    except Exception as exc:

        return _error_redirect(
            str(exc),
            platform=platform,
        )

    if not account:
        return _error_redirect(
            "save_failed",
            platform=platform,
        )

    # ----------------------------------------
    # NEVER send tokens to frontend
    # ----------------------------------------

    return _success_redirect(platform)