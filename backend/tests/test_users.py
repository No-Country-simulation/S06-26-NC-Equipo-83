"""Tests para el endpoint PUT /users/{user_id}."""

from uuid import uuid4

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user import User


def _auth_headers(client: TestClient, email: str, password: str) -> dict:
    login_res = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    print("LOGIN 1")
    print(login_res.status_code)
    print(login_res.json())

    if login_res.status_code == 401:
        register_res = client.post(
            "/auth/register",
            json={
                "email": email,
                "password": password,
                "full_name": "Test User",
                "birth_date": "1995-06-15",
                "gender": "male",
                "education_level": "universitario",
                "continent_code": "AM",
                "continent_name": "America",
                "country_code": "AR",
                "country_name": "Argentina",
                "state_code": "C",
                "state_name": "CABA",
                "city_name": "Buenos Aires",
                "whatsapp_e164": "+5491112345678",
                "current_situation": "student",
                "interest_areas": ["frontend"],
                "bio": "original bio",
            },
        )

        print("REGISTER")
        print(register_res.status_code)
        print(register_res.json())

        login_res = client.post(
            "/auth/login",
            json={
                "email": email,
                "password": password,
            },
        )

        print("LOGIN 2")
        print(login_res.status_code)
        print(login_res.json())

    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_update_full_name(client: TestClient, db_session: Session):
    """PUT /users/{id} actualiza full_name y devuelve el usuario completo."""
    email = f"put-fullname-{uuid4().hex[:8]}@test.com"
    password = "Pass1234!"
    headers = _auth_headers(client, email, password)

    # Obtener el user_id desde /auth/me
    me_res = client.get("/auth/me", headers=headers)
    user_id = me_res.json()["id"]

    # Actualizar nombre
    res = client.put(
        f"/users/{user_id}",
        json={"full_name": "Nuevo Nombre"},
        headers=headers,
    )

    assert res.status_code == 200, res.text
    data = res.json()
    assert data["full_name"] == "Nuevo Nombre"
    assert data["bio"] == "original bio"  # no se tocó


def test_update_returns_403_for_other_user(client: TestClient):
    """PUT /users/{other_id} devuelve 403 si no sos el dueño del perfil."""
    email_a = f"user-a-{uuid4().hex[:8]}@test.com"
    email_b = f"user-b-{uuid4().hex[:8]}@test.com"
    password = "Pass1234!"

    headers_a = _auth_headers(client, email_a, password)
    _auth_headers(client, email_b, password)

    me_res = client.get("/auth/me", headers=headers_a)
    user_a_id = me_res.json()["id"]

    # Loguearse como usuario B e intentar editar perfil de A
    login_b = client.post("/auth/login", json={
        "email": email_b, "password": password,
    })
    token_b = login_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    res = client.put(
        f"/users/{user_a_id}",
        json={"full_name": "Hackeado"},
        headers=headers_b,
    )

    assert res.status_code == 403
    assert "permiso" in res.json()["detail"].lower()


def test_update_bio(client: TestClient, db_session: Session):
    """PUT /users/{id} actualiza bio."""
    email = f"put-bio-{uuid4().hex[:8]}@test.com"
    password = "Pass1234!"
    headers = _auth_headers(client, email, password)

    me_res = client.get("/auth/me", headers=headers)
    user_id = me_res.json()["id"]

    res = client.put(
        f"/users/{user_id}",
        json={"bio": "Desarrolladora frontend con 3 años de experiencia."},
        headers=headers,
    )

    assert res.status_code == 200
    assert res.json()["bio"] == "Desarrolladora frontend con 3 años de experiencia."


def test_update_interest_areas(client: TestClient, db_session: Session):
    """PUT /users/{id} actualiza interest_areas (list[str])."""
    email = f"put-areas-{uuid4().hex[:8]}@test.com"
    password = "Pass1234!"
    headers = _auth_headers(client, email, password)

    me_res = client.get("/auth/me", headers=headers)
    user_id = me_res.json()["id"]

    res = client.put(
        f"/users/{user_id}",
        json={"interest_areas": ["backend", "devops"]},
        headers=headers,
    )

    assert res.status_code == 200
    assert res.json()["interest_areas"] == ["backend", "devops"]


def test_update_without_token_returns_401(client: TestClient):
    """PUT /users/{id} sin token devuelve 401."""
    res = client.put(
        f"/users/{uuid4()}",
        json={"full_name": "Sin auth"},
    )
    assert res.status_code == 401