from fastapi import APIRouter
from app.api.endpoints import health, dashboard, images, predictions, datasets, experiments, models, reports, gradcam

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(images.router, prefix="/images", tags=["images"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
api_router.include_router(experiments.router, prefix="/experiments", tags=["experiments"])
api_router.include_router(models.router, prefix="/models", tags=["models"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(gradcam.router, prefix="/gradcam", tags=["gradcam"])
