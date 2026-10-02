from fastapi import APIRouter

from app.core.config import APP_VERSION
from app.schemas.models import HealthResponse
from app.services.data_loader import store

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok", app_version=APP_VERSION, data_loaded=store._loaded)
