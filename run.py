"""
Convenience entry-point to start the FastAPI backend with uvicorn.

Usage (from the project root):
    python run.py

Or directly with uvicorn:
    uvicorn backend.main:app --reload --port 8001

Swagger UI  → http://127.0.0.1:8001/docs
ReDoc       → http://127.0.0.1:8001/redoc
"""
import uvicorn
import os
import sys

if __name__ == "__main__":
    # Get the absolute path of the directory containing run.py
    ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
    
    # Force PYTHONPATH to include the project root so uvicorn can find the 'backend' module
    # even when reloading.
    os.environ["PYTHONPATH"] = ROOT_DIR + os.pathsep + os.environ.get("PYTHONPATH", "")
    sys.path.append(ROOT_DIR)
    
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
    )
