# MiniHardware — Backend API

Production-ready backend REST API for **MiniHardware**, an e-commerce platform specializing in small metal/hardware items such as screws, bolts, nuts, washers, hinges, brackets, metal fittings, tools, and accessories.

Built with **Python 3.12+**, **FastAPI**, **PostgreSQL**, **SQLAlchemy 2.x (Async)**, **Pydantic v2**, and **Alembic**.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Technology Stack](#3-technology-stack)
4. [Folder Structure](#4-folder-structure)
5. [PostgreSQL Setup](#5-postgresql-setup)
6. [Environment Variables](#6-environment-variables)
7. [Installation](#7-installation)
8. [Database Migrations](#8-database-migrations)
9. [Seed Data](#9-seed-data)
10. [Running the Server](#10-running-the-server)
11. [Running Tests](#11-running-tests)
12. [API Endpoints](#12-api-endpoints)
13. [Flutter Integration Guide](#13-flutter-integration-guide)
14. [Deployment Instructions](#14-deployment-instructions)

---

## 1. Project Overview

MiniHardware serves small-footprint metal hardware components to consumer and contractor customers while providing store administrators with live inventory tracking, low-stock threshold alerting, and catalog management.

The system features two user roles:
* **ADMIN**: Manages products, categories, stock, inventory status (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`), and views store analytics.
* **CUSTOMER**: Browses products publicly, performs keyword search and category/price filtering, registers/logs in, manages an active cart, and is protected from adding items exceeding physical stock.

---

## 2. Features

* **Role-Based Access Control (RBAC):** Admin-only endpoints return `403 Forbidden` for regular customer accounts; unauthenticated endpoints return `401 Unauthorized`.
* **JWT Authentication:** Cryptographically signed tokens with expiration and user role verification.
* **Safe Inventory Management:** Stock is not prematurely locked upon cart addition, but cart quantities cannot exceed real-time physical inventory. Stock adjustments (`ADD`/`REMOVE`) prevent negative inventory.
* **Soft Deletions:** Products and categories are soft-deactivated (`is_active = false`) to preserve order and cart history.
* **Standardized JSON Response Structure:** All endpoints return `{ "success": bool, "message": str, "data": ... }`.
* **Automated Migrations & Seeding:** Alembic version tracking with idempotent data seeding.
* **OpenAPI Documentation:** Interactive Swagger UI at `/docs` and ReDoc at `/redoc`.

---

## 3. Technology Stack

* **Language:** Python 3.12+
* **Framework:** FastAPI (0.110+)
* **Database:** PostgreSQL 16+
* **Async ORM:** SQLAlchemy 2.0+ (using `asyncpg`)
* **Data Validation:** Pydantic v2 (`pydantic-settings`)
* **Migrations:** Alembic
* **Password Hashing:** Passlib with Bcrypt
* **Tokens:** PyJWT
* **ASGI Server:** Uvicorn
* **Containerization:** Docker & Docker Compose
* **Testing:** Pytest, pytest-asyncio, HTTPX, aiosqlite

---

## 4. Folder Structure

```
.
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── alembic.ini
├── .env.example
├── .gitignore
├── README.md
├── pytest.ini
├── seed.py
│
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── 001_initial_migration.py
│
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── dependencies.py
│   ├── database/
│   │   ├── database.py
│   │   └── models.py
│   ├── models/
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── category.py
│   │   └── cart.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── category.py
│   │   └── cart.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── admin.py
│   │   ├── products.py
│   │   ├── categories.py
│   │   └── cart.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── product_service.py
│   │   ├── inventory_service.py
│   │   └── cart_service.py
│   └── utils/
│       └── helpers.py
│
└── tests/
    ├── conftest.py
    ├── test_auth.py
    ├── test_products.py
    ├── test_admin.py
    └── test_cart.py
```

---

## 5. PostgreSQL Setup

1. **Install PostgreSQL** (if running locally without Docker):
   ```bash
   # macOS
   brew install postgresql@16 && brew services start postgresql@16

   # Ubuntu / Debian
   sudo apt-get update && sudo apt-get install -y postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Create the Database and User:**
   ```bash
   sudo -u postgres psql
   ```
   ```sql
   CREATE DATABASE minihardware;
   CREATE USER postgres WITH ENCRYPTED PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE minihardware TO postgres;
   \q
   ```

---

## 6. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Key variables:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | Async PostgreSQL connection string | `postgresql+asyncpg://postgres:postgres@localhost:5432/minihardware` |
| `DATABASE_URL_SYNC` | Sync connection string for Alembic | `postgresql://postgres:postgres@localhost:5432/minihardware` |
| `JWT_SECRET_KEY` | Secret key for signing JWTs | *(Set a random 64-char string)* |
| `JWT_ALGORITHM` | Cryptographic algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token validity duration | `60` |
| `CORS_ORIGINS` | Comma-separated or JSON list of origins | `*` |
| `SEED_ADMIN_EMAIL` | Default seeded admin email | `admin@minihardware.com` |
| `SEED_ADMIN_PASSWORD` | Default seeded admin password | `Admin123!` |

---

## 7. Installation

1. Create a Python 3.12 virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

---

## 8. Database Migrations

Apply the database migrations to create all required tables, foreign keys, and indexes:

```bash
# Upgrade to latest revision
alembic upgrade head

# Generate a new migration after model edits
alembic revision --autogenerate -m "describe changes"
```

---

## 9. Seed Data

Populate the database with the default administrator, 8 categories, and 12 sample hardware products:

```bash
python seed.py
```

Default credentials:
* **Admin Email:** `admin@minihardware.com`
* **Admin Password:** `Admin123!`

---

## 10. Running the Server

Start the development server with live reload:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API Documentation:
* **Swagger UI:** `http://localhost:8000/docs`
* **ReDoc:** `http://localhost:8000/redoc`

---

## 11. Running Tests

Run the complete test suite using pytest:

```bash
pytest
```

To run with verbose output and test coverage:
```bash
pytest -v --tb=short
```

---

## 12. API Endpoints

All responses follow the unified format:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register customer account |
| `POST` | `/api/auth/login` | Public | Login and receive Bearer JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |

### Products (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | List & search active products (`page`, `limit`, `search`, `category_id`, `min_price`, `max_price`, `in_stock`) |
| `GET` | `/api/products/{id}` | Public | Get product details with stock status (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`) |

### Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | List all active product categories |
| `GET` | `/api/categories/{id}` | Public | Get category details |

### Cart (`/api/cart`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Customer | View customer cart with subtotals |
| `POST` | `/api/cart/items` | Customer | Add product to cart (stock-validated) |
| `PUT` | `/api/cart/items/{item_id}` | Customer | Update cart item quantity |
| `DELETE` | `/api/cart/items/{item_id}` | Customer | Remove specific item |
| `DELETE` | `/api/cart` | Customer | Clear entire cart |

### Admin (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin Only | Get store inventory & catalog counts |
| `POST` | `/api/admin/products` | Admin Only | Create new hardware product |
| `PUT` | `/api/admin/products/{id}` | Admin Only | Update product details |
| `DELETE` | `/api/admin/products/{id}` | Admin Only | Soft-delete / deactivate product |
| `PATCH` | `/api/admin/products/{id}/stock` | Admin Only | Set exact stock quantity |
| `PATCH` | `/api/admin/products/{id}/stock/adjust`| Admin Only | Add or remove units (`ADD`/`REMOVE`) |
| `GET` | `/api/admin/inventory` | Admin Only | View inventory items with status filter |
| `POST` | `/api/admin/categories` | Admin Only | Create product category |
| `GET` | `/api/admin/categories` | Admin Only | List all categories (active & inactive) |
| `PUT` | `/api/admin/categories/{id}` | Admin Only | Update category |
| `DELETE`| `/api/admin/categories/{id}` | Admin Only | Delete or deactivate category |

---

## 13. Flutter Integration Guide

### 1. Networking Setup (Dio)

Use `dio` with an authentication interceptor:

```dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static const String baseUrl = 'http://10.0.2.2:8000/api'; // Android Emulator
  // For iOS Simulator: 'http://localhost:8000/api'
  // For Physical Device: 'http://<YOUR_LAN_IP>:8000/api'

  final Dio dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {'Content-Type': 'application/json'},
  ));

  final FlutterSecureStorage storage = const FlutterSecureStorage();

  ApiClient() {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await storage.read(key: 'jwt_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          if (error.response?.statusCode == 401) {
            // Handle token expiration: clear token and redirect to LoginScreen
            await storage.delete(key: 'jwt_token');
          }
          return handler.next(error);
        },
      ),
    );
  }
}
```

### 2. Standardized Response Parsing

```dart
class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;

  ApiResponse({required this.success, required this.message, this.data});

  factory ApiResponse.fromJson(Map<String, dynamic> json, T Function(dynamic) fromJsonT) {
    return ApiResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null ? fromJsonT(json['data']) : null,
    );
  }
}
```

### 3. Adding to Cart with Error Handling

```dart
Future<void> addToCart(int productId, int quantity) async {
  try {
    final response = await apiClient.dio.post(
      '/cart/items',
      data: {'product_id': productId, 'quantity': quantity},
    );

    if (response.data['success'] == true) {
      // Cart updated successfully
    }
  } on DioException catch (e) {
    if (e.response != null && e.response?.statusCode == 400) {
      final errorMessage = e.response?.data['message'] ?? 'Stock error';
      // Display snackbar: "Requested quantity exceeds available stock."
    }
  }
}
```

---

## 14. Deployment Instructions

### Docker Compose (Recommended)

To run the complete stack (FastAPI backend + PostgreSQL) with a single command:

```bash
docker-compose up --build -d
```

The container automatically:
1. Waits for PostgreSQL healthcheck to succeed.
2. Applies Alembic migrations (`alembic upgrade head`).
3. Executes the seed script (`python seed.py`).
4. Launches the production Uvicorn server on port 8000.

View logs:
```bash
docker-compose logs -f backend
```

Stop stack:
```bash
docker-compose down
```

### Cloud Production Checklist
1. Replace `JWT_SECRET_KEY` with a securely generated 256-bit secret.
2. Update `CORS_ORIGINS` to point strictly to the Flutter Web domain and mobile API gateways.
3. Configure SSL/TLS termination with Nginx or Caddy reverse proxy.
4. Set `ENVIRONMENT=production`.
