from fastapi import (
    APIRouter,
    HTTPException,
)

from app.services.dashboard_service import (
    get_dashboard,
)


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


DEV_USER_ID = (
    "00000000-0000-0000-0000-000000000001"
)


@router.get("")
def dashboard():

    try:

        data = get_dashboard(
            DEV_USER_ID
        )

        return {
            "success": True,
            **data,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to load dashboard: "
                f"{str(exc)}"
            ),
        )