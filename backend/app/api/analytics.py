from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.analytics_service import DEV_USER_ID, get_full_analytics

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


class AnalyticsQuery(BaseModel):
    days: int = Field(default=30, ge=1, le=365)


@router.get("/")
def analytics(days: int = 30):
    try:
        return get_full_analytics(days=days, user_id=DEV_USER_ID)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analytics could not be loaded: {exc}")


@router.post("/sync")
def sync_analytics(request: AnalyticsQuery):
    try:
        data = get_full_analytics(days=request.days, user_id=DEV_USER_ID)
        return {
            "success": True,
            "message": "Analytics refreshed from the database.",
            "period_days": request.days,
            "results": [],
            "overview": data["overview"],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analytics refresh failed: {exc}")
