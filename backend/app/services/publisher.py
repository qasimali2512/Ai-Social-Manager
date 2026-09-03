from datetime import datetime, timezone

from app.db.supabase import supabase
from app.services.publisher_service import publish_to_platform


def get_publication(publication_id: str):
    response = (
        supabase.table("post_publications")
        .select("*, posts(*), platforms(*), social_accounts(*)")
        .eq("id", publication_id)
        .maybe_single()
        .execute()
    )
    return response.data


def get_post_media(post_id: str):
    response = (
        supabase.table("post_media")
        .select("media_url, media_type, sort_order")
        .eq("post_id", post_id)
        .order("sort_order")
        .execute()
    )
    return response.data or []


def update_publication_status(
    publication_id: str,
    status: str,
    error_message: str | None = None,
):
    response = (
        supabase.table("post_publications")
        .update({"status": status, "error_message": error_message})
        .eq("id", publication_id)
        .execute()
    )
    return response.data[0] if response.data else None


def _external_id(result: dict) -> str | None:
    data = result.get("data") or result
    value = (
        data.get("id")
        or data.get("post_id")
        or data.get("external_id")
    )
    return str(value) if value else None


async def publish_publication(
    publication_id: str,
    user_id: str,
    already_claimed: bool = False,
):
    publication = get_publication(publication_id)
    if not publication:
        raise ValueError("Publication not found.")

    post = publication.get("posts")
    if not post:
        raise ValueError("Post not found.")

    if str(post.get("user_id")) != str(user_id):
        raise ValueError("You do not have access to this publication.")

    current_status = publication.get("status")
    if current_status == "published":
        return {"success": True, "already_published": True, "publication": publication}

    if not already_claimed and current_status not in {"pending", "scheduled"}:
        raise ValueError(
            f"Publication cannot be published from status '{current_status}'."
        )

    platform = publication.get("platforms")
    account = publication.get("social_accounts")
    if not platform:
        raise ValueError("Platform not found.")
    if not account:
        raise ValueError("No social account connected for this publication.")
    if not account.get("is_active", True):
        raise ValueError("Social account is inactive.")
    if not account.get("access_token"):
        raise ValueError("Social account access token is missing.")

    platform_key = str(
        platform.get("key") or platform.get("slug") or ""
    ).lower().strip()
    if not platform_key:
        raise ValueError("Platform key is missing.")

    content = str(post.get("content") or "").strip()
    if not content:
        raise ValueError("Post content is empty.")

    media_urls = [
        item.get("media_url")
        for item in get_post_media(post["id"])
        if item.get("media_url")
    ]

    if not already_claimed:
        update_publication_status(publication_id, "publishing")

    try:
        result = await publish_to_platform(
            platform=platform_key,
            content=content,
            media_urls=media_urls,
            account=account,
        )

        if not result.get("success"):
            error_message = (
                result.get("error")
                or result.get("message")
                or "Publishing failed."
            )
            update_publication_status(
                publication_id, "failed", error_message
            )
            return {"success": False, "error": error_message}

        update_data = {
            "status": "published",
            "published_at": datetime.now(timezone.utc).isoformat(),
            "error_message": None,
        }

        external_id = _external_id(result)
        if external_id:
            update_data["external_post_id"] = external_id

        updated_response = (
            supabase.table("post_publications")
            .update(update_data)
            .eq("id", publication_id)
            .execute()
        )

        # Keep the post-level status in sync only after the external API says
        # the platform post was created successfully.
        supabase.table("posts").update({"status": "published"}).eq(
            "id", post["id"]
        ).execute()

        return {
            "success": True,
            "publication": (
                updated_response.data[0]
                if updated_response.data
                else None
            ),
            "provider_response": result,
        }

    except Exception as exc:
        update_publication_status(
            publication_id, "failed", str(exc)
        )
        raise
