import logging

import httpx

from fastapi import APIRouter, HTTPException

from app.schemas.ai import (
    GenerateContentRequest,
    GenerateContentResponse,
)

from app.services.ai_post_service import (
    save_generated_post,
    regenerate_post,
)

from app.services.cloudflare_ai import (
    generate_post_content,
)


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/api/ai",
    tags=["AI Generation"],
)


# ---------------------------------------------------------
# DEV USER
# ---------------------------------------------------------

DEV_USER_ID = (
    "00000000-0000-0000-0000-000000000001"
)



# ---------------------------------------------------------
# GENERATE CONTENT
# ---------------------------------------------------------

@router.post(
    "/generate",
    response_model=GenerateContentResponse,
)
async def generate_content(
    request: GenerateContentRequest,
):

    # -----------------------------------------------------
    # MODE
    #
    # "both"  -> normal generation (default)
    # "text"  -> only the caption/content should change
    # "image" -> only the image should change
    # -----------------------------------------------------

    mode = (request.mode or "both").lower()

    if mode not in ("both", "text", "image"):
        mode = "both"


    logger.info(
        "Generating content directly via Cloudflare "
        "Workers AI. topic=%s mode=%s",
        request.topic,
        mode,
    )


    # -----------------------------------------------------
    # CALL CLOUDFLARE WORKERS AI
    #
    # Direct replacement for the old n8n
    # "Content Generator" workflow - no n8n involved.
    # -----------------------------------------------------

    try:

        generated = await generate_post_content(
            topic=request.topic,
            platform=request.platform,
            tone=request.tone,
            language=request.language,
            include_hashtags=request.include_hashtags,
            include_emoji=request.include_emoji,
            length=request.length,
            mode=mode,
        )

    except ValueError as exc:

        # Missing CLOUDFLARE_API_TOKEN, etc.
        logger.exception(
            "Cloudflare AI is not configured correctly."
        )

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:

        logger.exception(
            "Cloudflare AI generation failed."
        )

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    except httpx.TimeoutException as exc:

        logger.exception(
            "Cloudflare AI request timed out."
        )

        raise HTTPException(
            status_code=504,
            detail=(
                "Cloudflare AI did not respond within "
                "the allowed time."
            ),
        ) from exc

    except httpx.RequestError as exc:

        logger.exception(
            "Cloudflare AI request error."
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "Could not reach Cloudflare AI: "
                f"{str(exc)}"
            ),
        ) from exc


    content = generated.get("content")
    image_base64 = generated.get("image_base64")

    result = generated


    # -----------------------------------------------------
    # CONTENT VALIDATION
    #
    # When mode == "image" we don't require n8n to have
    # returned text - only the image matters for that
    # request. In every other mode, text is required.
    # -----------------------------------------------------

    if not content and mode != "image":

        logger.error(
            "n8n response did not contain "
            "generated content: %s",
            result,
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "n8n responded successfully, "
                "but no generated content was "
                "found in its response."
            ),
        )

    if mode == "image" and not image_base64:

        logger.error(
            "n8n response did not contain "
            "a regenerated image: %s",
            result,
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "n8n responded successfully, "
                "but no image was found in its "
                "response."
            ),
        )

    if mode == "text" and not content:

        logger.error(
            "n8n response did not contain "
            "regenerated text: %s",
            result,
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "n8n responded successfully, "
                "but no generated text was found "
                "in its response."
            ),
        )


    # -----------------------------------------------------
    # PREPARE DATABASE DATA
    # -----------------------------------------------------

    request_data = request.model_dump()


    # -----------------------------------------------------
    # IMPORTANT FIX
    #
    # Database posts.title is NOT NULL.
    #
    # The frontend sends topic, not title.
    #
    # Therefore use the user's topic as title.
    # -----------------------------------------------------

    topic = (
        request_data.get("topic")
        or ""
    ).strip()


    if not topic:

        raise HTTPException(
            status_code=400,
            detail=(
                "Post topic cannot be empty."
            ),
        )


    # UI topic becomes database title
    request_data["title"] = topic


    # Keep topic explicitly available
    request_data["topic"] = topic


    # Make sure platform is preserved
    request_data["platform"] = (
        request_data.get("platform")
    )


    logger.info(
        "Saving generated post with title: %s",
        request_data["title"],
    )


    # -----------------------------------------------------
    # SAVE POST
    #
    # If a post_id was provided, this is a REGENERATE
    # request from the Posts page dropdown - update the
    # existing row in place (only the text and/or image,
    # depending on mode) instead of creating a new post.
    # -----------------------------------------------------

    try:

        if request.post_id:

            post = regenerate_post(
                user_id=DEV_USER_ID,
                post_id=request.post_id,
                mode=mode,
                generated_content=content,
                image_base64=image_base64,
            )

        else:

            post = save_generated_post(
                user_id=DEV_USER_ID,
                request_data=request_data,
                generated_content=content,
                image_base64=image_base64,
            )


    except Exception as exc:

        logger.exception(
            "Failed to save generated post."
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Content was generated, "
                "but saving the post failed: "
                f"{str(exc)}"
            ),
        ) from exc

    if request.post_id and not post:

        raise HTTPException(
            status_code=404,
            detail="Post not found",
        )


    # -----------------------------------------------------
    # SAVE VALIDATION
    # -----------------------------------------------------

    if not post:

        raise HTTPException(
            status_code=500,
            detail=(
                "Content generated but "
                "failed to save post."
            ),
        )


    # -----------------------------------------------------
    # IMAGE URL
    # -----------------------------------------------------

    image_url = None


    if post.get("media"):

        image_url = (
            post["media"][0].get(
                "media_url"
            )
        )


    # If service directly returns image_url
    if not image_url:

        image_url = post.get(
            "image_url"
        )


    # If service directly returns media_url
    if not image_url:

        image_url = post.get(
            "media_url"
        )


    # -----------------------------------------------------
    # FINAL RESPONSE
    #
    # Read the final content/image back off the saved post
    # rather than the raw n8n output, so a "Regenerate
    # Image" call correctly reports the caption that was
    # KEPT (not empty), and vice versa for "Regenerate
    # Text".
    # -----------------------------------------------------

    final_content = (
        post.get("content")
        or post.get("caption")
        or content
    )

    final_image_url = (
        image_url
        or post.get("image_url")
        or post.get("media_url")
    )

    return GenerateContentResponse(
        success=True,
        content=final_content,
        image_url=final_image_url,
        post=post,
        raw=result,
    )