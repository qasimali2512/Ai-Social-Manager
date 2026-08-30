from pydantic import BaseModel


class DashboardResponse(BaseModel):
    success: bool
    summary: dict
    upcoming: list
    recent: list
    platforms: list
    notifications: dict