from datetime import datetime

from pydantic import (
    BaseModel,
    Field,
)


class PublishPostRequest(BaseModel):

    post_id: str = Field(
        ...,
        min_length=1,
    )

    social_account_id: str = Field(
        ...,
        min_length=1,
    )


class PublishPostResponse(BaseModel):

    success: bool

    message: str

    publication: dict | None = None


class SchedulePostRequest(BaseModel):

    post_id: str = Field(
        ...,
        min_length=1,
    )

    platform_id: str = Field(
        ...,
        min_length=1,
    )

    social_account_id: str | None = None

    scheduled_at: datetime | None = None


class PublicationResponse(BaseModel):

    id: str

    post_id: str

    platform_id: str

    social_account_id: str | None = None

    status: str

    scheduled_at: datetime | None = None

    published_at: datetime | None = None

    external_post_id: str | None = None

    error_message: str | None = None