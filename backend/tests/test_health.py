from fastapi.testclient import TestClient


def test_health_check_endpoint(client: TestClient) -> None:
    """Verify that the health check endpoint reports status and database connectivity."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "app" in data


def test_docs_endpoints_available(client: TestClient) -> None:
    """Verify that API documentation is generated and accessible."""
    docs_res = client.get("/docs")
    assert docs_res.status_code == 200

    openapi_res = client.get("/openapi.json")
    assert openapi_res.status_code == 200
    openapi_data = openapi_res.json()
    assert "paths" in openapi_data
    assert "/api/v1/auth/register" in openapi_data["paths"]
    assert "/api/v1/auth/login" in openapi_data["paths"]
    assert "/api/v1/profile/me" in openapi_data["paths"]
