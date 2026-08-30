from datetime import date

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from app.schemas.analytics import (
    AnalyticsResponse,
)

from app.services.analytics_service import (
    get_analytics,
    get_overview,
    get_platform_analytics,
    get_daily_analytics,
)


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"],
)


# ------------------------------------------------------------
# Temporary user until OAuth/authentication phase
# ------------------------------------------------------------

DEV_USER_ID = (
    "00000000-0000-0000-0000-000000000001"
)


@router.get(
    "",
    response_model=AnalyticsResponse,
)
def analytics(
    start_date: date | None = Query(
        default=None
    ),
    end_date: date | None = Query(
        default=None
    ),
):
    if (
        start_date
        and end_date
        and start_date > end_date
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "start_date cannot be "
                "after end_date."
            ),
        )

    try:

        data = get_analytics(
            user_id=DEV_USER_ID,
            start_date=start_date,
            end_date=end_date,
        )

        return {
            "success": True,
            **data,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to load analytics: "
                f"{str(exc)}"
            ),
        )


@router.get(
    "/overview"
)
def analytics_overview():

    try:

        return {
            "success": True,
            **get_overview(
                DEV_USER_ID
            ),
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to load overview: "
                f"{str(exc)}"
            ),
        )


@router.get(
    "/platforms"
)
def analytics_platforms():

    try:

        platforms = (
            get_platform_analytics(
                DEV_USER_ID
            )
        )

        return {
            "success": True,
            "count": len(platforms),
            "platforms": platforms,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to load platform "
                f"analytics: {str(exc)}"
            ),
        )


@router.get(
    "/daily"
)
def analytics_daily(
    start_date: date | None = Query(
        default=None
    ),
    end_date: date | None = Query(
        default=None
    ),
):

    if (
        start_date
        and end_date
        and start_date > end_date
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "start_date cannot be "
                "after end_date."
            ),
        )

    try:

        daily = get_daily_analytics(
            user_id=DEV_USER_ID,
            start_date=start_date,
            end_date=end_date,
        )

        return {
            "success": True,
            "count": len(daily),
            "daily": daily,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to load daily "
                f"analytics: {str(exc)}"
            ),
        )