from .base import PlatformAdapter
from .generic import GenericPlatformAdapter
from .linkedin import LinkedInAdapter
from .meta import MetaAdapter
from .tiktok import TikTokAdapter
from .x import XAdapter
from .youtube import YouTubeAdapter


def get_adapter(
    platform: str,
):
    platform = (
        platform
        .lower()
        .strip()
    )

    if platform == "linkedin":
        return LinkedInAdapter()

    if platform in {
        "facebook",
        "instagram",
    }:
        return MetaAdapter()

    if platform in {
        "x",
        "twitter",
    }:
        return XAdapter()

    if platform == "tiktok":
        return TikTokAdapter()

    if platform == "youtube":
        return YouTubeAdapter()

    raise ValueError(
        f"Unsupported OAuth platform: "
        f"{platform}"
    )