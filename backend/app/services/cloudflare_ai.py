import base64
import logging

import httpx

from app.core.config import settings


logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# CLOUDFLARE WORKERS AI
#
# Direct replacement for the n8n "Content Generator"
# workflow (Webhook -> Edit Fields -> HTTP Request ->
# HTTP Request1 -> Respond to Webhook).
#
# Text  model: @cf/zai-org/glm-4.7-flash
# Image model: @cf/black-forest-labs/flux-2-klein-4b
# ---------------------------------------------------------

CF_BASE_URL = "https://api.cloudflare.com/client/v4/accounts"


def _run_url(model: str) -> str:
    if not settings.CLOUDFLARE_ACCOUNT_ID:
        raise ValueError(
            "CLOUDFLARE_ACCOUNT_ID is not configured. "
            "Add it to backend/.env"
        )

    return (
        f"{CF_BASE_URL}/"
        f"{settings.CLOUDFLARE_ACCOUNT_ID}/ai/run/"
        f"{model}"
    )


def _headers() -> dict:
    if not settings.CLOUDFLARE_API_TOKEN:
        raise ValueError(
            "CLOUDFLARE_API_TOKEN is not configured. "
            "Add it to backend/.env"
        )

    return {
        "Authorization": (
            f"Bearer {settings.CLOUDFLARE_API_TOKEN}"
        ),
        "Content-Type": "application/json",
    }


# ---------------------------------------------------------
# PROMPT BUILDING
# ---------------------------------------------------------

def _build_text_prompt(
    topic: str,
    platform: str | None,
    tone: str,
    language: str,
    include_hashtags: bool,
    include_emoji: bool,
    length: str,
) -> tuple[str, str]:
    """
    Returns (system_prompt, user_prompt) for the text model.
    """

    system_prompt = (
        "You are a social media copywriter. "
        "Write only the final post caption/content. "
        "Do not add explanations, notes, or markdown "
        "formatting like headings. Do not wrap the "
        "output in quotes."
    )

    length_map = {
        "short": "very short, 1-2 sentences",
        "medium": "medium length, 3-5 sentences",
        "long": "detailed, 6+ sentences",
    }

    length_desc = length_map.get(
        (length or "medium").lower(),
        "medium length, 3-5 sentences",
    )

    user_prompt = (
        f"Write a {tone} social media post about: {topic}\n"
        f"Platform: {platform or 'general social media'}\n"
        f"Language: {language}\n"
        f"Length: {length_desc}\n"
        f"Include hashtags: {'yes' if include_hashtags else 'no'}\n"
        f"Include emoji: {'yes' if include_emoji else 'no'}"
    )

    return system_prompt, user_prompt


# ---------------------------------------------------------
# TEXT GENERATION
# ---------------------------------------------------------

