from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from app.services.notification_service import (
    get_notifications,
    get_unread_count,
    mark_as_read,
    mark_all_as_read,
)


router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"],
)


DEV_USER_ID = (
    "00000000-0000-0000-0000-000000000001"
)


@router.get("")
def notifications(
    unread_only: bool = Query(
        default=False
    ),
):

    try:

        data = get_notifications(
            user_id=DEV_USER_ID,
            unread_only=unread_only,
        )

        return {
            "success": True,
            "count": len(data),
            "unread_count": (
                get_unread_count(
                    DEV_USER_ID
                )
            ),
            "notifications": data,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to load notifications: "
                f"{str(exc)}"
            ),
        )


@router.get("/unread-count")
def unread_count():

    try:

        count = get_unread_count(
            DEV_USER_ID
        )

        return {
            "success": True,
            "count": count,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to load unread "
                f"count: {str(exc)}"
            ),
        )


@router.patch(
    "/{notification_id}/read"
)
def read_notification(
    notification_id: str,
):

    try:

        notification = mark_as_read(
            notification_id=notification_id,
            user_id=DEV_USER_ID,
        )

        if not notification:
            raise HTTPException(
                status_code=404,
                detail="Notification not found.",
            )

        return {
            "success": True,
            "notification": notification,
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to update notification: "
                f"{str(exc)}"
            ),
        )


@router.patch(
    "/read-all"
)
def read_all_notifications():

    try:

        updated = mark_all_as_read(
            DEV_USER_ID
        )

        return {
            "success": True,
            "updated": len(updated),
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to mark notifications "
                f"as read: {str(exc)}"
            ),
        )