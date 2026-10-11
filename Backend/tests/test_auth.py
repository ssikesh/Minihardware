import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_customer_registration(client: AsyncClient):
    """Test customer user registration."""
    response = await client.post("/api/auth/register", json={
        "name": "Alex Miller",
        "email": "alex@example.com",
        "password": "Password123!"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["user"]["email"] == "alex@example.com"
    assert data["data"]["user"]["role"] == "CUSTOMER"


@pytest.mark.asyncio
async def test_customer_registration_duplicate_email(client: AsyncClient):
    """Test registration with existing email returns 409 conflict."""
    payload = {
        "name": "Alex Miller",
        "email": "duplicate@example.com",
        "password": "Password123!"
    }
    res1 = await client.post("/api/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = await client.post("/api/auth/register", json=payload)
    assert res2.status_code == 409
    assert res2.json()["success"] is False


@pytest.mark.asyncio
async def test_customer_login_success(client: AsyncClient):
    """Test customer login with correct credentials."""
    # First register
    await client.post("/api/auth/register", json={
        "name": "Bob Builder",
        "email": "bob@example.com",
        "password": "SecretPassword123!"
    })

    # Then login
    response = await client.post("/api/auth/login", json={
        "email": "bob@example.com",
        "password": "SecretPassword123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["token_type"] == "bearer"
    assert data["data"]["user"]["email"] == "bob@example.com"


@pytest.mark.asyncio
async def test_customer_login_invalid_password(client: AsyncClient):
    """Test customer login with invalid password returns 401."""
    await client.post("/api/auth/register", json={
        "name": "Charlie",
        "email": "charlie@example.com",
        "password": "CorrectPassword123!"
    })

    response = await client.post("/api/auth/login", json={
        "email": "charlie@example.com",
        "password": "WrongPassword123!"
    })
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert "Invalid email or password" in data["message"]


@pytest.mark.asyncio
async def test_customer_login_nonexistent_user(client: AsyncClient):
    """Test login with non-existent email returns 401."""
    response = await client.post("/api/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "AnyPassword123!"
    })
    assert response.status_code == 401
    assert response.json()["success"] is False


@pytest.mark.asyncio
async def test_admin_login(client: AsyncClient, admin_user):
    """Test admin login returns token with admin role."""
    response = await client.post("/api/auth/login", json={
        "email": "admin@test.com",
        "password": "AdminPass123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["user"]["role"] == "ADMIN"


@pytest.mark.asyncio
async def test_get_current_user_profile(client: AsyncClient, customer_headers):
    """Test GET /api/auth/me returns user profile."""
    response = await client.get("/api/auth/me", headers=customer_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "customer@test.com"


@pytest.mark.asyncio
async def test_get_current_user_unauthenticated(client: AsyncClient):
    """Test GET /api/auth/me without token returns 401."""
    response = await client.get("/api/auth/me")
    assert response.status_code == 401
