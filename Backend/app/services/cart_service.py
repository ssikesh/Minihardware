from decimal import Decimal
from typing import Dict, Any
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.cart import CartResponse, CartItemResponse


class CartService:
    @staticmethod
    async def get_or_create_cart(db: AsyncSession, user_id: int) -> Cart:
        """Retrieves existing cart for user or initializes a new active cart."""
        result = await db.execute(
            select(Cart)
            .where(Cart.user_id == user_id)
            .options(
                selectinload(Cart.items).selectinload(CartItem.product)
            )
        )
        cart = result.scalar_one_or_none()
        if not cart:
            cart = Cart(user_id=user_id)
            db.add(cart)
            await db.commit()
            # Reload with relationships
            result = await db.execute(
                select(Cart)
                .where(Cart.id == cart.id)
                .options(
                    selectinload(Cart.items).selectinload(CartItem.product)
                )
            )
            cart = result.scalar_one()
        return cart

    @staticmethod
    async def get_cart_response(db: AsyncSession, user_id: int) -> CartResponse:
        """Constructs standardized cart response with item details, stock and subtotals."""
        cart = await CartService.get_or_create_cart(db, user_id)

        items_response = []
        total_items = 0
        total_price = Decimal("0.00")

        for item in cart.items:
            product = item.product
            # Check if product is still available / not deleted
            if product:
                price = product.price
                subtotal = price * item.quantity
                total_items += item.quantity
                total_price += subtotal

                items_response.append(
                    CartItemResponse(
                        item_id=item.id,
                        product_id=product.id,
                        name=product.name,
                        price=float(price),
                        quantity=item.quantity,
                        available_stock=product.stock_quantity,
                        subtotal=float(subtotal)
                    )
                )

        return CartResponse(
            cart_id=cart.id,
            items=items_response,
            total_items=total_items,
            total_price=float(total_price)
        )

    @staticmethod
    async def add_to_cart(
        db: AsyncSession,
        user_id: int,
        product_id: int,
        quantity: int
    ) -> CartResponse:
        """
        Adds product to cart, validating:
        1. Product exists
        2. Product is active
        3. Product has stock > 0
        4. Quantity > 0
        5. Total resulting quantity <= product.stock_quantity
        """
        if quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity to add must be greater than zero."
            )

        # 1. Fetch product
        res = await db.execute(select(Product).where(Product.id == product_id))
        product = res.scalar_one_or_none()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {product_id} not found."
            )

        # 2. Check if product is active
        if not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This product is currently inactive and cannot be added to the cart."
            )

        # 3. Check if product has stock
        if product.stock_quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product is currently out of stock."
            )

        # Retrieve user cart
        cart = await CartService.get_or_create_cart(db, user_id)

        # Find existing cart item for this product
        existing_item = None
        for item in cart.items:
            if item.product_id == product_id:
                existing_item = item
                break

        current_cart_qty = existing_item.quantity if existing_item else 0
        new_total_qty = current_cart_qty + quantity

        # 4 & 5 & 7. Check if new total quantity exceeds available stock
        if new_total_qty > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Requested quantity ({new_total_qty}) exceeds available stock ({product.stock_quantity}). "
                    f"You already have {current_cart_qty} in your cart."
                )
            )

        if existing_item:
            existing_item.quantity = new_total_qty
        else:
            new_item = CartItem(
                cart_id=cart.id,
                product_id=product_id,
                quantity=quantity
            )
            db.add(new_item)

        await db.commit()
        return await CartService.get_cart_response(db, user_id)

    @staticmethod
    async def update_cart_item(
        db: AsyncSession,
        user_id: int,
        item_id: int,
        quantity: int
    ) -> CartResponse:
        """
        Updates the quantity of a specific cart item after verifying inventory.
        """
        if quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be greater than zero. To remove the item, please delete it."
            )

        cart = await CartService.get_or_create_cart(db, user_id)

        res = await db.execute(
            select(CartItem)
            .where(CartItem.id == item_id, CartItem.cart_id == cart.id)
            .options(selectinload(CartItem.product))
        )
        cart_item = res.scalar_one_or_none()
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cart item with id {item_id} not found in your cart."
            )

        product = cart_item.product
        if not product or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This product is no longer available."
            )

        if quantity > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Requested quantity ({quantity}) exceeds available stock ({product.stock_quantity})."
            )

        cart_item.quantity = quantity
        await db.commit()

        return await CartService.get_cart_response(db, user_id)

    @staticmethod
    async def remove_cart_item(
        db: AsyncSession,
        user_id: int,
        item_id: int
    ) -> CartResponse:
        """Removes a specific item from the user's cart."""
        cart = await CartService.get_or_create_cart(db, user_id)

        res = await db.execute(
            select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id)
        )
        cart_item = res.scalar_one_or_none()
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cart item with id {item_id} not found in your cart."
            )

        await db.delete(cart_item)
        await db.commit()

        return await CartService.get_cart_response(db, user_id)

    @staticmethod
    async def clear_cart(db: AsyncSession, user_id: int) -> CartResponse:
        """Removes all items from the user's cart."""
        cart = await CartService.get_or_create_cart(db, user_id)

        for item in cart.items:
            await db.delete(item)

        await db.commit()
        return await CartService.get_cart_response(db, user_id)


cart_service = CartService()
