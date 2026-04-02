"""
Routers package – exposes all FastAPI routers.
"""
from . import auth, predict, admin

__all__ = ["auth", "predict", "admin"]
