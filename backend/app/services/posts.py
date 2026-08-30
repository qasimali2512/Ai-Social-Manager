from fastapi import HTTPException

from app.db.supabase import supabase


def get_post_by_id(post_id: str):
    response = (
        supabase
        .table("posts")
        .select("*")
        .eq("id", post_id)
        .maybe_single()
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Post not found",
        )

    return response.data


def validate_platform(platform_id: str):
    response = (
        supabase
        .table("platforms")
        .select(
            "id, name, key, is_active"
        )
        .eq("id", platform_id)
        .maybe_single()
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Platform {platform_id} "
                "not found"
            ),
        )

    if not response.data.get(
        "is_active",
        True,
    ):
        raise HTTPException(
            status_code=400,
            detail="Platform is inactive",
        )

    return response.data


def validate_account(
    account_id: str,
    platform_id: str,
):
    response = (
        supabase
        .table("social_accounts")
        .select("*")
        .eq("id", account_id)
        .maybe_single()
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail=(
                "Social account not found"
            ),
        )

    account = response.data

    # Current account structure uses
    # platform as a key.
    platform = validate_platform(
        platform_id
    )

    platform_key = (
        platform.get("key")
        or platform.get("slug")
    )

    account_platform = (
        account.get("platform")
        or account.get("platform_key")
    )

    # If account has platform_id, use it.
    if account.get("platform_id"):
        if str(
            account["platform_id"]
        ) != str(platform_id):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Account does not belong "
                    "to selected platform"
                ),
            )

    elif account_platform:
        if (
            account_platform.lower()
            != str(platform_key).lower()
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Account does not belong "
                    "to selected platform"
                ),
            )

    if not account.get(
        "is_active",
        True,
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Social account is inactive"
            ),
        )

    return account


def check_duplicate_publication(
    post_id: str,
    platform_id: str,
):
    response = (
        supabase
        .table("post_publications")
        .select("id, status")
        .eq(
            "post_id",
            post_id,
        )
        .eq(
            "platform_id",
            platform_id,
        )
        .maybe_single()
        .execute()
    )

    return response.data