import asyncio
from decimal import Decimal
from typing import AsyncGenerator
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.security import get_password_hash
from app.database.database import Base, get_db
from app.main import app
from app.models.category import Category
from app.models.product import Product
from app.models.user import User, UserRole

# In-memory SQLite async engine for lightning fast and isolated testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Creates fresh database schema before each test and drops it after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Creates test HTTP client with dependency override for get_db."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c

    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def sample_category(db_session: AsyncSession) -> Category:
    """Creates and returns a sample category."""
    cat = Category(
        name="Test Fasteners",
        description="Fasteners and fixings for testing",
        is_active=True
    )
    db_session.add(cat)
    await db_session.commit()
    await db_session.refresh(cat)
    return cat


@pytest_asyncio.fixture(scope="function")
async def sample_product(db_session: AsyncSession, sample_category: Category) -> Product:
    """Creates and returns a sample active product."""
    prod = Product(
        name="Stainless Steel M6 Bolt",
        description="High grade 304 stainless bolt",
        sku="TEST-BOLT-M6",
        price=Decimal("15.50"),
        stock_quantity=100,
        low_stock_threshold=20,
        category_id=sample_category.id,
        is_active=True
    )
    db_session.add(prod)
    await db_session.commit()
    await db_session.refresh(prod)
    return prod


@pytest_asyncio.fixture(scope="function")
async def admin_user(db_session: AsyncSession) -> User:
    """Seeds an admin user."""
    admin = User(
        name="Admin User",
        email="admin@test.com",
        password_hash=get_password_hash("AdminPass123!"),
        role=UserRole.ADMIN.value,
        is_active=True
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin


@pytest_asyncio.fixture(scope="function")
async def admin_headers(client: AsyncClient, admin_user: User) -> dict:
    """Authenticates admin and returns Bearer Authorization header."""
    res = await client.post("/api/auth/login", json={
        "email": "admin@test.com",
        "password": "AdminPass123!"
    })
    token = res.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture(scope="function")
async def customer_user(db_session: AsyncSession) -> User:
    """Seeds a customer user."""
    customer = User(
        name="Jane Customer",
        email="customer@test.com",
        password_hash=get_password_hash("CustomerPass123!"),
        role=UserRole.CUSTOMER.value,
        is_active=True
    )
    db_session.add(customer)
    await db_session.commit()
    await db_session.refresh(customer)
    return customer


@pytest_asyncio.fixture(scope="function")
async def customer_headers(client: AsyncClient, customer_user: User) -> dict:
    """Authenticates customer and returns Bearer Authorization header."""
    res = await client.post("/api/auth/login", json={
        "email": "customer@test.com",
        "password": "CustomerPass123!"
    })
    token = res.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
