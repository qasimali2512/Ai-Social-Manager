import httpx

from fastapi import APIRouter, HTTPException

from app.core.config import settings
from app.schemas.ai import (
    GenerateContentRequest,
    GenerateContentResponse,
)
from app.services.ai_post_service import (
    save_generated_post,
)


router = APIRouter(
    prefix="/api/ai",
    tags=["AI Generation"],
)


DEV_USER_ID = (
    "00000000-0000-0000-0000-000000000001"
)


@router.post(
    "/generate",
    response_model=GenerateContentResponse,
)
async def generate_content(
    request: GenerateContentRequest,
):
    if not settings.N8N_CONTENT_WEBHOOK_URL:
        raise HTTPException(
            status_code=500,
            detail=(
                "N8N_CONTENT_WEBHOOK_URL "
                "is not configured"
            ),
        )

    payload = {
        "topic": request.topic,
        "platform": request.platform,
        "tone": request.tone,
        "language": request.language,
        "include_hashtags": (
            request.include_hashtags
        ),
        "include_emoji": (
            request.include_emoji
        ),
        "length": request.length,
    }

    try:
        async with httpx.AsyncClient(
            timeout=120.0
        ) as client:

            response = await client.post(
                settings.N8N_CONTENT_WEBHOOK_URL,
                json=payload,
            )

        response.raise_for_status()

        result = response.json()

        if isinstance(result, list):
            result = result[0] if result else {}

        if not isinstance(result, dict):
            result = {
                "content": str(result)
            }

        content = result.get("content")

        # Handle nested Cloudflare/n8n response
        if not content:
            nested = result.get("result")

            if isinstance(nested, dict):
                content = nested.get("content")

                if not content:
                    choices = nested.get(
                        "choices",
                        [],
                    )

                    if choices:
                        message = choices[0].get(
                            "message",
                            {},
                        )

                        content = message.get(
                            "content"
                        )

        # n8n image output
        image_base64 = result.get(
            "image"
        )

        if not image_base64:
            image_base64 = result.get(
                "image_base64"
            )

        # Save post + image
        post = save_generated_post(
            user_id=DEV_USER_ID,
            request_data=request.model_dump(),
            generated_content=content,
            image_base64=image_base64,
        )

        if not post:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Content generated but "
                    "failed to save post"
                ),
            )

        image_url = None

        if post.get("media"):
            image_url = post["media"][0].get(
                "media_url"
            )

        return GenerateContentResponse(
            success=True,
            content=content,
            image_url=image_url,
            post=post,
            raw=result,
        )

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                f"n8n returned HTTP "
                f"{exc.response.status_code}"
            ),
        )

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "Could not connect to n8n: "
                f"{str(exc)}"
            ),
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                f"AI generation failed: "
                f"{str(exc)}"
            ),
        )