from fastapi import APIRouter, HTTPException

from app.db.supabase import supabase
from app.schemas.post import (
    PostCreate,
    PostUpdate,
    PostPublicationCreate,
)
from app.services.posts import (
    validate_platform,
    validate_account,
    check_duplicate_publication,
)


router = APIRouter(
    prefix="/api/posts",
    tags=["Posts"],
)

DEV_USER_ID = "00000000-0000-0000-0000-000000000001"


def resolve_publication_account(
    platform_id: str,
    social_account_id: str | None = None,
):
    """
    Resolve a real social_accounts.id for a publication.

    post_publications.account_id is NOT NULL, therefore every
    publication must have a valid connected account.
    """
    if social_account_id:
        account = (
            supabase
            .table("social_accounts")
            .select("*")
            .eq("id", social_account_id)
            .eq("user_id", DEV_USER_ID)
            .maybe_single()
            .execute()
        )

        account = account.data if account else None

        if not account:
            raise HTTPException(
                status_code=404,
                detail="Social account not found.",
            )

        validate_account(
            social_account_id,
            platform_id,
        )

        return social_account_id

    response = (
        supabase
        .table("social_accounts")
        .select("id, platform_id, is_active")
        .eq("user_id", DEV_USER_ID)
        .eq("platform_id", platform_id)
        .eq("is_active", True)
        .limit(1)
        .execute()
    )

    account = (response.data or [None])[0]

    if not account:
        raise HTTPException(
            status_code=400,
            detail=(
                "No active social account is connected for "
                "this platform. Select a connected account first."
            ),
        )

    return account["id"]


def attach_media(post: dict) -> dict:
    media_response = (
        supabase
        .table("post_media")
        .select("*")
        .eq("post_id", post["id"])
        .order("created_at", desc=False)
        .execute()
    )

    media = media_response.data or []

    post["media"] = media

    media_url = post.get("media_url")

    if not media_url and media:
        media_url = media[0].get("media_url")

    post["media_url"] = media_url
    post["image_url"] = media_url

    return post


@router.get("/")
def get_posts():
    response = (
        supabase
        .table("posts")
        .select("*")
        .eq("user_id", DEV_USER_ID)
        .order("created_at", desc=True)
        .execute()
    )

    posts = response.data or []

    for post in posts:
        attach_media(post)

    return {
        "success": True,
        "count": len(posts),
        "posts": posts,
    }


@router.get("/recent")
def get_recent_posts():
    response = (
        supabase
        .table("posts")
        .select("*")
        .eq("user_id", DEV_USER_ID)
        .order("created_at", desc=True)
        .limit(5)
        .execute()
    )

    posts = response.data or []

    for post in posts:
        attach_media(post)

    return {
        "success": True,
        "count": len(posts),
        "posts": posts,
    }


@router.get("/{post_id}")
def get_post(post_id: str):
    response = (
        supabase
        .table("posts")
        .select("*")
        .eq("id", post_id)
        .eq("user_id", DEV_USER_ID)
        .maybe_single()
        .execute()
    )

    post = response.data if response else None

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found",
        )

    attach_media(post)

    return {
        "success": True,
        "post": post,
    }


@router.post("/")
def create_post(post: PostCreate):
    if not post.content.strip():
        raise HTTPException(
            status_code=400,
            detail="Post content cannot be empty.",
        )

    post_data = {
        "user_id": DEV_USER_ID,
        "title": post.title,
        "content": post.content,
        "status": post.status.value,
        "scheduled_at": (
            post.scheduled_at.isoformat()
            if post.scheduled_at
            else None
        ),
        "media_url": post.media_url,
    }

    response = (
        supabase
        .table("posts")
        .insert(post_data)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to create post.",
        )

    created_post = response.data[0]
    post_id = created_post["id"]

    publications = []

    # -------------------------------------------------
    # Platform IDs
    # -------------------------------------------------
    for platform_id in (post.platform_ids or []):
        validate_platform(platform_id)

        if check_duplicate_publication(
            post_id,
            platform_id,
        ):
            continue

        account_id = resolve_publication_account(
            platform_id,
        )

        publications.append({
            "post_id": post_id,
            "platform_id": platform_id,
            "social_account_id": account_id,
            "account_id": account_id,
            "status": (
                "scheduled"
                if post.scheduled_at
                else "pending"
            ),
            "scheduled_at": (
                post.scheduled_at.isoformat()
                if post.scheduled_at
                else None
            ),
        })

    # -------------------------------------------------
    # Selected social accounts
    # -------------------------------------------------
    for account_id in (post.account_ids or []):
        account_response = (
            supabase
            .table("social_accounts")
            .select("*")
            .eq("id", account_id)
            .eq("user_id", DEV_USER_ID)
            .maybe_single()
            .execute()
        )

        account = (
            account_response.data
            if account_response
            else None
        )

        if not account:
            raise HTTPException(
                status_code=404,
                detail=f"Social account {account_id} not found.",
            )

        platform_id = account.get("platform_id")

        if not platform_id:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Social account {account_id} has no "
                    "platform_id."
                ),
            )

        validate_platform(platform_id)
        validate_account(account_id, platform_id)

        if check_duplicate_publication(
            post_id,
            platform_id,
        ):
            continue

        publications.append({
            "post_id": post_id,
            "platform_id": platform_id,
            "social_account_id": account_id,
            "account_id": account_id,
            "status": (
                "scheduled"
                if post.scheduled_at
                else "pending"
            ),
            "scheduled_at": (
                post.scheduled_at.isoformat()
                if post.scheduled_at
                else None
            ),
        })

    if publications:
        (
            supabase
            .table("post_publications")
            .insert(publications)
            .execute()
        )

    attach_media(created_post)

    return {
        "success": True,
        "message": "Post created successfully.",
        "post": created_post,
        "publications": publications,
    }


