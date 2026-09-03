from __future__ import annotations

from typing import Any
from urllib.parse import urlencode
import uuid

import httpx

from app.core.config import settings


class ZernioError(RuntimeError):
    pass


def _require_config() -> None:
    if not settings.ZERNIO_API_KEY:
        raise ZernioError("ZERNIO_API_KEY is not configured on the backend.")
    if not settings.ZERNIO_PROFILE_ID:
        raise ZernioError("ZERNIO_PROFILE_ID is not configured on the backend.")


def _headers() -> dict[str, str]:
    _require_config()
    return {
        "Authorization": f"Bearer {settings.ZERNIO_API_KEY}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }


def _base() -> str:
    return settings.ZERNIO_API_BASE_URL.rstrip("/")


async def list_accounts(platform: str | None = None) -> list[dict[str, Any]]:
    _require_config()
    params: dict[str, str] = {"profileId": settings.ZERNIO_PROFILE_ID}
    if platform:
        params["platform"] = platform

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            f"{_base()}/accounts",
            params=params,
            headers=_headers(),
        )

    if response.status_code >= 400:
        raise ZernioError(f"Zernio accounts request failed: {response.text}")

    data = response.json()
    return data.get("accounts") or []


async def get_connect_url(platform: str, redirect_url: str) -> str:
    _require_config()
    platform = platform.strip().lower()
    if platform not in {"facebook", "instagram"}:
        raise ZernioError("Zernio connection supports Facebook or Instagram here.")

    params = urlencode({
        "profileId": settings.ZERNIO_PROFILE_ID,
        "redirect_url": redirect_url,
    })

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            f"{_base()}/connect/{platform}?{params}",
            headers={
                "Authorization": f"Bearer {settings.ZERNIO_API_KEY}",
                "Accept": "application/json",
            },
        )

    if response.status_code >= 400:
        raise ZernioError(f"Zernio OAuth start failed: {response.text}")

    data = response.json()
    auth_url = data.get("authUrl") or data.get("authorization_url")
    if not auth_url:
        raise ZernioError("Zernio did not return an OAuth authorization URL.")
    return auth_url


async def create_post(
    *,
    content: str,
    account_id: str,
    platform: str,
    media_urls: list[str] | None = None,
    publish_now: bool = False,
    scheduled_for: str | None = None,
    title: str | None = None,
) -> dict[str, Any]:
    _require_config()

    target = {
        "platform": platform,
        "accountId": account_id,
    }

    payload: dict[str, Any] = {
        "content": content,
        "platforms": [target],
        "publishNow": publish_now,
    }
    if title:
        payload["title"] = title
    if media_urls:
        payload["mediaItems"] = [
            {
                "type": "video" if url.lower().split("?", 1)[0].endswith((".mp4", ".mov", ".m4v", ".webm")) else "image",
                "url": url,
            }
            for url in media_urls
        ]
    if scheduled_for:
        payload["scheduledFor"] = scheduled_for
        payload["publishNow"] = False

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            f"{_base()}/posts",
            headers={**_headers(), "x-request-id": str(uuid.uuid4())},
            json=payload,
        )

    if response.status_code >= 400:
        try:
            error = response.json()
        except Exception:
            error = response.text
        raise ZernioError(f"Zernio post request failed: {error}")

    return response.json()


async def disconnect_account(account_id: str) -> dict[str, Any]:
    _require_config()
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.delete(
            f"{_base()}/accounts/{account_id}",
            headers={
                "Authorization": f"Bearer {settings.ZERNIO_API_KEY}",
                "Accept": "application/json",
            },
        )
    if response.status_code >= 400:
        raise ZernioError(f"Zernio disconnect failed: {response.text}")
    try:
        return response.json()
    except Exception:
        return {"message": response.text}
