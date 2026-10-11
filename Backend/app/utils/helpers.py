from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None


def create_response(
    success: bool = True,
    message: str = "",
    data: Any = None
) -> Dict[str, Any]:
    """Generates a standardized JSON response dictionary."""
    return {
        "success": success,
        "message": message,
        "data": data,
    }


def calculate_stock_status(stock_quantity: int, low_stock_threshold: int = 10) -> str:
    """
    Returns inventory status:
    - OUT_OF_STOCK: stock_quantity == 0
    - LOW_STOCK: 0 < stock_quantity <= low_stock_threshold
    - IN_STOCK: stock_quantity > low_stock_threshold
    """
    if stock_quantity <= 0:
        return "OUT_OF_STOCK"
    elif stock_quantity <= low_stock_threshold:
        return "LOW_STOCK"
    return "IN_STOCK"


def format_pagination(
    items: List[Any],
    total: int,
    page: int,
    limit: int
) -> Dict[str, Any]:
    """Wraps paginated items with metadata."""
    total_pages = (total + limit - 1) // limit if limit > 0 else 1
    return {
        "items": items,
        "pagination": {
            "page": page,
            "limit": limit,
            "total_items": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }
    }
