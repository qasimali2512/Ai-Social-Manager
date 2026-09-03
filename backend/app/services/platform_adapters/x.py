import httpx


class XAdapter:

    API_BASE_URL = (
        "https://api.x.com/2"
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
                    "/users/me"
                ),
                params={
                    "user.fields": (
                        "id,name,username,"
                        "profile_image_url"
                    )
                },
                headers={
                    "Authorization":
                        f"Bearer {access_token}",
                    "Accept":
                        "application/json",
                },
            )

        if response.status_code >= 400:
            raise ValueError(
                "X profile request failed: "
                f"{response.text}"
            )

        data = response.json()

        user = data.get(
            "data",
            {}
        )

        return {
            "id":
                user.get("id"),

            "name":
                user.get("name"),

            "username":
                user.get("username"),

            "picture":
                user.get(
                    "profile_image_url"
                ),
        }

    async def publish_post(
        self,
        access_token: str,
        content: str,
        media_urls: list[str] | None = None,
    ) -> dict:

        payload = {
            "text": content
        }

        async with httpx.AsyncClient(
            timeout=30
        ) as client:

            response = await client.post(
                (
                    f"{self.API_BASE_URL}"
                    "/tweets"
                ),
                json=payload,
                headers={
                    "Authorization":
                        f"Bearer {access_token}",
                    "Content-Type":
                        "application/json",
                    "Accept":
                        "application/json",
                },
            )

        if response.status_code >= 400:
            raise ValueError(
                "X post failed: "
                f"{response.text}"
            )

        return response.json()