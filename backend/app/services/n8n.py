import httpx

from app.core.config import settings


async def generate_content_with_n8n(
    topic: str,
    platform: str | None = None,
    tone: str = "professional",
    language: str = "English",
    include_hashtags: bool = True,
    include_emoji: bool = True,
    length: str = "medium",
):
    if not settings.N8N_CONTENT_WEBHOOK_URL:
        raise ValueError(
            "N8N_CONTENT_WEBHOOK_URL is not configured"
        )

    payload = {
        "topic": topic,
        "platform": platform,
        "tone": tone,
        "language": language,
        "include_hashtags": include_hashtags,
        "include_emoji": include_emoji,
        "length": length,
    }

    async with httpx.AsyncClient(
        timeout=120
    ) as client:

        response = await client.post(
            settings.N8N_CONTENT_WEBHOOK_URL,
            json=payload,
        )

        response.raise_for_status()

        return response.json()


async def send_approved_post_to_n8n(
    post_id: str,
    platform: str,
    account_id: str,
):
    if not settings.N8N_APPROVAL_WEBHOOK_URL:
        raise ValueError(
            "N8N_APPROVAL_WEBHOOK_URL is not configured"
        )

    payload = {
        "post_id": post_id,
        "platform": platform,
        "account_id": account_id,
        "action": "publish",
    }

    async with httpx.AsyncClient(
        timeout=120
    ) as client:

        response = await client.post(
            settings.N8N_APPROVAL_WEBHOOK_URL,
            json=payload,
        )

        response.raise_for_status()

        return response.json()