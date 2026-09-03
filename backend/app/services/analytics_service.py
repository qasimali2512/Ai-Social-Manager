from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from app.db.supabase import safe_execute, supabase

DEV_USER_ID = "00000000-0000-0000-0000-000000000001"

METRIC_KEYS = (
    "likes", "comments", "shares", "saves", "clicks",
    "reach", "impressions", "video_views", "engagement",
)


def _empty_metrics() -> Dict[str, Any]:
    return {**{key: 0 for key in METRIC_KEYS}, "engagement_rate": 0.0}


def _number(value: Any) -> int:
    try:
        return max(0, int(value or 0))
    except (TypeError, ValueError):
        return 0


def _date(value: Any):
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed
    except (TypeError, ValueError):
        return None


def _add_metrics(target: Dict[str, Any], source: Dict[str, Any]) -> None:
    for key in METRIC_KEYS:
        target[key] += _number(source.get(key))


def _finalize_metrics(data: Dict[str, Any]) -> Dict[str, Any]:
    data = {**_empty_metrics(), **data}
    if not data["engagement"]:
        data["engagement"] = (
            data["likes"] + data["comments"] + data["shares"]
            + data["saves"] + data["clicks"]
        )
    if data["impressions"]:
        data["engagement_rate"] = round(
            data["engagement"] / data["impressions"] * 100, 2
        )
    return data


def get_full_analytics(days: int = 30, user_id: str = DEV_USER_ID) -> Dict[str, Any]:
    days = max(1, min(int(days or 30), 365))
    start = datetime.now(timezone.utc) - timedelta(days=days)

    posts_response = safe_execute(
        supabase.table("posts")
        .select("id,status,platform,created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
    )
    posts = posts_response.data or []

    posts_in_period = []
    for post in posts:
        created = _date(post.get("created_at"))
        if created is None or created >= start:
            posts_in_period.append(post)

    overview = _empty_metrics()
    overview.update({"total_posts": len(posts_in_period), "published": 0, "scheduled": 0, "failed": 0, "draft": 0, "success_rate": 0.0})

    post_platforms: Dict[str, int] = {}
    daily_activity: Dict[str, int] = {}
    post_ids = {post.get("id") for post in posts_in_period if post.get("id")}

    for post in posts_in_period:
        status = str(post.get("status") or "draft").lower()
        if status == "published": overview["published"] += 1
        elif status == "scheduled": overview["scheduled"] += 1
        elif status == "failed": overview["failed"] += 1
        else: overview["draft"] += 1

        platform = str(post.get("platform") or "unknown").lower()
        post_platforms[platform] = post_platforms.get(platform, 0) + 1
        created = _date(post.get("created_at"))
        if created:
            key = created.strftime("%Y-%m-%d")
            daily_activity[key] = daily_activity.get(key, 0) + 1

    completed = overview["published"] + overview["failed"]
    if completed:
        overview["success_rate"] = round(overview["published"] / completed * 100, 2)

    publications_response = safe_execute(
        supabase.table("post_publications")
        .select("id,post_id,platform_id,status,created_at,published_at,scheduled_at,platforms(id,name,slug,icon)")
        .order("created_at", desc=True)
    )
    publications = [
        item for item in (publications_response.data or [])
        if item.get("post_id") in post_ids
    ]

    # Publication records are the source of truth for platform activity.
    platform_data: Dict[str, Dict[str, Any]] = {}
    for item in publications:
        platform = item.get("platforms") or {}
        key = str(platform.get("slug") or platform.get("name") or "unknown").lower()
        bucket = platform_data.setdefault(key, {"posts": 0, "published": 0, "scheduled": 0, "failed": 0, **_empty_metrics()})
        bucket["posts"] += 1
        status = str(item.get("status") or "").lower()
        if status == "published": bucket["published"] += 1
        elif status in {"scheduled", "pending"}: bucket["scheduled"] += 1
        elif status == "failed": bucket["failed"] += 1

    # Optional real metrics table. If it is not installed yet, analytics still works.
    try:
        metric_response = safe_execute(
            supabase.table("social_post_metrics")
            .select("post_id,platform,likes,comments,shares,saves,clicks,reach,impressions,video_views,engagement,engagement_rate,created_at")
            .eq("user_id", user_id)
        )
        metric_rows = metric_response.data or []
    except Exception:
        metric_rows = []

    daily_metrics: Dict[str, Dict[str, Any]] = {}
    for row in metric_rows:
        row_date = _date(row.get("created_at"))
        if row.get("post_id") not in post_ids or (row_date and row_date < start):
            continue
        normalized = _empty_metrics()
        for key in METRIC_KEYS:
            normalized[key] = _number(row.get(key))
        normalized = _finalize_metrics(normalized)
        _add_metrics(overview, normalized)

        platform = str(row.get("platform") or "unknown").lower()
        bucket = platform_data.setdefault(platform, {"posts": 0, "published": 0, "scheduled": 0, "failed": 0, **_empty_metrics()})
        _add_metrics(bucket, normalized)

        if row_date:
            key = row_date.strftime("%Y-%m-%d")
            daily = daily_metrics.setdefault(key, _empty_metrics())
            _add_metrics(daily, normalized)

    overview = _finalize_metrics(overview)
    for key, bucket in platform_data.items():
        platform_data[key] = _finalize_metrics(bucket)

    return {
        "period_days": days,
        "overview": overview,
        "posts": {
            "total": overview["total_posts"],
            "published": overview["published"],
            "scheduled": overview["scheduled"],
            "failed": overview["failed"],
            "draft": overview["draft"],
        },
        "platforms": platform_data,
        "post_platforms": post_platforms,
        "daily_activity": [
            {"date": date, "posts": count}
            for date, count in sorted(daily_activity.items())
        ],
        "daily_metrics": [
            {"date": date, **_finalize_metrics(values)}
            for date, values in sorted(daily_metrics.items())
        ],
    }
