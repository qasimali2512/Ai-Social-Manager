from fastapi import (
    APIRouter,
    HTTPException,
)

from app.db.supabase import supabase

from app.schemas.publication import (
    PublishPostRequest,
    PublishPostResponse,
    SchedulePostRequest,
)

from app.services.publication_service import (
    get_publications,
    get_publication,
    create_publication,
    update_publication,
    delete_publication,
)

from app.services.publisher import (
    publish_publication,
)


router = APIRouter(
    prefix="/api/publications",
    tags=["Publications"],
)


DEV_USER_ID = (
    "00000000-0000-0000-0000-000000000001"
)


# ============================================================
# LIST
# ============================================================

@router.get("")
def list_publications():

    publications = get_publications(
        DEV_USER_ID
    )

    return {
        "success": True,
        "count": len(publications),
        "publications": publications,
    }


# ============================================================
# SINGLE
# ============================================================

@router.get("/{publication_id}")
def retrieve_publication(
    publication_id: str,
):

    publication = get_publication(
        publication_id,
        DEV_USER_ID,
    )

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found.",
        )

    return {
        "success": True,
        "publication": publication,
    }


# ============================================================
# CREATE / SCHEDULE
# ============================================================

@router.post("")
def create_post_publication(
    request: SchedulePostRequest,
):

    data = {
        "post_id": request.post_id,
        "platform_id": request.platform_id,
        "social_account_id": (
            request.social_account_id
        ),
        "scheduled_at": (
            request.scheduled_at
        ),
    }

    publication = create_publication(
        user_id=DEV_USER_ID,
        data=data,
    )

    if not publication:
        raise HTTPException(
            status_code=400,
            detail=(
                "Failed to create publication."
            ),
        )

    return {
        "success": True,
        "message": (
            "Publication created successfully."
        ),
        "publication": publication,
    }


# ============================================================
# PUBLISH NOW
# ============================================================

@router.post(
    "/publish",
    response_model=PublishPostResponse,
)
async def publish_now(
    request: PublishPostRequest,
):

    post_response = (
        supabase
        .table("posts")
        .select(
            "id, user_id, content"
        )
        .eq(
            "id",
            request.post_id,
        )
        .eq(
            "user_id",
            DEV_USER_ID,
        )
        .maybe_single()
        .execute()
    )

    if not post_response.data:
        raise HTTPException(
            status_code=404,
            detail="Post not found.",
        )

    if not (
        post_response.data.get(
            "content"
        )
        or ""
    ).strip():
        raise HTTPException(
            status_code=400,
            detail="Post content is empty.",
        )

    account_response = (
        supabase
        .table("social_accounts")
        .select("*")
        .eq(
            "id",
            request.social_account_id,
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
                "Connected social account "
                "not found."
            ),
        )

    if not account.get(
        "is_active",
        True,
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Social account is inactive."
            ),
        )

    platform_id = account.get(
        "platform_id"
    )

    if not platform_id:

        platform_key = account.get(
            "platform"
        )

        if not platform_key:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Social account platform "
                    "is missing."
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

        if not platform_response.data:
            raise HTTPException(
                status_code=404,
                detail="Platform not found.",
            )

        platform_id = (
            platform_response.data["id"]
        )

    publication = create_publication(
        user_id=DEV_USER_ID,
        data={
            "post_id": request.post_id,
            "platform_id": platform_id,
            "social_account_id": (
                request.social_account_id
            ),
        },
    )

    if not publication:
        raise HTTPException(
            status_code=400,
            detail=(
                "Failed to create publication."
            ),
        )

    try:

        result = await publish_publication(
            publication_id=publication["id"],
            user_id=DEV_USER_ID,
        )

        if not result.get("success"):

            raise HTTPException(
                status_code=400,
                detail=result.get(
                    "error",
                    "Publishing failed.",
                ),
            )

        return {
            "success": True,
            "message": (
                "Post published successfully."
            ),
            "publication": result.get(
                "publication"
            ),
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


# ============================================================
# SCHEDULE
# ============================================================

@router.post("/schedule")
def schedule_post(
    request: SchedulePostRequest,
):

    if not request.scheduled_at:
        raise HTTPException(
            status_code=400,
            detail=(
                "scheduled_at is required."
            ),
        )

    publication = create_publication(
        user_id=DEV_USER_ID,
        data={
            "post_id": request.post_id,
            "platform_id": (
                request.platform_id
            ),
            "social_account_id": (
                request.social_account_id
            ),
            "scheduled_at": (
                request.scheduled_at
            ),
        },
    )

    if not publication:
        raise HTTPException(
            status_code=400,
            detail=(
                "Failed to schedule post."
            ),
        )

    return {
        "success": True,
        "message": (
            "Post scheduled successfully."
        ),
        "publication": publication,
    }


# ============================================================
# UPDATE
# ============================================================

@router.put("/{publication_id}")
def update_post_publication(
    publication_id: str,
    request: SchedulePostRequest,
):

    existing = get_publication(
        publication_id,
        DEV_USER_ID,
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail=(
                "Publication not found."
            ),
        )

    publication = update_publication(
        publication_id=publication_id,
        user_id=DEV_USER_ID,
        data={
            "scheduled_at": (
                request.scheduled_at
            ),
            "social_account_id": (
                request.social_account_id
            ),
        },
    )

    if not publication:
        raise HTTPException(
            status_code=400,
            detail=(
                "Failed to update publication."
            ),
        )

    return {
        "success": True,
        "message": (
            "Publication updated successfully."
        ),
        "publication": publication,
    }


# ============================================================
# DELETE
# ============================================================

@router.delete("/{publication_id}")
def remove_publication(
    publication_id: str,
):

    deleted = delete_publication(
        publication_id,
        DEV_USER_ID,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=(
                "Publication not found."
            ),
        )

    return {
        "success": True,
        "message": (
            "Publication deleted successfully."
        ),
    }