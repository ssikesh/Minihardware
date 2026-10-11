from datetime import timedelta
from typing import Tuple
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User, UserRole
from app.schemas.auth import LoginRequest, RegisterRequest


class AuthService:
    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).where(User.email == email.lower().strip()))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def register_user(
        db: AsyncSession,
        data: RegisterRequest,
        role: str = UserRole.CUSTOMER.value
    ) -> User:
        # Check if email is already taken
        existing_user = await AuthService.get_user_by_email(db, data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"User with email '{data.email}' already exists."
            )

        new_user = User(
            name=data.name.strip(),
            email=data.email.lower().strip(),
            password_hash=get_password_hash(data.password),
            role=role,
            is_active=True
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user

    @staticmethod
    async def authenticate_user(
        db: AsyncSession,
        data: LoginRequest
    ) -> Tuple[User, str, int]:
        user = await AuthService.get_user_by_email(db, data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated. Please contact support."
            )

        expires_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        token_payload = {
            "sub": str(user.id),
            "user_id": user.id,
            "role": user.role,
            "email": user.email,
        }
        access_token = create_access_token(
            data=token_payload,
            expires_delta=timedelta(minutes=expires_minutes)
        )
        expires_in_seconds = expires_minutes * 60

        return user, access_token, expires_in_seconds


auth_service = AuthService()
