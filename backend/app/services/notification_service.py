from app.db.supabase import supabase


def get_notifications(
    user_id: str,
    unread_only: bool = False,
):
    query = (
        supabase
        .table("notifications")
        .select("*")
        .eq("user_id", user_id)
        .order(
            "created_at",
            desc=True,
        )
    )

    if unread_only:
        query = query.eq(
            "is_read",
            False,
        )

    response = query.execute()

    return response.data or []


def get_unread_count(
    user_id: str,
):
    response = (
        supabase
        .table("notifications")
        .select(
            "id",
            count="exact",
        )
        .eq(
            "user_id",
            user_id,
        )
        .eq(
            "is_read",
            False,
        )
        .execute()
    )

    return response.count or 0


def mark_as_read(
    notification_id: str,
    user_id: str,
):
    response = (
        supabase
        .table("notifications")
        .update({
            "is_read": True,
        })
        .eq(
            "id",
            notification_id,
        )
        .eq(
            "user_id",
            user_id,
        )
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def mark_all_as_read(
    user_id: str,
):
    response = (
        supabase
        .table("notifications")
        .update({
            "is_read": True,
        })
        .eq(
            "user_id",
            user_id,
        )
        .eq(
            "is_read",
            False,
        )
        .execute()
    )

    return response.data or []