from datetime import datetime, timezone

from app.db.supabase import supabase

from app.services.publisher_service import (
    publish_to_platform,
)


def get_publication(
    publication_id: str,
):
    response = (
        supabase
        .table("post_publications")
        .select(
            """
            *,
            posts(*),
            platforms(*),
            social_accounts(*)
            """
        )
        .eq(
            "id",
            publication_id,
        )
        .maybe_single()
        .execute()
    )

    return response.data


def get_post_media(
    post_id: str,
):
    response = (
        supabase
        .table("post_media")
        .select(
            """
            media_url,
            media_type,
            sort_order
            """
        )
        .eq(
            "post_id",
            post_id,
        )
        .order(
            "sort_order",
        )
        .execute()
    )

    return response.data or []


def update_publication_status(
    publication_id: str,
    status: str,
    error_message: str | None = None,
):
    data = {
        "status": status,
        "error_message": error_message,
    }

    response = (
        supabase
        .table("post_publications")
        .update(data)
        .eq(
            "id",
            publication_id,
        )
        .execute()
    )

    return (
        response.data[0]
        if response.data
        else None
    )


async def publish_publication(
    publication_id: str,
    user_id: str,
    already_claimed: bool = False,
):
    """
    Publish one post publication.

    already_claimed=True is used by the scheduler
    because scheduler already changed scheduled -> publishing.
    """

    publication = get_publication(
        publication_id
    )

    if not publication:
        raise ValueError(
            "Publication not found."
        )

    post = publication.get(
        "posts"
    )

    if not post:
        raise ValueError(
            "Post not found."
        )

    if str(
        post.get("user_id")
    ) != str(user_id):
        raise ValueError(
            "You do not have access "
            "to this publication."
        )

    current_status = publication.get(
        "status"
    )

    if (
        current_status == "published"
    ):
        return {
            "success": True,
            "already_published": True,
            "publication": publication,
        }

    if (
        not already_claimed
        and current_status
        not in {
            "pending",
            "scheduled",
        }
    ):
        raise ValueError(
            f"Publication cannot be "
            f"published from status "
            f"'{current_status}'."
        )

    platform = publication.get(
        "platforms"
    )

    if not platform:
        raise ValueError(
            "Platform not found."
        )

    platform_key = (
        platform.get("key")
        or platform.get("slug")
    )

    if not platform_key:
        raise ValueError(
            "Platform key is missing."
        )

    account = publication.get(
        "social_accounts"
    )

    if not account:
        raise ValueError(
            f"No social account connected "
            f"for {platform_key}."
        )

    if not account.get(
        "is_active",
        True,
    ):
        raise ValueError(
            "Social account is inactive."
        )

    if not account.get(
        "access_token"
    ):
        raise ValueError(
            "Social account access token "
            "is missing."
        )

    content = (
        post.get("content")
        or ""
    ).strip()

    if not content:
        raise ValueError(
            "Post content is empty."
        )

    media_records = get_post_media(
        post["id"]
    )

    media_urls = [
        item["media_url"]
        for item in media_records
        if item.get("media_url")
    ]

    # If scheduler has not claimed the post,
    # move it to publishing now.
    if not already_claimed:

        update_publication_status(
            publication_id,
            "publishing",
            None,
        )

    try:

        result = await publish_to_platform(
            platform=platform_key,
            content=content,
            media_urls=media_urls,
            account=account,
        )

        if not result.get(
            "success"
        ):

            error_message = (
                result.get("error")
                or result.get("message")
                or "Publishing failed."
            )

            update_publication_status(
                publication_id,
                "failed",
                error_message,
            )

            return {
                "success": False,
                "error": error_message,
            }

        provider_data = (
            result.get("data")
            or result
        )

        update_data = {
            "status": "published",
            "published_at": (
                datetime.now(
                    timezone.utc
                ).isoformat()
            ),
            "error_message": None,
        }

        external_id = (
            provider_data.get("id")
            or provider_data.get(
                "post_id"
            )
            or provider_data.get(
                "external_id"
            )
        )

        if external_id:
            update_data[
                "external_post_id"
            ] = str(external_id)

        try:

            updated = (
                supabase
                .table("post_publications")
                .update(update_data)
                .eq(
                    "id",
                    publication_id,
                )
                .execute()
            )

        except Exception:

            update_data.pop(
                "external_post_id",
                None,
            )

            updated = (
                supabase
                .table("post_publications")
                .update(update_data)
                .eq(
                    "id",
                    publication_id,
                )
                .execute()
            )

        # Mark post published only when
        # the publication succeeded.
        (
            supabase
            .table("posts")
            .update({
                "status": "published",
            })
            .eq(
                "id",
                post["id"],
            )
            .execute()
        )

        return {
            "success": True,
            "publication": (
                updated.data[0]
                if updated.data
                else None
            ),
            "provider_response": result,
        }

    except Exception as exc:

        error_message = str(exc)

        update_publication_status(
            publication_id,
            "failed",
            error_message,
        )

        raise