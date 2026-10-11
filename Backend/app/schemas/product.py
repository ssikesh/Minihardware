from datetime import datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.schemas.category import CategorySimpleResponse


class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200, examples=["M6 Stainless Steel Bolt"])
    description: str | None = Field(None, examples=["High quality stainless steel bolt"])
    sku: str = Field(..., min_length=2, max_length=100, examples=["BOLT-M6-SS"])
    price: float = Field(..., ge=0.0, examples=[15.50])
    stock_quantity: int = Field(0, ge=0, examples=[200])
    low_stock_threshold: int = Field(10, ge=0, examples=[20])
    category_id: int = Field(..., examples=[1])
    image_url: str | None = Field(None, examples=["https://example.com/images/bolt-m6.jpg"])


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=200)
    description: str | None = None
    sku: str | None = Field(None, min_length=2, max_length=100)
    price: float | None = Field(None, ge=0.0)
    stock_quantity: int | None = Field(None, ge=0)
    low_stock_threshold: int | None = Field(None, ge=0)
    category_id: int | None = None
    image_url: str | None = None
    is_active: bool | None = None


class StockUpdate(BaseModel):
    stock_quantity: int = Field(..., ge=0, examples=[150])


class StockAdjust(BaseModel):
    quantity: int = Field(..., gt=0, examples=[50])
    operation: Literal["ADD", "REMOVE"] = Field(..., examples=["ADD"])


class ProductCustomerResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    sku: str
    price: float
    stock_quantity: int
    available: bool
    stock_status: str
    category: CategorySimpleResponse
    image_url: str | None = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("price", mode="before")
    @classmethod
    def convert_decimal(cls, v):
        if isinstance(v, Decimal):
            return float(v)
        return v


class ProductAdminResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    sku: str
    price: float
    stock_quantity: int
    low_stock_threshold: int
    category_id: int
    category: CategorySimpleResponse
    image_url: str | None = None
    is_active: bool
    stock_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator("price", mode="before")
    @classmethod
    def convert_decimal(cls, v):
        if isinstance(v, Decimal):
            return float(v)
        return v


class InventoryItemResponse(BaseModel):
    product_id: int
    name: str
    sku: str
    category: str
    price: float
    current_stock: int
    low_stock_threshold: int
    status: str

    model_config = ConfigDict(from_attributes=True)

    @field_validator("price", mode="before")
    @classmethod
    def convert_decimal(cls, v):
        if isinstance(v, Decimal):
            return float(v)
        return v


class DashboardStatsResponse(BaseModel):
    total_products: int
    total_categories: int
    low_stock_products: int
    out_of_stock_products: int
