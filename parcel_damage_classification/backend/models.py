"""
SQLAlchemy models mirroring Django's UserRegistrationModel (table: UserRegistrations).
"""
from sqlalchemy import Column, Integer, String
from backend.database import Base


class UserRegistration(Base):
    """Mirrors Django's UserRegistrationModel — table 'UserRegistrations'."""
    __tablename__ = "UserRegistrations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    loginid = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(100), nullable=False)
    mobile = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    locality = Column(String(100), nullable=False)
    address = Column(String(1000), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    status = Column(String(100), nullable=False, default="waiting")
