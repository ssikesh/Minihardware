from decimal import Decimal
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    # ---------------- Category Operations ----------------
    @staticmethod
    async def create_category(db: AsyncSession, data: CategoryCreate) -> Category:
        existing = await db.execute(
            select(Category).where(func.lower(Category.name) == data.name.strip().lower())
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Category with name '{data.name}' already exists."
            )

        category = Category(
            name=data.name.strip(),
            description=data.description.strip() if data.description else None,
            is_active=data.is_active
        )
        db.add(category)
        await db.commit()
        await db.refresh(category)
        return category

    @staticmethod
    async def get_category_by_id(db: AsyncSession, category_id: int) -> Category:
        result = await db.execute(select(Category).where(Category.id == category_id))
        category = result.scalar_one_or_none()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with id {category_id} not found."
            )
        return category

    @staticmethod
    async def list_categories(
        db: AsyncSession,
        active_only: bool = False
    ) -> List[Category]:
        query = select(Category)
        if active_only:
            query = query.where(Category.is_active == True)
        query = query.order_by(Category.name.asc())
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def update_category(
        db: AsyncSession,
        category_id: int,
        data: CategoryUpdate
    ) -> Category:
        category = await ProductService.get_category_by_id(db, category_id)

        if data.name is not None and data.name.strip() != category.name:
            existing = await db.execute(
                select(Category).where(
                    func.lower(Category.name) == data.name.strip().lower(),
                    Category.id != category_id
                )
            )
            if existing.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Another category with name '{data.name}' already exists."
                )
            category.name = data.name.strip()

        if data.description is not None:
            category.description = data.description.strip() if data.description else None

        if data.is_active is not None:
            category.is_active = data.is_active

        await db.commit()
        await db.refresh(category)
        return category

    @staticmethod
    async def delete_category(db: AsyncSession, category_id: int) -> Category:
        category = await ProductService.get_category_by_id(db, category_id)
        # Check if products are tied to this category
        products_count_res = await db.execute(
            select(func.count(Product.id)).where(Product.category_id == category_id)
        )
        products_count = products_count_res.scalar_one()

        if products_count > 0:
            # Soft delete category to preserve data integrity
            category.is_active = False
            await db.commit()
            await db.refresh(category)
            return category
        else:
            await db.delete(category)
            await db.commit()
            return category

    # ---------------- Product Operations ----------------
    @staticmethod
    async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
        # Check category existence
        await ProductService.get_category_by_id(db, data.category_id)

        # Check SKU uniqueness
        sku_clean = data.sku.strip().upper()
        existing_sku = await db.execute(
            select(Product).where(Product.sku == sku_clean)
        )
        if existing_sku.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Product with SKU '{sku_clean}' already exists."
            )

        product = Product(
            name=data.name.strip(),
            description=data.description.strip() if data.description else None,
            sku=sku_clean,
            price=Decimal(str(data.price)),
            stock_quantity=data.stock_quantity,
            low_stock_threshold=data.low_stock_threshold,
            category_id=data.category_id,
            image_url=data.image_url.strip() if data.image_url else None,
            is_active=True
        )
        db.add(product)
        await db.commit()
        await db.refresh(product)
        
        # Load category relationship
        res = await db.execute(
            select(Product).where(Product.id == product.id).options(selectinload(Product.category))
        )
        return res.scalar_one()

    @staticmethod
    async def update_product(
        db: AsyncSession,
        product_id: int,
        data: ProductUpdate
    ) -> Product:
        result = await db.execute(
            select(Product).where(Product.id == product_id).options(selectinload(Product.category))
        )
        product = result.scalar_one_or_none()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {product_id} not found."
            )

        if data.category_id is not None:
            await ProductService.get_category_by_id(db, data.category_id)
            product.category_id = data.category_id

        if data.sku is not None:
            sku_clean = data.sku.strip().upper()
            if sku_clean != product.sku:
                existing_sku = await db.execute(
                    select(Product).where(Product.sku == sku_clean, Product.id != product_id)
                )
                if existing_sku.scalar_one_or_none():
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Another product with SKU '{sku_clean}' already exists."
                    )
                product.sku = sku_clean

        if data.name is not None:
            product.name = data.name.strip()
        if data.description is not None:
            product.description = data.description.strip() if data.description else None
        if data.price is not None:
            product.price = Decimal(str(data.price))
        if data.stock_quantity is not None:
            product.stock_quantity = data.stock_quantity
        if data.low_stock_threshold is not None:
            product.low_stock_threshold = data.low_stock_threshold
        if data.image_url is not None:
            product.image_url = data.image_url.strip() if data.image_url else None
        if data.is_active is not None:
            product.is_active = data.is_active

        await db.commit()
        await db.refresh(product)
        
        # Re-fetch with category loaded
        res = await db.execute(
            select(Product).where(Product.id == product_id).options(selectinload(Product.category))
        )
        return res.scalar_one()

    @staticmethod
    async def delete_product(db: AsyncSession, product_id: int) -> Product:
        """Soft deletes product by setting is_active = False."""
        result = await db.execute(
            select(Product).where(Product.id == product_id).options(selectinload(Product.category))
        )
        product = result.scalar_one_or_none()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {product_id} not found."
            )

        product.is_active = False
        await db.commit()
        await db.refresh(product)
        return product

    @staticmethod
    async def get_product_by_id(
        db: AsyncSession,
        product_id: int,
        active_only: bool = True
    ) -> Product:
        query = select(Product).where(Product.id == product_id).options(selectinload(Product.category))
        if active_only:
            query = query.where(Product.is_active == True)
        
        result = await db.execute(query)
        product = result.scalar_one_or_none()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {product_id} not found or inactive."
            )
        return product

    @staticmethod
    async def list_products(
        db: AsyncSession,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        category_id: Optional[int] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        in_stock: Optional[bool] = None,
        active_only: bool = True
    ) -> Tuple[List[Product], int]:
        query = select(Product).options(selectinload(Product.category))
        count_query = select(func.count(Product.id))

        if active_only:
            query = query.where(Product.is_active == True)
            count_query = count_query.where(Product.is_active == True)

        if search:
            search_pattern = f"%{search.strip()}%"
            search_filter = or_(
                Product.name.ilike(search_pattern),
                Product.description.ilike(search_pattern),
                Product.sku.ilike(search_pattern)
            )
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        if category_id:
            query = query.where(Product.category_id == category_id)
            count_query = count_query.where(Product.category_id == category_id)

        if min_price is not None:
            query = query.where(Product.price >= Decimal(str(min_price)))
            count_query = count_query.where(Product.price >= Decimal(str(min_price)))

        if max_price is not None:
            query = query.where(Product.price <= Decimal(str(max_price)))
            count_query = count_query.where(Product.price <= Decimal(str(max_price)))

        if in_stock is True:
            query = query.where(Product.stock_quantity > 0)
            count_query = count_query.where(Product.stock_quantity > 0)
        elif in_stock is False:
            query = query.where(Product.stock_quantity == 0)
            count_query = count_query.where(Product.stock_quantity == 0)

        # Get total count
        total_res = await db.execute(count_query)
        total = total_res.scalar_one()

        # Apply pagination
        offset = (page - 1) * limit
        query = query.order_by(Product.id.desc()).offset(offset).limit(limit)

        result = await db.execute(query)
        items = list(result.scalars().all())

        return items, total


product_service = ProductService()
