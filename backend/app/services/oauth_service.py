from urllib.parse import urlencode

from app.services.platform_service import (
    get_platform_by_key,
)


def build_authorization_url(
    platform_key: str,
    redirect_uri: str,
    state: str,
):
    platform = get_platform_by_key(
        platform_key
    )

    if not platform:
        raise ValueError(
            "Platform not found or inactive"
        )

    authorization_url = platform.get(
        "authorization_url"
    )

    client_id = platform.get(
        "client_id"
    )

    scopes = platform.get(
        "scopes"
    ) or []

    if not authorization_url:
        raise ValueError(
            "Authorization URL is not configured"
        )

    if not client_id:
        raise ValueError(
            "Client ID is not configured"
        )

    if isinstance(scopes, list):
        scope = " ".join(scopes)
    else:
        scope = str(scopes)

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "state": state,
    }

    if scope:
        params["scope"] = scope

    separator = "&" if "?" in authorization_url else "?"

    return (
        authorization_url
        + separator
        + urlencode(params)
    )