from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.database import get_db
from app.schemas.category import CategoryResponse
from app.services.product_service import product_service
from app.utils.helpers import create_response

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    summary="List active categories",
    description="Public endpoint to list all active product categories."
)
async def list_categories(
    db: AsyncSession = Depends(get_db)
):
    categories = await product_service.list_categories(db, active_only=True)
    data = [CategoryResponse.model_validate(c).model_dump() for c in categories]
    return create_response(
        success=True,
        message="Categories retrieved successfully.",
        data=data
    )


@router.get(
    "/{category_id}",
    status_code=status.HTTP_200_OK,
    summary="Get category details",
    description="Public endpoint to fetch category details by ID."
)
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db)
):
    category = await product_service.get_category_by_id(db, category_id)
    return create_response(
        success=True,
        message="Category retrieved successfully.",
        data=CategoryResponse.model_validate(category).model_dump()
    )
