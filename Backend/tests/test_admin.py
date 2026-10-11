import pytest
from httpx import AsyncClient

from app.models.category import Category
from app.models.product import Product


@pytest.mark.asyncio
async def test_admin_dashboard(client: AsyncClient, admin_headers, sample_product: Product):
    """Test GET /api/admin/dashboard returns accurate metrics."""
    response = await client.get("/api/admin/dashboard", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    stats = data["data"]
    assert stats["total_products"] >= 1
    assert stats["total_categories"] >= 1
    assert "low_stock_products" in stats
    assert "out_of_stock_products" in stats


@pytest.mark.asyncio
async def test_create_product_admin(client: AsyncClient, admin_headers, sample_category: Category):
    """Test admin creating a product."""
    payload = {
        "name": "M10 Heavy Duty Nut",
        "description": "Grade 8 heavy hex nut",
        "sku": "NUT-M10-HD",
        "price": 2.50,
        "stock_quantity": 300,
        "low_stock_threshold": 30,
        "category_id": sample_category.id,
        "image_url": "https://example.com/nut.jpg"
    }
    response = await client.post("/api/admin/products", json=payload, headers=admin_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["sku"] == "NUT-M10-HD"
    assert data["data"]["price"] == 2.50
    assert data["data"]["stock_quantity"] == 300
    assert data["data"]["category"]["id"] == sample_category.id


@pytest.mark.asyncio
async def test_customer_cannot_create_product(client: AsyncClient, customer_headers, sample_category: Category):
    """Test that customer accounts receive 403 Forbidden on admin product creation."""
    payload = {
        "name": "Illegal Product",
        "sku": "SKU-ILLEGAL",
        "price": 10.00,
        "stock_quantity": 10,
        "category_id": sample_category.id
    }
    response = await client.post("/api/admin/products", json=payload, headers=customer_headers)
    assert response.status_code == 403
    assert response.json()["success"] is False


@pytest.mark.asyncio
async def test_update_product(client: AsyncClient, admin_headers, sample_product: Product):
    """Test updating product fields as admin."""
    payload = {
        "name": "Updated M6 Bolt Name",
        "price": 18.00,
        "low_stock_threshold": 25
    }
    response = await client.put(f"/api/admin/products/{sample_product.id}", json=payload, headers=admin_headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["name"] == "Updated M6 Bolt Name"
    assert data["price"] == 18.00
    assert data["low_stock_threshold"] == 25


@pytest.mark.asyncio
async def test_deactivate_product(client: AsyncClient, admin_headers, sample_product: Product):
    """Test soft-deleting a product sets is_active = false."""
    response = await client.delete(f"/api/admin/products/{sample_product.id}", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["is_active"] is False

    # Check product is now inaccessible to regular customer endpoint
    cust_res = await client.get(f"/api/products/{sample_product.id}")
    assert cust_res.status_code == 404


@pytest.mark.asyncio
async def test_update_stock_quantity(client: AsyncClient, admin_headers, sample_product: Product):
    """Test PATCH /api/admin/products/{id}/stock sets exact quantity."""
    response = await client.patch(
        f"/api/admin/products/{sample_product.id}/stock",
        json={"stock_quantity": 150},
        headers=admin_headers
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["stock_quantity"] == 150


@pytest.mark.asyncio
async def test_adjust_stock_add_and_remove(client: AsyncClient, admin_headers, sample_product: Product):
    """Test PATCH /api/admin/products/{id}/stock/adjust increments and decrements correctly."""
    # Product starts at 100 stock
    # Add 50
    res_add = await client.patch(
        f"/api/admin/products/{sample_product.id}/stock/adjust",
        json={"quantity": 50, "operation": "ADD"},
        headers=admin_headers
    )
    assert res_add.status_code == 200
    assert res_add.json()["data"]["stock_quantity"] == 150

    # Remove 20
    res_rem = await client.patch(
        f"/api/admin/products/{sample_product.id}/stock/adjust",
        json={"quantity": 20, "operation": "REMOVE"},
        headers=admin_headers
    )
    assert res_rem.status_code == 200
    assert res_rem.json()["data"]["stock_quantity"] == 130


@pytest.mark.asyncio
async def test_prevent_negative_stock(client: AsyncClient, admin_headers, sample_product: Product):
    """Test that setting or adjusting stock below zero returns 400 Bad Request."""
    # Attempt to set negative directly
    res_direct = await client.patch(
        f"/api/admin/products/{sample_product.id}/stock",
        json={"stock_quantity": -5},
        headers=admin_headers
    )
    assert res_direct.status_code in [400, 422]

    # Attempt to remove more than existing stock (100 in stock)
    res_adjust = await client.patch(
        f"/api/admin/products/{sample_product.id}/stock/adjust",
        json={"quantity": 200, "operation": "REMOVE"},
        headers=admin_headers
    )
    assert res_adjust.status_code == 400
    assert "Cannot remove" in res_adjust.json()["message"]


@pytest.mark.asyncio
async def test_view_inventory(client: AsyncClient, admin_headers, sample_product: Product):
    """Test viewing inventory with pagination and filtering."""
    response = await client.get("/api/admin/inventory?page=1&limit=10", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    items = data["data"]["items"]
    assert len(items) >= 1
    assert items[0]["product_id"] == sample_product.id
    assert items[0]["status"] == "IN_STOCK"


@pytest.mark.asyncio
async def test_admin_category_management(client: AsyncClient, admin_headers):
    """Test category creation, listing, updating, and deactivation by admin."""
    # 1. Create
    res_create = await client.post(
        "/api/admin/categories",
        json={"name": "Hinges & Fittings", "description": "Door and gate hardware"},
        headers=admin_headers
    )
    assert res_create.status_code == 201
    cat_id = res_create.json()["data"]["id"]

    # 2. List
    res_list = await client.get("/api/admin/categories", headers=admin_headers)
    assert res_list.status_code == 200
    cats = res_list.json()["data"]
    assert any(c["id"] == cat_id for c in cats)

    # 3. Update
    res_update = await client.put(
        f"/api/admin/categories/{cat_id}",
        json={"description": "Updated description for door fittings"},
        headers=admin_headers
    )
    assert res_update.status_code == 200
    assert res_update.json()["data"]["description"] == "Updated description for door fittings"

    # 4. Delete
    res_del = await client.delete(f"/api/admin/categories/{cat_id}", headers=admin_headers)
    assert res_del.status_code == 200
