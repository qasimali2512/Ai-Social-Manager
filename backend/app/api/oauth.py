from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from app.services.oauth_service import (
    build_authorization_url,
)

from app.services.oauth_state_service import (
    create_state,
    validate_state,
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


DEV_USER_ID = (
    "00000000-0000-0000-0000-000000000001"
)

FRONTEND_URL = "http://localhost:5173"
BACKEND_URL = "http://localhost:8000"


# ============================================
# START OAUTH
# ============================================

@router.get("/{platform}/connect")
def connect_platform(
    platform: str,
):
    platform = platform.lower().strip()

    state = create_state(
        user_id=DEV_USER_ID,
        platform=platform,
    )

    redirect_uri = (
        f"{BACKEND_URL}/api/oauth/"
        f"{platform}/callback"
    )

    try:
        authorization_url = (
            build_authorization_url(
                platform_key=platform,
                redirect_uri=redirect_uri,
                state=state,
            )
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    return {
        "success": True,
        "platform": platform,
        "authorization_url": authorization_url,
    }


# ============================================
# OAUTH CALLBACK
# ============================================

@router.get("/{platform}/callback")
async def oauth_callback(
    platform: str,
    code: str | None = Query(None),
    state: str | None = Query(None),
    error: str | None = Query(None),
):
    platform = platform.lower().strip()

    # ----------------------------------------
    # Provider returned an error
    # ----------------------------------------

    if error:
        raise HTTPException(
            status_code=400,
            detail=f"OAuth authorization failed: {error}",
        )

    if not code:
        raise HTTPException(
            status_code=400,
            detail="Authorization code is missing",
        )

    if not state:
        raise HTTPException(
            status_code=400,
            detail="OAuth state is missing",
        )

    # ----------------------------------------
    # Validate state
    # ----------------------------------------

    state_data = validate_state(
        state=state,
        platform=platform,
    )

    if not state_data:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OAuth state",
        )

    user_id = state_data["user_id"]

    # ----------------------------------------
    # Redirect URI must match connect URL
    # ----------------------------------------

    redirect_uri = (
        f"{BACKEND_URL}/api/oauth/"
        f"{platform}/callback"
    )

    # ----------------------------------------
    # Exchange code → access token
    # ----------------------------------------

    try:
        token_data = (
            await exchange_code_for_token(
                platform_key=platform,
                code=code,
                redirect_uri=redirect_uri,
            )
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    access_token = token_data.get(
        "access_token"
    )

    if not access_token:
        raise HTTPException(
            status_code=400,
            detail=(
                "Provider did not return "
                "an access token."
            ),
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

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    # ----------------------------------------
    # Save / update connected account
    # ----------------------------------------

    try:
        account = save_oauth_account(
            user_id=user_id,
            platform=platform,
            token_data=token_data,
            profile=profile,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    if not account:
        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to save social account."
            ),
        )

    # ----------------------------------------
    # Don't return access token to frontend
    # ----------------------------------------

    safe_account = {
        key: value
        for key, value in account.items()
        if key not in {
            "access_token",
            "refresh_token",
        }
    }

    return {
        "success": True,
        "platform": platform,
        "message": (
            "Social account connected successfully."
        ),
        "account": safe_account,
        "redirect_url": (
            f"{FRONTEND_URL}/accounts"
        ),
    }