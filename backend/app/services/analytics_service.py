from collections import defaultdict
from datetime import date, datetime, timedelta

from app.db.supabase import supabase


VALID_STATUSES = {
    "published",
    "scheduled",
    "pending",
    "failed",
    "publishing",
}


def _parse_date(value):
    if not value:
        return None

    if isinstance(value, date):
        return value

    try:
        return datetime.fromisoformat(
            str(value).replace("Z", "+00:00")
        ).date()
    except (ValueError, TypeError):
        return None


def _normalize_status(value):
    status = str(value or "").lower().strip()

    if status in VALID_STATUSES:
        return status

    return "pending"


def _get_posts(user_id: str):
    response = (
        supabase
        .table("posts")
        .select(
            "id,user_id,status,created_at"
        )
        .eq(
            "user_id",
            user_id,
        )
        .execute()
    )

    return response.data or []


def _get_publications(user_id: str):
    response = (
        supabase
        .table("post_publications")
        .select(
            """
            id,
            post_id,
            platform_id,
            social_account_id,
            scheduled_at,
            published_at,
            status,
            error_message,
            created_at,
            posts!inner(
                id,
                user_id
            ),
            platforms(
                id,
                name,
                slug
            )
            """
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


def get_analytics(
    user_id: str,
    start_date: date | None = None,
    end_date: date | None = None,
):
    posts = _get_posts(user_id)
    publications = _get_publications(user_id)

    # --------------------------------------------------------
    # Date filtering
    # --------------------------------------------------------

    if start_date or end_date:

        filtered_publications = []

        for publication in publications:

            publication_date = (
                _parse_date(
                    publication.get(
                        "created_at"
                    )
                )
                or _parse_date(
                    publication.get(
                        "scheduled_at"
                    )
                )
            )

            if not publication_date:
                continue

            if (
                start_date
                and publication_date < start_date
            ):
                continue

            if (
                end_date
                and publication_date > end_date
            ):
                continue

            filtered_publications.append(
                publication
            )

        publications = (
            filtered_publications
        )

        post_ids = {
            item.get("post_id")
            for item in publications
            if item.get("post_id")
        }

        posts = [
            post
            for post in posts
            if post.get("id") in post_ids
        ]

    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    summary = {
        "total_posts": len(posts),
        "published_posts": 0,
        "scheduled_posts": 0,
        "pending_posts": 0,
        "failed_posts": 0,
        "total_publications": len(
            publications
        ),
        "successful_publications": 0,
        "failed_publications": 0,
    }

    # Count post statuses
    for post in posts:

        status = _normalize_status(
            post.get("status")
        )

        if status == "published":
            summary[
                "published_posts"
            ] += 1

        elif status == "scheduled":
            summary[
                "scheduled_posts"
            ] += 1

        elif status == "failed":
            summary[
                "failed_posts"
            ] += 1

        else:
            summary[
                "pending_posts"
            ] += 1

    # Count publication statuses
    for publication in publications:

        status = _normalize_status(
            publication.get("status")
        )

        if status == "published":
            summary[
                "successful_publications"
            ] += 1

        elif status == "failed":
            summary[
                "failed_publications"
            ] += 1

    # --------------------------------------------------------
    # Platform analytics
    # --------------------------------------------------------

    platform_data = defaultdict(
        lambda: {
            "platform_id": None,
            "platform_name": "Unknown",
            "platform_slug": None,
            "total": 0,
            "published": 0,
            "scheduled": 0,
            "pending": 0,
            "failed": 0,
        }
    )

    for publication in publications:

        platform = (
            publication.get(
                "platforms"
            )
            or {}
        )

        platform_id = (
            publication.get(
                "platform_id"
            )
            or platform.get("id")
        )

        key = str(
            platform_id
            or "unknown"
        )

        item = platform_data[key]

        item["platform_id"] = (
            platform_id
        )

        item["platform_name"] = (
            platform.get("name")
            or "Unknown"
        )

        item["platform_slug"] = (
            platform.get("slug")
        )

        item["total"] += 1

        status = _normalize_status(
            publication.get("status")
        )

        if status == "published":
            item["published"] += 1

        elif status == "scheduled":
            item["scheduled"] += 1

        elif status == "failed":
            item["failed"] += 1

        else:
            item["pending"] += 1

    platforms = list(
        platform_data.values()
    )

    platforms.sort(
        key=lambda item: item["total"],
        reverse=True,
    )

    # --------------------------------------------------------
    # Daily analytics
    # --------------------------------------------------------

    daily_data = defaultdict(
        lambda: {
            "total": 0,
            "published": 0,
            "scheduled": 0,
            "pending": 0,
            "failed": 0,
        }
    )

    for publication in publications:

        publication_date = (
            _parse_date(
                publication.get(
                    "created_at"
                )
            )
            or _parse_date(
                publication.get(
                    "scheduled_at"
                )
            )
        )

        if not publication_date:
            continue

        key = publication_date.isoformat()

        daily_data[key]["total"] += 1

        status = _normalize_status(
            publication.get("status")
        )

        if status == "published":
            daily_data[key][
                "published"
            ] += 1

        elif status == "scheduled":
            daily_data[key][
                "scheduled"
            ] += 1

        elif status == "failed":
            daily_data[key][
                "failed"
            ] += 1

        else:
            daily_data[key][
                "pending"
            ] += 1

    daily = []

    for day, values in sorted(
        daily_data.items()
    ):
        daily.append({
            "date": day,
            **values,
        })

    # --------------------------------------------------------
    # Recent publications
    # --------------------------------------------------------

    recent_publications = []

    for publication in publications[:10]:

        platform = (
            publication.get(
                "platforms"
            )
            or {}
        )

        recent_publications.append({
            "id": publication.get(
                "id"
            ),
            "post_id": publication.get(
                "post_id"
            ),
            "platform_id": (
                publication.get(
                    "platform_id"
                )
                or platform.get("id")
            ),
            "platform_name": platform.get(
                "name"
            ),
            "platform_slug": platform.get(
                "slug"
            ),
            "status": _normalize_status(
                publication.get(
                    "status"
                )
            ),
            "scheduled_at": publication.get(
                "scheduled_at"
            ),
            "published_at": publication.get(
                "published_at"
            ),
            "created_at": publication.get(
                "created_at"
            ),
            "error_message": publication.get(
                "error_message"
            ),
        })

    return {
        "summary": summary,
        "platforms": platforms,
        "daily": daily,
        "recent_publications": (
            recent_publications
        ),
    }


def get_overview(
    user_id: str,
):
    return get_analytics(
        user_id=user_id
    )


def get_platform_analytics(
    user_id: str,
):
    analytics = get_analytics(
        user_id=user_id
    )

    return analytics["platforms"]


def get_daily_analytics(
    user_id: str,
    start_date: date | None = None,
    end_date: date | None = None,
):
    analytics = get_analytics(
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
    )

    return analytics["daily"]