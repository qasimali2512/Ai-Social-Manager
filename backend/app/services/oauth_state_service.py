import secrets
from datetime import datetime, timedelta, timezone


_oauth_states: dict[str, dict] = {}


STATE_EXPIRY_MINUTES = 10


def create_state(
    user_id: str,
    platform: str,
) -> str:
    state = secrets.token_urlsafe(32)

    _oauth_states[state] = {
        "user_id": user_id,
        "platform": platform.lower().strip(),
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
        _oauth_states.pop(state, None)
        return None

    # OAuth state is one-time use.
    _oauth_states.pop(state, None)

    return data