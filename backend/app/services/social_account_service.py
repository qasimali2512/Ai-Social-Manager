from app.db.supabase import supabase


def get_social_accounts(user_id: str):
    response = (
        supabase
        .table("social_accounts")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return response.data or []


def get_social_account(
    account_id: str,
    user_id: str,
):
    response = (
        supabase
        .table("social_accounts")
        .select("*")
        .eq("id", account_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )

    return response.data


def save_oauth_account(
    user_id: str,
    platform: str,
    token_data: dict,
    profile: dict,
):
    access_token = token_data.get(
        "access_token"
    )

    refresh_token = token_data.get(
        "refresh_token"
    )

    expires_in = token_data.get(
        "expires_in"
    )

    if not access_token:
        raise ValueError(
            "Access token is missing."
        )

    account_name = (
        profile.get("name")
        or profile.get("username")
        or profile.get("screen_name")
        or profile.get("email")
        or f"{platform} Account"
    )

    platform_account_id = (
        profile.get("id")
        or profile.get("user_id")
        or profile.get("account_id")
    )

    payload = {
        "user_id": user_id,
        "platform": platform,
        "account_name": account_name,
        "platform_account_id": platform_account_id,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_in": expires_in,
        "is_active": True,
    }

    existing = (
        supabase
        .table("social_accounts")
        .select("id")
        .eq("user_id", user_id)
        .eq("platform", platform)
        .eq(
            "platform_account_id",
            platform_account_id,
        )
        .maybe_single()
        .execute()
    )

    if existing.data:
        response = (
            supabase
            .table("social_accounts")
            .update(payload)
            .eq("id", existing.data["id"])
            .eq("user_id", user_id)
            .execute()
        )
    else:
        response = (
            supabase
            .table("social_accounts")
            .insert(payload)
            .execute()
        )

    if not response.data:
        return None

    return response.data[0]


def update_social_account(
    account_id: str,
    user_id: str,
    data: dict,
):
    clean_data = {
        key: value
        for key, value in data.items()
        if value is not None
    }

    if not clean_data:
        return get_social_account(
            account_id,
            user_id,
        )

    response = (
        supabase
        .table("social_accounts")
        .update(clean_data)
        .eq("id", account_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def delete_social_account(
    account_id: str,
    user_id: str,
):
    response = (
        supabase
        .table("social_accounts")
        .delete()
        .eq("id", account_id)
        .eq("user_id", user_id)
        .execute()
    )

    return bool(response.data)