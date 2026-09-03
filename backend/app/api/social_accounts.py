from fastapi import (
    APIRouter,
    HTTPException,
)

from pydantic import BaseModel
from typing import Optional

from app.services.social_account_service import (
    get_social_accounts,
    get_social_account,
    update_social_account,
    delete_social_account,
)


# ============================================
# PATCH request body
# ============================================
#
# The real `social_accounts` table only has an
# `is_active` boolean column - there is no `status`
# text column. The frontend used to send
# {"status": "active" / "inactive"}, which this
# route did not even exist to receive (there was no
# PATCH route at all, so every Activate/Deactivate
# click was silently failing with a 405).
#
# This model accepts BOTH `is_active` (boolean, the
# correct/preferred field) and a legacy `status`
# string, so older frontend builds keep working too.

class SocialAccountStatusUpdate(BaseModel):
    is_active: Optional[bool] = None
    status: Optional[str] = None


router = APIRouter(
    prefix="/api/social-accounts",
    tags=["Social Accounts"],
)


DEV_USER_ID = (
    "00000000-0000-0000-0000-000000000001"
)


# ============================================
# GET CONNECTED ACCOUNTS
# ============================================

@router.get("")
def list_accounts():
    accounts = get_social_accounts(
        DEV_USER_ID
    )

    # Never expose tokens to frontend.
    safe_accounts = [
        {
            key: value
            for key, value in account.items()
            if key not in {
                "access_token",
                "refresh_token",
            }
        }
        for account in accounts
    ]

    return {
        "success": True,
        "count": len(safe_accounts),
        "accounts": safe_accounts,
    }


# ============================================
# GET SINGLE ACCOUNT
# ============================================

@router.get("/{account_id}")
def retrieve_account(
    account_id: str,
):
    account = get_social_account(
        account_id,
        DEV_USER_ID,
    )

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Social account not found.",
        )

    return {
        "success": True,
        "account": {
            key: value
            for key, value in account.items()
            if key not in {
                "access_token",
                "refresh_token",
            }
        },
    }


# ============================================
# UPDATE ACCOUNT (Activate / Deactivate)
# ============================================

@router.patch("/{account_id}")
def patch_account(
    account_id: str,
    request: SocialAccountStatusUpdate,
):
    existing = get_social_account(
        account_id,
        DEV_USER_ID,
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Social account not found.",
        )

    # Resolve the boolean value the DB actually
    # stores. `is_active` wins if provided; otherwise
    # fall back to translating the legacy `status`
    # string ("active" / "inactive" / etc.).
    is_active = request.is_active

    if is_active is None and request.status is not None:
        is_active = request.status.strip().lower() not in {
            "inactive",
            "disabled",
            "disconnected",
            "revoked",
        }

    if is_active is None:
        raise HTTPException(
            status_code=400,
            detail="Provide 'is_active' (boolean) to update the account status.",
        )

    account = update_social_account(
        account_id,
        DEV_USER_ID,
        {"is_active": is_active},
    )

    if not account:
        raise HTTPException(
            status_code=500,
            detail="Failed to update account.",
        )

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
        "account": safe_account,
    }


# ============================================
# DISCONNECT ACCOUNT
# ============================================

@router.delete("/{account_id}")
def disconnect_account(
    account_id: str,
):
    existing = get_social_account(
        account_id,
        DEV_USER_ID,
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Social account not found.",
        )

    deleted = delete_social_account(
        account_id,
        DEV_USER_ID,
    )

    if not deleted:
        raise HTTPException(
            status_code=500,
            detail="Failed to disconnect account.",
        )

    return {
        "success": True,
        "message": (
            "Social account disconnected."
        ),
    }