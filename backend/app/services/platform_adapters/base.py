from abc import ABC, abstractmethod


class PlatformAdapter(ABC):

    @abstractmethod
    async def get_profile(
        self,
        access_token: str,
    ) -> dict:
        raise NotImplementedError

    @abstractmethod
    async def publish_post(
        self,
        access_token: str,
        content: str,
        media_urls: list[str] | None = None,
    ) -> dict:
        raise NotImplementedError