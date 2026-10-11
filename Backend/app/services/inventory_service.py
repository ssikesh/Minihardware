from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.category import Category
from app.models.product import Product
from app.schemas.product import InventoryItemResponse
from app.utils.helpers import calculate_stock_status


class InventoryService:
    @staticmethod
    async def update_stock(
        db: AsyncSession,
        product_id: int,
        new_quantity: int
    ) -> Product:
        if new_quantity < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stock quantity cannot be negative."
            )

        result = await db.execute(
            select(Product).where(Product.id == product_id).with_for_update()
        )
        product = result.scalar_one_or_none()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {product_id} not found."
            )

        product.stock_quantity = new_quantity
        await db.commit()
        await db.refresh(product)

        # Load category
        res = await db.execute(
            select(Product).where(Product.id == product.id).options(selectinload(Product.category))
        )
        return res.scalar_one()

    @staticmethod
    async def adjust_stock(
        db: AsyncSession,
        product_id: int,
        quantity: int,
        operation: str
    ) -> Product:
        if quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Adjustment quantity must be greater than zero."
            )

        result = await db.execute(
            select(Product).where(Product.id == product_id).with_for_update()
        )
        product = result.scalar_one_or_none()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {product_id} not found."
            )

        op = operation.upper().strip()
        if op == "ADD":
            product.stock_quantity += quantity
        elif op == "REMOVE":
            if product.stock_quantity - quantity < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot remove {quantity} units. Current stock is only {product.stock_quantity}."
                )
            product.stock_quantity -= quantity
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported stock adjustment operation: '{operation}'. Use 'ADD' or 'REMOVE'."
            )

        await db.commit()
        await db.refresh(product)

        # Load category
        res = await db.execute(
            select(Product).where(Product.id == product.id).options(selectinload(Product.category))
        )
        return res.scalar_one()

    @staticmethod
    async def get_inventory(
        db: AsyncSession,
        page: int = 1,
        limit: int = 20,
        status_filter: Optional[str] = None
    ) -> Tuple[List[InventoryItemResponse], int]:
        # Query products joined with category
        query = select(Product).options(selectinload(Product.category)).order_by(Product.id.asc())

        # Status filtering at query level if possible
        if status_filter:
            norm_status = status_filter.upper().strip()
            if norm_status == "OUT_OF_STOCK":
                query = query.where(Product.stock_quantity == 0)
            elif norm_status == "LOW_STOCK":
                query = query.where(
                    Product.stock_quantity > 0,
                    Product.stock_quantity <= Product.low_stock_threshold
                )
            elif norm_status == "IN_STOCK":
                query = query.where(
                    Product.stock_quantity > Product.low_stock_threshold
                )

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_res = await db.execute(count_query)
        total = total_res.scalar_one()

        # Paginate
        offset = (page - 1) * limit
        paginated_query = query.offset(offset).limit(limit)
        result = await db.execute(paginated_query)
        products = result.scalars().all()

        inventory_items = []
        for p in products:
            item_status = calculate_stock_status(p.stock_quantity, p.low_stock_threshold)
            inventory_items.append(
                InventoryItemResponse(
                    product_id=p.id,
                    name=p.name,
                    sku=p.sku,
                    category=p.category.name if p.category else "Uncategorized",
                    price=float(p.price),
                    current_stock=p.stock_quantity,
                    low_stock_threshold=p.low_stock_threshold,
                    status=item_status
                )
            )

        return inventory_items, total

    @staticmethod
    async def get_dashboard_stats(db: AsyncSession) -> Dict[str, int]:
        # Total products count
        total_products_res = await db.execute(select(func.count(Product.id)))
        total_products = total_products_res.scalar_one()

        # Total categories count
        total_categories_res = await db.execute(select(func.count(Category.id)))
        total_categories = total_categories_res.scalar_one()

        # Low stock products count (0 < stock <= low_stock_threshold)
        low_stock_res = await db.execute(
            select(func.count(Product.id)).where(
                Product.stock_quantity > 0,
                Product.stock_quantity <= Product.low_stock_threshold
            )
        )
        low_stock_products = low_stock_res.scalar_one()

        # Out of stock products count (stock == 0)
        out_of_stock_res = await db.execute(
            select(func.count(Product.id)).where(Product.stock_quantity == 0)
        )
        out_of_stock_products = out_of_stock_res.scalar_one()

        return {
            "total_products": total_products,
            "total_categories": total_categories,
            "low_stock_products": low_stock_products,
            "out_of_stock_products": out_of_stock_products,
        }


inventory_service = InventoryService()
