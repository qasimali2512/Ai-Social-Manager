import hashlib
import secrets
import base64

from datetime import (
    datetime,
    timedelta,
    timezone,
)


_oauth_states: dict[str, dict] = {}


STATE_EXPIRY_MINUTES = 10


def create_code_verifier() -> str:
    return secrets.token_urlsafe(64)


def create_code_challenge(
    code_verifier: str,
) -> str:

    digest = hashlib.sha256(
        code_verifier.encode("utf-8")
    ).digest()

    return (
        base64.urlsafe_b64encode(
            digest
        )
        .decode("utf-8")
        .rstrip("=")
    )


def create_state(
    user_id: str,
    platform: str,
    code_verifier: str | None = None,
) -> str:

    state = secrets.token_urlsafe(32)

    _oauth_states[state] = {
        "user_id": user_id,
        "platform": (
            platform.lower().strip()
        ),
        "code_verifier": code_verifier,
        "created_at": datetime.now(
            timezone.utc
        ),
    }

    return state


def validate_state(
    state: str,
    platform: str,
):
    if not state:
        return None

    data = _oauth_states.get(state)

    if not data:
        return None

    if data["platform"] != (
        platform.lower().strip()
    ):
        return None

    created_at = data["created_at"]

    expired = (
        datetime.now(timezone.utc)
        - created_at
        > timedelta(
            minutes=STATE_EXPIRY_MINUTES
        )
    )

    if expired:
        _oauth_states.pop(
            state,
            None,
        )

        return None

    # One-time use.
    _oauth_states.pop(
        state,
        None,
    )

    return data