async def generate_text(
    topic: str,
    platform: str | None = None,
    tone: str = "professional",
    language: str = "English",
    include_hashtags: bool = True,
    include_emoji: bool = True,
    length: str = "medium",
) -> str:
    system_prompt, user_prompt = _build_text_prompt(
        topic=topic,
        platform=platform,
        tone=tone,
        language=language,
        include_hashtags=include_hashtags,
        include_emoji=include_emoji,
        length=length,
    )

    payload = {
        "messages": [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
    }

    url = _run_url(settings.CLOUDFLARE_TEXT_MODEL)

    timeout = httpx.Timeout(
        connect=10.0,
        read=90.0,
        write=30.0,
        pool=10.0,
    )

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(
            url,
            headers=_headers(),
            json=payload,
        )

    if response.status_code >= 400:
        logger.error(
            "Cloudflare text model error %s: %s",
            response.status_code,
            response.text[:2000],
        )
        raise RuntimeError(
            "Cloudflare AI text generation failed "
            f"({response.status_code}): "
            f"{response.text[:500]}"
        )

    data = response.json()

    if not data.get("success", False):
        logger.error(
            "Cloudflare text model returned success=false: %s",
            data,
        )
        raise RuntimeError(
            f"Cloudflare AI text generation failed: {data}"
        )

    result = data.get("result") or {}

    content = None

    # -------------------------------------------------
    # OpenAI-style chat completion format (this is what
    # @cf/zai-org/glm-4.7-flash actually returns):
    # {"result": {"choices": [{"message": {"content": "..."}}]}}
    # -------------------------------------------------
    choices = result.get("choices")

    if isinstance(choices, list) and choices:
        first_choice = choices[0] or {}
        message = first_choice.get("message") or {}
        content = message.get("content")

        # ---------------------------------------------
        # Some "reasoning" models (e.g.
        # @cf/zai-org/glm-4.7-flash) leave
        # message.content = None and instead put
        # everything - including the final answer - in
        # message.reasoning / message.reasoning_content.
        # Fall back to extracting the final answer out
        # of that field instead of failing outright.
        # ---------------------------------------------
        if not content:
            reasoning_text = (
                message.get("reasoning_content")
                or message.get("reasoning")
            )
            if reasoning_text:
                content = _extract_final_answer_from_reasoning(
                    reasoning_text
                )

    # -------------------------------------------------
    # Simpler Workers AI text-generation format:
    # {"result": {"response": "..."}}
    # -------------------------------------------------
    if not content:
        content = result.get("response")

    if not content:
        content = result.get("text")

    if not content:
        raise RuntimeError(
            "Cloudflare AI response did not contain "
            f"generated text: {data}"
        )

    return str(content).strip()


def _extract_final_answer_from_reasoning(reasoning_text: str) -> str | None:
    """
    Best-effort extraction of the final generated caption out of a
    reasoning-model "thinking" transcript, for models that fail to
    populate message.content directly (e.g. glm-4.7-flash).

    The model's reasoning text typically ends with something like:
        **Final Output Generation** ...
            *Text:* <final caption>
            *Hashtags:* <hashtags>

    We look for common markers ("Final Output", "Final Answer",
    "*Text:*", "Final Caption", etc.) and, failing that, fall back to
    the last non-empty paragraph of the reasoning text.
    """
    import re

    text = reasoning_text.strip()
    if not text:
        return None

    # Try to find an explicit "Text:" / "Caption:" marker, usually
    # near the end, and grab everything after it up to the next
    # markdown bullet/heading boundary.
    text_marker = re.search(
        r"\*+\s*Text:?\*+\s*(.+?)(?:\n\s*\*+\s*Hashtags|\Z)",
        text,
        re.IGNORECASE | re.DOTALL,
    )
    hashtags_marker = re.search(
        r"\*+\s*Hashtags:?\*+\s*(.+?)\Z",
        text,
        re.IGNORECASE | re.DOTALL,
    )

    if text_marker:
        caption = text_marker.group(1).strip(" \n*")
        if hashtags_marker:
            hashtags = hashtags_marker.group(1).strip(" \n*")
            # Hashtags may be comma-separated in the reasoning trace;
            # normalize to space-separated "#tag" tokens.
            tags = re.findall(r"#\w+", hashtags)
            if tags:
                caption = f"{caption}\n\n{' '.join(tags)}"
        return caption.strip()

    # Fallback: use the last non-empty paragraph/bullet of the
    # reasoning text, which is usually the final drafted version.
    paragraphs = [
        p.strip(" \n*-")
        for p in re.split(r"\n\s*\n", text)
        if p.strip(" \n*-")
    ]
    if paragraphs:
        return paragraphs[-1]

    return None


# ---------------------------------------------------------
# IMAGE GENERATION
# ---------------------------------------------------------

async def generate_image(
    prompt: str,
) -> str:
    """
    Returns a base64-encoded JPEG/PNG string (no data: prefix).
    """

    # -------------------------------------------------
    # @cf/black-forest-labs/flux-2-klein-4b requires
    # multipart/form-data, not a JSON body. Sending JSON
    # produces:
    #   "Bad input: Error: required properties at '/' are
    #   'multipart'"
    # -------------------------------------------------

    url = _run_url(settings.CLOUDFLARE_IMAGE_MODEL)

    timeout = httpx.Timeout(
        connect=10.0,
        read=240.0,
        write=30.0,
        pool=10.0,
    )

    headers = _headers()

    # Content-Type is set automatically by httpx for
    # multipart requests (with the correct boundary) -
    # remove our JSON header so it isn't overridden.
    headers.pop("Content-Type", None)

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(
            url,
            headers=headers,
            # Using files= (even for plain text fields)
            # forces httpx to encode this as true
            # multipart/form-data, which is what these
            # FLUX models require. data= alone would send
            # application/x-www-form-urlencoded instead.
            files={
                "prompt": (
                    None,
                    prompt,
                ),
                "steps": (
                    None,
                    str(settings.CLOUDFLARE_IMAGE_STEPS),
                ),
            },
        )

    if response.status_code >= 400:
        logger.error(
            "Cloudflare image model error %s: %s",
            response.status_code,
            response.text[:2000],
        )
        raise RuntimeError(
            "Cloudflare AI image generation failed "
            f"({response.status_code}): "
            f"{response.text[:500]}"
        )

    content_type = response.headers.get(
        "content-type", ""
    )

    # -------------------------------------------------
    # Some Workers AI image models stream back raw image
    # bytes (image/png, image/jpeg) instead of JSON.
    # -------------------------------------------------
    if content_type.startswith("image/"):
        return base64.b64encode(
            response.content
        ).decode("utf-8")

    # -------------------------------------------------
    # Otherwise expect JSON with a base64 field.
    # -------------------------------------------------
    data = response.json()

    if not data.get("success", True):
        logger.error(
            "Cloudflare image model returned success=false: %s",
            data,
        )
        raise RuntimeError(
            f"Cloudflare AI image generation failed: {data}"
        )

    result = data.get("result") or {}

    image_b64 = (
        result.get("image")
        or result.get("image_base64")
    )

    if not image_b64:
        raise RuntimeError(
            "Cloudflare AI response did not contain "
            f"an image: {data}"
        )

    return image_b64


# ---------------------------------------------------------
# COMBINED HELPER
#
# Mirrors the old n8n workflow output: generate text
# and/or image depending on mode.
# ---------------------------------------------------------

async def generate_post_content(
    topic: str,
    platform: str | None = None,
    tone: str = "professional",
    language: str = "English",
    include_hashtags: bool = True,
    include_emoji: bool = True,
    length: str = "medium",
    mode: str = "both",
) -> dict:
    content = None
    image_base64 = None

    if mode in ("both", "text"):
        content = await generate_text(
            topic=topic,
            platform=platform,
            tone=tone,
            language=language,
            include_hashtags=include_hashtags,
            include_emoji=include_emoji,
            length=length,
        )

    if mode in ("both", "image"):
        image_prompt = (
            f"A photorealistic, professional photograph for "
            f"a LinkedIn post about: {topic}. "
            f"Style: {tone}, corporate/professional setting, "
            "natural lighting, high detail, shot on a DSLR "
            "camera, realistic textures and proportions. "
            "Purely visual, photographic composition - do "
            "not include any text, words, letters, numbers, "
            "UI screens, app mockups, logos, or captions in "
            "the image."
        )

        image_base64 = await generate_image(
            prompt=image_prompt,
        )

    return {
        "content": content,
        "image_base64": image_base64,
    }