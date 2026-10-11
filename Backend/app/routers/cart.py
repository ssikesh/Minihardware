from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_customer, get_db
from app.models.user import User
from app.schemas.cart import AddToCartRequest, CartResponse, UpdateCartItemRequest
from app.services.cart_service import cart_service
from app.utils.helpers import create_response

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    summary="Get customer cart",
    description="Retrieves the current authenticated customer's cart, items, subtotals, and total price."
)
async def get_cart(
    current_user: User = Depends(get_current_customer),
    db: AsyncSession = Depends(get_db)
):
    cart_response = await cart_service.get_cart_response(db, current_user.id)
    return create_response(
        success=True,
        message="Cart retrieved successfully.",
        data=cart_response.model_dump()
    )


@router.post(
    "/items",
    status_code=status.HTTP_200_OK,
    summary="Add product to cart",
    description="Adds a specified quantity of a product to the cart. If product already in cart, increases its quantity. Rejects if total quantity exceeds stock."
)
async def add_item_to_cart(
    data: AddToCartRequest,
    current_user: User = Depends(get_current_customer),
    db: AsyncSession = Depends(get_db)
):
    cart_response = await cart_service.add_to_cart(
        db=db,
        user_id=current_user.id,
        product_id=data.product_id,
        quantity=data.quantity
    )
    return create_response(
        success=True,
        message="Item added to cart successfully.",
        data=cart_response.model_dump()
    )


@router.put(
    "/items/{item_id}",
    status_code=status.HTTP_200_OK,
    summary="Update cart item quantity",
    description="Updates the quantity of a specific cart item after verifying current inventory limits."
)
async def update_cart_item(
    item_id: int,
    data: UpdateCartItemRequest,
    current_user: User = Depends(get_current_customer),
    db: AsyncSession = Depends(get_db)
):
    cart_response = await cart_service.update_cart_item(
        db=db,
        user_id=current_user.id,
        item_id=item_id,
        quantity=data.quantity
    )
    return create_response(
        success=True,
        message="Cart item updated successfully.",
        data=cart_response.model_dump()
    )


@router.delete(
    "/items/{item_id}",
    status_code=status.HTTP_200_OK,
    summary="Remove item from cart",
    description="Removes a specific item from the customer's cart."
)
async def remove_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_customer),
    db: AsyncSession = Depends(get_db)
):
    cart_response = await cart_service.remove_cart_item(
        db=db,
        user_id=current_user.id,
        item_id=item_id
    )
    return create_response(
        success=True,
        message="Cart item removed successfully.",
        data=cart_response.model_dump()
    )


@router.delete(
    "",
    status_code=status.HTTP_200_OK,
    summary="Clear entire cart",
    description="Empties all items from the customer's active cart."
)
async def clear_cart(
    current_user: User = Depends(get_current_customer),
    db: AsyncSession = Depends(get_db)
):
    cart_response = await cart_service.clear_cart(db, current_user.id)
    return create_response(
        success=True,
        message="Cart cleared successfully.",
        data=cart_response.model_dump()
    )
