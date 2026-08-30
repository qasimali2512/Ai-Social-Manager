from fastapi import APIRouter, HTTPException

from app.schemas.platform import (
    PlatformCreate,
    PlatformUpdate,
    PlatformResponse,
)

from app.services.platform_service import (
    get_platforms,
    get_platform,
    get_platform_by_key,
    create_platform,
    update_platform,
    delete_platform,
)


router = APIRouter(
    prefix="/api/platforms",
    tags=["Platforms"],
)


# ============================================
# GET ALL ACTIVE PLATFORMS
# ============================================

@router.get(
    "",
    response_model=list[PlatformResponse],
)
def list_platforms():
    return get_platforms()


# ============================================
# GET SINGLE PLATFORM
# ============================================

@router.get(
    "/{platform_id}",
    response_model=PlatformResponse,
)
def retrieve_platform(
    platform_id: str,
):
    platform = get_platform(platform_id)

    if not platform:
        raise HTTPException(
            status_code=404,
            detail="Platform not found",
        )

    return platform


# ============================================
# GET PLATFORM BY KEY
# ============================================

@router.get(
    "/key/{platform_key}",
    response_model=PlatformResponse,
)
def retrieve_platform_by_key(
    platform_key: str,
):
    platform = get_platform_by_key(
        platform_key
    )

    if not platform:
        raise HTTPException(
            status_code=404,
            detail="Platform not found or inactive",
        )

    return platform


# ============================================
# CREATE PLATFORM
# ============================================

@router.post(
    "",
    response_model=PlatformResponse,
)
def add_platform(
    request: PlatformCreate,
):
    existing = get_platform_by_key(
        request.key
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail=(
                "A platform with this key "
                "already exists."
            ),
        )

    platform = create_platform(
        request.model_dump()
    )

    if not platform:
        raise HTTPException(
            status_code=500,
            detail="Failed to create platform",
        )

    return platform


# ============================================
# UPDATE PLATFORM
# ============================================

@router.patch(
    "/{platform_id}",
    response_model=PlatformResponse,
)
def edit_platform(
    platform_id: str,
    request: PlatformUpdate,
):
    existing = get_platform(platform_id)

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Platform not found",
        )

    platform = update_platform(
        platform_id,
        request.model_dump(
            exclude_unset=True
        ),
    )

    if not platform:
        raise HTTPException(
            status_code=500,
            detail="Failed to update platform",
        )

    return platform


# ============================================
# DEACTIVATE PLATFORM
# ============================================

@router.delete(
    "/{platform_id}",
)
def remove_platform(
    platform_id: str,
):
    existing = get_platform(platform_id)

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Platform not found",
        )

    deleted = delete_platform(
        platform_id
    )

    if not deleted:
        raise HTTPException(
            status_code=500,
            detail="Failed to deactivate platform",
        )

    return {
        "success": True,
        "message": (
            "Platform deactivated successfully"
        ),
    }