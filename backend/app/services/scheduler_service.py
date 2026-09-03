from datetime import datetime, timezone

from app.db.supabase import supabase
from app.services.publisher import publish_publication


def get_due_publications():
    now = datetime.now(timezone.utc).isoformat()
    response = (
        supabase.table("post_publications")
        .select("id, post_id, platform_id, social_account_id, scheduled_at, status")
        .eq("status", "scheduled")
        .lte("scheduled_at", now)
        .order("scheduled_at")
        .execute()
    )
    return response.data or []


def claim_publication(publication_id: str) -> bool:
    response = (
        supabase.table("post_publications")
        .update({"status": "publishing", "error_message": None})
        .eq("id", publication_id)
        .eq("status", "scheduled")
        .execute()
    )
    return bool(response.data)


async def process_scheduled_posts():
    publications = get_due_publications()
    results = []

    for publication in publications:
        publication_id = publication["id"]

        if not claim_publication(publication_id):
            results.append({
                "id": publication_id,
                "success": False,
                "skipped": True,
                "reason": "Publication was already claimed or processed.",
            })
            continue

        post_response = (
            supabase.table("posts")
            .select("id, user_id")
            .eq("id", publication["post_id"])
            .maybe_single()
            .execute()
        )

        if not post_response.data:
            message = "Post not found."
            supabase.table("post_publications").update({
                "status": "failed",
                "error_message": message,
            }).eq("id", publication_id).execute()
            results.append({"id": publication_id, "success": False, "error": message})
            continue

        user_id = post_response.data["user_id"]

        try:
            result = await publish_publication(
                publication_id=publication_id,
                user_id=user_id,
                already_claimed=True,
            )
            results.append({
                "id": publication_id,
                "success": bool(result.get("success")),
                "result": result,
            })
        except Exception as exc:
            message = str(exc)
            supabase.table("post_publications").update({
                "status": "failed",
                "error_message": message,
            }).eq("id", publication_id).execute()
            results.append({"id": publication_id, "success": False, "error": message})

    return results
