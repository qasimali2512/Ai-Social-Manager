from __future__ import annotations

import os
from datetime import datetime, timezone, timedelta
from typing import Any
from urllib.parse import quote

import httpx

from app.core.config import settings
from app.db.supabase import supabase


HTTP_TIMEOUT = float(os.getenv("PUBLISH_HTTP_TIMEOUT", "60"))
META_GRAPH_VERSION = os.getenv("META_GRAPH_VERSION", "").strip()
LINKEDIN_VERSION = os.getenv("LINKEDIN_VERSION", "202608").strip()


def _token(account: dict[str, Any]) -> str:
    return str(account.get("access_token") or "").strip()


def _platform_account_id(account: dict[str, Any]) -> str:
    return str(
        account.get("platform_account_id")
        or account.get("platform_user_id")
        or account.get("account_id")
        or ""
    ).strip()


def _meta_base() -> str:
    if META_GRAPH_VERSION:
        return f"https://graph.facebook.com/{META_GRAPH_VERSION}"
    return "https://graph.facebook.com"


def _error(response: httpx.Response) -> str:
    try:
        data = response.json()
        if isinstance(data, dict):
            err = data.get("error")
            if isinstance(err, dict):
                return str(err.get("message") or data)
            return str(data.get("message") or data)
    except Exception:
        pass
    return response.text or f"HTTP {response.status_code}"


async def _request_json(
    method: str,
    url: str,
    *,
    headers: dict[str, str] | None = None,
    params: dict[str, Any] | None = None,
    json: dict[str, Any] | None = None,
) -> tuple[httpx.Response, dict[str, Any]]:
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        response = await client.request(
            method,
            url,
            headers=headers,
            params=params,
            json=json,
        )

    try:
        data = response.json()
    except Exception:
        data = {}

    return response, data if isinstance(data, dict) else {}


async def _refresh_google_access_token(account: dict[str, Any]) -> str | None:
    refresh_token = str(account.get("refresh_token") or "").strip()
    if not refresh_token or not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        return None

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            },
            headers={"Accept": "application/json"},
        )

    if response.status_code >= 400:
        return None

    data = response.json()
    access_token = data.get("access_token")
    if not access_token:
        return None

    update = {"access_token": access_token}
    if data.get("expires_in"):
        try:
            update["token_expires_at"] = (
                datetime.now(timezone.utc)
                + timedelta(seconds=int(data["expires_in"]))
            ).isoformat()
        except (TypeError, ValueError):
            pass

    account_id = account.get("id")
    if account_id:
        try:
            supabase.table("social_accounts").update(update).eq("id", account_id).execute()
        except Exception:
            pass

    account.update(update)
    return access_token


def _youtube_token_expired(account: dict[str, Any]) -> bool:
    raw = account.get("token_expires_at")
    if not raw:
        return False
    try:
        value = str(raw).replace("Z", "+00:00")
        expires_at = datetime.fromisoformat(value)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        return expires_at <= datetime.now(timezone.utc) + timedelta(minutes=2)
    except (TypeError, ValueError):
        return False


async def _publish_youtube(
    content: str,
    media_urls: list[str],
    account: dict[str, Any],
) -> dict[str, Any]:
    token = _token(account)
    if not token:
        return {"success": False, "error": "YouTube access token is missing."}

    if _youtube_token_expired(account):
        refreshed = await _refresh_google_access_token(account)
        if refreshed:
            token = refreshed

    adapter = YouTubeAdapter()
    result = await adapter.publish_post(
        access_token=token,
        content=content,
        media_urls=media_urls,
    )

    # Google may report an expired token even when the stored expiry is absent.
    if (
        not result.get("success")
        and "401" in str(result.get("error", ""))
        and account.get("refresh_token")
    ):
        refreshed = await _refresh_google_access_token(account)
        if refreshed:
            result = await adapter.publish_post(
                access_token=refreshed,
                content=content,
                media_urls=media_urls,
            )

    return result


