import httpx


GRAPH_API = (
    "https://graph.facebook.com/v23.0"
)


class MetaAdapter:

    async def get_profile(
        self,
        access_token: str,
        platform: str = "facebook",
    ) -> dict:

        if platform == "instagram":

            return await self._get_instagram_profile(
                access_token
            )

        return await self._get_facebook_profile(
            access_token
        )

    async def _get_facebook_profile(
        self,
        access_token: str,
    ) -> dict:

        async with httpx.AsyncClient(
            timeout=30
        ) as client:

            response = await client.get(
                f"{GRAPH_API}/me",
                params={
                    "fields":
                        "id,name",
                    "access_token":
                        access_token,
                },
            )

        if response.status_code >= 400:
            raise ValueError(
                "Facebook profile request "
                f"failed: {response.text}"
            )

        return response.json()

    async def _get_instagram_profile(
        self,
        access_token: str,
    ) -> dict:

        async with httpx.AsyncClient(
            timeout=30
        ) as client:

            response = await client.get(
                f"{GRAPH_API}/me/accounts",
                params={
                    "fields": (
                        "id,name,"
                        "instagram_business_account"
                        "{id,username,name}"
                    ),
                    "access_token":
                        access_token,
                },
            )

        if response.status_code >= 400:
            raise ValueError(
                "Instagram account lookup "
                f"failed: {response.text}"
            )

        data = response.json()

        pages = data.get(
            "data",
            []
        )

        for page in pages:

            instagram_account = page.get(
                "instagram_business_account"
            )

            if instagram_account:
                return {
                    "id":
                        instagram_account.get(
                            "id"
                        ),

                    "name":
                        instagram_account.get(
                            "name"
                        )
                        or instagram_account.get(
                            "username"
                        ),

                    "username":
                        instagram_account.get(
                            "username"
                        ),

                    "page_id":
                        page.get("id"),
                }

        raise ValueError(
            "No Instagram professional account "
            "was found. Make sure your Instagram "
            "account is a Business or Creator "
            "account and is connected to a "
            "Facebook Page."
        )

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
                "Meta publishing requires "
                "the platform-specific publishing "
                "flow."
            ),
        }