def test_admin_products_require_auth(client):
    response = client.get("/api/v1/admin/products")
    assert response.status_code == 401


def test_admin_create_update_delete_product(client, admin_auth_headers):
    payload = {
        "slug": "le-nouveau",
        "name": "Le Nouveau",
        "shape": "Round",
        "price_cents": 9000,
    }
    create_res = client.post("/api/v1/admin/products", json=payload, headers=admin_auth_headers)
    assert create_res.status_code == 201
    product_id = create_res.json()["id"]

    # Inactive-by-default products should not show up on the public endpoint... but this one
    # defaults to active=True, so it should be visible publicly too.
    public_res = client.get("/api/v1/products")
    assert any(p["slug"] == "le-nouveau" for p in public_res.json())

    update_res = client.put(
        f"/api/v1/admin/products/{product_id}",
        json={"price_cents": 9500, "is_active": False},
        headers=admin_auth_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["price_cents"] == 9500

    # Now inactive — hidden from the public catalog but visible to admin.
    public_res_2 = client.get("/api/v1/products")
    assert all(p["slug"] != "le-nouveau" for p in public_res_2.json())

    admin_list_res = client.get("/api/v1/admin/products", headers=admin_auth_headers)
    assert any(p["slug"] == "le-nouveau" for p in admin_list_res.json())

    delete_res = client.delete(f"/api/v1/admin/products/{product_id}", headers=admin_auth_headers)
    assert delete_res.status_code == 204

    admin_list_res_2 = client.get("/api/v1/admin/products", headers=admin_auth_headers)
    assert all(p["slug"] != "le-nouveau" for p in admin_list_res_2.json())


def test_admin_create_product_duplicate_slug(client, admin_auth_headers, sample_product):
    payload = {
        "slug": sample_product.slug,
        "name": "Doublon",
        "shape": "Round",
        "price_cents": 5000,
    }
    response = client.post("/api/v1/admin/products", json=payload, headers=admin_auth_headers)
    assert response.status_code == 409
