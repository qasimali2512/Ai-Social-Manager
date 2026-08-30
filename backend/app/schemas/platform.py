from pydantic import BaseModel, Field


class PlatformCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    key: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    authorization_url: str | None = None

    token_url: str | None = None

    scopes: list[str] = []

    api_base_url: str | None = None

    icon: str | None = None

    description: str | None = None

    client_id: str | None = None

    client_secret: str | None = None


class PlatformUpdate(BaseModel):
    name: str | None = Field(
        None,
        min_length=1,
        max_length=100,
    )

    key: str | None = Field(
        None,
        min_length=1,
        max_length=100,
    )

    authorization_url: str | None = None

    token_url: str | None = None

    scopes: list[str] | None = None

    api_base_url: str | None = None

    icon: str | None = None

    description: str | None = None

    client_id: str | None = None

    client_secret: str | None = None

    is_active: bool | None = None


class PlatformResponse(BaseModel):
    id: str
    name: str
    key: str

    authorization_url: str | None = None
    token_url: str | None = None

    scopes: list[str] = []

    api_base_url: str | None = None

    icon: str | None = None

    description: str | None = None

    is_active: bool = True