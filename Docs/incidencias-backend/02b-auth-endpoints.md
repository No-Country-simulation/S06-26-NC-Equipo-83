## INCIDENCIA 02b — Auth Service + Router (Registro y Login)

## Resumen

Esta incidencia expone los endpoints HTTP para que las personas puedan registrarse y acceder a la plataforma. Implementa el servicio que orquesta el registro con validación de email único y hash de contraseña, además del inicio de sesión que verifica credenciales y devuelve un token de acceso. También crea las rutas de la API y las conecta con la aplicación principal, permitiendo que cualquier frontend pueda crear cuentas y obtener tokens para autenticarse.

**Rama:** `incidencia/02b-auth-endpoints`  
**Duración estimada:** 1 día (6-8 horas).  
**Depende de:** 01 Y 02a terminadas.  
**Asignada a:** El mismo dev que hizo 02a (ya conoce el código que creó).

### ¿Qué vas a aprender de Python en esta incidencia?

| Concepto | ¿Qué es? |
|----------|---------|
| `class` con `__init__()` | Constructor de una clase — recibe dependencias por parámetro |
| `HTTPException` | Cómo devolver errores HTTP desde Python |
| `APIRouter` | Agrupar endpoints relacionados bajo un prefijo |
| `Depends(get_session)` | Inyección de dependencias — FastAPI maneja el ciclo de vida de la DB |
| `response_model=UserResponse` | FastAPI filtra automáticamente los campos que no están en el schema de respuesta |
| `status.HTTP_201_CREATED` | Constantes para códigos HTTP en vez de números mágicos |

### Pre-lectura (20 min)

| Archivo | ¿Por qué? |
|---------|----------|
| `app/schemas/user.py` | Vas a usar `UserCreate` (request), `UserResponse` (response), `UserLogin`, `TokenResponse` |
| `app/repositories/user.py` | El código que creaste en 02a — `get_user_by_email`, `create_user` |
| `app/core/security.py` | `hash_password`, `verify_password`, `create_access_token` |
| `app/main.py` | Vas a ver cómo se monta un router con `app.include_router()` |

### Antes de codear: flujo git

```bash
git checkout main
git pull origin main
git checkout -b incidencia/02b-auth-endpoints
```

### Paso a paso

#### Archivo 1: `backend/app/services/auth.py`

```python
from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.repositories.user import get_user_by_email, create_user
from app.core.security import hash_password, verify_password, create_access_token


class AuthService:
    """Lógica de negocio para autenticación de usuarios.

    Recibe una session de SQLModel por inyección de dependencias.
    Orquesta repositories y security — no escribe queries directamente.
    """

    def __init__(self, session: Session):
        """Guarda la sesión para usarla en los métodos.

        En Python, __init__ es el constructor. Se ejecuta cuando hacés
        AuthService(session). El parámetro 'self' se pasa automáticamente
        y representa la instancia creada.
        """
        self.session = session

    def register(self, user_data: UserCreate) -> User:
        """Registra un nuevo usuario.

        Flujo:
        1. Verifica que el email no exista → 409 si ya está registrado.
        2. Hashea la contraseña — NUNCA se guarda en texto plano.
        3. Crea el usuario en la base de datos.

        IMPORTANTE: UserCreate (schema) tiene 'password'.
        User (modelo de DB) tiene 'hashed_password'.
        Son campos distintos. No los confundas.
        """
        # Paso 1: validar email único
        existing_user = get_user_by_email(self.session, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El email ya está registrado.",
            )

        # Paso 2: crear modelo User a partir del schema UserCreate
        # user_data.model_dump() convierte el schema a un diccionario
        user_dict = user_data.model_dump()
        # Reemplazamos 'password' por 'hashed_password' con el hash
        user_dict["hashed_password"] = hash_password(user_dict.pop("password"))

        db_user = User(**user_dict)
        # **user_dict es "desempaquetado de diccionario":
        # User(email=..., full_name=..., hashed_password=...)

        # Paso 3: persistir en DB
        return create_user(self.session, db_user)

    def login(self, email: str, password: str) -> dict[str, str]:
        """Autentica a un usuario y devuelve un token JWT.

        Flujo:
        1. Busca el usuario por email.
        2. Verifica que exista y que la contraseña coincida.
        3. Si algo falla → 401 (mismo error para no dar pistas).
        4. Si todo OK → genera JWT con el user_id como subject.
        """
        user = get_user_by_email(self.session, email)

        # Verificación en UNA sola línea — falla si user es None
        # o si la contraseña no coincide
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas.",
            )

        # El campo "sub" (subject) del JWT es el user_id como string.
        # Es estándar JWT usar "sub" para identificar al usuario.
        token = create_access_token(data={"sub": str(user.id)})
        return {"access_token": token, "token_type": "bearer"}
```

**Dos conceptos Python que aparecen acá y son nuevos para vos:**

1. **`user_dict.pop("password")`** — `pop()` SACA la clave `"password"` del diccionario y DEVUELVE su valor. Lo usamos para extraer la contraseña en texto plano y reemplazarla por el hash en una sola línea.