async def _publish_facebook(
    content: str,
    media_urls: list[str],
    account: dict[str, Any],
) -> dict[str, Any]:
    token = _token(account)
    if not token:
        return {"success": False, "error": "Facebook access token is missing."}

    # Meta OAuth normally gives a user token. For Page publishing we first
    # resolve the Page and its Page access token from /me/accounts.
    page_id = _platform_account_id(account)
    page_token = token

    response, data = await _request_json(
        "GET",
        f"{_meta_base()}/me/accounts",
        params={
            "fields": "id,name,access_token,instagram_business_account",
            "access_token": token,
        },
    )

    if response.status_code >= 400:
        return {"success": False, "error": _error(response)}

    pages = data.get("data") or []
    if pages:
        selected = next(
            (p for p in pages if str(p.get("id")) == page_id),
            pages[0] if not page_id else None,
        )
        if selected:
            page_id = str(selected.get("id") or page_id)
            page_token = str(selected.get("access_token") or token)

    if not page_id:
        return {
            "success": False,
            "error": "No Facebook Page was found for this connected account.",
        }

    if media_urls:
        # Page photo publishing accepts a publicly reachable image URL.
        response, data = await _request_json(
            "POST",
            f"{_meta_base()}/{quote(page_id, safe='')}/photos",
            params={
                "url": media_urls[0],
                "caption": content,
                "access_token": page_token,
            },
        )
    else:
        response, data = await _request_json(
            "POST",
            f"{_meta_base()}/{quote(page_id, safe='')}/feed",
            params={
                "message": content,
                "access_token": page_token,
            },
        )

    if response.status_code >= 400:
        return {"success": False, "error": _error(response)}

    return {
        "success": True,
        "data": {
            "id": data.get("post_id") or data.get("id"),
            "platform": "facebook",
            "raw": data,
        },
    }


async def _publish_instagram(
    content: str,
    media_urls: list[str],
    account: dict[str, Any],
) -> dict[str, Any]:
    token = _token(account)
    if not token:
        return {"success": False, "error": "Instagram access token is missing."}

    if not media_urls:
        return {
            "success": False,
            "error": "Instagram publishing requires a public image or video URL.",
        }

    page_id = _platform_account_id(account)

    response, data = await _request_json(
        "GET",
        f"{_meta_base()}/me/accounts",
        params={
            "fields": "id,instagram_business_account,access_token",
            "access_token": token,
        },
    )

    if response.status_code >= 400:
        return {"success": False, "error": _error(response)}

    pages = data.get("data") or []
    selected = next(
        (p for p in pages if str(p.get("id")) == page_id),
        pages[0] if len(pages) == 1 else None,
    )

    if not selected:
        return {
            "success": False,
            "error": "No Facebook Page linked to an Instagram professional account was found.",
        }

    ig_business = selected.get("instagram_business_account") or {}
    ig_user_id = str(ig_business.get("id") or "").strip()
    page_token = str(selected.get("access_token") or token)

    if not ig_user_id:
        return {
            "success": False,
            "error": "The connected Facebook Page has no Instagram professional account.",
        }

    media_url = media_urls[0]
    lowered = media_url.lower().split("?", 1)[0]
    is_video = lowered.endswith((".mp4", ".mov", ".m4v", ".avi"))

    params: dict[str, Any] = {
        "access_token": page_token,
        "caption": content,
    }
    if is_video:
        params.update({
            "media_type": "REELS",
            "video_url": media_url,
        })
    else:
        params.update({"image_url": media_url})

    response, data = await _request_json(
        "POST",
        f"{_meta_base()}/{quote(ig_user_id, safe='')}/media",
        params=params,
    )

    if response.status_code >= 400:
        return {"success": False, "error": _error(response)}

    creation_id = str(data.get("id") or "").strip()
    if not creation_id:
        return {
            "success": False,
            "error": "Instagram did not return a media creation ID.",
        }

    # For video/reels Meta can need processing time. Poll briefly before publish.
    if is_video:
        for _ in range(10):
            response, status_data = await _request_json(
                "GET",
                f"{_meta_base()}/{quote(creation_id, safe='')}",
                params={
                    "fields": "status_code",
                    "access_token": page_token,
                },
            )
            if response.status_code >= 400:
                return {"success": False, "error": _error(response)}
            if status_data.get("status_code") == "FINISHED":
                break
            if status_data.get("status_code") == "ERROR":
                return {
                    "success": False,
                    "error": "Instagram media processing failed.",
                }
            import asyncio
            await asyncio.sleep(2)

    response, publish_data = await _request_json(
        "POST",
        f"{_meta_base()}/{quote(ig_user_id, safe='')}/media_publish",
        params={
            "creation_id": creation_id,
            "access_token": page_token,
        },
    )

    if response.status_code >= 400:
        return {"success": False, "error": _error(response)}

    return {
        "success": True,
        "data": {
            "id": publish_data.get("id"),
            "platform": "instagram",
            "raw": publish_data,
        },
    }


