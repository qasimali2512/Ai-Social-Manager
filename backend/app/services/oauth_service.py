from urllib.parse import urlencode

from app.services.oauth_config_service import (
    get_oauth_config,
    validate_oauth_config,
)


def build_authorization_url(
    platform_key: str,
    redirect_uri: str,
    state: str,
    code_challenge: str | None = None,
):
    platform = get_oauth_config(
        platform_key
    )

    if not platform:
        raise ValueError(
            "OAuth is not configured for "
            f"{platform_key}."
        )

    validate_oauth_config(platform)

    scopes = platform.get("scopes") or []

    if isinstance(scopes, list):
        scope = " ".join(scopes)
    else:
        scope = str(scopes)

    params = {
        "client_id":
            platform["client_id"],
        "redirect_uri":
            redirect_uri,
        "response_type":
            "code",
        "state":
            state,
    }

    # TikTok's authorize endpoint expects the app
    # identifier under "client_key", not "client_id".
    if platform["key"] == "tiktok":
        params["client_key"] = (
            params.pop("client_id")
        )

    if scope:
        params["scope"] = scope

    # Google/YouTube needs offline access so scheduled
    # publishing can refresh the access token later.
    if platform["key"] == "youtube":
        params["access_type"] = "offline"
        params["prompt"] = "consent"

    # X and TikTok OAuth 2.0 both use PKCE.
    if (
        platform["key"] in {"x", "tiktok"}
        and code_challenge
    ):
        params["code_challenge"] = (
            code_challenge
        )

        params["code_challenge_method"] = (
            "S256"
        )

    separator = (
        "&"
        if "?" in platform["authorization_url"]
        else "?"
    )

    return (
        platform["authorization_url"]
        + separator
        + urlencode(params)
    )