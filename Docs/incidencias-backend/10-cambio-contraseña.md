## INCIDENCIA 10 — PUT /users/{id}/password: Endpoint de cambio de contraseña

## Resumen

Esta incidencia agrega el endpoint `PUT /users/{id}/password` para que el usuario pueda cambiar su contraseña desde `/profile`. El schema `PasswordUpdate` recibe `current_password`, `new_password` y `confirm_password`. La validación ocurre en el service: la contraseña actual debe ser correcta (401 si no), la nueva debe coincidir con la confirmación (422 si no). El endpoint devuelve 204 No Content.

**Rama:** `incidencia/10-cambio-contrasena`
**Duración estimada:** 1-2 horas.
**Depende de:** Incidencia 09 mergeada (`PUT /users/{id}` ya funciona).
**Asignada a:** 1 dev backend.

### ¿Qué vas a aprender en esta incidencia?

| Concepto | ¿Qué es? |
|----------|---------|
| `HTTP_204_NO_CONTENT` | Status code para operaciones exitosas que no devuelven body |
| `verify_password()` | Cómo comparar una contraseña en texto plano contra un hash de bcrypt |
| `get_password_hash()` | Cómo generar un nuevo hash para la nueva contraseña |
| `HTTPException(401)` en cambio de contraseña | 401 = la contraseña actual es incorrecta (no es 403 porque no es un tema de permisos) |
| `HTTPException(422)` para validación | 422 = error de validación del lado del cliente (las contraseñas no coinciden) |

### Pre-lectura (15 min)

| Archivo | ¿Por qué? |
|---------|----------|
| `app/schemas/user.py` | Vas a agregar `PasswordUpdate` — schema de 3 campos obligatorios |
| `app/services/auth.py` | Vas a agregar `change_password()` |
| `app/routers/users.py` | Vas a agregar el endpoint `PUT /{user_id}/password` |
| `app/core/security.py` | Funciones `verify_password()` y `get_password_hash()` que ya existen |
| `tests/test_users.py` | Vas a agregar 4 tests de password |

### Antes de codear: flujo git

```bash
git checkout develop
git pull origin develop
git checkout -b incidencia/10-cambio-contrasena
```

### Paso a paso

#### Archivo 1: `backend/app/schemas/user.py` (MODIFICAR)

Agregá `PasswordUpdate` al final del archivo:

```python
class PasswordUpdate(SQLModel):
    """Schema para cambio de contraseña."""
    current_password: str
    new_password: str
    confirm_password: str
```

> **¿Por qué no hay validación en el schema?** La validación de que las contraseñas coincidan y de que la actual sea correcta va en el service. El schema solo garantiza que el request tenga los 3 campos.

#### Archivo 2: `backend/app/services/auth.py` (MODIFICAR)

Agregá el import de `verify_password` y `get_password_hash` si no están ya:

```python
from app.core.security import get_password_hash, verify_password
```

Agregá el método `change_password` a la clase `AuthService`:

```python
def change_password(self, user: User, data) -> None:
    """Cambia la contraseña del usuario autenticado.

    Valida que:
    1. La contraseña actual sea correcta → 401 si no
    2. La nueva coincida con la confirmación → 422 si no

    Si todo es válido, hashea la nueva contraseña y la persiste.
    """
    if not verify_password(data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La contraseña actual es incorrecta.",
        )

    if data.new_password != data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La nueva contraseña y la confirmación no coinciden.",
        )

    user.hashed_password = get_password_hash(data.new_password)
    self.session.add(user)
    self.session.commit()
```

> **El tipo del parámetro `data`** se deja sin anotar para evitar imports circulares — recibe una instancia de `PasswordUpdate`.

#### Archivo 3: `backend/app/routers/users.py` (MODIFICAR)

Agregá el import de `PasswordUpdate` al principio:

```python
from app.schemas.user import UserUpdate, UserResponse, PasswordUpdate
```

Agregá el endpoint después del `update_user_profile` existente:

```python
@router.put(
    "/{user_id}/password",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cambiar contraseña",
)
def change_password(
    user_id: UUID,
    password_data: PasswordUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Cambia la contraseña del usuario autenticado.

    Verifica que la contraseña actual sea correcta, que la nueva
    coincida con la confirmación, y persiste el nuevo hash.
    Devuelve 204 No Content en caso de éxito.
    """
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tenés permiso para cambiar la contraseña de este usuario.",
        )

    service = AuthService(session)
    service.change_password(current_user, password_data)
```

> **`status_code=204`** significa que FastAPI NO serializa ningún body. Si el método no devuelve nada y no tiene `response_model`, simplemente retorna 204 con body vacío.

#### Archivo 4: `backend/tests/test_users.py` (MODIFICAR)

Agregá 4 tests al final del archivo existente. Buscá el patrón: cada test registra un usuario, obtiene token con la helper `_auth_headers()`, y prueba un escenario distinto.

