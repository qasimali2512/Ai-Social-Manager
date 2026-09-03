from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.core.config import settings
from app.services.zernio_service import (
    ZernioError,
    create_post,
    get_connect_url,
    list_accounts,
)


router = APIRouter(prefix="/api/zernio", tags=["Zernio / Zapier"])


@router.get("/status")
async def zernio_status():
    if not settings.ZERNIO_API_KEY or not settings.ZERNIO_PROFILE_ID:
        return {
            "configured": False,
            "connected": False,
            "accounts": [],
        }

    try:
        accounts = await list_accounts()
    except ZernioError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {
        "configured": True,
        "connected": bool(accounts),
        "profile_id": settings.ZERNIO_PROFILE_ID,
        "accounts": accounts,
    }


@router.get("/accounts")
async def zernio_accounts(
    platform: str | None = Query(None),
):
    try:
        accounts = await list_accounts(platform=platform)
    except ZernioError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {
        "success": True,
        "accounts": accounts,
    }


@router.get("/connect/{platform}")
async def zernio_connect(platform: str):
    redirect_url = f"{settings.FRONTEND_URL.rstrip('/')}/accounts?zernio=success"
    try:
        auth_url = await get_connect_url(platform, redirect_url)
    except ZernioError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {
        "success": True,
        "platform": platform,
        "authorization_url": auth_url,
    }


class ZernioPostRequest(BaseModel):
    account_id: str = Field(min_length=1)
    platform: str = Field(min_length=1)
    content: str = Field(min_length=1, max_length=10000)
    media_urls: list[str] = Field(default_factory=list)
    scheduled_for: str | None = None
    title: str | None = None


@router.post("/posts")
async def zernio_create_post(request: ZernioPostRequest):
    try:
        result = await create_post(
            content=request.content,
            account_id=request.account_id,
            platform=request.platform.lower().strip(),
            media_urls=request.media_urls,
            publish_now=not bool(request.scheduled_for),
            scheduled_for=request.scheduled_for,
            title=request.title,
        )
    except ZernioError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {
        "success": True,
        "provider": "zernio",
        "result": result,
    }


@router.delete("/accounts/{account_id}")
async def zernio_disconnect_account(account_id: str):
    from app.services.zernio_service import disconnect_account
    try:
        result = await disconnect_account(account_id)
    except ZernioError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"success": True, "result": result}
