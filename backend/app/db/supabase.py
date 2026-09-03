import logging
import socket
import time
import httpx

from supabase import Client, create_client

from app.core.config import settings


logger = logging.getLogger(__name__)


supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY,
)


def safe_execute(query, retries: int = 4, delay: float = 0.7):
    """
    Execute Supabase/PostgREST query with retry handling
    for transient Windows/httpx network errors.
    """

    last_error = None

    for attempt in range(1, retries + 1):
        try:
            return query.execute()

        except (
            httpx.ReadError,
            httpx.ConnectError,
            httpx.RemoteProtocolError,
            httpx.ConnectTimeout,
            httpx.ReadTimeout,
            OSError,
            socket.error,
        ) as exc:

            last_error = exc

            logger.warning(
                "Supabase request failed "
                f"(attempt {attempt}/{retries}): {exc}"
            )

            if attempt < retries:
                time.sleep(delay * attempt)

    raise last_error