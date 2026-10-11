from decimal import Decimal
from typing import List
from pydantic import BaseModel, ConfigDict, Field, field_validator


class AddToCartRequest(BaseModel):
    product_id: int = Field(..., examples=[1])
    quantity: int = Field(..., gt=0, examples=[5])


class UpdateCartItemRequest(BaseModel):
    quantity: int = Field(..., gt=0, examples=[3])


class CartItemResponse(BaseModel):
    item_id: int | None = None
    product_id: int
    name: str
    price: float
    quantity: int
    available_stock: int
    subtotal: float

    model_config = ConfigDict(from_attributes=True)

    @field_validator("price", "subtotal", mode="before")
    @classmethod
    def convert_decimal(cls, v):
        if isinstance(v, Decimal):
            return float(v)
        return v


class CartResponse(BaseModel):
    cart_id: int
    items: List[CartItemResponse]
    total_items: int
    total_price: float

    model_config = ConfigDict(from_attributes=True)

    @field_validator("total_price", mode="before")
    @classmethod
    def convert_decimal(cls, v):
        if isinstance(v, Decimal):
            return float(v)
        return v
