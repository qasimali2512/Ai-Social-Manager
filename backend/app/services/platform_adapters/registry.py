from app.services.platform_service import (
    get_platform_by_key,
)

from .base import PlatformAdapter
from .generic import GenericPlatformAdapter


def get_adapter(
    platform: str,
) -> PlatformAdapter:

    platform = (
        platform.lower()
        .strip()
    )

    config = get_platform_by_key(
        platform
    )

    if not config:
        raise ValueError(
            "Platform not found or inactive."
        )

    api_base_url = config.get(
        "api_base_url"
    )

    if not api_base_url:
        raise ValueError(
            f"API base URL is not configured "
            f"for {platform}."
        )

    # ----------------------------------------
    # Platform-specific adapters can be added
    # here later without changing the API.
    # ----------------------------------------

    return GenericPlatformAdapter(
        api_base_url=api_base_url
    )