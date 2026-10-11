# MiniHardware — Frontend Web Application

Production-ready, responsive e-commerce web application for **MiniHardware** built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, **Zustand**, and **Axios**.

Communicates directly with the MiniHardware **FastAPI + PostgreSQL** backend.

---

## 1. Features

### Customer Storefront
* **Hero & Department Showcase:** Fast navigation to screws, bolts, nuts, washers, hinges, and fittings.
* **Hardware Product Catalog:** Keyword search with debounce, category filtering, min/max price range sliders, and in-stock toggles.
* **Product Details:** Real-time physical inventory badges (`In Stock`, `Low Stock`, `Out of Stock`) and quantity selector bounded by stock limits.
* **Active Shopping Cart:** Real-time stock enforcement synced with backend cart endpoints (`/api/cart`), avoiding overselling.
* **Authentication & Profile:** JWT token persistence, auto-login state recovery, and profile inspection.

### Admin Portal (`/admin`)
* **Role-Based Guards (`AdminRoute`):** Only authenticated users with role `ADMIN` can access admin pages; customers receive an access denied notice.
* **Executive Dashboard:** Live counts of total products, categories, low-stock warnings, and out-of-stock items.
* **Product Management:** Full CRUD with SKU enforcement and soft-deactivation (`is_active = false`).
* **Interactive Stock Management:** Quick adjust (`+10`, `-10`, custom amounts) or set exact non-negative quantities with instant feedback.
* **Inventory & Categories Monitor:** Department grouping and status-filtered tables.

---

## 2. Technology Stack

* **Build Tool:** Vite 5
* **Framework:** React 18
* **Language:** TypeScript 5
* **Styling:** Tailwind CSS 3 (Industrial steel & amber brand palette)
* **HTTP Client:** Axios (with request/response interceptors)
* **Routing:** React Router v6 (CustomerLayout, AdminLayout, protected guards)
* **State Management:** Zustand (dedicated `authStore` and `cartStore`)
* **Icons:** Lucide React

---

## 3. Project Structure

```
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── README.md
└── src/
    ├── api/
    │   ├── axios.ts         # Centralized Axios with Bearer token & error normalization
    │   ├── authApi.ts       # Login, register, me endpoints
    │   ├── productApi.ts    # Public products catalog & details
    │   ├── categoryApi.ts   # Public category listing
    │   ├── cartApi.ts       # Customer cart CRUD operations
    │   └── adminApi.ts      # Dashboard, inventory, stock adjustments
    ├── components/
    │   ├── common/          # LoadingSpinner, ErrorMessage, EmptyState, Modal, Toast, SearchBar
    │   ├── navbar/          # Customer Navbar, Footer
    │   ├── product/         # ProductCard, ProductGrid, StockBadge, QuantitySelector, Skeleton
    │   ├── cart/            # CartItemRow, CartSummary
    │   └── admin/           # AdminSidebar, AdminHeader, StatsCard, StockModal
    ├── layouts/
    │   ├── CustomerLayout.tsx
    │   └── AdminLayout.tsx
    ├── pages/
    │   ├── auth/            # Login, Register
    │   ├── customer/        # Home, Products, ProductDetails, Categories, Cart, Profile
    │   └── admin/           # Dashboard, Products, AddProduct, EditProduct, Inventory, Categories
    ├── store/
    │   ├── authStore.ts     # User authentication and role verification
    │   └── cartStore.ts     # Active cart items and inventory synchronization
    ├── types/               # TypeScript interfaces for API, users, products, cart
    ├── routes/
    │   └── AppRoutes.tsx    # Route definitions and guard wrappers
    ├── App.tsx
    ├── main.tsx
    └── index.css
```

---

## 4. Getting Started

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher
* **MiniHardware Backend:** Running on `http://localhost:8000`

### 1. Installation
In the `frontend` folder, install project dependencies:

```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Ensure `VITE_API_BASE_URL` points to your running FastAPI backend:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Running the Development Server
```bash
npm run dev
```

The frontend will be available at:
👉 **[http://localhost:3000](http://localhost:3000)** (or the port indicated in your console)

### 4. Building for Production
```bash
npm run build
```
Creates an optimized production bundle inside the `dist/` directory.

---

## 5. Testing Credentials

Use the default seeded accounts to test different roles:

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@minihardware.com` | `Admin123!` | Customer Storefront + `/admin` Dashboard |
| **Customer** | Register a new account (or use `customer@test.com` / `CustomerPass123!`) | Customer Storefront + `/cart` (Blocked from `/admin`) |
