from datetime import datetime, timezone

from app.db.supabase import supabase

from app.services.publisher import (
    publish_publication,
)


def get_due_publications():
    """
    Get scheduled publications whose scheduled time
    has arrived.
    """

    now = datetime.now(
        timezone.utc
    ).isoformat()

    response = (
        supabase
        .table("post_publications")
        .select(
            """
            id,
            post_id,
            platform_id,
            social_account_id,
            scheduled_at,
            status
            """
        )
        .eq(
            "status",
            "scheduled",
        )
        .lte(
            "scheduled_at",
            now,
        )
        .order(
            "scheduled_at",
        )
        .execute()
    )

    return response.data or []


def claim_publication(
    publication_id: str,
):
    """
    Atomically move a scheduled publication to publishing.

    This prevents the same scheduled item from being
    picked up repeatedly.
    """

    response = (
        supabase
        .table("post_publications")
        .update({
            "status": "publishing",
            "error_message": None,
        })
        .eq(
            "id",
            publication_id,
        )
        .eq(
            "status",
            "scheduled",
        )
        .execute()
    )

    return bool(response.data)


async def process_scheduled_posts():
    """
    Process all due scheduled publications.
    """

    publications = (
        get_due_publications()
    )

    results = []

    for publication in publications:

        publication_id = publication[
            "id"
        ]

        post_id = publication[
            "post_id"
        ]

        # Claim before publishing.
        claimed = claim_publication(
            publication_id
        )

        if not claimed:
            results.append({
                "id": publication_id,
                "success": False,
                "skipped": True,
                "reason": (
                    "Publication was already "
                    "claimed or processed."
                ),
            })

            continue

        # Find post owner.
        post_response = (
            supabase
            .table("posts")
            .select(
                "id, user_id"
            )
            .eq(
                "id",
                post_id,
            )
            .maybe_single()
            .execute()
        )

        if not post_response.data:

            (
                supabase
                .table("post_publications")
                .update({
                    "status": "failed",
                    "error_message": (
                        "Post not found."
                    ),
                })
                .eq(
                    "id",
                    publication_id,
                )
                .execute()
            )

            results.append({
                "id": publication_id,
                "success": False,
                "error": (
                    "Post not found."
                ),
            })

            continue

        user_id = post_response.data[
            "user_id"
        ]

        try:

            result = await publish_publication(
                publication_id=publication_id,
                user_id=user_id,
                already_claimed=True,
            )

            results.append({
                "id": publication_id,
                "success": result.get(
                    "success",
                    False,
                ),
                "result": result,
            })

        except Exception as exc:

            error_message = str(exc)

            (
                supabase
                .table("post_publications")
                .update({
                    "status": "failed",
                    "error_message": (
                        error_message
                    ),
                })
                .eq(
                    "id",
                    publication_id,
                )
                .execute()
            )

            results.append({
                "id": publication_id,
                "success": False,
                "error": error_message,
            })

    return results