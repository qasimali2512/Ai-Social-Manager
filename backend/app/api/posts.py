from fastapi import (
    APIRouter,
    HTTPException,
)

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


DEV_USER_ID = (
    "00000000-0000-0000-0000-000000000001"
)


@router.get("/")
def get_posts():
    response = (
        supabase
        .table("posts")
        .select("*")
        .eq(
            "user_id",
            DEV_USER_ID,
        )
        .order(
            "created_at",
            desc=True,
        )
        .execute()
    )

    return {
        "success": True,
        "count": len(response.data or []),
        "posts": response.data or [],
    }


@router.get("/recent")
def get_recent_posts():
    response = (
        supabase
        .table("posts")
        .select("*")
        .eq(
            "user_id",
            DEV_USER_ID,
        )
        .order(
            "created_at",
            desc=True,
        )
        .limit(5)
        .execute()
    )

    return {
        "success": True,
        "count": len(response.data or []),
        "posts": response.data or [],
    }


@router.get("/{post_id}")
def get_post(post_id: str):
    response = (
        supabase
        .table("posts")
        .select("*")
        .eq("id", post_id)
        .eq(
            "user_id",
            DEV_USER_ID,
        )
        .maybe_single()
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Post not found",
        )

    return {
        "success": True,
        "post": response.data,
    }


@router.post("/")
def create_post(post: PostCreate):

    if not post.content.strip():
        raise HTTPException(
            status_code=400,
            detail=(
                "Post content cannot be empty"
            ),
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
            detail="Failed to create post",
        )

    created_post = response.data[0]
    post_id = created_post["id"]

    publications = []

    # ----------------------------------------
    # Platform-only publications
    # ----------------------------------------

    for platform_id in post.platform_ids:

        platform = validate_platform(
            platform_id
        )

        duplicate = (
            check_duplicate_publication(
                post_id,
                platform_id,
            )
        )

        if duplicate:
            continue

        publications.append({
            "post_id": post_id,
            "platform_id": platform_id,
            "social_account_id": None,
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

    # ----------------------------------------
    # Selected social accounts
    # ----------------------------------------

    for account_id in post.account_ids:

        account_response = (
            supabase
            .table("social_accounts")
            .select("*")
            .eq(
                "id",
                account_id,
            )
            .eq(
                "user_id",
                DEV_USER_ID,
            )
            .maybe_single()
            .execute()
        )

        account = account_response.data

        if not account:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Social account "
                    f"{account_id} not found"
                ),
            )

        platform_id = account.get(
            "platform_id"
        )

        if platform_id:
            platform = validate_platform(
                platform_id
            )

        else:
            platform_key = account.get(
                "platform"
            )

            if not platform_key:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Social account has "
                        "no platform."
                    ),
                )

            platform_response = (
                supabase
                .table("platforms")
                .select("*")
                .eq(
                    "key",
                    platform_key,
                )
                .maybe_single()
                .execute()
            )

            platform = (
                platform_response.data
            )

            if not platform:
                raise HTTPException(
                    status_code=404,
                    detail=(
                        "Platform for social "
                        "account not found."
                    ),
                )

            platform_id = platform["id"]

        validate_account(
            account_id,
            platform_id,
        )

        existing = (
            supabase
            .table("post_publications")
            .select("id")
            .eq(
                "post_id",
                post_id,
            )
            .eq(
                "platform_id",
                platform_id,
            )
            .maybe_single()
            .execute()
        )

        if existing.data:
            continue

        publications.append({
            "post_id": post_id,
            "platform_id": platform_id,
            "social_account_id": account_id,
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

    return {
        "success": True,
        "message": (
            "Post created successfully"
        ),
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
        .eq(
            "id",
            post_id,
        )
        .eq(
            "user_id",
            DEV_USER_ID,
        )
        .maybe_single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(
            status_code=404,
            detail="Post not found",
        )

    update_data = post.model_dump(
        exclude_unset=True
    )

    if "status" in update_data:
        update_data["status"] = (
            update_data["status"].value
        )

    if "scheduled_at" in update_data:
        value = update_data[
            "scheduled_at"
        ]

        update_data["scheduled_at"] = (
            value.isoformat()
            if value
            else None
        )

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided",
        )

    response = (
        supabase
        .table("posts")
        .update(update_data)
        .eq(
            "id",
            post_id,
        )
        .eq(
            "user_id",
            DEV_USER_ID,
        )
        .execute()
    )

    return {
        "success": True,
        "message": (
            "Post updated successfully"
        ),
        "post": response.data[0],
    }


@router.delete("/{post_id}")
def delete_post(post_id: str):

    existing = (
        supabase
        .table("posts")
        .select("id")
        .eq(
            "id",
            post_id,
        )
        .eq(
            "user_id",
            DEV_USER_ID,
        )
        .maybe_single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(
            status_code=404,
            detail="Post not found",
        )

    (
        supabase
        .table("post_publications")
        .delete()
        .eq(
            "post_id",
            post_id,
        )
        .execute()
    )

    (
        supabase
        .table("posts")
        .delete()
        .eq(
            "id",
            post_id,
        )
        .eq(
            "user_id",
            DEV_USER_ID,
        )
        .execute()
    )

    return {
        "success": True,
        "message": (
            "Post deleted successfully"
        ),
    }


@router.post(
    "/{post_id}/publications"
)
def add_publication(
    post_id: str,
    publication: PostPublicationCreate,
):

    post = (
        supabase
        .table("posts")
        .select("id")
        .eq(
            "id",
            post_id,
        )
        .eq(
            "user_id",
            DEV_USER_ID,
        )
        .maybe_single()
        .execute()
    )

    if not post.data:
        raise HTTPException(
            status_code=404,
            detail="Post not found",
        )

    platform = validate_platform(
        publication.platform_id
    )

    existing = (
        check_duplicate_publication(
            post_id,
            publication.platform_id,
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail=(
                "This post is already "
                "connected to this platform"
            ),
        )

    if publication.social_account_id:
        validate_account(
            publication.social_account_id,
            publication.platform_id,
        )

    data = {
        "post_id": post_id,
        "platform_id": (
            publication.platform_id
        ),
        "social_account_id": (
            publication.social_account_id
        ),
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

    return {
        "success": True,
        "message": (
            "Platform added to post"
        ),
        "publication": response.data[0],
    }


@router.get(
    "/{post_id}/publications"
)
def get_publications(post_id: str):

    post = (
        supabase
        .table("posts")
        .select("id")
        .eq(
            "id",
            post_id,
        )
        .eq(
            "user_id",
            DEV_USER_ID,
        )
        .maybe_single()
        .execute()
    )

    if not post.data:
        raise HTTPException(
            status_code=404,
            detail="Post not found",
        )

    response = (
        supabase
        .table("post_publications")
        .select(
            "*, platforms(*), social_accounts(*)"
        )
        .eq(
            "post_id",
            post_id,
        )
        .order("created_at")
        .execute()
    )

    return {
        "success": True,
        "count": len(response.data or []),
        "publications": response.data or [],
    }