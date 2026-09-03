from pydantic import BaseModel, Field


class GenerateContentRequest(BaseModel):
    topic: str = Field(
        ...,
        min_length=2,
        max_length=500,
    )

    platform: str | None = None

    tone: str = "professional"

    language: str = "English"

    include_hashtags: bool = True

    include_emoji: bool = True

    length: str = "medium"

    # -------------------------------------------------
    # NEW: regeneration support
    #
    # mode:
    #   "both"  -> generate + save new text AND image
    #              (default, original behaviour)
    #   "text"  -> only regenerate the caption/content,
    #              existing image (if any) is kept
    #   "image" -> only regenerate the image, existing
    #              caption/content (if any) is kept
    #
    # post_id:
    #   When provided, the existing post row is updated
    #   in place instead of creating a brand new post.
    #   Used by the "Posts" page's Regenerate dropdown
    #   (Regenerate Image / Regenerate Text / Regenerate
    #   Both) and the Delete flow.
    # -------------------------------------------------

    mode: str = "both"

    post_id: str | None = None


class GenerateContentResponse(BaseModel):
    success: bool

    content: str | None = None

    hashtags: list[str] = Field(default_factory=list)

    image_url: str | None = None

    post: dict | None = None

    raw: dict | list | str | None = None