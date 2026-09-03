import httpx


class TikTokAdapter:

    API_BASE_URL = (
        "https://open.tiktokapis.com/v2"
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
                    "/user/info/"
                ),
                params={
                    "fields": (
                        "open_id,union_id,"
                        "display_name,avatar_url"
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
                "TikTok profile request failed: "
                f"{response.text}"
            )

        data = response.json()

        user = (
            data.get("data", {})
            .get("user", {})
        )

        return {
            "id":
                user.get("open_id"),

            "name":
                user.get("display_name"),

            "username":
                user.get("display_name"),

            "picture":
                user.get("avatar_url"),
        }

    async def publish_post(
        self,
        access_token: str,
        content: str,
        media_urls: list[str] | None = None,
    ) -> dict:
        # ---------------------------------------------
        # TikTok does not support plain text posts.
        # Publishing requires the Content Posting API
        # with an actual video (or photo, for approved
        # apps), uploaded via a separate init/upload
        # flow - not a single "create post" call like
        # LinkedIn/X/Meta.
        #
        # Wiring that up needs: a video file (not just
        # a caption), the app's TikTok audit/approval
        # for the content.posting scope, and a
        # multi-step upload (init -> PUT the video
        # bytes -> publish). That's out of scope for
        # this adapter until video generation/upload is
        # added to the app.
        # ---------------------------------------------
        raise NotImplementedError(
            "TikTok publishing requires a video file "
            "and TikTok's multi-step Content Posting "
            "API - it isn't supported yet. Connecting "
            "the account (OAuth) works, but "
            "'Publish to TikTok' isn't wired up."
        )