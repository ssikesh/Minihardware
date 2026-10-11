from decimal import Decimal
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.product import Product


@pytest.mark.asyncio
async def test_get_products_list(client: AsyncClient, sample_product: Product):
    """Test public listing of active products."""
    response = await client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["items"]) >= 1
    item = data["data"]["items"][0]
    assert item["sku"] == sample_product.sku
    assert item["name"] == sample_product.name
    assert item["available"] is True
    assert "stock_status" in item


@pytest.mark.asyncio
async def test_get_product_details(client: AsyncClient, sample_product: Product):
    """Test retrieving single product details."""
    response = await client.get(f"/api/products/{sample_product.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    product_data = data["data"]
    assert product_data["id"] == sample_product.id
    assert product_data["name"] == "Stainless Steel M6 Bolt"
    assert product_data["sku"] == "TEST-BOLT-M6"
    assert product_data["price"] == 15.50
    assert product_data["stock_quantity"] == 100
    assert product_data["available"] is True
    assert product_data["category"]["id"] == sample_product.category_id
    # Ensure sensitive admin data like low_stock_threshold is NOT exposed
    assert "low_stock_threshold" not in product_data


@pytest.mark.asyncio
async def test_get_nonexistent_product(client: AsyncClient):
    """Test retrieving non-existent product returns 404."""
    response = await client.get("/api/products/99999")
    assert response.status_code == 404
    assert response.json()["success"] is False


@pytest.mark.asyncio
async def test_search_products(client: AsyncClient, db_session: AsyncSession, sample_category: Category):
    """Test searching products by keyword."""
    p1 = Product(
        name="Brass Wood Screw",
        sku="SCRW-BRS-01",
        price=Decimal("2.50"),
        stock_quantity=50,
        low_stock_threshold=10,
        category_id=sample_category.id,
        is_active=True
    )
    p2 = Product(
        name="Steel Hex Bolt",
        sku="BOLT-STL-01",
        price=Decimal("3.50"),
        stock_quantity=50,
        low_stock_threshold=10,
        category_id=sample_category.id,
        is_active=True
    )
    db_session.add_all([p1, p2])
    await db_session.commit()

    # Search for 'screw'
    res = await client.get("/api/products?search=screw")
    assert res.status_code == 200
    items = res.json()["data"]["items"]
    assert any("Brass Wood Screw" in item["name"] for item in items)
    assert not any("Steel Hex Bolt" in item["name"] for item in items)


@pytest.mark.asyncio
async def test_filter_products_by_category(client: AsyncClient, db_session: AsyncSession):
    """Test filtering products by category ID."""
    cat1 = Category(name="Cat 1", is_active=True)
    cat2 = Category(name="Cat 2", is_active=True)
    db_session.add_all([cat1, cat2])
    await db_session.commit()
    await db_session.refresh(cat1)
    await db_session.refresh(cat2)

    p1 = Product(
        name="Product In Cat 1",
        sku="SKU-CAT1",
        price=Decimal("10.00"),
        stock_quantity=10,
        category_id=cat1.id,
        is_active=True
    )
    p2 = Product(
        name="Product In Cat 2",
        sku="SKU-CAT2",
        price=Decimal("20.00"),
        stock_quantity=10,
        category_id=cat2.id,
        is_active=True
    )
    db_session.add_all([p1, p2])
    await db_session.commit()

    res = await client.get(f"/api/products?category_id={cat1.id}")
    assert res.status_code == 200
    items = res.json()["data"]["items"]
    assert len(items) == 1
    assert items[0]["name"] == "Product In Cat 1"


@pytest.mark.asyncio
async def test_filter_products_by_price(client: AsyncClient, db_session: AsyncSession, sample_category: Category):
    """Test filtering products by minimum and maximum price."""
    p_cheap = Product(
        name="Cheap Washer",
        sku="WSH-CHEAP",
        price=Decimal("1.00"),
        stock_quantity=50,
        category_id=sample_category.id,
        is_active=True
    )
    p_expensive = Product(
        name="Expensive Tool",
        sku="TOOL-EXP",
        price=Decimal("100.00"),
        stock_quantity=10,
        category_id=sample_category.id,
        is_active=True
    )
    db_session.add_all([p_cheap, p_expensive])
    await db_session.commit()

    res = await client.get("/api/products?min_price=50&max_price=150")
    assert res.status_code == 200
    items = res.json()["data"]["items"]
    assert len(items) == 1
    assert items[0]["sku"] == "TOOL-EXP"


@pytest.mark.asyncio
async def test_inactive_products_hidden_from_customer(
    client: AsyncClient,
    db_session: AsyncSession,
    sample_category: Category
):
    """Test inactive products are excluded from customer listing."""
    p_inactive = Product(
        name="Hidden Discontinued Item",
        sku="SKU-DISCONTINUED",
        price=Decimal("5.00"),
        stock_quantity=10,
        category_id=sample_category.id,
        is_active=False
    )
    db_session.add(p_inactive)
    await db_session.commit()

    res = await client.get("/api/products")
    items = res.json()["data"]["items"]
    assert not any(item["sku"] == "SKU-DISCONTINUED" for item in items)
