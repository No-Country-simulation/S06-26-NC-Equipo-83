## INCIDENCIA 09 — PUT /users/{id}: Endpoint de actualización de perfil

## Resumen

Esta incidencia crea el endpoint que falta para que el usuario pueda editar su perfil desde `/profile`. El frontend ya está llamando a `PUT /users/{user_id}`, pero el backend responde 404 porque nunca se implementó. Se crea el schema `UserUpdate`, la función `update_user()` en el repositorio, el método `update_profile()` en `AuthService`, el router `users.py` con el endpoint protegido, y el test correspondiente.

**Rama:** `incidencia/09-actualizar-perfil`
**Duración estimada:** 2-3 horas.
**Depende de:** Ninguna (solo main actualizado con la incidencia 07 mergeada, que ya está en main).
**Asignada a:** 1 dev backend.

### ¿Qué vas a aprender en esta incidencia?

| Concepto | ¿Qué es? |
|----------|---------|
| `model_dump(exclude_unset=True)` | Cómo serializar un schema Pydantic a diccionario ignorando los campos que no vinieron en el request |
| `setattr(obj, key, value)` | Cómo actualizar dinámicamente atributos de un objeto Python sin hardcodear nombres de campo |
| `current_user.id != user_id` | Cómo protejer un endpoint para que un usuario solo pueda editar su propio perfil |
| `exclude={"hashed_password", "email"}` | Cómo evitar que el frontend modifique campos sensibles por accidente |
| `HTTPException(403)` vs `401` | 401 = no autenticado, 403 = autenticado pero sin permiso para ese recurso |

### Pre-lectura (15 min)

| Archivo | ¿Por qué? |
|---------|----------|
| `app/schemas/user.py` | Vas a agregar `UserUpdate` — mirá `UserCreate` como referencia |
| `app/repositories/user.py` | Vas a agregar `update_user()` — mirá `create_user()` como referencia |
| `app/services/auth.py` | Vas a agregar `update_profile()` |
| `app/routers/auth.py` | Vas a crear `routers/users.py` con el mismo patrón de DI |
| `app/main.py` | Vas a registrar el nuevo router |

### Antes de codear: flujo git

```bash
git checkout develop
git pull origin develop
git checkout -b incidencia/09-actualizar-perfil
```

### Paso a paso

#### Archivo 1: `backend/app/schemas/user.py` (MODIFICAR)

Agregá `UserUpdate` después de `UserResponse`. Todos los campos son `Optional` — el frontend manda solo lo que cambió.

```python
class UserUpdate(SQLModel):
    """Schema para actualización parcial del perfil.

    Todos los campos son opcionales. Solo se actualizan los campos
    que vienen en el request (exclude_unset=True en el service).
    """
    full_name: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    education_level: Optional[str] = None

    continent_code: Optional[str] = None
    continent_name: Optional[str] = None
    country_code: Optional[str] = None
    country_name: Optional[str] = None
    state_code: Optional[str] = None
    state_name: Optional[str] = None
    city_name: Optional[str] = None
    whatsapp_e164: Optional[str] = None

    language_code: Optional[str] = None

    # ── Campos profesionales v3 ──────────────────────────────────────
    current_situation: Optional[str] = None
    work_sector: Optional[str] = None
    seniority: Optional[str] = None
    interest_areas: Optional[list[str]] = None
    current_search: Optional[str] = None
    known_technologies: Optional[list[dict]] = None
    bio: Optional[str] = None
```

> **¿Por qué no incluimos `email` ni `hashed_password`?** El email se cambia con un flujo separado de verificación. La contraseña tiene su propio endpoint de cambio. Este endpoint es solo para datos del perfil.

#### Archivo 2: `backend/app/repositories/user.py` (MODIFICAR)

Agregá `update_user()` al final del archivo:

```python
def update_user(session: Session, user: User, data: dict) -> User:
    """Actualiza los campos del usuario con los valores del diccionario.

    Solo los campos cuyos valores NO son None se sobreescriben.
    Se usa setattr() para no hardcodear nombres de campo — si el
    schema UserUpdate cambia, esta función no necesita modificarse.

    session.add()  → marca el objeto para UPDATE
    session.commit() → persiste los cambios en la DB
    session.refresh() → recarga los datos (updated_at, etc.)
    """
    for key, value in data.items():
        if value is not None and hasattr(user, key):
            setattr(user, key, value)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
```

> **`hasattr(user, key)`** es una verificación de seguridad. Si por error el frontend manda `hashed_password: "hack"`, `hasattr(user, "hashed_password")` es `True` y lo actualizaría. Por eso en el schema `UserUpdate` NO incluimos `hashed_password` ni `email`. Pero si el schema cambia en el futuro, esta guarda previene accidentes.

#### Archivo 3: `backend/app/services/auth.py` (MODIFICAR)

Agregá el import de `update_user` al principio:

```python
from app.repositories.user import get_user_by_email, create_user, update_user
```

Agregá el método `update_profile` a la clase `AuthService`:

```python
def update_profile(self, user: User, data) -> User:
    """Actualiza el perfil del usuario autenticado.

    Usa exclude_unset=True para que solo los campos que el frontend
    ENVIÓ EXPLÍCITAMENTE se actualicen. Si el frontend manda
    {"full_name": "Nuevo Nombre"}, los demás campos quedan intactos.
    """
    update_data = data.model_dump(exclude_unset=True)
    return update_user(self.session, user, update_data)
```

