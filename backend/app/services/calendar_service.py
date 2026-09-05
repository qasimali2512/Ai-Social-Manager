from datetime import date, datetime

from app.db.supabase import supabase


def _parse_date(value):
    if not value:
        return None

    try:
        return datetime.fromisoformat(
            str(value).replace(
                "Z",
                "+00:00",
            )
        ).date()

    except (
        ValueError,
        TypeError,
    ):
        return None


def get_calendar_events(
    user_id: str,
    start_date: date | None = None,
    end_date: date | None = None,
):
    response = (
        supabase
        .table("post_publications")
        .select(
            """
            id,
            post_id,
            platform_id,
            scheduled_at,
            published_at,
            status,
            created_at,
            error_message,
            posts!inner(
                id,
                user_id
            ),
            platforms(
                id,
                name,
                slug,
                icon
            )
            """
        )
        .eq(
            "posts.user_id",
            user_id,
        )
        .order(
            "scheduled_at",
            desc=False,
        )
        .execute()
    )

    publications = (
        response.data or []
    )

    events = []

    for item in publications:

        scheduled_at = item.get(
            "scheduled_at"
        )

        event_date = _parse_date(
            scheduled_at
        )

        if not event_date:
            continue

        if (
            start_date
            and event_date < start_date
        ):
            continue

        if (
            end_date
            and event_date > end_date
        ):
            continue

        platform = (
            item.get("platforms")
            or {}
        )

        events.append({
            "id": item.get("id"),
            "post_id": item.get(
                "post_id"
            ),
            "platform_id": item.get(
                "platform_id"
            ),
            "platform_name": platform.get(
                "name"
            ),
            "platform_slug": platform.get(
                "slug"
            ),
            "platform_icon": platform.get(
                "icon"
            ),
            "status": item.get(
                "status"
            ),
            "scheduled_at": scheduled_at,
            "published_at": item.get(
                "published_at"
            ),
            "created_at": item.get(
                "created_at"
            ),
            "error_message": item.get(
                "error_message"
            ),
        })

    events = _augment_with_standalone_posts(
        user_id,
        events,
        start_date,
        end_date,
    )

    return events


def _augment_with_standalone_posts(
    user_id: str,
    events: list,
    start_date: date | None = None,
    end_date: date | None = None,
):
    """
    Add posts that were scheduled directly (e.g. via
    Zernio/Zapier) and therefore have no local
    `post_publications` row, so they still appear on the
    calendar.
    """

    linked_post_ids = {
        event.get("post_id")
        for event in events
        if event.get("post_id")
    }

    posts_response = (
        supabase
        .table("posts")
        .select(
            "id,status,scheduled_at,platform,created_at"
        )
        .eq("user_id", user_id)
        .eq("status", "scheduled")
        .execute()
    )

    posts = posts_response.data or []

    for post in posts:
        if post.get("id") in linked_post_ids:
            continue

        scheduled_at = post.get(
            "scheduled_at"
        )

        if not scheduled_at:
            continue

        event_date = _parse_date(
            scheduled_at
        )

        if not event_date:
            continue

        if (
            start_date
            and event_date < start_date
        ):
            continue

        if (
            end_date
            and event_date > end_date
        ):
            continue

        platform_label = (
            post.get("platform")
            or "Zapier / Zernio"
        )

        events.append({
            "id": f"post:{post.get('id')}",
            "post_id": post.get("id"),
            "platform_id": None,
            "platform_name": platform_label,
            "platform_slug": str(
                platform_label
            ).lower(),
            "platform_icon": None,
            "status": post.get("status"),
            "scheduled_at": scheduled_at,
            "published_at": None,
            "created_at": post.get(
                "created_at"
            ),
            "error_message": None,
        })

    events.sort(
        key=lambda x: (
            x.get("scheduled_at") or ""
        )
    )

    return events