from app.db.supabase import supabase


def get_oauth_config(
    platform_key: str,
):
    response = (
        supabase
        .table("platforms")
        .select(
            "id, key, name, "
            "authorization_url, token_url, "
            "client_id, client_secret, "
            "scopes, api_base_url, is_active"
        )
        .eq("key", platform_key.lower())
        .eq("is_active", True)
        .maybe_single()
        .execute()
    )

    return response.data


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