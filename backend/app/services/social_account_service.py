from datetime import datetime, timedelta, timezone

from app.db.supabase import supabase, safe_execute

from app.services.platform_service import (
    get_platform_by_key,
    create_platform,
)


# ============================================================
# social_accounts columns (from the real Supabase schema):
#
#   id, user_id, platform_id, username, display_name,
#   avatar_url, account_url, access_token, refresh_token,
#   token_expires_at, is_active, created_at, updated_at
#
# Important differences from earlier assumptions:
#   - platform is stored as `platform_id` (FK -> platforms.id),
#     not a plain "platform" text column.
#   - There is no `account_name` or `platform_account_id`
#     column. `username` is NOT NULL and, together with
#     (user_id, platform_id), is the uniqueness key.
#   - There is no `expires_in` (seconds) column - instead
#     `token_expires_at` stores an absolute timestamp.
#
# Every query goes through safe_execute() instead of a plain
# .execute() - on Windows, transient socket hiccups can
# otherwise surface as a 500 with "[WinError 10035] ...
# non-blocking socket operation".
# ============================================================

PLATFORM_ALIASES = {
    "twitter": "x",
    "x": "twitter",
}


def _resolve_platform(platform_key: str) -> dict:
    """
    Look up a platform row by its slug/key.
    Falls back to a known alias (x <-> twitter) since
    different parts of the app use either name.
    """

    key = (platform_key or "").lower().strip()

    platform = get_platform_by_key(key)

    if not platform and key in PLATFORM_ALIASES:
        platform = get_platform_by_key(
            PLATFORM_ALIASES[key]
        )

    if not platform and key == "youtube":
        # Older databases may not have a YouTube row yet.
        # Create it automatically on the first successful
        # YouTube OAuth callback.
        platform = create_platform({
            "name": "YouTube",
            "slug": "youtube",
            "icon": "youtube",
            "description": "Connect and publish videos to YouTube.",
            "is_active": True,
        })

    if not platform:
        raise ValueError(
            f"Platform '{platform_key}' was not "
            "found. Make sure it exists (and is "
            "active) in the platforms table."
        )

    return platform


def _attach_platform_info(
    account: dict | None,
) -> dict | None:
    """
    Flatten the embedded `platforms` relation (if
    present) onto the account dict as platform /
    platform_name / platform_icon, for the frontend.
    """

    if not account:
        return account

    platform = account.get("platforms") or {}

    account["platform"] = platform.get("slug")
    account["platform_name"] = platform.get("name")
    account["platform_icon"] = platform.get("icon")

    return account


def _expires_in_to_timestamp(
    expires_in,
) -> str | None:
    """
    OAuth providers return `expires_in` as a number of
    seconds from now. The database stores an absolute
    `token_expires_at` timestamp instead, so convert it.
    """

    if not expires_in:
        return None

    try:
        seconds = int(expires_in)
    except (TypeError, ValueError):
        return None

    return (
        datetime.now(timezone.utc)
        + timedelta(seconds=seconds)
    ).isoformat()


SELECT_WITH_PLATFORM = (
    "*, platforms(id, name, slug, icon)"
)


def get_social_accounts(user_id: str):
    response = safe_execute(
        supabase
        .table("social_accounts")
        .select(SELECT_WITH_PLATFORM)
        .eq("user_id", user_id)
        .order("created_at", desc=True)
    )

    accounts = response.data or []

    return [
        _attach_platform_info(account)
        for account in accounts
    ]


def get_social_account(
    account_id: str,
    user_id: str,
):
    response = safe_execute(
        supabase
        .table("social_accounts")
        .select(SELECT_WITH_PLATFORM)
        .eq("id", account_id)
        .eq("user_id", user_id)
        .maybe_single()
    )

    # NOTE: supabase-py's .maybe_single() returns None
    # (not a response object with data=None) when zero
    # rows match, because PostgREST replies 406 with an
    # empty body in that case. Guard against that instead
    # of assuming `response` is always an object.
    if not response:
        return None

    return _attach_platform_info(response.data)


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

    token_expires_at = (
        _expires_in_to_timestamp(
            token_data.get("expires_in")
        )
    )

    if not access_token:
        raise ValueError(
            "Access token is missing."
        )

    # Resolve the "linkedin" / "facebook" / "x"
    # style key into the platforms.id the
    # social_accounts table actually stores.
    platform_row = _resolve_platform(platform)
    platform_id = platform_row["id"]

    # `username` is NOT NULL in the database, so it
    # always needs a real value - fall back through
    # whatever the provider profile actually gave us.
    username = (
        profile.get("username")
        or profile.get("email")
        or profile.get("screen_name")
        or profile.get("id")
        or profile.get("user_id")
        or f"{platform}_user"
    )

    display_name = (
        profile.get("name")
        or profile.get("display_name")
        or username
    )

    avatar_url = (
        profile.get("picture")
        or profile.get("profile_image_url")
        or profile.get("avatar_url")
    )

    payload = {
        "user_id": user_id,
        "platform_id": platform_id,
        "username": username,
        "display_name": display_name,
        "avatar_url": avatar_url,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_expires_at": token_expires_at,
        "is_active": True,
    }

    # Matches the table's real uniqueness
    # constraint: (user_id, platform_id, username).
    existing = safe_execute(
        supabase
        .table("social_accounts")
        .select("id")
        .eq("user_id", user_id)
        .eq("platform_id", platform_id)
        .eq("username", username)
        .maybe_single()
    )

    # NOTE: supabase-py's .maybe_single() returns None
    # (not a response object with data=None) when zero
    # rows match - e.g. the very first time this
    # user/platform/username combo connects. Treat that
    # the same as "no existing row" instead of crashing
    # with 'NoneType' object has no attribute 'data'.
    existing_id = (
        existing.data["id"]
        if existing and existing.data
        else None
    )

    if existing_id:
        response = safe_execute(
            supabase
            .table("social_accounts")
            .update(payload)
            .eq("id", existing_id)
            .eq("user_id", user_id)
            .select(SELECT_WITH_PLATFORM)
        )
    else:
        response = safe_execute(
            supabase
            .table("social_accounts")
            .insert(payload)
            .select(SELECT_WITH_PLATFORM)
        )

    if not response.data:
        return None

    return _attach_platform_info(
        response.data[0]
    )


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

    response = safe_execute(
        supabase
        .table("social_accounts")
        .update(clean_data)
        .eq("id", account_id)
        .eq("user_id", user_id)
        .select(SELECT_WITH_PLATFORM)
    )

    if not response.data:
        return None

    return _attach_platform_info(
        response.data[0]
    )


def delete_social_account(
    account_id: str,
    user_id: str,
):
    response = safe_execute(
        supabase
        .table("social_accounts")
        .delete()
        .eq("id", account_id)
        .eq("user_id", user_id)
    )

    return bool(response.data)