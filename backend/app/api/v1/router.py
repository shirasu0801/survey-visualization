"""
API Router
"""
from fastapi import APIRouter

from app.api.v1.endpoints import surveys, responses, analytics, export, qr

api_router = APIRouter()

api_router.include_router(surveys.router, prefix="/surveys", tags=["surveys"])
api_router.include_router(responses.router, prefix="/responses", tags=["responses"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(export.router, prefix="/export", tags=["export"])
api_router.include_router(qr.router, prefix="/qr", tags=["qr"])
