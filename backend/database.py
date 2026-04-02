"""
Database connection for FastAPI backend using the same SQLite DB as Django.
"""
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Reuse the same SQLite database that Django uses
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "db.sqlite3"

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# Check if DB exists (informative only)
if not DB_PATH.exists():
    print(f"⚠️ Warning: Database file not found at {DB_PATH}")
    print("   Please ensure Django migrations have been run (python manage.py migrate).")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency to get DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
