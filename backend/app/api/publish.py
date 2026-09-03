from fastapi import APIRouter, HTTPException

from app.db.supabase import supabase
from app.schemas.publication import PublishPostRequest
from app.services.publisher import publish_publication

router = APIRouter(prefix="/api/publish", tags=["Publishing"])

DEV_USER_ID = "00000000-0000-0000-0000-000000000001"


@router.post("")
async def publish_post(request: PublishPostRequest):
    post = (
        supabase.table("posts")
        .select("id, user_id")
        .eq("id", request.post_id)
        .eq("user_id", DEV_USER_ID)
        .maybe_single()
        .execute()
    )
    if not post.data:
        raise HTTPException(status_code=404, detail="Post not found.")

    account = (
        supabase.table("social_accounts")
        .select("*")
        .eq("id", request.social_account_id)
        .eq("user_id", DEV_USER_ID)
        .maybe_single()
        .execute()
    )
    if not account.data:
        raise HTTPException(status_code=404, detail="Social account not found.")
    if not account.data.get("is_active", True):
        raise HTTPException(status_code=400, detail="Social account is inactive.")
    if not account.data.get("access_token"):
        raise HTTPException(status_code=400, detail="Social account access token is missing.")

    existing = (
        supabase.table("post_publications")
        .select("id")
        .eq("post_id", request.post_id)
        .eq("social_account_id", request.social_account_id)
        .maybe_single()
        .execute()
    )

    if existing.data:
        publication_id = existing.data["id"]
    else:
        platform_id = account.data.get("platform_id")
        if not platform_id:
            platform_key = account.data.get("platform")
            platform_response = (
                supabase.table("platforms")
                .select("id")
                .eq("key", platform_key)
                .maybe_single()
                .execute()
            )
            if not platform_response.data:
                raise HTTPException(status_code=404, detail="Platform not found.")
            platform_id = platform_response.data["id"]

        created = (
            supabase.table("post_publications")
            .insert({
                "post_id": request.post_id,
                "platform_id": platform_id,
                "social_account_id": request.social_account_id,
                "status": "pending",
            })
            .execute()
        )
        if not created.data:
            raise HTTPException(status_code=500, detail="Failed to create publication.")
        publication_id = created.data[0]["id"]

    try:
        result = await publish_publication(
            publication_id=publication_id,
            user_id=DEV_USER_ID,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Publishing failed."))

    return result
