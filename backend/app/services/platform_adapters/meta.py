import httpx

from app.services.platform_adapters.base import (
    PlatformAdapter,
)


GRAPH_API = "https://graph.facebook.com"


class MetaAdapter(PlatformAdapter):

    async def get_profile(
        self,
        access_token: str,
    ) -> dict:
        params = {
            "fields": "id,name",
            "access_token": access_token,
        }

        async with httpx.AsyncClient(
            timeout=30
        ) as client:
            response = await client.get(
                f"{GRAPH_API}/me",
                params=params,
            )

        if response.status_code >= 400:
            raise ValueError(
                f"Meta profile request failed: "
                f"{response.text}"
            )

        return response.json()

    async def publish_post(
        self,
        access_token: str,
        content: str,
        media_urls: list[str] | None = None,
    ) -> dict:

        if not access_token:
            return {
                "success": False,
                "error": "Access token is missing",
            }

        if not content:
            return {
                "success": False,
                "error": "Post content is empty",
            }

        return {
            "success": False,
            "status": "not_configured",
            "platform": "meta",
            "message": (
                "Publishing will be connected "
                "after account setup."
            ),
        }