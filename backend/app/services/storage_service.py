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
        raise ValueError(
            "Image data is empty"
        )

    # -------------------------------------------------
    # Remove data URI prefix
    # Example:
    # data:image/jpeg;base64,/9j/4AAQ...
    # -------------------------------------------------
    if "," in image_base64:
        image_base64 = image_base64.split(
            ",",
            1,
        )[1]

    # Remove accidental whitespace/newlines
    image_base64 = image_base64.strip()

    try:
        image_bytes = base64.b64decode(
            image_base64,
            validate=True,
        )
    except Exception as exc:
        raise ValueError(
            "Invalid base64 image data"
        ) from exc

    if not image_bytes:
        raise ValueError(
            "Decoded image is empty"
        )

    # -------------------------------------------------
    # Unique file name
    # -------------------------------------------------
    file_name = (
        f"{user_id}/"
        f"{uuid.uuid4().hex}.jpg"
    )

    # -------------------------------------------------
    # Upload to Supabase Storage
    # -------------------------------------------------
    upload_response = (
        supabase
        .storage
        .from_(BUCKET_NAME)
        .upload(
            file_name,
            image_bytes,
            {
                "content-type": "image/jpeg",
                "upsert": "false",
            },
        )
    )

    # -------------------------------------------------
    # Public URL
    # -------------------------------------------------
    public_url = (
        supabase
        .storage
        .from_(BUCKET_NAME)
        .get_public_url(
            file_name
        )
    )

    if not public_url:
        raise ValueError(
            "Could not generate public image URL"
        )

    return public_url