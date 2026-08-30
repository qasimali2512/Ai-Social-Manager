from pydantic import BaseModel, Field
from typing import Optional


class SocialAccountCreate(BaseModel):
    platform: str = Field(
        ...,
        min_length=2,
        max_length=50,
    )

    account_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    username: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    access_token: Optional[str] = None

    refresh_token: Optional[str] = None

    platform_user_id: Optional[str] = None

    is_active: bool = True


class SocialAccountUpdate(BaseModel):
    account_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    username: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    access_token: Optional[str] = None

    refresh_token: Optional[str] = None

    platform_user_id: Optional[str] = None

    is_active: Optional[bool] = None


class SocialAccountResponse(BaseModel):
    id: str
    user_id: str
    platform: str
    account_name: Optional[str] = None
    username: Optional[str] = None
    platform_user_id: Optional[str] = None
    is_active: bool = True

class SocialAccountListResponse(BaseModel):
    success: bool
    count: int
    accounts: list[dict]