El tipo del parámetro `data` se deja sin anotar para evitar imports circulares — recibe una instancia de `UserUpdate` pero no lo declaramos como tipo.

#### Archivo 4: `backend/app/routers/users.py` (CREAR)

```python
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db.session import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserUpdate, UserResponse
from app.services.auth import AuthService

router = APIRouter(prefix="/users", tags=["users"])


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Actualizar perfil del usuario",
)
def update_user_profile(
    user_id: UUID,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Actualiza los datos del perfil del usuario autenticado.

    Solo el propio usuario puede editar su perfil.
    Si intenta editar el perfil de otro usuario, devuelve 403.
    """
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tenés permiso para editar este perfil.",
        )

    service = AuthService(session)
    return service.update_profile(current_user, user_data)
```

#### Archivo 5: `backend/app/main.py` (MODIFICAR)

Agregá el import:

```python
from app.routers import users
```

Registrá el router (al lado de los otros `include_router`):

```python
app.include_router(users.router)
```

#### Archivo 6: `backend/tests/test_users.py` (CREAR)

Creá un test para el endpoint. Seguí el patrón de los tests existentes.

```python
"""Tests para el endpoint PUT /users/{user_id}."""

from uuid import uuid4

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user import User


def _auth_headers(client: TestClient, email: str, password: str) -> dict:
    """Helper: registra (o loguea) y devuelve headers con Bearer token."""
    login_res = client.post("/auth/login", json={
        "email": email,
        "password": password,
    })
    if login_res.status_code == 401:
        client.post("/auth/register", json={
            "email": email,
            "password": password,
            "full_name": "Test User",
            "birth_date": "1995-06-15",
            "gender": "male",
            "education_level": "universitario",
            "continent_code": "SA",
            "continent_name": "South America",
            "country_code": "AR",
            "country_name": "Argentina",
            "state_code": "C",
            "state_name": "CABA",
            "city_name": "Buenos Aires",
            "whatsapp_e164": "+5491112345678",
            "current_situation": "student",
            "interest_areas": ["frontend"],
            "bio": "original bio",
        })
        login_res = client.post("/auth/login", json={
            "email": email,
            "password": password,
        })
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
```

### Verificación completa

```bash
# 1. Python compila sin errores
python -m py_compile app/schemas/user.py && echo "OK schema"
python -m py_compile app/repositories/user.py && echo "OK repo"
python -m py_compile app/services/auth.py && echo "OK service"
python -m py_compile app/routers/users.py && echo "OK router"
python -m py_compile app/main.py && echo "OK main"

# 2. App carga sin errores
python -c "from app.main import app; print('App OK')"

# 3. Tests pasan (incluyendo los nuevos)
python -m pytest tests/test_users.py -v
# Esperado: 5 passed

# 4. Tests completos del proyecto
python -m pytest tests/ -v
# Esperado: ~35 passed (30 existentes + 5 nuevos)

# 5. Probar manualmente en Swagger
# Abrí http://localhost:8000/docs
# 1. Registrate con POST /auth/register
# 2. Copiá el token del response
# 3. Hacé click en "Authorize" y pegá el token
# 4. Hacé GET /auth/me para obtener tu user_id
# 5. Hacé PUT /users/{user_id} con body {"full_name": "Nombre Editado"}
# 6. Hacé GET /auth/me de nuevo — el nombre debe estar actualizado
```

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `AssertionError: assert 422 == 200` en el test | `UserUpdate` requiere un campo que no mandaste | Todos los campos de `UserUpdate` deben ser `Optional[X] = None` |
| `AssertionError: assert 404 == 200` | El router no está registrado en `main.py` | Agregá `app.include_router(users.router)` |
| `ImportError: cannot import name 'UserUpdate'` | No agregaste la clase al archivo de schemas | Revisá el paso 1 |
| `TypeError: 'NoneType' object is not iterable` en `update_user` | Un campo `Optional[list]` vino como `None` y `setattr` lo pisó | La guarda `if value is not None` previene esto. Si falla, revisá que el `if` esté ANTES del `setattr` |
| `AttributeError: 'UserUpdate' object has no attribute 'model_dump'` | `UserUpdate` no hereda de `SQLModel` | Asegurate de que sea `class UserUpdate(SQLModel)` |
| `INTERNAL SERVER ERROR` en Swagger al hacer PUT | El campo `known_technologies` viene como `None` y el modelo espera `list[dict]` | El `if value is not None` en `update_user` debe manejarlo — si `value` es `None`, no se actualiza ese campo |

### Criterios de aceptación Incidencia 09

- [ ] `UserUpdate` existe en `schemas/user.py` con todos los campos opcionales
- [ ] `update_user()` existe en `repositories/user.py` con `setattr` + guarda `is not None`
- [ ] `update_profile()` existe en `AuthService` y usa `exclude_unset=True`
- [ ] `routers/users.py` expone `PUT /users/{user_id}` protegido con `get_current_user`
- [ ] Intentar editar el perfil de otro usuario devuelve 403
- [ ] Intentar editar sin token devuelve 401
- [ ] El router está registrado en `main.py`
- [ ] 5 tests nuevos pasan (`test_users.py`)
- [ ] Los 30 tests existentes siguen pasando
- [ ] Commit con: `feat(users): agregar PUT /users/{id} para actualizar perfil`

---
