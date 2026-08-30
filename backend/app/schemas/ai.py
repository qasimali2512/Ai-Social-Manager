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


class GenerateContentResponse(BaseModel):
    success: bool

    content: str | None = None

    hashtags: list[str] = Field(default_factory=list)

    image_url: str | None = None

    post: dict | None = None

    raw: dict | list | str | None = None