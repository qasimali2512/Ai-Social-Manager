from datetime import datetime

from pydantic import BaseModel, Field


class NotificationCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )

    message: str = Field(
        ...,
        min_length=1,
        max_length=1000,
    )

    notification_type: str = "info"


class NotificationUpdate(BaseModel):
    is_read: bool