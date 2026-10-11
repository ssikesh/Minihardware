from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["John Doe"])
    email: EmailStr = Field(..., examples=["john@example.com"])
    password: str = Field(..., min_length=6, max_length=100, examples=["StrongPassword123!"])


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., examples=["john@example.com"])
    password: str = Field(..., examples=["StrongPassword123!"])


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

    model_config = ConfigDict(from_attributes=True)


class TokenPayload(BaseModel):
    sub: str | None = None
    user_id: int | None = None
    role: str | None = None
    exp: int | None = None
