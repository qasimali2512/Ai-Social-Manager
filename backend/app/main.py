import asyncio
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.analytics import router as analytics_router
from app.api.calendar import router as calendar_router
from app.api.dashboard import router as dashboard_router
from app.api.generate import router as generate_router
from app.api.media import router as media_router
from app.api.notifications import router as notifications_router
from app.api.oauth import router as oauth_router
from app.api.zernio import router as zernio_router
from app.api.platforms import router as platforms_router
from app.api.posts import router as posts_router
from app.api.publications import router as publications_router
from app.api.publish import router as publish_router
from app.api.scheduler import router as scheduler_router
from app.api.social_accounts import router as social_accounts_router
from app.core.config import settings
from app.services.scheduler_service import process_scheduled_posts


def _mask(value: str) -> str:
    """Show just enough of a secret to spot copy/paste mistakes
    (wrong app, trailing space, stray quotes) without printing
    the whole thing to the console."""

    if not value:
        return "<EMPTY>"

    if len(value) <= 8:
        return f"{'*' * len(value)} (len={len(value)})"

    return (
        f"{value[:4]}...{value[-4:]} "
        f"(len={len(value)})"
    )


def _print_oauth_diagnostics():
    print("=" * 50)
    print("OAuth credentials loaded at startup:")
    print(
        "  LINKEDIN_CLIENT_ID     = "
        f"{_mask(settings.LINKEDIN_CLIENT_ID)}"
    )
    print(
        "  LINKEDIN_CLIENT_SECRET = "
        f"{_mask(settings.LINKEDIN_CLIENT_SECRET)}"
    )
    print(
        "  LINKEDIN_SCOPES        = "
        f"{settings.LINKEDIN_SCOPES!r}"
    )
    print(
        "  BACKEND_URL            = "
        f"{settings.BACKEND_URL}"
    )
    print(
        "  (If a value above looks EMPTY, too short, "
        "or doesn't match what's currently in your "
        "LinkedIn Developer app, that's why token "
        "exchange fails with invalid_client. Also "
        "confirm this printout appears fresh EVERY "
        "time you restart - if it doesn't reprint, "
        "the server didn't actually restart.)"
    )
    print("=" * 50)


async def _scheduler_loop():
    """Run due publications every minute.

    The database claim operation in scheduler_service prevents two workers
    from publishing the same publication when more than one app process is
    running.
    """
    while True:
        try:
            await process_scheduled_posts()
        except Exception as exc:
            print(f"[scheduler] {exc}")
        await asyncio.sleep(60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    _print_oauth_diagnostics()
    task = asyncio.create_task(_scheduler_loop())
    try:
        yield
    finally:
        task.cancel()
        with suppress(asyncio.CancelledError):
            await task


app = FastAPI(
    title="AI Social Manager API",
    description="Backend API for AI-powered social media management.",
    version="1.1.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(generate_router)
app.include_router(posts_router)
app.include_router(media_router)
app.include_router(platforms_router)
app.include_router(social_accounts_router)
app.include_router(oauth_router)
app.include_router(zernio_router)
app.include_router(publications_router)
app.include_router(publish_router)
app.include_router(scheduler_router)
app.include_router(dashboard_router)
app.include_router(calendar_router)
app.include_router(notifications_router)
app.include_router(analytics_router)


@app.get("/")
def root():
    return {
        "success": True,
        "message": "AI Social Manager API is running.",
        "version": "1.1.0",
        "real_publishing": True,
        "scheduler": True,
    }


@app.get("/health")
def health():
    return {
        "success": True,
        "status": "healthy",
    }