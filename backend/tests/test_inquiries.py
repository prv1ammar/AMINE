def test_create_inquiry(client, sample_product):
    payload = {
        "name": "Camille R.",
        "email": "camille@example.com",
        "phone": "0600000000",
        "address": "12 rue des Lilas, 75011 Paris",
        "subject": "Commander un modèle",
        "message": "Je voudrais commander Le Classique en noir.",
        "product_slug": sample_product.slug,
    }
    response = client.post("/api/v1/inquiries", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "new"
    assert data["product_slug"] == sample_product.slug
    assert data["phone"] == "0600000000"
    assert data["address"] == "12 rue des Lilas, 75011 Paris"


def test_create_inquiry_requires_valid_email(client):
    payload = {
        "name": "Camille R.",
        "email": "not-an-email",
        "subject": "Autre",
        "message": "Bonjour",
    }
    response = client.post("/api/v1/inquiries", json=payload)
    assert response.status_code == 422


def test_create_inquiry_without_order_details_does_not_require_phone_or_address(client):
    payload = {
        "name": "Camille R.",
        "email": "camille@example.com",
        "subject": "Question sur un produit",
        "message": "Le Classique existe-t-il en écaille ?",
    }
    response = client.post("/api/v1/inquiries", json=payload)
    assert response.status_code == 201
    assert response.json()["phone"] is None


def test_order_inquiry_requires_phone_and_address(client, sample_product):
    payload = {
        "name": "Camille R.",
        "email": "camille@example.com",
        "subject": "Commander un modèle",
        "message": "Je voudrais commander Le Classique en noir.",
        "product_slug": sample_product.slug,
    }
    response = client.post("/api/v1/inquiries", json=payload)
    assert response.status_code == 422


def test_list_inquiries_requires_auth(client):
    response = client.get("/api/v1/admin/inquiries")
    assert response.status_code == 401


def test_admin_can_list_and_update_inquiry_status(client, admin_auth_headers, sample_product):
    payload = {
        "name": "Camille R.",
        "email": "camille@example.com",
        "phone": "0600000000",
        "address": "12 rue des Lilas, 75011 Paris",
        "message": "Je voudrais commander Le Classique en noir.",
        "product_slug": sample_product.slug,
    }
    create_res = client.post("/api/v1/inquiries", json=payload)
    inquiry_id = create_res.json()["id"]

    list_res = client.get("/api/v1/admin/inquiries", headers=admin_auth_headers)
    assert list_res.status_code == 200
    assert any(i["id"] == inquiry_id for i in list_res.json())

    update_res = client.patch(
        f"/api/v1/admin/inquiries/{inquiry_id}",
        json={"status": "contacted"},
        headers=admin_auth_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "contacted"
