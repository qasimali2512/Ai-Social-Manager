from app.db.supabase import supabase


def get_publications(
    user_id: str,
):
    response = (
        supabase
        .table("post_publications")
        .select(
            "*, posts!inner(user_id), "
            "platforms(*), social_accounts(*)"
        )
        .eq(
            "posts.user_id",
            user_id,
        )
        .order(
            "created_at",
            desc=True,
        )
        .execute()
    )

    return response.data or []


def get_publication(
    publication_id: str,
    user_id: str,
):
    response = (
        supabase
        .table("post_publications")
        .select(
            "*, posts!inner(user_id), "
            "platforms(*), social_accounts(*)"
        )
        .eq(
            "id",
            publication_id,
        )
        .eq(
            "posts.user_id",
            user_id,
        )
        .maybe_single()
        .execute()
    )

    return response.data


def create_publication(
    user_id: str,
    data: dict,
):
    post_id = data.get("post_id")
    platform_id = data.get(
        "platform_id"
    )
    social_account_id = data.get(
        "social_account_id"
    )

    if not post_id:
        return None

    post_response = (
        supabase
        .table("posts")
        .select("id")
        .eq(
            "id",
            post_id,
        )
        .eq(
            "user_id",
            user_id,
        )
        .maybe_single()
        .execute()
    )

    if not post_response.data:
        return None

    if not platform_id:
        return None

    # Validate platform.
    platform_response = (
        supabase
        .table("platforms")
        .select(
            "id, key, is_active"
        )
        .eq(
            "id",
            platform_id,
        )
        .maybe_single()
        .execute()
    )

    platform = platform_response.data

    if not platform:
        return None

    if not platform.get(
        "is_active",
        True,
    ):
        return None

    # Validate selected account.
    if social_account_id:

        account_response = (
            supabase
            .table("social_accounts")
            .select("*")
            .eq(
                "id",
                social_account_id,
            )
            .eq(
                "user_id",
                user_id,
            )
            .maybe_single()
            .execute()
        )

        account = account_response.data

        if not account:
            return None

        if not account.get(
            "is_active",
            True,
        ):
            return None

        if account.get(
            "platform_id"
        ):
            if str(
                account["platform_id"]
            ) != str(platform_id):
                return None

        elif account.get(
            "platform"
        ):
            if (
                account["platform"].lower()
                != platform["key"].lower()
            ):
                return None

    payload = {
        "post_id": post_id,
        "platform_id": platform_id,
        "social_account_id": (
            social_account_id
        ),
        "scheduled_at": (
            data.get("scheduled_at")
        ),
        "status": (
            "scheduled"
            if data.get("scheduled_at")
            else "pending"
        ),
    }

    response = (
        supabase
        .table("post_publications")
        .insert(payload)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def update_publication(
    publication_id: str,
    user_id: str,
    data: dict,
):
    existing = get_publication(
        publication_id,
        user_id,
    )

    if not existing:
        return None

    allowed = {
        "scheduled_at",
        "status",
        "social_account_id",
    }

    update_data = {
        key: value
        for key, value in data.items()
        if key in allowed
    }

    if not update_data:
        return existing

    response = (
        supabase
        .table("post_publications")
        .update(update_data)
        .eq(
            "id",
            publication_id,
        )
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def delete_publication(
    publication_id: str,
    user_id: str,
):
    existing = get_publication(
        publication_id,
        user_id,
    )

    if not existing:
        return False

    response = (
        supabase
        .table("post_publications")
        .delete()
        .eq(
            "id",
            publication_id,
        )
        .execute()
    )

    return bool(response.data)