```python
def test_change_password_success(client: TestClient, db_session: Session):
    """PUT /users/{id}/password cambia la contraseña y permite login con la nueva."""
    email = f"pw-ok-{uuid4().hex[:8]}@test.com"
    password = "OldPass1!"
    headers = _auth_headers(client, email, password)

    me_res = client.get("/auth/me", headers=headers)
    user_id = me_res.json()["id"]

    # Cambiar contraseña
    res = client.put(
        f"/users/{user_id}/password",
        json={
            "current_password": password,
            "new_password": "NewPass2!",
            "confirm_password": "NewPass2!",
        },
        headers=headers,
    )
    assert res.status_code == 204

    # Verificar que se puede hacer login con la nueva
    login_res = client.post("/auth/login", json={
        "email": email,
        "password": "NewPass2!",
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()


def test_change_password_wrong_current(client: TestClient):
    """PUT /users/{id}/password con current_password incorrecta devuelve 401."""
    email = f"pw-wrong-{uuid4().hex[:8]}@test.com"
    password = "RealPass1!"
    headers = _auth_headers(client, email, password)

    me_res = client.get("/auth/me", headers=headers)
    user_id = me_res.json()["id"]

    res = client.put(
        f"/users/{user_id}/password",
        json={
            "current_password": "WrongPass1!",
            "new_password": "NewPass2!",
            "confirm_password": "NewPass2!",
        },
        headers=headers,
    )
    assert res.status_code == 401
    assert "actual" in res.json()["detail"].lower()


def test_change_password_mismatch(client: TestClient):
    """PUT /users/{id}/password con new_password != confirm_password devuelve 422."""
    email = f"pw-mismatch-{uuid4().hex[:8]}@test.com"
    password = "RealPass1!"
    headers = _auth_headers(client, email, password)

    me_res = client.get("/auth/me", headers=headers)
    user_id = me_res.json()["id"]

    res = client.put(
        f"/users/{user_id}/password",
        json={
            "current_password": password,
            "new_password": "NewPass2!",
            "confirm_password": "Different3!",
        },
        headers=headers,
    )
    assert res.status_code == 422
    assert "coinciden" in res.json()["detail"].lower()


def test_change_password_403_for_other_user(client: TestClient):
    """PUT /users/{other_id}/password devuelve 403 si no sos el dueño."""
    email_a = f"pw-a-{uuid4().hex[:8]}@test.com"
    email_b = f"pw-b-{uuid4().hex[:8]}@test.com"
    password = "Pass1234!"

    headers_a = _auth_headers(client, email_a, password)
    _auth_headers(client, email_b, password)

    me_res = client.get("/auth/me", headers=headers_a)
    user_a_id = me_res.json()["id"]

    # Loguearse como B e intentar cambiar contraseña de A
    login_b = client.post("/auth/login", json={
        "email": email_b, "password": password,
    })
    token_b = login_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    res = client.put(
        f"/users/{user_a_id}/password",
        json={
            "current_password": password,
            "new_password": "Hack1Pass!",
            "confirm_password": "Hack1Pass!",
        },
        headers=headers_b,
    )
    assert res.status_code == 403
```

### Verificación completa

```bash
# 1. Python compila sin errores
python -m py_compile app/schemas/user.py && echo "OK schema"
python -m py_compile app/services/auth.py && echo "OK service"
python -m py_compile app/routers/users.py && echo "OK router"

# 2. Tests de password
python -m pytest tests/test_users.py -v -k "password"
# Esperado: 4 passed

# 3. Tests completos del proyecto
python -m pytest tests/ -v
# Esperado: ~39 passed (los 35 anteriores + 4 nuevos de password)
```

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `AttributeError: 'AuthService' object has no attribute 'change_password'` | No agregaste el método a la clase `AuthService` | Revisá el paso 2 — el método debe estar indentado dentro de `class AuthService` |
| `ImportError: cannot import name 'PasswordUpdate'` | No agregaste la clase al archivo de schemas | Revisá el paso 1 |
| `TypeError: change_password() missing 1 required positional argument: 'password_data'` | El endpoint no está pasando el body correctamente | Asegurate de que el parámetro en el endpoint sea `password_data: PasswordUpdate` |
| Test falla con `AssertionError: assert 200 == 204` | El endpoint está devolviendo 200 en vez de 204 | Revisá que tengas `status_code=status.HTTP_204_NO_CONTENT` en el decorador del endpoint |
| Test falla con `AssertionError: assert 422 == 401` en wrong current | `verify_password()` no está funcionando o la contraseña en la DB está mal hasheada | Verificá que `_auth_headers()` registre correctamente y que `verify_password` compare contra `user.hashed_password` |
| `verify_password` o `get_password_hash` no existen | El import no está en `auth.py` | Agregá `from app.core.security import get_password_hash, verify_password` |

### Criterios de aceptación Incidencia 10

- [ ] `PasswordUpdate` existe en `schemas/user.py` con `current_password`, `new_password`, `confirm_password`
- [ ] `change_password()` existe en `AuthService` con validación de contraseña actual (401) y coincidencia (422)
- [ ] `PUT /users/{id}/password` está protegido con `get_current_user` y devuelve 403 para otro usuario
- [ ] Endpoint devuelve 204 No Content en caso de éxito
- [ ] Endpoint devuelve 401 si la contraseña actual es incorrecta
- [ ] Endpoint devuelve 422 si new_password != confirm_password
- [ ] 4 tests nuevos pasan (success, wrong current, mismatch, 403)
- [ ] Los tests existentes siguen pasando (35 → 39)
- [ ] Commit con: `feat(users): agregar PUT /users/{id}/password para cambio de contraseña`

---
