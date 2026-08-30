from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.services.media import (
    upload_post_media,
    get_post_media,
    delete_post_media,
)


router = APIRouter(
    prefix="/api/media",
    tags=["Media"],
)


@router.post("/upload")
async def upload_media(
    user_id: str = Form(...),
    post_id: str = Form(...),
    sort_order: int = Form(0),
    file: UploadFile = File(...),
):
    try:
        media = await upload_post_media(
            user_id=user_id,
            post_id=post_id,
            file=file,
            sort_order=sort_order,
        )

        if not media:
            raise HTTPException(
                status_code=500,
                detail="Failed to save media.",
            )

        return {
            "success": True,
            "media": media,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Media upload failed: {str(exc)}",
        )


@router.get("/post/{post_id}")
def list_post_media(post_id: str):
    return {
        "success": True,
        "media": get_post_media(post_id),
    }


@router.delete("/{media_id}")
def remove_media(
    media_id: str,
    post_id: str,
):
    deleted = delete_post_media(
        media_id=media_id,
        post_id=post_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Media not found.",
        )

    return {
        "success": True,
        "message": "Media deleted successfully.",
    }