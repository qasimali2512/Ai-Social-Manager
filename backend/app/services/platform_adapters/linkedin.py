import httpx


class LinkedInAdapter:

    API_BASE_URL = (
        "https://api.linkedin.com"
    )

    async def get_profile(
        self,
        access_token: str,
    ) -> dict:

        async with httpx.AsyncClient(
            timeout=30
        ) as client:

            response = await client.get(
                (
                    f"{self.API_BASE_URL}"
                    "/v2/userinfo"
                ),
                headers={
                    "Authorization":
                        f"Bearer {access_token}",
                    "Accept":
                        "application/json",
                },
            )

        if response.status_code >= 400:
            raise ValueError(
                "LinkedIn profile request "
                f"failed: {response.text}"
            )

        data = response.json()

        return {
            "id":
                data.get("sub"),

            "name":
                data.get("name"),

            "username":
                data.get("email"),

            "email":
                data.get("email"),

            "picture":
                data.get("picture"),
        }

    async def publish_post(
        self,
        access_token: str,
        content: str,
        media_urls: list[str] | None = None,
    ) -> dict:

        return {
            "success": False,
            "status": "not_configured",
            "message": (
                "LinkedIn publishing endpoint "
                "requires the member posting "
                "integration."
            ),
        }