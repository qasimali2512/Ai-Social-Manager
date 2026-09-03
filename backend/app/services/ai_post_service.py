from app.db.supabase import supabase
from app.services.storage_service import upload_base64_image


DEV_USER_ID = "00000000-0000-0000-0000-000000000001"


def save_generated_post(
    user_id: str,
    request_data: dict,
    generated_content: str | None,
    image_base64: str | None = None,
):
    """
    Save AI-generated post.

    Important:
    - posts table does NOT contain a platform column.
    - posts.title is NOT NULL.
    - Generated image is stored in Supabase Storage.
    - Image metadata is stored in post_media.
    """

    topic = request_data.get("topic") or "AI Social Post"

    # -------------------------------------------------
    # TITLE
    # -------------------------------------------------
    # The database requires title NOT NULL.
    # For AI generated posts, use the topic as title.
    title = (
        request_data.get("title")
        or topic
        or "AI Social Post"
    )

    # -------------------------------------------------
    # POST DATA
    # -------------------------------------------------
    # IMPORTANT:
    # Do NOT add "platform" here because your
    # public.posts table does not have that column.
    post_data = {
        "user_id": user_id or DEV_USER_ID,

        "title": title,

        "caption": generated_content or "",

        "topic": topic,

        "tone": (
            request_data.get("tone")
            or "Professional"
        ),

        "language": (
            request_data.get("language")
            or "English"
        ),

        "content": generated_content or "",

        "status": "draft",
    }

    # -------------------------------------------------
    # SAVE POST
    # -------------------------------------------------
    post_response = (
        supabase
        .table("posts")
        .insert(post_data)
        .execute()
    )

    if not post_response.data:
        return None

    post = post_response.data[0]

    # Always initialize media
    post["media"] = []

    # -------------------------------------------------
    # UPLOAD GENERATED IMAGE
    # -------------------------------------------------
    if image_base64:

        image_url = upload_base64_image(
            image_base64=image_base64,
            user_id=user_id or DEV_USER_ID,
        )

        if image_url:

            # -------------------------------------------------
            # Save URL directly in posts.media_url
            # -------------------------------------------------
            media_update = (
                supabase
                .table("posts")
                .update({
                    "media_url": image_url,
                })
                .eq(
                    "id",
                    post["id"],
                )
                .execute()
            )

            if media_update.data:
                post = media_update.data[0]

            # -------------------------------------------------
            # Save media record
            # -------------------------------------------------
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

            # -------------------------------------------------
            # Frontend-friendly field
            # -------------------------------------------------
            post["image_url"] = image_url

    else:
        post["image_url"] = post.get(
            "media_url"
        )

    return post


# =======================================================
# REGENERATE AN EXISTING POST
# =======================================================
#
# Used by the Posts page "Regenerate" dropdown:
#   - Regenerate Text  -> mode="text"
#   - Regenerate Image -> mode="image"
#   - Regenerate Both  -> mode="both"
#
# Unlike save_generated_post (which always INSERTs a new
# row), this UPDATES the existing post in place so the
# post keeps its id, created_at, status, schedule, etc.
# =======================================================

def regenerate_post(
    user_id: str,
    post_id: str,
    mode: str,
    generated_content: str | None = None,
    image_base64: str | None = None,
):
    """
    Update an existing post's content and/or image.

    mode == "text"  -> only touches content/caption
    mode == "image" -> only touches the image
    mode == "both"  -> touches both (whatever was
                        returned/provided)
    """

    # -------------------------------------------------
    # LOAD EXISTING POST
    # -------------------------------------------------
    existing_response = (
        supabase
        .table("posts")
        .select("*")
        .eq("id", post_id)
        .eq("user_id", user_id or DEV_USER_ID)
        .maybe_single()
        .execute()
    )

    existing = existing_response.data if existing_response else None

    if not existing:
        return None

    update_data = {}

    # -------------------------------------------------
    # TEXT
    # -------------------------------------------------
    if mode in ("text", "both") and generated_content:
        update_data["content"] = generated_content
        update_data["caption"] = generated_content

    # -------------------------------------------------
    # SAVE TEXT UPDATE (if any)
    # -------------------------------------------------
    post = existing

    if update_data:
        update_response = (
            supabase
            .table("posts")
            .update(update_data)
            .eq("id", post_id)
            .eq("user_id", user_id or DEV_USER_ID)
            .execute()
        )

        if update_response.data:
            post = update_response.data[0]

    post["media"] = []

    # -------------------------------------------------
    # IMAGE
    # -------------------------------------------------
    if mode in ("image", "both") and image_base64:

        image_url = upload_base64_image(
            image_base64=image_base64,
            user_id=user_id or DEV_USER_ID,
        )

        if image_url:

            media_update = (
                supabase
                .table("posts")
                .update({
                    "media_url": image_url,
                })
                .eq("id", post_id)
                .eq("user_id", user_id or DEV_USER_ID)
                .execute()
            )

            if media_update.data:
                post = media_update.data[0]

            # Remove old media rows for this post so the
            # gallery doesn't keep piling up stale images,
            # then record the new one.
            (
                supabase
                .table("post_media")
                .delete()
                .eq("post_id", post_id)
                .execute()
            )

            media_response = (
                supabase
                .table("post_media")
                .insert({
                    "post_id": post_id,
                    "media_url": image_url,
                    "media_type": "image",
                })
                .execute()
            )

            post["media"] = media_response.data or []
            post["image_url"] = image_url

    if "image_url" not in post:
        post["image_url"] = post.get("media_url")

    return post