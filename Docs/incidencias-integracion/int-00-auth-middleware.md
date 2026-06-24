## INCIDENCIA INT-00 — Auth Middleware `get_current_user` + `GET /auth/me`

## Resumen

Esta incidencia crea la pieza que falta para proteger endpoints con JWT: una dependencia `get_current_user` que extrae el token del header `Authorization`, lo decodifica, busca al usuario en la base de datos y lo inyecta en cualquier endpoint que la use. También expone `GET /auth/me` para que el frontend pueda validar el token al cargar la app y obtener los datos del usuario logueado sin necesidad de guardar el `user_id` en localStorage.

**Rama:** `incidencia/int-00-auth-middleware`  
**Duración estimada:** 3-4 horas.  
**Depende de:** Backend con auth funcionando (incidencias 01, 02a, 02b completas).  
**Asignada a:** 1 dev backend.

### ¿Qué vas a aprender?

| Concepto | ¿Qué es? |
|----------|---------|
| `Depends()` en parámetros de función | FastAPI ejecuta la dependencia ANTES de tu endpoint y te pasa el resultado |
| `OAuth2PasswordBearer` | Helper de FastAPI que extrae el token del header `Authorization: Bearer <token>` |
| `HTTPException` con `WWW-Authenticate` | Cómo devolver 401 correctamente con el header que el estándar OAuth2 exige |
| `decode_access_token` | La función que ya existe en `security.py` — la vas a usar, no a reescribir |

### Pre-lectura (15 min)

| Archivo | Pregunta que responde |
|---------|----------------------|
| `app/core/security.py` | ¿Cómo se decodifica un JWT? `decode_access_token` ya está implementada. |
| `app/repositories/user.py` | ¿Cómo busco un usuario por ID? `get_user_by_id` ya existe. |
| `app/schemas/user.py` | ¿Qué campos devuelve `UserResponse`? Es el schema que usa `GET /auth/me`. |
| `app/routers/auth.py` | ¿Dónde agrego el nuevo endpoint? En este mismo archivo. |

### Antes de codear: flujo git

```bash
git checkout main
git pull origin main
git checkout -b incidencia/int-00-auth-middleware
```

### Paso a paso

#### Archivo 1: Agregar `get_current_user` en `backend/app/core/security.py`

Abrí `app/core/security.py`. Ya tiene `hash_password`, `verify_password`, `create_access_token` y `decode_access_token`. Vas a agregar DOS cosas al final del archivo:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from jose import JWTError

# ... (todo el código existente se mantiene igual) ...