async def _publish_linkedin(
    content: str,
    media_urls: list[str],
    account: dict[str, Any],
) -> dict[str, Any]:
    token = _token(account)
    author = _platform_account_id(account)

    if not token:
        return {"success": False, "error": "LinkedIn access token is missing."}
    if not author:
        return {
            "success": False,
            "error": "LinkedIn author URN is missing from the connected account.",
        }

    if not author.startswith("urn:li:"):
        author = f"urn:li:person:{author}"

    headers = {
        "Authorization": f"Bearer {token}",
        "X-Restli-Protocol-Version": "2.0.0",
        "Linkedin-Version": LINKEDIN_VERSION,
        "Content-Type": "application/json",
    }

    payload: dict[str, Any] = {
        "author": author,
        "commentary": content,
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
        "lifecycleState": "PUBLISHED",
        "isReshareDisabledByAuthor": False,
    }

    # LinkedIn's current Posts API needs an uploaded media asset for images.
    # The current connected-account flow may only have a public media URL, so
    # text posts are published directly; image publishing uses the Images API.
    if media_urls:
        response, image_data = await _request_json(
            "POST",
            "https://api.linkedin.com/rest/images?action=initializeUpload",
            headers=headers,
            json={"initializeUploadRequest": {"owner": author}},
        )
        if response.status_code >= 400:
            return {"success": False, "error": _error(response)}

        value = image_data.get("value") or {}
        upload_url = value.get("uploadUrl")
        image_urn = value.get("image")
        if not upload_url or not image_urn:
            return {
                "success": False,
                "error": "LinkedIn did not return an image upload URL.",
            }

        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            source_response = await client.get(media_urls[0])
            source_response.raise_for_status()
            upload_response = await client.put(
                upload_url,
                content=source_response.content,
                headers={"Content-Type": source_response.headers.get("content-type", "image/jpeg")},
            )

        if upload_response.status_code >= 300:
            return {
                "success": False,
                "error": f"LinkedIn image upload failed: {upload_response.text}",
            }

        payload["content"] = {
            "media": {
                "id": image_urn,
            }
        }

    response, data = await _request_json(
        "POST",
        "https://api.linkedin.com/rest/posts",
        headers=headers,
        json=payload,
    )

    if response.status_code >= 400:
        return {"success": False, "error": _error(response)}

    post_id = response.headers.get("x-restli-id") or data.get("id")

    return {
        "success": True,
        "data": {
            "id": post_id,
            "platform": "linkedin",
            "raw": data,
        },
    }


async def _publish_x(
    content: str,
    media_urls: list[str],
    account: dict[str, Any],
) -> dict[str, Any]:
    token = _token(account)
    if not token:
        return {"success": False, "error": "X access token is missing."}

    # X API v2 text publishing uses the authenticated user context. Media
    # requires a separate media-upload flow and is intentionally rejected here
    # instead of pretending a public URL can be attached directly.
    if media_urls:
        return {
            "success": False,
            "error": "X text publishing is enabled, but media upload requires an X media-upload credential flow.",
        }

    response, data = await _request_json(
        "POST",
        "https://api.x.com/2/tweets",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        json={"text": content},
    )

    if response.status_code >= 400:
        return {"success": False, "error": _error(response)}

    tweet = data.get("data") or data
    return {
        "success": True,
        "data": {
            "id": tweet.get("id"),
            "platform": "x",
            "raw": data,
        },
    }


async def publish_to_platform(
    platform: str,
    content: str,
    media_urls: list[str] | None,
    account: dict[str, Any],
) -> dict[str, Any]:
    platform_key = (platform or "").strip().lower()
    content = (content or "").strip()
    media_urls = media_urls or []

    if not platform_key:
        return {"success": False, "error": "Platform is required."}
    if not content:
        return {"success": False, "error": "Post content is empty."}
    if not account:
        return {"success": False, "error": "Social account is required."}
    if not _token(account):
        return {"success": False, "error": "Social account access token is missing."}

    adapters = {
        "facebook": _publish_facebook,
        "instagram": _publish_instagram,
        "linkedin": _publish_linkedin,
        "twitter": _publish_x,
        "x": _publish_x,
        "youtube": _publish_youtube,
    }

    adapter = adapters.get(platform_key)
    if not adapter:
        return {
            "success": False,
            "error": f"Real publishing is not implemented for '{platform_key}'.",
        }

    try:
        return await adapter(
            content=content,
            media_urls=media_urls,
            account=account,
        )
    except httpx.HTTPError as exc:
        return {
            "success": False,
            "error": f"Platform request failed: {exc}",
        }
    except Exception as exc:
        return {"success": False, "error": str(exc)}
