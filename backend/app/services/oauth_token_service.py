import httpx

from app.services.oauth_config_service import (
    get_oauth_config,
    validate_oauth_config,
)


async def exchange_code_for_token(
    platform_key: str,
    code: str,
    redirect_uri: str,
    code_verifier: str | None = None,
):
    platform = get_oauth_config(
        platform_key
    )

    if not platform:
        raise ValueError(
            "OAuth platform is not configured."
        )

    validate_oauth_config(platform)

    payload = {
        "grant_type":
            "authorization_code",

        "code":
            code,

        "redirect_uri":
            redirect_uri,

        "client_id":
            platform["client_id"],
    }

    # LinkedIn / Meta / TikTok all send a client secret
    # in the body (X does not - see below).
    if platform["key"] != "x":
        payload["client_secret"] = (
            platform["client_secret"]
        )

    # TikTok's token endpoint expects "client_key",
    # not "client_id".
    if platform["key"] == "tiktok":
        payload["client_key"] = (
            payload.pop("client_id")
        )

    # X and TikTok OAuth 2.0 PKCE
    if (
        platform["key"] in {"x", "tiktok"}
        and code_verifier
    ):
        payload["code_verifier"] = (
            code_verifier
        )

    headers = {
        "Accept": "application/json",
        "Content-Type":
            "application/x-www-form-urlencoded",
    }

    auth = None

    # X accepts client authentication
    # through HTTP Basic for confidential apps.
    if platform["key"] == "x":
        auth = (
            platform["client_id"],
            platform["client_secret"],
        )

        payload.pop(
            "client_id",
            None,
        )

    async with httpx.AsyncClient(
        timeout=30
    ) as client:

        response = await client.post(
            platform["token_url"],
            data=payload,
            headers=headers,
            auth=auth,
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

    if not data.get(
        "access_token"
    ):
        raise ValueError(
            "Provider did not return "
            "an access token."
        )

    return data