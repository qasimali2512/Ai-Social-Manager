from app.db.supabase import supabase, safe_execute


def _with_key_alias(platform: dict | None):
    """
    Database uses `slug`, while the application can continue
    using `key` as an API/application-level alias.
    """
    if not platform:
        return platform

    result = dict(platform)

    if "slug" in result:
        result["key"] = result["slug"]

    return result


def _with_key_aliases(platforms: list):
    """
    Add `key` alias to every platform returned from the database.
    """
    return [
        _with_key_alias(platform)
        for platform in platforms
    ]


# ============================================================
# GET ALL ACTIVE PLATFORMS
# ============================================================

def get_platforms():
    response = safe_execute(
        supabase
        .table("platforms")
        .select(
            "id, name, slug, icon, description, "
            "authorization_url, token_url, scopes, "
            "api_base_url, is_active"
        )
        .eq("is_active", True)
        .order("name")
    )

    return _with_key_aliases(response.data or [])


# ============================================================
# GET PLATFORM BY ID
# ============================================================

def get_platform(
    platform_id: str,
):
    response = safe_execute(
        supabase
        .table("platforms")
        .select("*")
        .eq("id", platform_id)
        .maybe_single()
    )

    return _with_key_alias(response.data)


# ============================================================
# GET PLATFORM BY KEY / SLUG
# ============================================================

def get_platform_by_key(
    platform_key: str,
):
    slug = platform_key.lower().strip()

    response = safe_execute(
        supabase
        .table("platforms")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", True)
        .maybe_single()
    )

    return _with_key_alias(response.data)


# ============================================================
# CREATE PLATFORM
# ============================================================

def create_platform(
    data: dict,
):
    payload = dict(data)

    # Application may send `key`.
    # Database stores it as `slug`.
    if "key" in payload:
        payload["slug"] = (
            payload.pop("key")
            .lower()
            .strip()
        )

    # If slug is already provided, normalize it.
    elif "slug" in payload:
        payload["slug"] = (
            payload["slug"]
            .lower()
            .strip()
        )

    response = safe_execute(
        supabase
        .table("platforms")
        .insert(payload)
    )

    if not response.data:
        return None

    return _with_key_alias(response.data[0])


# ============================================================
# UPDATE PLATFORM
# ============================================================

def update_platform(
    platform_id: str,
    data: dict,
):
    clean_data = {
        key: value
        for key, value in data.items()
        if value is not None
    }

    # Convert application-level `key`
    # into database-level `slug`.
    if "key" in clean_data:
        clean_data["slug"] = (
            clean_data.pop("key")
            .lower()
            .strip()
        )

    # Normalize slug if directly supplied.
    if "slug" in clean_data:
        clean_data["slug"] = (
            clean_data["slug"]
            .lower()
            .strip()
        )

    if not clean_data:
        return get_platform(platform_id)

    response = safe_execute(
        supabase
        .table("platforms")
        .update(clean_data)
        .eq("id", platform_id)
    )

    if not response.data:
        return None

    return _with_key_alias(response.data[0])


# ============================================================
# DELETE / DEACTIVATE PLATFORM
# ============================================================

def delete_platform(
    platform_id: str,
):
    # Soft delete / deactivate.
    response = safe_execute(
        supabase
        .table("platforms")
        .update({
            "is_active": False,
        })
        .eq("id", platform_id)
    )

    return bool(response.data)