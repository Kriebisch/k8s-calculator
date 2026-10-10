from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_divide_returns_quotient():
    response = client.post("/divide", json={"a": 10, "b": 2})

    assert response.status_code == 200
    assert response.json() == {"result": 5.0}

def test_divide_returns_400_when_dividing_by_zero():
    response = client.post("/divide", json={"a": 10, "b": 0})

    assert response.status_code == 400
    assert response.json() == {
    "detail": "Division durch Null ist nicht erlaubt"
}

def test_divide_returns_400_when_input_is_not_a_number():
    response = client.post("/divide", json={"a": "abc", "b": 2})

    assert response.status_code == 400
    assert response.json() == {
    "error": "a und b müssen Zahlen sein!"
}