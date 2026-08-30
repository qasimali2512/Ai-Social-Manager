from typing import Any


async def publish_to_platform(
    platform: str,
    content: str,
    media_urls: list[str] | None,
    account: dict[str, Any],
) -> dict[str, Any]:
    """
    Central publishing dispatcher.

    OAuth/token acquisition is intentionally not handled here.
    The connected account must already contain the credentials
    required by the platform adapter.
    """

    platform_key = (
        platform or ""
    ).strip().lower()

    if not platform_key:
        return {
            "success": False,
            "error": "Platform is required.",
        }

    if not content.strip():
        return {
            "success": False,
            "error": "Post content is empty.",
        }

    if not account:
        return {
            "success": False,
            "error": "Social account is required.",
        }

    adapters = {
        "facebook": _publish_facebook,
        "instagram": _publish_instagram,
        "linkedin": _publish_linkedin,
        "twitter": _publish_twitter,
        "x": _publish_twitter,
        "tiktok": _publish_tiktok,
        "youtube": _publish_youtube,
        "pinterest": _publish_pinterest,
        "threads": _publish_threads,
    }

    adapter = adapters.get(platform_key)

    if not adapter:
        return {
            "success": False,
            "error": (
                f"Publishing adapter for "
                f"'{platform_key}' is not implemented yet."
            ),
        }

    try:
        return await adapter(
            content=content,
            media_urls=media_urls or [],
            account=account,
        )

    except Exception as exc:
        return {
            "success": False,
            "error": str(exc),
        }


# ============================================================
# FACEBOOK
# ============================================================

async def _publish_facebook(
    content: str,
    media_urls: list[str],
    account: dict[str, Any],
) -> dict[str, Any]:

    return {
        "success": False,
        "error": (
            "Facebook publishing credentials/API "
            "adapter are not configured yet."
        ),
    }


# ============================================================
# INSTAGRAM
# ============================================================

async def _publish_instagram(
    content: str,
    media_urls: list[str],
    account: dict[str, Any],
) -> dict[str, Any]:

    return {
        "success": False,
        "error": (
            "Instagram publishing credentials/API "
            "adapter are not configured yet."
        ),
    }


# ============================================================
# LINKEDIN
# ============================================================

async def _publish_linkedin(
    content: str,
    media_urls: list[str],
    account: dict[str, Any],
) -> dict[str, Any]:

    return {
        "success": False,
        "error": (
            "LinkedIn publishing credentials/API "
            "adapter are not configured yet."
        ),
    }


# ============================================================
# X / TWITTER
# ============================================================

async def _publish_twitter(
    content: str,
    media_urls: list[str],
    account: dict[str, Any],
) -> dict[str, Any]:

    return {
        "success": False,
        "error": (
            "X/Twitter publishing credentials/API "
            "adapter are not configured yet."
        ),
    }


# ============================================================
# TIKTOK
# ============================================================

async def _publish_tiktok(
    content: str,
    media_urls: list[str],
    account: dict[str, Any],
) -> dict[str, Any]:

    return {
        "success": False,
        "error": (
            "TikTok publishing credentials/API "
            "adapter are not configured yet."
        ),
    }


# ============================================================
# YOUTUBE
# ============================================================

async def _publish_youtube(
    content: str,
    media_urls: list[str],
    account: dict[str, Any],
) -> dict[str, Any]:

    return {
        "success": False,
        "error": (
            "YouTube publishing credentials/API "
            "adapter are not configured yet."
        ),
    }


# ============================================================
# PINTEREST
# ============================================================

async def _publish_pinterest(
    content: str,
    media_urls: list[str],
    account: dict[str, Any],
) -> dict[str, Any]:

    return {
        "success": False,
        "error": (
            "Pinterest publishing credentials/API "
            "adapter are not configured yet."
        ),
    }


# ============================================================
# THREADS
# ============================================================

async def _publish_threads(
    content: str,
    media_urls: list[str],
    account: dict[str, Any],
) -> dict[str, Any]:

    return {
        "success": False,
        "error": (
            "Threads publishing credentials/API "
            "adapter are not configured yet."
        ),
    }