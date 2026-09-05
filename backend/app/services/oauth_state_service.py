import hashlib
import secrets
import base64

from datetime import (
    datetime,
    timedelta,
    timezone,
)

from app.db.supabase import supabase, safe_execute


# ============================================================
# OAuth "state" storage.
#
# IMPORTANT: this used to be a plain in-memory Python dict
# (`_oauth_states = {}`). That only works if the exact same
# backend PROCESS handles both /connect (which creates the
# state) and /callback (which validates it).
#
# In practice that assumption broke as soon as:
#   - /connect was hit on one machine (e.g. a local dev
#     backend) while BACKEND_URL pointed the redirect_uri at
#     a different deployment (e.g. AWS) - so /callback landed
#     on a process that never created that state, OR
#   - the app runs with more than one worker process, OR
#   - the process restarts between connect and callback.
#
# All of those show up as "OAuth failed ... invalid_state"
# even though the user did everything right. Storing state in
# Supabase instead makes it work no matter which process/
# instance handles either request.
# ============================================================

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

    safe_execute(
        supabase
        .table("oauth_states")
        .insert({
            "state": state,
            "user_id": user_id,
            "platform": (
                platform.lower().strip()
            ),
            "code_verifier": code_verifier,
        })
    )

    return state


def validate_state(
    state: str,
    platform: str,
):
    if not state:
        return None

    response = safe_execute(
        supabase
        .table("oauth_states")
        .select("*")
        .eq("state", state)
        .maybe_single()
    )

    # supabase-py's .maybe_single() returns None (not a
    # response object with data=None) when zero rows match.
    data = response.data if response else None

    if not data:
        return None

    # One-time use: delete immediately, whether or not the
    # rest of validation passes below, so a state can never
    # be replayed.
    safe_execute(
        supabase
        .table("oauth_states")
        .delete()
        .eq("state", state)
    )

    if data["platform"] != (
        platform.lower().strip()
    ):
        return None

    created_at = datetime.fromisoformat(
        data["created_at"]
    )

    expired = (
        datetime.now(timezone.utc)
        - created_at
        > timedelta(
            minutes=STATE_EXPIRY_MINUTES
        )
    )

    if expired:
        return None

    return {
        "user_id": data["user_id"],
        "platform": data["platform"],
        "code_verifier": data["code_verifier"],
    }


def cleanup_expired_states() -> None:
    """
    Optional housekeeping: delete any states older than the
    expiry window that were never consumed (e.g. the user
    abandoned the login). Safe to call periodically (a
    scheduled job) or just occasionally - it's not required
    for correctness since validate_state() already rejects
    expired rows.
    """

    cutoff = (
        datetime.now(timezone.utc)
        - timedelta(minutes=STATE_EXPIRY_MINUTES)
    ).isoformat()

    safe_execute(
        supabase
        .table("oauth_states")
        .delete()
        .lt("created_at", cutoff)
    )