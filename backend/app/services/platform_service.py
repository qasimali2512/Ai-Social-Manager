from app.db.supabase import supabase


def get_platforms():
    response = (
        supabase
        .table("platforms")
        .select(
            "id, name, key, authorization_url, "
            "token_url, scopes, api_base_url, is_active"
        )
        .eq("is_active", True)
        .order("name")
        .execute()
    )

    return response.data or []


def get_platform(
    platform_id: str,
):
    response = (
        supabase
        .table("platforms")
        .select("*")
        .eq("id", platform_id)
        .maybe_single()
        .execute()
    )

    return response.data


def get_platform_by_key(
    platform_key: str,
):
    key = platform_key.lower().strip()

    response = (
        supabase
        .table("platforms")
        .select("*")
        .eq("key", key)
        .eq("is_active", True)
        .maybe_single()
        .execute()
    )

    return response.data


def create_platform(
    data: dict,
):
    payload = {
        **data,
        "key": data["key"].lower().strip(),
    }

    response = (
        supabase
        .table("platforms")
        .insert(payload)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def update_platform(
    platform_id: str,
    data: dict,
):
    clean_data = {
        key: value
        for key, value in data.items()
        if value is not None
    }

    if "key" in clean_data:
        clean_data["key"] = (
            clean_data["key"]
            .lower()
            .strip()
        )

    if not clean_data:
        return get_platform(
            platform_id
        )

    response = (
        supabase
        .table("platforms")
        .update(clean_data)
        .eq("id", platform_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def delete_platform(
    platform_id: str,
):
    # Soft delete / deactivate.
    response = (
        supabase
        .table("platforms")
        .update({
            "is_active": False,
        })
        .eq("id", platform_id)
        .execute()
    )

    return bool(response.data)