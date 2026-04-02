"""
FastAPI application entry point.

Run with:
    python run.py

Interactive docs:
    http://127.0.0.1:8001/docs
"""
import logging
import sys
import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Ensure the project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.routers import auth, predict, admin

from contextlib import asynccontextmanager

# --- Lifespan (Startup/Shutdown) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info("Starting Parcel Damage Classification API...")
    if not (BASE_DIR / "db.sqlite3").exists():
        logger.warning(f"Database 'db.sqlite3' NOT found in {BASE_DIR}. Make sure Django has initialized it.")
    else:
        logger.info(f"Database found at {BASE_DIR / 'db.sqlite3'}")
    
    yield  # Control returns to FastAPI
    
    # Shutdown logic (optional)
    logger.info("Shutting down Parcel Damage Classification API...")

# --- App Instance ---
app = FastAPI(
    title="Parcel Damage Classification API",
    description="FastAPI backend for the Parcel Damage Classification system.",
    version="1.1.0",
    lifespan=lifespan,
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Static Files (Media) ---
MEDIA_DIR = BASE_DIR / "media"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR = MEDIA_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/media", StaticFiles(directory=str(MEDIA_DIR)), name="media")

# --- Global Exception Handler ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error. Please check backend logs.", "error": str(exc)},
    )

# --- Routers ---
app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(admin.router)

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to the Parcel Damage Classification API",
        "version": "1.1.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/auth",
            "predict": "/api/predict",
            "admin": "/api/admin",
        },
    }
