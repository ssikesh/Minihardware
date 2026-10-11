from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Bolts"])
    description: str | None = Field(None, examples=["All types of metal and steel bolts"])
    is_active: bool = Field(True, examples=[True])


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    description: str | None = None
    is_active: bool | None = None


class CategorySimpleResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
