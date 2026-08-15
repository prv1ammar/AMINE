def test_admin_collections_require_auth(client):
    response = client.get("/api/v1/admin/collections")
    assert response.status_code == 401


def test_create_collection_and_manage_products(client, admin_auth_headers, sample_product):
    create_res = client.post(
        "/api/v1/admin/collections",
        json={"slug": "ete-2024", "name": "Été 2024", "description": "La sélection estivale."},
        headers=admin_auth_headers,
    )
    assert create_res.status_code == 201
    collection_id = create_res.json()["id"]
    assert create_res.json()["product_count"] == 0

    add_res = client.post(
        f"/api/v1/admin/collections/{collection_id}/products",
        json={"product_id": sample_product.id, "position": 0},
        headers=admin_auth_headers,
    )
    assert add_res.status_code == 204

    public_res = client.get("/api/v1/collections/ete-2024")
    assert public_res.status_code == 200
    body = public_res.json()
    assert body["product_count"] == 1
    assert body["products"][0]["slug"] == sample_product.slug

    remove_res = client.delete(
        f"/api/v1/admin/collections/{collection_id}/products/{sample_product.id}",
        headers=admin_auth_headers,
    )
    assert remove_res.status_code == 204

    public_res_2 = client.get("/api/v1/collections/ete-2024")
    assert public_res_2.json()["product_count"] == 0


def test_public_collection_list_excludes_inactive(client, admin_auth_headers):
    client.post(
        "/api/v1/admin/collections",
        json={"slug": "archivee", "name": "Archivée", "is_active": False},
        headers=admin_auth_headers,
    )
    response = client.get("/api/v1/collections")
    assert all(c["slug"] != "archivee" for c in response.json())


def test_get_collection_not_found(client):
    response = client.get("/api/v1/collections/does-not-exist")
    assert response.status_code == 404
