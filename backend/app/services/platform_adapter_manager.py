from .platform_adapters.registry import (
    get_adapter,
)


async def get_platform_profile(
    platform: str,
    access_token: str,
):
    adapter = get_adapter(
        platform
    )

    return await adapter.get_profile(
        access_token
    )


async def publish_to_platform(
    platform: str,
    access_token: str,
    content: str,
    media_urls: list[str] | None = None,
):
    adapter = get_adapter(
        platform
    )

    return await adapter.publish_post(
        access_token=access_token,
        content=content,
        media_urls=media_urls,
    )