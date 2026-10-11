from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.database import get_db
from app.schemas.category import CategorySimpleResponse
from app.schemas.product import ProductCustomerResponse
from app.services.product_service import product_service
from app.utils.helpers import calculate_stock_status, create_response, format_pagination

router = APIRouter(prefix="/products", tags=["Products"])


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    summary="List active products",
    description="Public endpoint to search and filter active hardware products with pagination."
)
async def list_products(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, description, or SKU"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    min_price: Optional[float] = Query(None, ge=0.0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0.0, description="Maximum price filter"),
    in_stock: Optional[bool] = Query(None, description="Filter by stock availability"),
    db: AsyncSession = Depends(get_db)
):
    products, total = await product_service.list_products(
        db=db,
        page=page,
        limit=limit,
        search=search,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        in_stock=in_stock,
        active_only=True
    )

    items = []
    for p in products:
        status_str = calculate_stock_status(p.stock_quantity, p.low_stock_threshold)
        cat_resp = CategorySimpleResponse(
            id=p.category.id,
            name=p.category.name
        ) if p.category else CategorySimpleResponse(id=0, name="Uncategorized")

        items.append(
            ProductCustomerResponse(
                id=p.id,
                name=p.name,
                description=p.description,
                sku=p.sku,
                price=float(p.price),
                stock_quantity=p.stock_quantity,
                available=p.stock_quantity > 0,
                stock_status=status_str,
                category=cat_resp,
                image_url=p.image_url
            ).model_dump()
        )

    paginated_data = format_pagination(items=items, total=total, page=page, limit=limit)
    return create_response(
        success=True,
        message="Products retrieved successfully.",
        data=paginated_data
    )


@router.get(
    "/{product_id}",
    status_code=status.HTTP_200_OK,
    summary="Get product details",
    description="Public endpoint to view full product specifications and stock availability."
)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    product = await product_service.get_product_by_id(db, product_id, active_only=True)
    status_str = calculate_stock_status(product.stock_quantity, product.low_stock_threshold)

    cat_resp = CategorySimpleResponse(
        id=product.category.id,
        name=product.category.name
    ) if product.category else CategorySimpleResponse(id=0, name="Uncategorized")

    product_data = ProductCustomerResponse(
        id=product.id,
        name=product.name,
        description=product.description,
        sku=product.sku,
        price=float(product.price),
        stock_quantity=product.stock_quantity,
        available=product.stock_quantity > 0,
        stock_status=status_str,
        category=cat_resp,
        image_url=product.image_url
    ).model_dump()

    return create_response(
        success=True,
        message="Product details retrieved successfully.",
        data=product_data
    )
