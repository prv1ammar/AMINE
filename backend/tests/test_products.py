def test_list_products_empty(client):
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    assert response.json() == []


def test_list_products_returns_seeded(client, sample_product):
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["slug"] == "le-classique"


def test_get_product_by_slug(client, sample_product):
    response = client.get(f"/api/v1/products/{sample_product.slug}")
    assert response.status_code == 200
    assert response.json()["name"] == "Le Classique"


def test_get_product_not_found(client):
    response = client.get("/api/v1/products/does-not-exist")
    assert response.status_code == 404