# ---------------------------------------------------------------------------
# Esquema OAuth2 — le dice a FastAPI de dónde sacar el token
# ---------------------------------------------------------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),  # vas a necesitar importar get_session
) -> "User":
    """Valida el JWT y devuelve el usuario autenticado.

    Flujo:
    1. Extrae el token del header Authorization: Bearer <token>
    2. Lo decodifica con decode_access_token()
    3. Extrae el user_id del campo "sub" del payload
    4. Busca al usuario en la DB
    5. Si algo falla → 401

    Usala como parámetro en cualquier endpoint protegido:
        def mi_endpoint(current_user: User = Depends(get_current_user)):
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
    except (ValueError, JWTError):
        raise credentials_exception

    from uuid import UUID
    from app.repositories.user import get_user_by_id

    user = get_user_by_id(session, UUID(user_id_str))
    if user is None:
        raise credentials_exception

    return user
```

**IMPORTANTE:** `get_current_user` importa `get_session` y `get_user_by_id` DENTRO de la función (no al inicio del archivo) para evitar imports circulares. `security.py` es importado por muchos módulos. Si ponés los imports al principio, generás un ciclo: `security.py → db.session → models → ??? → security.py`. Los imports lazy (dentro de la función) rompen ese ciclo.

También necesitás agregar este import al inicio del archivo:

```python
# Agregar al inicio de app/core/security.py, junto con los otros imports
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from app.db.session import get_session
```

El import de `jose.JWTError` probablemente ya exista (se usa en `decode_access_token`). Verificá.

**Verificá que compile:**
```bash
python -c "from app.core.security import get_current_user; print('get_current_user OK')"
```

Si falla con `ImportError`, revisá los imports lazy. Si falla con algo de `User`, asegurate de que el type hint `"User"` esté entre comillas (string literal — así Python no intenta resolverlo en tiempo de importación).

#### Archivo 2: Agregar `GET /auth/me` en `backend/app/routers/auth.py`

Abrí `app/routers/auth.py`. Agregá este endpoint DESPUÉS de los existentes (después de `login`):

```python
from app.core.security import get_current_user
from app.models.user import User

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Obtener usuario autenticado",
)
def get_me(current_user: User = Depends(get_current_user)):
    """Devuelve los datos del usuario logueado a partir del token JWT.

    El frontend llama a este endpoint al montar la app para:
    1. Validar que el token en localStorage sigue siendo válido.
    2. Obtener el user_id, nombre, email y perfil sin guardarlos en el cliente.
    """
    return current_user
```

**Concepto clave: `Depends(get_current_user)`**

Fijate que `get_me` recibe `current_user` como parámetro, pero el frontend no lo envía en el body ni en la URL. FastAPI ejecuta `get_current_user` ANTES de tu función, extrae el token, busca al usuario, y te lo pasa listo. Si el token es inválido o el usuario no existe, `get_current_user` lanza 401 y tu función ni se ejecuta.

**El orden de los parámetros importa.** FastAPI resuelve las dependencias en orden. Si tuvieras `session` también, ponelo después:

```python
def get_me(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
```

#### Archivo 3: Agregar `get_current_user` a las dependencias de `/salud`

Abrí `app/routers/salud.py`. **Por ahora solo agregá el parámetro** — no cambies la lógica todavía (eso es INT-01):

```python
from app.core.security import get_current_user
from app.models.user import User

@router.post("", response_model=SaludResponse)
async def checkin_emocional(
    request: SaludRequest,
    current_user: User = Depends(get_current_user),  # NUEVO
    session: Session = Depends(get_session),
):
    """Procesa el check-in emocional diario."""
    service = SaludService(session)
    return await service.procesar_checkin(request)
```

Por ahora `SaludRequest` sigue teniendo `usuario_id` y el service lo usa. En INT-01 vas a eliminar ese campo y usar `current_user.id`.

### Verificación

```bash
# 1. App carga sin errores
python -c "from app.main import app; print('App OK')"

# 2. Tests existentes
python -m pytest tests/ -v
# Los 30 tests deben seguir en verde. Si alguno falla, revisá que no hayas roto
# imports circulares.

# 3. Levantá el servidor
uvicorn app.main:app --reload
```

En Swagger (`http://localhost:8000/docs`), ejecutá estos escenarios:

**A) Login para obtener token:**
```json
POST /auth/login
{
  "email": "ana@test.com",
  "password": "secreta123"
}
```
Copiá el `access_token` del response.

**B) GET /auth/me con token válido:**
- Clickeá el ícono de candado 🔒 arriba a la derecha en Swagger
- Pegá el token (solo el string, sin `Bearer ` — Swagger lo agrega solo)
- Ejecutá `GET /auth/me`
- **Esperado:** 200 OK con todos los datos del usuario, SIN `hashed_password`

**C) GET /auth/me SIN token:**
- No pongas ningún token en el candado
- Ejecutá `GET /auth/me`
- **Esperado:** 401 Unauthorized

**D) GET /auth/me con token inválido:**
- Poné `"esto-no-es-un-jwt"` como token
- **Esperado:** 401 Unauthorized

**E) POST /salud con token (para verificar que get_current_user no rompió nada):**
- Con el token válido en el candado, ejecutá un check-in normal
- **Esperado:** Funciona igual que antes (200 OK o 404 si el usuario no existe)

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `ImportError: cannot import name 'get_current_user' from 'app.core.security'` | No agregaste la función, o la pusiste con otro nombre | Verificá que la función se llame exactamente `get_current_user` |
| `ImportError: circular import` | `security.py` importa `get_session` del módulo `db.session` que a su vez importa `models` que importa `security` | Los imports de `get_session` y `get_user_by_id` DEBEN estar DENTRO de `get_current_user`, no al inicio del archivo |
| `NameError: name 'User' is not defined` | Usaste `User` como type hint sin comillas en `security.py` | Usá `"User"` (string) para el type hint de retorno: `def get_current_user(...) -> "User":` |
| `AttributeError: 'OAuth2PasswordBearer' object has no attribute` | Olvidaste los paréntesis en `Depends(oauth2_scheme)` | Es `token: str = Depends(oauth2_scheme)`, con paréntesis |
| 422 Validation Error en `/auth/me` | El endpoint no tiene `response_model` o usa un schema equivocado | `@router.get("/me", response_model=UserResponse)` |
| Swagger no muestra el candado en `/auth/me` | Falta el parámetro `current_user: User = Depends(get_current_user)` en la firma | Swagger detecta automáticamente que el endpoint requiere auth por el `Depends(get_current_user)` |
| `ImportError: cannot import name 'get_session' from 'app.db.session'` | `get_session` no existe o se llama distinto | Verificá `app/db/session.py` — la función se llama `get_session` |

### Criterios de aceptación INT-00

- [ ] `get_current_user` decodifica el JWT, extrae `sub`, busca al usuario y lo devuelve
- [ ] `get_current_user` lanza 401 si el token es inválido, expirado o el usuario no existe
- [ ] `GET /auth/me` devuelve `UserResponse` con todos los datos del usuario autenticado
- [ ] `GET /auth/me` sin token devuelve 401
- [ ] `GET /auth/me` con token inválido devuelve 401
- [ ] El response de `/auth/me` NO contiene `hashed_password` (lo garantiza `response_model`)
- [ ] Swagger muestra el candado 🔒 en `/auth/me` y en `/salud`
- [ ] Tests existentes (30) siguen pasando
- [ ] `/salud` sigue funcionando igual que antes (no rompiste nada)
- [ ] Commit con: `feat(auth): agregar get_current_user y GET /auth/me`

---

## 🔄 Actualizaciones durante la integración real

### `get_session` se importa a nivel módulo, no lazy

El spec recomendaba import lazy (dentro de la función `get_current_user`) de `get_session` y `get_user_by_id` para evitar imports circulares. En el código real:

- **`get_session`** se importa al inicio del archivo (`from app.db.session import get_session`) porque no genera ciclo con `security.py`.
- **`get_user_by_id`** sí se mantiene como import lazy dentro de `get_current_user` porque `app.repositories.user` podría generar un ciclo si se importa a nivel módulo.

Este enfoque es más limpio: solo se usa lazy import donde es estrictamente necesario.

```python
# security.py — imports reales
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from app.db.session import get_session  # ← nivel módulo, no genera ciclo

def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> "User":
    # ...
    from uuid import UUID
    from app.repositories.user import get_user_by_id  # ← lazy, evita ciclo
    user = get_user_by_id(session, UUID(user_id_str))
```

---
