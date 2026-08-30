from fastapi import (
    APIRouter,
    HTTPException,
)

from app.services.social_account_service import (
    get_social_accounts,
    get_social_account,
    update_social_account,
    delete_social_account,
)


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