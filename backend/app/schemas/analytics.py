from datetime import date

from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_posts: int = 0
    published_posts: int = 0
    scheduled_posts: int = 0
    pending_posts: int = 0
    failed_posts: int = 0
    total_publications: int = 0
    successful_publications: int = 0
    failed_publications: int = 0


class PlatformAnalytics(BaseModel):
    platform_id: str | None = None
    platform_name: str = "Unknown"
    platform_slug: str | None = None
    total: int = 0
    published: int = 0
    scheduled: int = 0
    pending: int = 0
    failed: int = 0


class DailyAnalytics(BaseModel):
    date: date
    total: int = 0
    published: int = 0
    scheduled: int = 0
    pending: int = 0
    failed: int = 0


class RecentPublication(BaseModel):
    id: str
    post_id: str | None = None
    platform_id: str | None = None
    platform_name: str | None = None
    platform_slug: str | None = None
    status: str
    scheduled_at: str | None = None
    published_at: str | None = None
    created_at: str | None = None
    error_message: str | None = None


class AnalyticsResponse(BaseModel):
    success: bool
    summary: AnalyticsSummary
    platforms: list[PlatformAnalytics]
    daily: list[DailyAnalytics]
    recent_publications: list[RecentPublication]