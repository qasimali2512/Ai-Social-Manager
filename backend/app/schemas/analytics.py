from typing import Dict, List

from pydantic import BaseModel, Field


# ============================================================
# SOCIAL METRICS
# ============================================================

class SocialMetrics(BaseModel):
    likes: int = 0
    comments: int = 0
    shares: int = 0
    saves: int = 0
    clicks: int = 0
    reach: int = 0
    impressions: int = 0
    video_views: int = 0
    engagement: int = 0
    engagement_rate: float = 0.0


# ============================================================
# PLATFORM METRICS
# ============================================================

class PlatformMetrics(SocialMetrics):
    platform: str = "unknown"


# ============================================================
# DAILY ACTIVITY
# ============================================================

class DailyActivity(BaseModel):
    date: str
    posts: int = 0


# ============================================================
# DAILY SOCIAL METRICS
# ============================================================

class DailySocialMetrics(SocialMetrics):
    date: str


# ============================================================
# POSTS OVERVIEW
# ============================================================

class PostsOverview(BaseModel):
    total: int = 0
    published: int = 0
    scheduled: int = 0
    failed: int = 0
    draft: int = 0


# ============================================================
# ANALYTICS OVERVIEW
# ============================================================

class AnalyticsOverview(SocialMetrics):
    total_posts: int = 0
    published: int = 0
    scheduled: int = 0
    failed: int = 0
    draft: int = 0
    success_rate: float = 0.0


# ============================================================
# FULL ANALYTICS RESPONSE
# ============================================================

class AnalyticsResponse(BaseModel):
    period_days: int = Field(
        default=30,
        ge=1,
        le=365,
    )

    overview: AnalyticsOverview

    posts: PostsOverview

    platforms: Dict[
        str,
        SocialMetrics,
    ] = {}

    post_platforms: Dict[
        str,
        int,
    ] = {}

    daily_activity: List[
        DailyActivity
    ] = []

    daily_metrics: List[
        DailySocialMetrics
    ] = []


# ============================================================
# ANALYTICS QUERY
# ============================================================

class AnalyticsQuery(BaseModel):
    days: int = Field(
        default=30,
        ge=1,
        le=365,
    )


# ============================================================
# METRIC SYNC REQUEST
# ============================================================

class MetricsSyncRequest(BaseModel):
    platform: str | None = None
    days: int = Field(
        default=30,
        ge=1,
        le=365,
    )


# ============================================================
# METRIC SYNC RESULT
# ============================================================

class MetricsSyncResult(BaseModel):
    platform: str
    synced: int = 0
    updated: int = 0
    failed: int = 0
    message: str = ""


# ============================================================
# PLATFORM SYNC RESPONSE
# ============================================================

class AnalyticsSyncResponse(BaseModel):
    success: bool = True

    results: List[
        MetricsSyncResult
    ] = []

    message: str = ""