from datetime import date

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from app.services.calendar_service import (
    get_calendar_events,
)


router = APIRouter(
    prefix="/api/calendar",
    tags=["Calendar"],
)


DEV_USER_ID = (
    "00000000-0000-0000-0000-000000000001"
)


@router.get("")
def calendar_events(
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

        events = get_calendar_events(
            user_id=DEV_USER_ID,
            start_date=start_date,
            end_date=end_date,
        )

        return {
            "success": True,
            "count": len(events),
            "events": events,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to load calendar: "
                f"{str(exc)}"
            ),
        )