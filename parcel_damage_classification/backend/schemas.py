"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
import re

# --------------------------------------------------------------------------- #
#  Registration Schemas                                                        #
# --------------------------------------------------------------------------- #

class UserRegisterRequest(BaseModel):
    """Payload for user registration."""
    name: str = Field(..., pattern=r"^[a-zA-Z\s]+$", description="Letters only")
    loginid: str = Field(..., pattern=r"^[a-zA-Z]+$", description="Letters only")
    password: str = Field(..., min_length=8, description="Min 8 chars with upper, lower & digit")
    mobile: str = Field(..., pattern=r"^[56789][0-9]{9}$", description="Valid 10-digit mobile number")
    email: EmailStr = Field(..., description="Valid email address")
    locality: str = Field(..., min_length=1, max_length=100)
    address: str = Field(..., min_length=1, max_length=1000)
    city: str = Field(..., pattern=r"^[A-Za-z\s]+$")
    state: str = Field(..., pattern=r"^[A-Za-z\s]+$")

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Custom password strength check (look-ahead alternative)."""
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one numerical digit.")
        return v


class UserRegisterResponse(BaseModel):
    """Response after successful registration."""
    message: str
    user_id: int

    class Config:
        from_attributes = True


# --------------------------------------------------------------------------- #
#  Login Schemas                                                                #
# --------------------------------------------------------------------------- #

class UserLoginRequest(BaseModel):
    """Payload for user login."""
    loginid: str = Field(..., example="johndoe")
    password: str = Field(..., example="Secret@123")


class UserLoginResponse(BaseModel):
    """Response after successful login."""
    message: str
    user_id: int
    name: str
    loginid: str
    email: str
    status: str


# --------------------------------------------------------------------------- #
#  Prediction Schemas                                                           #
# --------------------------------------------------------------------------- #

class PredictionResponse(BaseModel):
    """Response from the parcel damage prediction."""
    prediction: str
    confidence: str
    image_url: str
    message: str
