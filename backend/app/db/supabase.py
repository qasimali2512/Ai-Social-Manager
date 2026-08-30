import logging
import socket
import time

from supabase import Client, create_client

from app.core.config import settings


logger = logging.getLogger(__name__)


supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY,
)


def safe_execute(query, retries: int = 3, delay: float = 0.4):
    """
    Run a Supabase/PostgREST query with automatic retries.

    On Windows, transient network hiccups (a dropped keep-alive
    socket, antivirus/firewall SSL inspection, Wi-Fi jitter, etc.)
    can surface from the underlying httpx/httpcore socket layer as:

        OSError: [WinError 10035] A non-blocking socket operation
        could not be completed immediately

    This is not an application bug - it's a transient condition,
    and simply retrying the request almost always succeeds.
    Without this wrapper, that single flaky socket read turns into
    a hard 500 for the whole dashboard (or any other endpoint that
    hits Supabase). This helper retries on OSError/socket.error
    with a short, increasing backoff before finally giving up.

    Usage:
        response = safe_execute(
            supabase.table("posts").select("*").eq("user_id", uid)
        )
    """

    last_error = None

    for attempt in range(1, retries + 1):
        try:
            return query.execute()

        except (OSError, socket.error) as exc:
            last_error = exc

            logger.warning(
                "Supabase query failed on attempt "
                f"{attempt}/{retries}: {exc}"
            )

            if attempt == retries:
                break

            time.sleep(delay * attempt)

    raise last_error