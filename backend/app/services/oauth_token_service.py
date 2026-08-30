import httpx

from app.services.platform_service import (
    get_platform_by_key,
)


async def exchange_code_for_token(
    platform_key: str,
    code: str,
    redirect_uri: str,
):
    platform = get_platform_by_key(
        platform_key
    )

    if not platform:
        raise ValueError(
            "Platform not found or inactive"
        )

    token_url = platform.get(
        "token_url"
    )

    client_id = platform.get(
        "client_id"
    )

    client_secret = platform.get(
        "client_secret"
    )

    if not token_url:
        raise ValueError(
            "OAuth token URL is not configured"
        )

    if not client_id:
        raise ValueError(
            "OAuth client ID is not configured"
        )

    if not client_secret:
        raise ValueError(
            "OAuth client secret is not configured"
        )

    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
        "client_id": client_id,
        "client_secret": client_secret,
    }

    async with httpx.AsyncClient(
        timeout=30
    ) as client:

        response = await client.post(
            token_url,
            data=payload,
            headers={
                "Accept": "application/json",
            },
        )

    if response.status_code >= 400:
        raise ValueError(
            "Token exchange failed: "
            f"{response.text}"
        )

    try:
        data = response.json()
    except Exception:
        raise ValueError(
            "OAuth provider returned "
            "an invalid response."
        )

    if not data.get("access_token"):
        raise ValueError(
            "Provider did not return "
            "an access token."
        )

    return data