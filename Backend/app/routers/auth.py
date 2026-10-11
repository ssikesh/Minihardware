from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.services.auth_service import auth_service
from app.utils.helpers import create_response

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Register a new customer account",
    description="Registers a new customer account with name, email, and password. Returns access token upon registration."
)
async def register(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    user = await auth_service.register_user(db, data)
    _, token, expires_in = await auth_service.authenticate_user(
        db, LoginRequest(email=data.email, password=data.password)
    )

    token_data = TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=expires_in,
        user=UserResponse.model_validate(user)
    )

    return create_response(
        success=True,
        message="User registered successfully.",
        data=token_data.model_dump()
    )


@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    summary="User login",
    description="Authenticates user using email and password, returning JWT access token and user profile."
)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    user, token, expires_in = await auth_service.authenticate_user(db, data)
    token_data = TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=expires_in,
        user=UserResponse.model_validate(user)
    )

    return create_response(
        success=True,
        message="Login successful.",
        data=token_data.model_dump()
    )


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Retrieves profile information for the currently authenticated user."
)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    user_data = UserResponse.model_validate(current_user)
    return create_response(
        success=True,
        message="Current user profile retrieved successfully.",
        data=user_data.model_dump()
    )
