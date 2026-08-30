from app.db.supabase import supabase
from app.services.storage_service import upload_base64_image


def save_generated_post(
    user_id: str,
    request_data: dict,
    generated_content: str | None,
    image_base64: str | None = None,
):
    post_data = {
        "user_id": user_id,
        "topic": request_data.get("topic"),
        "platform": request_data.get("platform"),
        "tone": request_data.get("tone"),
        "language": request_data.get(
            "language",
            "English",
        ),
        "content": generated_content,
        "status": "draft",
    }

    post_response = (
        supabase
        .table("posts")
        .insert(post_data)
        .execute()
    )

    if not post_response.data:
        return None

    post = post_response.data[0]

    # Upload generated image to Supabase Storage
    if image_base64:
        image_url = upload_base64_image(
            image_base64,
            user_id,
        )

        # Save image information in post_media
        media_response = (
            supabase
            .table("post_media")
            .insert({
                "post_id": post["id"],
                "media_url": image_url,
                "media_type": "image",
            })
            .execute()
        )

        post["media"] = (
            media_response.data or []
        )

    return post