2. **`User(**user_dict)`** — El `**` "desempaqueta" el diccionario como argumentos nombrados. Esto:
   ```python
   User(**{"email": "a@b.com", "full_name": "Ana"})
   ```
   Es EXACTAMENTE lo mismo que:
   ```python
   User(email="a@b.com", full_name="Ana")
   ```

#### Archivo 2: `backend/app/routers/__init__.py`

Vacío (si no existe ya).

#### Archivo 3: `backend/app/routers/auth.py`

```python
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.user import UserCreate, UserResponse, TokenResponse, UserLogin
from app.services.auth import AuthService

# Crear un router con prefijo y tag para Swagger
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un nuevo usuario",
)
def register(user_data: UserCreate, session: Session = Depends(get_session)):
    """Crea una cuenta nueva con datos personales y profesionales.

    El response_model=UserResponse asegura que NUNCA se devuelva
    la contraseña hasheada en la respuesta, aunque el service
    retorne un objeto User completo.
    """
    service = AuthService(session)
    return service.register(user_data)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Iniciar sesión",
)
def login(credentials: UserLogin, session: Session = Depends(get_session)):
    """Autentica al usuario y devuelve un token JWT.

    El token debe enviarse en el header Authorization de requests
    subsiguientes como: Bearer <token>
    """
    service = AuthService(session)
    return service.login(credentials.email, credentials.password)
```

**Concepto de `response_model` — FUNDAMENTAL para seguridad:**

Fijate que `register()` retorna un `User` (modelo de DB, que tiene `hashed_password`). Pero el decorador dice `response_model=UserResponse`. FastAPI automáticamente:

1. Toma el objeto `User` que devolvió el service
2. Lo convierte a `UserResponse` (que NO tiene `hashed_password`)
3. Descarta cualquier campo que no esté en `UserResponse`
4. Devuelve solo lo seguro al cliente

**NUNCA expongas `hashed_password` en una respuesta de API. `response_model` es tu firewall.**

#### Archivo 4: Modificar `backend/app/main.py`

Agregá estas líneas después de los imports existentes y antes del final:

```python
from app.routers import auth

# Montar routers
app.include_router(auth.router)
```

### Verificación completa

```bash
# 1. App carga sin errores
python -c "from app.main import app; print('App OK')"

# 2. Tests existentes
python -m pytest tests/ -v
# 30 verdes

# 3. Levantá el servidor
uvicorn app.main:app --reload

# 4. Abrí Swagger: http://localhost:8000/docs
```

En Swagger, ejecutá estos 4 escenarios:

**A) Registrar usuario válido:**
```json
POST /auth/register
{
  "email": "ana@test.com",
  "password": "secreta123",
  "full_name": "Ana López",
  "birth_date": "1998-05-15",
  "gender": "femenino",
  "education_level": "universitario",
  "continent": "América del Sur",
  "country": "Argentina",
  "state": "Buenos Aires",
  "city": "La Plata",
  "whatsapp": "+5491123456789",
  "professional_level": "junior",
  "tech_area": "frontend",
  "career_objective": "find_job"
}
```
**Esperado:** 201 Created. El response NO debe contener `hashed_password`.

**B) Duplicar email:**
Repetí el mismo request de (A).
**Esperado:** 409 Conflict. `{"detail": "El email ya está registrado."}`

**C) Login correcto:**
```json
POST /auth/login
{
  "email": "ana@test.com",
  "password": "secreta123"
}
```
**Esperado:** 200 OK. `{"access_token": "eyJ...", "token_type": "bearer"}`

**D) Login incorrecto:**
```json
POST /auth/login
{
  "email": "ana@test.com",
  "password": "password-mala"
}
```
**Esperado:** 401 Unauthorized.

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `ImportError: cannot import name 'AuthService'` | El archivo `services/auth.py` no existe o la clase tiene otro nombre | Verificá que la clase se llame `AuthService` (PascalCase, sin typo) |
| `TypeError: User() got an unexpected keyword argument 'password'` | Estás pasando `password` al modelo User, pero User espera `hashed_password` | Usá `model_dump()` + `pop("password")` como en el ejemplo |
| `422 Unprocessable Entity` en Swagger | El JSON que enviaste no coincide con el schema | Leé el mensaje de error de Swagger — te dice EXACTAMENTE qué campo está mal o falta |
| `status.HTTP_409_CONFLICT` no existe | No importaste `status` de fastapi | `from fastapi import status` |
| `response_model` no filtra `hashed_password` | `UserResponse` no incluye `hashed_password` pero tampoco lo excluye explícitamente | Verificá que `UserResponse` NO tenga el campo `hashed_password` |

### Criterios de aceptación Incidencia 02b

- [ ] `POST /auth/register` crea usuario en DB, devuelve 201, NO expone `hashed_password`
- [ ] `POST /auth/register` con email duplicado devuelve 409
- [ ] `POST /auth/login` con credenciales válidas devuelve token JWT
- [ ] `POST /auth/login` con credenciales inválidas devuelve 401
- [ ] Ambos endpoints aparecen en Swagger (`/docs`) con schemas documentados
- [ ] El router NO contiene lógica de negocio — solo recibe, llama al service, devuelve
- [ ] Tests existentes (30) siguen pasando
- [ ] Commit con: `feat(auth): implementar registro y login con JWT`

---
