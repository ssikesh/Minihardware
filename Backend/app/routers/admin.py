from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_admin, get_db
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategorySimpleResponse, CategoryUpdate
from app.schemas.product import (
    DashboardStatsResponse,
    InventoryItemResponse,
    ProductAdminResponse,
    ProductCreate,
    ProductUpdate,
    StockAdjust,
    StockUpdate
)
from app.services.inventory_service import inventory_service
from app.services.product_service import product_service
from app.utils.helpers import calculate_stock_status, create_response, format_pagination

router = APIRouter(prefix="/admin", tags=["Admin"])


# ---------------- Dashboard ----------------
@router.get(
    "/dashboard",
    status_code=status.HTTP_200_OK,
    summary="Get admin dashboard statistics",
    description="Returns aggregate counts of total products, categories, low-stock items, and out-of-stock items."
)
async def get_dashboard(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stats = await inventory_service.get_dashboard_stats(db)
    return create_response(
        success=True,
        message="Dashboard statistics retrieved successfully.",
        data=DashboardStatsResponse(**stats).model_dump()
    )


# ---------------- Product Management ----------------
@router.post(
    "/products",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description="Admin creates a new hardware product with SKU, pricing, and stock limits."
)
async def create_product(
    data: ProductCreate,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    product = await product_service.create_product(db, data)
    status_str = calculate_stock_status(product.stock_quantity, product.low_stock_threshold)
    cat_resp = CategorySimpleResponse(
        id=product.category.id,
        name=product.category.name
    ) if product.category else CategorySimpleResponse(id=0, name="Uncategorized")

    product_data = ProductAdminResponse(
        id=product.id,
        name=product.name,
        description=product.description,
        sku=product.sku,
        price=float(product.price),
        stock_quantity=product.stock_quantity,
        low_stock_threshold=product.low_stock_threshold,
        category_id=product.category_id,
        category=cat_resp,
        image_url=product.image_url,
        is_active=product.is_active,
        stock_status=status_str,
        created_at=product.created_at,
        updated_at=product.updated_at
    ).model_dump()

    return create_response(
        success=True,
        message="Product created successfully.",
        data=product_data
    )


@router.put(
    "/products/{product_id}",
    status_code=status.HTTP_200_OK,
    summary="Update product details",
    description="Allows admin to update product name, description, price, SKU, category, image, and active status."
)
async def update_product(
    product_id: int,
    data: ProductUpdate,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    product = await product_service.update_product(db, product_id, data)
    status_str = calculate_stock_status(product.stock_quantity, product.low_stock_threshold)
    cat_resp = CategorySimpleResponse(
        id=product.category.id,
        name=product.category.name
    ) if product.category else CategorySimpleResponse(id=0, name="Uncategorized")

    product_data = ProductAdminResponse(
        id=product.id,
        name=product.name,
        description=product.description,
        sku=product.sku,
        price=float(product.price),
        stock_quantity=product.stock_quantity,
        low_stock_threshold=product.low_stock_threshold,
        category_id=product.category_id,
        category=cat_resp,
        image_url=product.image_url,
        is_active=product.is_active,
        stock_status=status_str,
        created_at=product.created_at,
        updated_at=product.updated_at
    ).model_dump()

    return create_response(
        success=True,
        message="Product updated successfully.",
        data=product_data
    )


@router.delete(
    "/products/{product_id}",
    status_code=status.HTTP_200_OK,
    summary="Deactivate/Delete product",
    description="Soft-deletes a product by marking is_active = false to preserve historical cart and order references."
)
async def delete_product(
    product_id: int,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    product = await product_service.delete_product(db, product_id)
    return create_response(
        success=True,
        message=f"Product '{product.name}' deactivated successfully.",
        data={"product_id": product.id, "is_active": product.is_active}
    )


@router.patch(
    "/products/{product_id}/stock",
    status_code=status.HTTP_200_OK,
    summary="Set product stock quantity",
    description="Directly updates stock quantity to an exact non-negative number."
)
async def set_product_stock(
    product_id: int,
    data: StockUpdate,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    product = await inventory_service.update_stock(db, product_id, data.stock_quantity)
    status_str = calculate_stock_status(product.stock_quantity, product.low_stock_threshold)
    return create_response(
        success=True,
        message="Product stock updated successfully.",
        data={
            "product_id": product.id,
            "sku": product.sku,
            "name": product.name,
            "stock_quantity": product.stock_quantity,
            "stock_status": status_str
        }
    )


@router.patch(
    "/products/{product_id}/stock/adjust",
    status_code=status.HTTP_200_OK,
    summary="Increment or decrement product stock",
    description="Adjusts stock quantity by adding or removing units. Rejects operations that would result in negative stock."
)
async def adjust_product_stock(
    product_id: int,
    data: StockAdjust,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    product = await inventory_service.adjust_stock(
        db, product_id, data.quantity, data.operation
    )
    status_str = calculate_stock_status(product.stock_quantity, product.low_stock_threshold)
    return create_response(
        success=True,
        message=f"Stock adjusted successfully with operation '{data.operation}'.",
        data={
            "product_id": product.id,
            "sku": product.sku,
            "name": product.name,
            "stock_quantity": product.stock_quantity,
            "stock_status": status_str
        }
    )


# ---------------- Inventory View ----------------
@router.get(
    "/inventory",
    status_code=status.HTTP_200_OK,
    summary="View inventory items",
    description="Lists all inventory items with pagination and status filtering (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)."
)
async def view_inventory(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Status filter: IN_STOCK, LOW_STOCK, OUT_OF_STOCK"),
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    items, total = await inventory_service.get_inventory(
        db, page=page, limit=limit, status_filter=status
    )
    items_data = [item.model_dump() for item in items]
    paginated_data = format_pagination(items=items_data, total=total, page=page, limit=limit)
    return create_response(
        success=True,
        message="Inventory retrieved successfully.",
        data=paginated_data
    )


# ---------------- Category Management ----------------
@router.post(
    "/categories",
    status_code=status.HTTP_201_CREATED,
    summary="Create category",
    description="Admin creates a new product category."
)
async def create_category(
    data: CategoryCreate,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    category = await product_service.create_category(db, data)
    return create_response(
        success=True,
        message="Category created successfully.",
        data=CategoryResponse.model_validate(category).model_dump()
    )


@router.get(
    "/categories",
    status_code=status.HTTP_200_OK,
    summary="List all categories for admin",
    description="Lists all categories including inactive ones for administrative management."
)
async def list_admin_categories(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    categories = await product_service.list_categories(db, active_only=False)
    data = [CategoryResponse.model_validate(c).model_dump() for c in categories]
    return create_response(
        success=True,
        message="Categories retrieved successfully.",
        data=data
    )


@router.put(
    "/categories/{category_id}",
    status_code=status.HTTP_200_OK,
    summary="Update category",
    description="Admin updates category name, description, or active status."
)
async def update_category(
    category_id: int,
    data: CategoryUpdate,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    category = await product_service.update_category(db, category_id, data)
    return create_response(
        success=True,
        message="Category updated successfully.",
        data=CategoryResponse.model_validate(category).model_dump()
    )


@router.delete(
    "/categories/{category_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete/Deactivate category",
    description="Deletes category if no products reference it, or soft-deactivates it."
)
async def delete_category(
    category_id: int,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    category = await product_service.delete_category(db, category_id)
    return create_response(
        success=True,
        message=f"Category '{category.name}' removed or deactivated.",
        data={"category_id": category.id, "is_active": category.is_active}
    )
