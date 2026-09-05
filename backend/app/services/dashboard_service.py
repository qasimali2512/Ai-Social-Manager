from app.db.supabase import supabase, safe_execute


DEV_USER_ID = "00000000-0000-0000-0000-000000000001"


def get_dashboard(user_id: str):
    # --------------------------------------------------
    # Posts
    # --------------------------------------------------

    posts_response = safe_execute(
        supabase
        .table("posts")
        .select("id,status,created_at,scheduled_at,platform")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
    )

    posts = posts_response.data or []

    # --------------------------------------------------
    # Publications
    # --------------------------------------------------

    publications_response = safe_execute(
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
        .eq("posts.user_id", user_id)
        .order("created_at", desc=True)
    )

    publications = (
        publications_response.data or []
    )

    # --------------------------------------------------
    # Summary
    # --------------------------------------------------

    summary = {
        "total_posts": len(posts),
        "published": 0,
        "scheduled": 0,
        "pending": 0,
        "failed": 0,
        "total_publications": len(
            publications
        ),
    }

    for post in posts:
        status = str(
            post.get("status") or "pending"
        ).lower()

        if status == "published":
            summary["published"] += 1

        elif status == "scheduled":
            summary["scheduled"] += 1

        elif status == "failed":
            summary["failed"] += 1

        else:
            summary["pending"] += 1

    # --------------------------------------------------
    # Upcoming scheduled publications
    # --------------------------------------------------

    upcoming = []

    for item in publications:

        status = str(
            item.get("status") or ""
        ).lower()

        if status not in {
            "scheduled",
            "pending",
        }:
            continue

        if not item.get("scheduled_at"):
            continue

        platform = (
            item.get("platforms")
            or {}
        )

        upcoming.append({
            "id": item.get("id"),
            "post_id": item.get("post_id"),
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
            "status": status,
            "scheduled_at": item.get(
                "scheduled_at"
            ),
        })

    upcoming.sort(
        key=lambda x: (
            x.get("scheduled_at")
            or ""
        )
    )

    # --------------------------------------------------
    # Standalone scheduled posts (e.g. posts scheduled
    # via Zernio/Zapier). These are updated directly on
    # the `posts` table and never get a local
    # `post_publications` row (Zernio accounts are
    # virtual and have no local social_accounts row), so
    # without this fallback they would never show up
    # here even though they really are scheduled.
    # --------------------------------------------------

    linked_post_ids = {
        item.get("post_id")
        for item in publications
        if item.get("post_id")
    }

    for post in posts:
        if post.get("id") in linked_post_ids:
            continue

        status = str(
            post.get("status") or ""
        ).lower()

        if status != "scheduled":
            continue

        if not post.get("scheduled_at"):
            continue

        platform_label = (
            post.get("platform")
            or "Zapier / Zernio"
        )

        upcoming.append({
            "id": f"post:{post.get('id')}",
            "post_id": post.get("id"),
            "platform_id": None,
            "platform_name": platform_label,
            "platform_slug": str(
                platform_label
            ).lower(),
            "platform_icon": None,
            "status": status,
            "scheduled_at": post.get(
                "scheduled_at"
            ),
        })

    upcoming.sort(
        key=lambda x: (
            x.get("scheduled_at")
            or ""
        )
    )

    # --------------------------------------------------
    # Recent publications
    # --------------------------------------------------

    recent = []

    for item in publications[:10]:

        platform = (
            item.get("platforms")
            or {}
        )

        recent.append({
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
            "status": item.get(
                "status"
            ),
            "scheduled_at": item.get(
                "scheduled_at"
            ),
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

    # --------------------------------------------------
    # Platform counts
    # --------------------------------------------------

    platform_map = {}

    for item in publications:

        platform = (
            item.get("platforms")
            or {}
        )

        platform_id = (
            item.get("platform_id")
            or platform.get("id")
        )

        if not platform_id:
            continue

        if platform_id not in platform_map:
            platform_map[platform_id] = {
                "id": platform_id,
                "name": platform.get(
                    "name"
                ),
                "slug": platform.get(
                    "slug"
                ),
                "icon": platform.get(
                    "icon"
                ),
                "total": 0,
                "published": 0,
                "scheduled": 0,
                "failed": 0,
            }

        platform_map[
            platform_id
        ]["total"] += 1

        status = str(
            item.get("status") or ""
        ).lower()

        if status == "published":
            platform_map[
                platform_id
            ]["published"] += 1

        elif status == "scheduled":
            platform_map[
                platform_id
            ]["scheduled"] += 1

        elif status == "failed":
            platform_map[
                platform_id
            ]["failed"] += 1

    return {
        "summary": summary,
        "upcoming": upcoming[:10],
        "recent": recent,
        "platforms": list(
            platform_map.values()
        ),
    }