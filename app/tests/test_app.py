import pytest
from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


def test_index(client):
    r = client.get("/")
    assert r.status_code == 200
    assert r.get_json()["message"] == "Hello from Flask DevOps App!"


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.get_json()["status"] == "ok"


def test_items(client):
    r = client.get("/api/items")
    assert r.status_code == 200
    assert len(r.get_json()["items"]) == 3
