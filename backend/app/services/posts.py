from fastapi import HTTPException

from app.db.supabase import supabase


def validate_platform(platform_id: str) -> dict:
    """
    Validate a platform by its real database primary key.

    The real platforms schema uses `slug`, not `key`.
    """
    if not platform_id:
        raise HTTPException(
            status_code=400,
            detail="Platform ID is required.",
        )

    response = (
        supabase
        .table("platforms")
        .select("*")
        .eq("id", platform_id)
        .maybe_single()
        .execute()
    )

    platform = response.data if response else None

    if not platform:
        raise HTTPException(
            status_code=404,
            detail="Platform not found.",
        )

    if platform.get("is_active") is False:
        raise HTTPException(
            status_code=400,
            detail="This platform is currently inactive.",
        )

    return platform


def validate_account(
    account_id: str,
    platform_id: str | None = None,
) -> dict:
    """
    Validate that the selected social account exists and is active.

    social_accounts uses `platform_id` as the foreign key.
    """
    if not account_id:
        raise HTTPException(
            status_code=400,
            detail="Social account ID is required.",
        )

    response = (
        supabase
        .table("social_accounts")
        .select("*")
        .eq("id", account_id)
        .maybe_single()
        .execute()
    )

    account = response.data if response else None

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Social account not found.",
        )

    if account.get("is_active") is False:
        raise HTTPException(
            status_code=400,
            detail="This social account is inactive.",
        )

    if platform_id and str(account.get("platform_id")) != str(platform_id):
        raise HTTPException(
            status_code=400,
            detail="Selected social account does not belong to the selected platform.",
        )

    return account


def check_duplicate_publication(
    post_id: str,
    platform_id: str,
) -> dict | None:
    """
    Return an existing publication for this post/platform, if present.
    """
    if not post_id or not platform_id:
        return None

    response = (
        supabase
        .table("post_publications")
        .select("id, post_id, platform_id, account_id, social_account_id, status")
        .eq("post_id", post_id)
        .eq("platform_id", platform_id)
        .limit(1)
        .execute()
    )

    rows = response.data or []
    return rows[0] if rows else None
