import httpx

from .base import PlatformAdapter


YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3"


class YouTubeAdapter(PlatformAdapter):
    """YouTube OAuth profile adapter.

    OAuth scopes are configured in backend/.env.  The profile call uses
    channels.list?part=snippet,contentDetails&mine=true so the connected
    YouTube channel can be stored as a normal social account.
    """

    async def get_profile(self, access_token: str) -> dict:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                f"{YOUTUBE_API_BASE_URL}/channels",
                params={
                    "part": "snippet,contentDetails",
                    "mine": "true",
                },
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json",
                },
            )

        if response.status_code >= 400:
            raise ValueError(
                "Failed to fetch YouTube channel: "
                f"{response.text}"
            )

        data = response.json()
        items = data.get("items") or []
        if not items:
            raise ValueError(
                "No YouTube channel was found for this Google account."
            )

        channel = items[0]
        snippet = channel.get("snippet") or {}
        thumbnails = snippet.get("thumbnails") or {}
        thumbnail = (
            thumbnails.get("high")
            or thumbnails.get("medium")
            or thumbnails.get("default")
            or {}
        )

        channel_id = channel.get("id")
        title = snippet.get("title") or "YouTube Channel"
        custom_url = snippet.get("customUrl")

        return {
            "id": channel_id,
            "username": custom_url or channel_id or title,
            "name": title,
            "display_name": title,
            "avatar_url": thumbnail.get("url"),
            "account_url": (
                f"https://www.youtube.com/channel/{channel_id}"
                if channel_id
                else None
            ),
        }

    async def publish_post(
        self,
        access_token: str,
        content: str,
        media_urls: list[str] | None = None,
    ) -> dict:
        raise ValueError(
            "YouTube publishing requires a video upload flow. "
            "OAuth connection is ready, but text-only publishing is not a YouTube video upload."
        )
