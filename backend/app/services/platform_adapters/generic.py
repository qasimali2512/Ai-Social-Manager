import httpx

from .base import PlatformAdapter


class GenericPlatformAdapter(
    PlatformAdapter
):

    def __init__(
        self,
        api_base_url: str,
    ):
        self.api_base_url = (
            api_base_url.rstrip("/")
        )

    async def get_profile(
        self,
        access_token: str,
    ) -> dict:

        async with httpx.AsyncClient(
            timeout=30
        ) as client:

            response = await client.get(
                f"{self.api_base_url}/me",
                headers={
                    "Authorization": (
                        f"Bearer {access_token}"
                    ),
                    "Accept": "application/json",
                },
            )

        if response.status_code >= 400:
            raise ValueError(
                "Failed to fetch profile: "
                f"{response.text}"
            )

        return response.json()

    async def publish_post(
        self,
        access_token: str,
        content: str,
        media_urls: list[str] | None = None,
    ) -> dict:

        payload = {
            "content": content,
        }

        if media_urls:
            payload["media_urls"] = media_urls

        async with httpx.AsyncClient(
            timeout=30
        ) as client:

            response = await client.post(
                f"{self.api_base_url}/posts",
                json=payload,
                headers={
                    "Authorization": (
                        f"Bearer {access_token}"
                    ),
                    "Accept": "application/json",
                    "Content-Type": (
                        "application/json"
                    ),
                },
            )

        if response.status_code >= 400:
            raise ValueError(
                "Failed to publish post: "
                f"{response.text}"
            )

        return response.json()