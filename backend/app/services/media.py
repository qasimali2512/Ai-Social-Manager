import uuid
from pathlib import Path

from fastapi import UploadFile

from app.db.supabase import supabase


BUCKET_NAME = "post-media"


ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


async def upload_post_media(
    user_id: str,
    post_id: str,
    file: UploadFile,
    sort_order: int = 0,
):
    if file.content_type not in ALLOWED_TYPES:
        raise ValueError(
            "Only JPEG, PNG and WebP images are allowed."
        )

    file_data = await file.read()

    if not file_data:
        raise ValueError("Uploaded file is empty.")

    extension = Path(file.filename or "").suffix.lower()

    if not extension:
        extension = ".jpg"

    file_name = f"{uuid.uuid4()}{extension}"

    storage_path = f"{user_id}/{post_id}/{file_name}"

    # Upload to Supabase Storage
    supabase.storage.from_(BUCKET_NAME).upload(
        storage_path,
        file_data,
        {
            "content-type": file.content_type,
            "upsert": "false",
        },
    )

    # Public URL
    media_url = (
        supabase.storage
        .from_(BUCKET_NAME)
        .get_public_url(storage_path)
    )

    # Save metadata in post_media
    response = (
        supabase
        .table("post_media")
        .insert(
            {
                "post_id": post_id,
                "media_url": media_url,
                "media_type": "image",
                "sort_order": sort_order,
            }
        )
        .execute()
    )

    if not response.data:
        # Remove uploaded file if DB insert failed
        try:
            supabase.storage.from_(BUCKET_NAME).remove(
                [storage_path]
            )
        except Exception:
            pass

        return None

    return response.data[0]


def get_post_media(post_id: str):
    response = (
        supabase
        .table("post_media")
        .select("*")
        .eq("post_id", post_id)
        .order("sort_order")
        .execute()
    )

    return response.data or []


def delete_post_media(
    media_id: str,
    post_id: str,
):
    media_response = (
        supabase
        .table("post_media")
        .select("*")
        .eq("id", media_id)
        .eq("post_id", post_id)
        .maybe_single()
        .execute()
    )

    media = media_response.data

    if not media:
        return False

    media_url = media.get("media_url")

    # Delete DB record
    response = (
        supabase
        .table("post_media")
        .delete()
        .eq("id", media_id)
        .eq("post_id", post_id)
        .execute()
    )

    if not response.data:
        return False

    # Storage cleanup
    if media_url:
        try:
            marker = f"/storage/v1/object/public/{BUCKET_NAME}/"

            if marker in media_url:
                storage_path = media_url.split(marker, 1)[1]

                supabase.storage.from_(BUCKET_NAME).remove(
                    [storage_path]
                )
        except Exception:
            pass

    return True