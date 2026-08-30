from fastapi import APIRouter, HTTPException

from app.services.scheduler_service import (
    get_due_publications,
    process_scheduled_posts,
)


router = APIRouter(
    prefix="/api/scheduler",
    tags=["Scheduler"],
)


@router.get("/due")
def due_posts():

    try:

        publications = (
            get_due_publications()
        )

        return {
            "success": True,
            "count": len(publications),
            "publications": publications,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to fetch scheduled "
                f"posts: {str(exc)}"
            ),
        )


@router.post("/process")
async def process_posts():

    try:

        results = (
            await process_scheduled_posts()
        )

        successful = sum(
            1
            for result in results
            if result.get("success")
        )

        failed = sum(
            1
            for result in results
            if (
                not result.get("success")
                and not result.get("skipped")
            )
        )

        skipped = sum(
            1
            for result in results
            if result.get("skipped")
        )

        return {
            "success": True,
            "processed": len(results),
            "successful": successful,
            "failed": failed,
            "skipped": skipped,
            "results": results,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Scheduler failed: {str(exc)}"
            ),
        )