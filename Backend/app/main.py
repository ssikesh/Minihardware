from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.routers import admin, auth, cart, categories, products
from app.utils.helpers import create_response

tags_metadata = [
    {
        "name": "Authentication",
        "description": "User registration, login, JWT token issuance, and profile retrieval.",
    },
    {
        "name": "Products",
        "description": "Public hardware product catalog browsing, keyword search, category, and price filtering.",
    },
    {
        "name": "Categories",
        "description": "Public hardware product category listings for mobile and web frontends.",
    },
    {
        "name": "Cart",
        "description": "Customer shopping cart operations with real-time stock validation and subtotal calculations.",
    },
    {
        "name": "Admin",
        "description": "Administrative dashboard, product CRUD, inventory tracking, stock adjustments, and category management.",
    },
]

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
# MiniHardware API

Production-ready backend API for **MiniHardware** — an online hardware store specializing in small metal/hardware products such as screws, bolts, nuts, washers, hinges, brackets, metal fittings, tools, and hardware accessories.

## Features:
* **Dual Roles:** Secure RBAC for `ADMIN` and `CUSTOMER` users.
* **JWT Authentication:** Token-based authentication with expiration and role verification.
* **Public Catalog:** Fast, filtered browsing and search with real-time stock indicators.
* **Safe Cart:** Real-time stock enforcement preventing customers from exceeding physical inventory.
* **Admin Inventory:** Live stock adjustments, low-stock threshold monitoring, and business analytics dashboard.
* **Flutter-Friendly:** Consistent response wrappers and standardized error payloads.
    """,
    version=settings.VERSION,
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Standardized Exception Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Formats HTTP exceptions consistently with detail and message fields."""
    message = str(exc.detail) if isinstance(exc.detail, str) else "An error occurred."
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": message,
            "detail": exc.detail,
            "data": None
        },
        headers=exc.headers
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats Pydantic request validation errors."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation error: invalid request payload or parameters.",
            "detail": exc.errors(),
            "data": None
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Captures unhandled exceptions to prevent exposing raw tracebacks."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Internal server error. Please try again later.",
            "detail": str(exc) if settings.ENVIRONMENT == "development" else "Internal server error",
            "data": None
        }
    )


# Health Check & Root Endpoints
@app.get("/", tags=["Health"], summary="Root endpoint")
async def root():
    return create_response(
        success=True,
        message="Welcome to MiniHardware API",
        data={"version": settings.VERSION, "docs": "/docs"}
    )


@app.get("/health", tags=["Health"], summary="Health check")
async def health_check():
    return create_response(
        success=True,
        message="Service is healthy",
        data={"status": "healthy"}
    )


# Include Routers with API prefix (/api)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(categories.router, prefix=settings.API_V1_STR)
app.include_router(cart.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
