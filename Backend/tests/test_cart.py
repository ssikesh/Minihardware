from decimal import Decimal
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.product import Product


@pytest.mark.asyncio
async def test_add_product_to_cart(client: AsyncClient, customer_headers, sample_product: Product):
    """Test adding an available product to the cart."""
    payload = {
        "product_id": sample_product.id,
        "quantity": 5
    }
    response = await client.post("/api/cart/items", json=payload, headers=customer_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    cart = data["data"]
    assert cart["total_items"] == 5
    assert len(cart["items"]) == 1
    assert cart["items"][0]["product_id"] == sample_product.id
    assert cart["items"][0]["quantity"] == 5
    assert cart["items"][0]["price"] == 15.50
    assert cart["items"][0]["subtotal"] == 77.50
    assert cart["total_price"] == 77.50


@pytest.mark.asyncio
async def test_add_same_product_twice_increases_quantity(
    client: AsyncClient,
    customer_headers,
    sample_product: Product
):
    """Test that adding the same product multiple times accumulates quantity rather than duplicating items."""
    # First addition
    await client.post("/api/cart/items", json={"product_id": sample_product.id, "quantity": 3}, headers=customer_headers)

    # Second addition
    res = await client.post("/api/cart/items", json={"product_id": sample_product.id, "quantity": 4}, headers=customer_headers)
    assert res.status_code == 200
    cart = res.json()["data"]
    assert len(cart["items"]) == 1
    assert cart["items"][0]["quantity"] == 7
    assert cart["total_items"] == 7
    assert cart["total_price"] == float(Decimal("15.50") * 7)


@pytest.mark.asyncio
async def test_prevent_quantity_greater_than_stock(
    client: AsyncClient,
    customer_headers,
    db_session: AsyncSession,
    sample_category: Category
):
    """Test that attempting to add or accumulate more items than available stock returns 400."""
    low_stock_prod = Product(
        name="Rare Bolt",
        sku="BOLT-RARE-10",
        price=Decimal("10.00"),
        stock_quantity=10,
        low_stock_threshold=2,
        category_id=sample_category.id,
        is_active=True
    )
    db_session.add(low_stock_prod)
    await db_session.commit()
    await db_session.refresh(low_stock_prod)

    # 1. First add 7 (valid: 7 <= 10)
    res1 = await client.post(
        "/api/cart/items",
        json={"product_id": low_stock_prod.id, "quantity": 7},
        headers=customer_headers
    )
    assert res1.status_code == 200

    # 2. Try to add 5 more (7 + 5 = 12 > 10) -> Must be rejected with 400
    res2 = await client.post(
        "/api/cart/items",
        json={"product_id": low_stock_prod.id, "quantity": 5},
        headers=customer_headers
    )
    assert res2.status_code == 400
    assert "exceeds available stock" in res2.json()["message"]


@pytest.mark.asyncio
async def test_prevent_inactive_product_from_being_added(
    client: AsyncClient,
    customer_headers,
    db_session: AsyncSession,
    sample_category: Category
):
    """Test that inactive products cannot be added to the cart."""
    inactive_prod = Product(
        name="Disabled Washer",
        sku="WSH-DISABLED",
        price=Decimal("1.00"),
        stock_quantity=50,
        category_id=sample_category.id,
        is_active=False
    )
    db_session.add(inactive_prod)
    await db_session.commit()
    await db_session.refresh(inactive_prod)

    response = await client.post(
        "/api/cart/items",
        json={"product_id": inactive_prod.id, "quantity": 1},
        headers=customer_headers
    )
    assert response.status_code == 400
    assert "inactive" in response.json()["message"].lower()


@pytest.mark.asyncio
async def test_prevent_out_of_stock_product_from_being_added(
    client: AsyncClient,
    customer_headers,
    db_session: AsyncSession,
    sample_category: Category
):
    """Test that zero stock products cannot be added to the cart."""
    oos_prod = Product(
        name="Zero Stock Bolt",
        sku="BOLT-ZERO",
        price=Decimal("1.00"),
        stock_quantity=0,
        category_id=sample_category.id,
        is_active=True
    )
    db_session.add(oos_prod)
    await db_session.commit()
    await db_session.refresh(oos_prod)

    response = await client.post(
        "/api/cart/items",
        json={"product_id": oos_prod.id, "quantity": 1},
        headers=customer_headers
    )
    assert response.status_code == 400
    assert "out of stock" in response.json()["message"].lower()


@pytest.mark.asyncio
async def test_update_cart_item_quantity(
    client: AsyncClient,
    customer_headers,
    sample_product: Product
):
    """Test updating cart item quantity."""
    # Add product
    add_res = await client.post(
        "/api/cart/items",
        json={"product_id": sample_product.id, "quantity": 2},
        headers=customer_headers
    )
    item_id = add_res.json()["data"]["items"][0]["item_id"]

    # Update to 4
    update_res = await client.put(
        f"/api/cart/items/{item_id}",
        json={"quantity": 4},
        headers=customer_headers
    )
    assert update_res.status_code == 200
    cart = update_res.json()["data"]
    assert cart["items"][0]["quantity"] == 4
    assert cart["total_items"] == 4


@pytest.mark.asyncio
async def test_update_cart_item_exceeding_stock(
    client: AsyncClient,
    customer_headers,
    sample_product: Product
):
    """Test updating cart item to quantity exceeding current stock returns 400."""
    # Product has 100 in stock
    add_res = await client.post(
        "/api/cart/items",
        json={"product_id": sample_product.id, "quantity": 2},
        headers=customer_headers
    )
    item_id = add_res.json()["data"]["items"][0]["item_id"]

    # Attempt to update to 150
    update_res = await client.put(
        f"/api/cart/items/{item_id}",
        json={"quantity": 150},
        headers=customer_headers
    )
    assert update_res.status_code == 400
    assert "exceeds available stock" in update_res.json()["message"]


@pytest.mark.asyncio
async def test_remove_cart_item(
    client: AsyncClient,
    customer_headers,
    sample_product: Product
):
    """Test removing a specific item from the cart."""
    add_res = await client.post(
        "/api/cart/items",
        json={"product_id": sample_product.id, "quantity": 3},
        headers=customer_headers
    )
    item_id = add_res.json()["data"]["items"][0]["item_id"]

    del_res = await client.delete(f"/api/cart/items/{item_id}", headers=customer_headers)
    assert del_res.status_code == 200
    cart = del_res.json()["data"]
    assert len(cart["items"]) == 0
    assert cart["total_items"] == 0


@pytest.mark.asyncio
async def test_clear_cart(
    client: AsyncClient,
    customer_headers,
    db_session: AsyncSession,
    sample_category: Category
):
    """Test clearing all items from cart."""
    p1 = Product(name="P1", sku="SKU-1", price=Decimal("5.00"), stock_quantity=10, category_id=sample_category.id)
    p2 = Product(name="P2", sku="SKU-2", price=Decimal("10.00"), stock_quantity=10, category_id=sample_category.id)
    db_session.add_all([p1, p2])
    await db_session.commit()
    await db_session.refresh(p1)
    await db_session.refresh(p2)

    await client.post("/api/cart/items", json={"product_id": p1.id, "quantity": 1}, headers=customer_headers)
    await client.post("/api/cart/items", json={"product_id": p2.id, "quantity": 2}, headers=customer_headers)

    res = await client.delete("/api/cart", headers=customer_headers)
    assert res.status_code == 200
    cart = res.json()["data"]
    assert len(cart["items"]) == 0
    assert cart["total_items"] == 0
    assert cart["total_price"] == 0.0
