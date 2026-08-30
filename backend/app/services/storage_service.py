import base64
import uuid

from app.db.supabase import supabase


BUCKET_NAME = "post-media"


def upload_base64_image(
    image_base64: str,
    user_id: str,
) -> str:
    """
    Upload a base64 encoded image to Supabase Storage
    and return its public URL.
    """

    if not image_base64:
        raise ValueError("Image data is empty")

    # Remove data URI prefix if present
    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    image_bytes = base64.b64decode(image_base64)

    file_name = (
        f"{user_id}/"
        f"{uuid.uuid4().hex}.jpg"
    )

    supabase.storage.from_(BUCKET_NAME).upload(
        file_name,
        image_bytes,
        {
            "content-type": "image/jpeg",
            "upsert": "false",
        },
    )

    public_url = (
        supabase.storage
        .from_(BUCKET_NAME)
        .get_public_url(file_name)
    )

    return public_url