@router.put("/{post_id}")
def update_post(
    post_id: str,
    post: PostUpdate,
):
    existing = (
        supabase
        .table("posts")
        .select("*")
        .eq("id", post_id)
        .eq("user_id", DEV_USER_ID)
        .maybe_single()
        .execute()
    )

    if not existing or not existing.data:
        raise HTTPException(
            status_code=404,
            detail="Post not found.",
        )

    update_data = post.model_dump(
        exclude_unset=True,
    )

    if "status" in update_data:
        status = update_data["status"]
        update_data["status"] = (
            status.value
            if hasattr(status, "value")
            else status
        )

    if "scheduled_at" in update_data:
        value = update_data["scheduled_at"]
        update_data["scheduled_at"] = (
            value.isoformat()
            if value
            else None
        )

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided.",
        )

    response = (
        supabase
        .table("posts")
        .update(update_data)
        .eq("id", post_id)
        .eq("user_id", DEV_USER_ID)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to update post.",
        )

    updated_post = response.data[0]
    attach_media(updated_post)

    return {
        "success": True,
        "message": "Post updated successfully.",
        "post": updated_post,
    }


@router.delete("/{post_id}")
def delete_post(post_id: str):
    existing = (
        supabase
        .table("posts")
        .select("id")
        .eq("id", post_id)
        .eq("user_id", DEV_USER_ID)
        .maybe_single()
        .execute()
    )

    if not existing or not existing.data:
        raise HTTPException(
            status_code=404,
            detail="Post not found.",
        )

    (
        supabase
        .table("post_media")
        .delete()
        .eq("post_id", post_id)
        .execute()
    )

    (
        supabase
        .table("post_publications")
        .delete()
        .eq("post_id", post_id)
        .execute()
    )

    (
        supabase
        .table("posts")
        .delete()
        .eq("id", post_id)
        .eq("user_id", DEV_USER_ID)
        .execute()
    )

    return {
        "success": True,
        "message": "Post deleted successfully.",
    }


@router.post("/{post_id}/publications")
def add_publication(
    post_id: str,
    publication: PostPublicationCreate,
):
    post_response = (
        supabase
        .table("posts")
        .select("id")
        .eq("id", post_id)
        .eq("user_id", DEV_USER_ID)
        .maybe_single()
        .execute()
    )

    if not post_response or not post_response.data:
        raise HTTPException(
            status_code=404,
            detail="Post not found.",
        )

    validate_platform(publication.platform_id)

    if check_duplicate_publication(
        post_id,
        publication.platform_id,
    ):
        raise HTTPException(
            status_code=409,
            detail="This post is already connected to this platform.",
        )

    account_id = resolve_publication_account(
        publication.platform_id,
        publication.social_account_id,
    )

    data = {
        "post_id": post_id,
        "platform_id": publication.platform_id,
        "social_account_id": account_id,
        "account_id": account_id,
        "status": (
            "scheduled"
            if publication.scheduled_at
            else "pending"
        ),
        "scheduled_at": (
            publication.scheduled_at.isoformat()
            if publication.scheduled_at
            else None
        ),
    }

    response = (
        supabase
        .table("post_publications")
        .insert(data)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to add publication.",
        )

    return {
        "success": True,
        "message": "Platform added to post.",
        "publication": response.data[0],
    }


@router.get("/{post_id}/publications")
def get_publications(post_id: str):
    post_response = (
        supabase
        .table("posts")
        .select("id")
        .eq("id", post_id)
        .eq("user_id", DEV_USER_ID)
        .maybe_single()
        .execute()
    )

    if not post_response or not post_response.data:
        raise HTTPException(
            status_code=404,
            detail="Post not found.",
        )

    response = (
        supabase
        .table("post_publications")
        .select(
            "*, platforms(*), social_accounts(*)"
        )
        .eq("post_id", post_id)
        .order("created_at")
        .execute()
    )

    return {
        "success": True,
        "count": len(response.data or []),
        "publications": response.data or [],
    }
