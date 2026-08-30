from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.generate import router as generate_router
from app.api.posts import router as posts_router
from app.api.media import router as media_router
from app.api.platforms import router as platforms_router
from app.api.social_accounts import (
    router as social_accounts_router,
)
from app.api.publications import (
    router as publications_router,
)
from app.api.publish import router as publish_router
from app.api.scheduler import router as scheduler_router
from app.api.dashboard import router as dashboard_router
from app.api.calendar import router as calendar_router
from app.api.notifications import (
    router as notifications_router,
)
from app.api.analytics import (
    router as analytics_router,
)


app = FastAPI(
    title="AI Social Manager API",
    description=(
        "Backend API for AI-powered "
        "social media management."
    ),
    version="1.0.0",
)


# ============================================
# CORS
# ============================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# API ROUTERS
# ============================================

app.include_router(generate_router)
app.include_router(posts_router)
app.include_router(media_router)
app.include_router(platforms_router)
app.include_router(social_accounts_router)
app.include_router(publications_router)
app.include_router(publish_router)
app.include_router(scheduler_router)
app.include_router(dashboard_router)
app.include_router(calendar_router)
app.include_router(notifications_router)
app.include_router(analytics_router)


# ============================================
# ROOT
# ============================================

@app.get("/")
def root():
    return {
        "success": True,
        "message": "AI Social Manager API is running.",
        "version": "1.0.0",
    }


# ============================================
# HEALTH
# ============================================

@app.get("/health")
def health():
    return {
        "success": True,
        "status": "healthy",
    }