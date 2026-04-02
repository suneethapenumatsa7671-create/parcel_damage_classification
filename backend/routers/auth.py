"""
Router: /api/auth — Register & Login endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import UserRegistration
from backend.schemas import (
    UserRegisterRequest,
    UserRegisterResponse,
    UserLoginRequest,
    UserLoginResponse,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# --------------------------------------------------------------------------- #
#  POST /api/auth/register                                                     #
# --------------------------------------------------------------------------- #
@router.post(
    "/register",
    response_model=UserRegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description=(
        "Creates a new user account. The account is set to **'waiting'** status "
        "until an admin activates it. All fields are required."
    ),
)
def register_user(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    **Register a new user.**

    - Checks for duplicate loginid, mobile, or email.
    - Saves user with status = 'waiting' (must be activated by admin).
    """
    # --- Duplicate checks ---
    if db.query(UserRegistration).filter(UserRegistration.loginid == payload.loginid).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Login ID already exists. Please choose a different one.",
        )
    if db.query(UserRegistration).filter(UserRegistration.mobile == payload.mobile).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number already registered.",
        )
    if db.query(UserRegistration).filter(UserRegistration.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered.",
        )

    # --- Create user ---
    new_user = UserRegistration(
        name=payload.name,
        loginid=payload.loginid,
        password=payload.password,       # NOTE: store hashed in production!
        mobile=payload.mobile,
        email=payload.email,
        locality=payload.locality,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        status="waiting",                # Requires admin activation
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserRegisterResponse(
        message="Registration successful! Your account is pending admin activation.",
        user_id=new_user.id,
    )


# --------------------------------------------------------------------------- #
#  POST /api/auth/login                                                        #
# --------------------------------------------------------------------------- #
@router.post(
    "/login",
    response_model=UserLoginResponse,
    status_code=status.HTTP_200_OK,
    summary="User login",
    description=(
        "Validates credentials and returns user info. "
        "The account must be **'activated'** by an admin before login is allowed."
    ),
)
def login_user(payload: UserLoginRequest, db: Session = Depends(get_db)):
    """
    **Login a registered & activated user.**

    - Validates loginid + password.
    - Checks account activation status.
    - Returns user profile on success.
    """
    user = db.query(UserRegistration).filter(
        UserRegistration.loginid == payload.loginid,
        UserRegistration.password == payload.password,
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid login ID or password.",
        )

    if user.status != "activated":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account not activated. Current status: '{user.status}'. Please contact admin.",
        )

    return UserLoginResponse(
        message="Login successful!",
        user_id=user.id,
        name=user.name,
        loginid=user.loginid,
        email=user.email,
        status=user.status,
    )
