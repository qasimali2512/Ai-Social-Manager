from app.services.platform_adapters.base import (
    PlatformAdapter,
)

from app.services.platform_adapters.meta import (
    MetaAdapter,
)


ADAPTERS: dict[str, PlatformAdapter] = {}


def register_adapter(
    platform: str,
    adapter: PlatformAdapter,
):
    ADAPTERS[platform.lower()] = adapter


def get_adapter(
    platform: str,
):
    return ADAPTERS.get(
        platform.lower()
    )


def register_default_adapters():
    meta_adapter = MetaAdapter()

    register_adapter(
        "facebook",
        meta_adapter,
    )

    register_adapter(
        "instagram",
        meta_adapter,
    )


register_default_adapters()