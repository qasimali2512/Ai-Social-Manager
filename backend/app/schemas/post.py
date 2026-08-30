from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class PostStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    REJECTED = "rejected"


class PublicationStatus(str, Enum):
    PENDING = "pending"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    FAILED = "failed"
    REJECTED = "rejected"


class PostCreate(BaseModel):
    content: str = Field(
        ...,
        min_length=1,
        max_length=10000,
    )

    title: str | None = Field(
        default=None,
        max_length=300,
    )

    status: PostStatus = PostStatus.DRAFT

    scheduled_at: datetime | None = None

    media_url: str | None = None

    platform_ids: list[str] = Field(
        default_factory=list
    )

    account_ids: list[str] = Field(
        default_factory=list
    )


class PostUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        max_length=300,
    )

    content: str | None = Field(
        default=None,
        min_length=1,
        max_length=10000,
    )

    status: PostStatus | None = None

    scheduled_at: datetime | None = None

    media_url: str | None = None


class PostPublicationCreate(BaseModel):
    platform_id: str

    social_account_id: str | None = None

    scheduled_at: datetime | None = None


class PostResponse(BaseModel):
    id: str
    title: str | None = None
    content: str
    status: str
    scheduled_at: datetime | None = None
    media_url: str | None = None