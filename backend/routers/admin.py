"""
Router: /api/admin — Admin login, view registered users, and activate users.

Mirrors the Django admins/views.py functionality:
  - AdminLoginCheck   → POST /api/admin/login
  - ViewRegisteredUsers → GET /api/admin/users
  - AdminActivaUsers  → PUT /api/admin/users/{user_id}/activate
  - AdminHome         → GET /api/admin/home
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List

from backend.database import get_db
from backend.models import UserRegistration

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# --------------------------------------------------------------------------- #
#  Schemas (local — admin-only)                                                #
# --------------------------------------------------------------------------- #

class AdminLoginRequest(BaseModel):
    loginid: str = Field(..., example="admin")
    password: str = Field(..., example="admin")


class AdminLoginResponse(BaseModel):
    message: str
    role: str


class UserDetailResponse(BaseModel):
    id: int
    name: str
    loginid: str
    mobile: str
    email: str
    locality: str
    address: str
    city: str
    state: str
    status: str

    class Config:
        from_attributes = True


class ActivateUserResponse(BaseModel):
    message: str
    user_id: int
    status: str


# --------------------------------------------------------------------------- #
#  POST /api/admin/login                                                       #
# --------------------------------------------------------------------------- #
@router.post(
    "/login",
    response_model=AdminLoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin login",
    description=(
        "Validates admin credentials (loginid: **admin**, password: **admin** or "
        "**Admin**/**Admin**). Returns a success message on valid credentials."
    ),
)
def admin_login(payload: AdminLoginRequest):
    """
    **Admin login.**

    - Accepts `admin`/`admin` or `Admin`/`Admin` credentials.
    - Returns role = 'admin' on success.
    """
    valid = (
        (payload.loginid == "admin" and payload.password == "admin") or
        (payload.loginid == "Admin" and payload.password == "Admin")
    )
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials. Please check your login details.",
        )
    return AdminLoginResponse(
        message="Admin login successful!",
        role="admin",
    )


# --------------------------------------------------------------------------- #
#  GET /api/admin/users                                                        #
# --------------------------------------------------------------------------- #
@router.get(
    "/users",
    response_model=List[UserDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="View all registered users",
    description="Returns a list of all users registered in the system (mirrors ViewRegisteredUsers).",
)
def view_registered_users(db: Session = Depends(get_db)):
    """
    **View all registered users.**

    Returns every user in the `UserRegistrations` table.
    """
    users = db.query(UserRegistration).all()
    return users


# --------------------------------------------------------------------------- #
#  PUT /api/admin/users/{user_id}/activate                                     #
# --------------------------------------------------------------------------- #
@router.put(
    "/users/{user_id}/activate",
    response_model=ActivateUserResponse,
    status_code=status.HTTP_200_OK,
    summary="Activate a registered user",
    description=(
        "Sets the user's status to **'activated'**, allowing them to log in. "
        "Mirrors Django's AdminActivaUsers view."
    ),
)
def activate_user(user_id: int, db: Session = Depends(get_db)):
    """
    **Activate a user account.**

    - Finds the user by `user_id`.
    - Sets their `status` to `'activated'`.
    - Returns confirmation with the updated status.
    """
    user = db.query(UserRegistration).filter(UserRegistration.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id={user_id} not found.",
        )

    user.status = "activated"
    db.commit()
    db.refresh(user)

    return ActivateUserResponse(
        message=f"User '{user.name}' has been successfully activated.",
        user_id=user.id,
        status=user.status,
    )


# --------------------------------------------------------------------------- #
#  GET /api/admin/home                                                         #
# --------------------------------------------------------------------------- #
@router.get(
    "/home",
    status_code=status.HTTP_200_OK,
    summary="Admin home / dashboard summary",
    description="Returns a quick summary dashboard — total users, activated vs. waiting.",
)
def admin_home(db: Session = Depends(get_db)):
    """
    **Admin home / dashboard.**

    Returns aggregate stats about registered users.
    """
    all_users = db.query(UserRegistration).all()
    total = len(all_users)
    activated = sum(1 for u in all_users if u.status == "activated")
    waiting = total - activated

    return {
        "message": "Welcome to the Admin Dashboard",
        "stats": {
            "total_users": total,
            "activated_users": activated,
            "waiting_activation": waiting,
        },
    }
