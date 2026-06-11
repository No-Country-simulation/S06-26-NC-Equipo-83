## INCIDENCIA 02a — Seguridad JWT + Repositorio de Usuarios

## Resumen

Esta incidencia implementa la capa de seguridad y acceso a datos de usuarios. Por un lado, protege las contraseñas mediante hash criptográfico para que nunca se almacenen en texto plano y genera tokens de autenticación JWT para identificar a los usuarios en cada solicitud. Por otro lado, crea las funciones de repositorio que buscan, crean y validan usuarios directamente en la base de datos. Todo esto es lógica de negocio pura, sin dependencia de HTTP ni del framework web.

**Rama:** `incidencia/02a-security-user-repo`  
**Duración estimada:** 1 día (6-8 horas).  
**Depende de:** 01 terminada.  
**Asignada a:** 1 dev.  
**Por qué existe separada de 02b:** Son dos archivos de funciones puras — sin HTTP, sin FastAPI. Más fáciles de entender y testear de a uno. Cuando termines esto, el dev de orientar ya puede importar `get_user_by_id`.

### ¿Qué vas a aprender de Python en esta incidencia?

| Concepto | ¿Qué es? |
|----------|---------|
| Funciones con type hints | `def crear(data: str) -> bool:` — documenta y valida tipos |
| `passlib` + bcrypt | Hashear contraseñas — nunca se guardan en texto plano |
| `python-jose` + JWT | Crear y verificar tokens de autenticación |
| `datetime.now(timezone.utc)` | Fechas con zona horaria UTC — no uses `datetime.utcnow()` que está deprecado |
| `select()` y `.where()` de SQLModel | Escribir queries SQL como código Python |
| `session.exec()`, `.first()`, `session.add()`, `session.commit()` | Operaciones CRUD con SQLModel |

### Pre-lectura (30 min)

| Archivo | ¿Por qué? |
|---------|----------|
| `app/models/user.py` | Estructura de la tabla `users` — campos, tipos, defaults |
| `app/core/config.py` | Vas a usar `settings.SECRET_KEY` |
| `app/db/session.py` | Vas a usar `Session` como tipo de parámetro |
| `app/enums/__init__.py` | Cómo se importan enums desde el paquete |

### Antes de codear: flujo git

```bash
git checkout main
git pull origin main
git checkout -b incidencia/02a-security-user-repo
```

### Archivo 1: `backend/app/core/security.py`

Funciones puras. No tocan base de datos ni HTTP. Reciben strings, devuelven strings o bools.

```python
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt, JWTError
from app.core.config import settings


# ---------------------------------------------------------------------------
# Contexto de bcrypt — se crea UNA sola vez cuando Python importa el módulo.
# No lo crees dentro de una función. Se cachea a nivel módulo por eficiencia.
# ---------------------------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Convierte una contraseña en texto plano a un hash irreversible.

    NUNCA guardes la contraseña original. Siempre guardá el hash.
    Ni siquiera nosotros podemos recuperar la contraseña original desde el hash.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara una contraseña en texto plano contra su hash almacenado.

    Retorna True si coinciden, False si no.
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Crea un JSON Web Token con un payload y fecha de expiración.

    Args:
        data: Diccionario con los datos a incluir (ej: {"sub": user_id}).
        expires_delta: Duración del token. Si es None, usa el default de config.

    Returns:
        String con el token JWT codificado.
    """
    to_encode = data.copy()

    # Fecha de expiración = ahora + duración
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # El campo "exp" es estándar JWT y FastAPI lo valida automáticamente
    to_encode.update({"exp": expire})

    # Codificar con HS256 (simétrico, solo nosotros podemos verificarlo)
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


def decode_access_token(token: str) -> dict:
    """Decodifica y valida un JWT.

    Si el token expiró, fue manipulado o es inválido, lanza una excepción.

    Raises:
        ValueError: Si el token es inválido o expiró.
    """
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except JWTError:
        raise ValueError("Token inválido o expirado")
```

**Verificá YA MISMO. No esperes al final:**

```bash
python -c "
from app.core.security import hash_password, verify_password
h = hash_password('hola123')
print('Hash generado:', h[:20] + '...')
print('Verificación correcta:', verify_password('hola123', h))
print('Verificación incorrecta:', verify_password('password_mala', h))
"
# Esperado:
# Hash generado: $2b$12$...
# Verificación correcta: True
# Verificación incorrecta: False
```

```bash
python -c "
from app.core.security import create_access_token, decode_access_token
token = create_access_token({'sub': 'usuario-de-prueba'})
print('Token:', token[:30] + '...')
payload = decode_access_token(token)
print('Payload decodificado:', payload)
"
# Esperado: un dict con 'sub' y 'exp'
```

### Archivo 2: `backend/app/repositories/__init__.py`

Creá la carpeta `repositories/` y este archivo vacío dentro si no existen.

### Archivo 3: `backend/app/repositories/user.py`

**¿Qué es un repository?** La ÚNICA capa que habla con la base de datos. Acá van todas las queries. Si necesitás buscar un usuario, crear uno, listarlos — es acá. No mezcles lógica de negocio con queries.

```python
from uuid import UUID
from sqlmodel import Session, select
from app.models.user import User


def get_user_by_email(session: Session, email: str) -> User | None:
    """Busca un usuario por email. Retorna None si no existe.

    select(User)          → SELECT * FROM users
    .where(User.email == email) → WHERE email = '...'
    session.exec()        → ejecuta la query
    .first()              → primer resultado o None
    """
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def get_user_by_id(session: Session, user_id: UUID) -> User | None:
    """Busca un usuario por ID (primary key).

    session.get() es un atajo para buscar por PK.
    Es más rápido que select() + where() para este caso.
    """
    return session.get(User, user_id)


def create_user(session: Session, user: User) -> User:
    """Inserta un nuevo usuario en la base de datos.

    IMPORTANTE: Recibe una instancia de User YA CONSTRUIDA,
    con la contraseña YA HASHEADA. Este repositorio no hashea —
    eso es responsabilidad del service.

    session.add()     → marca el objeto para INSERT (no lo ejecuta aún)
    session.commit()  → ejecuta TODAS las operaciones pendientes en la DB
    session.refresh() → recarga el objeto con los datos que generó la DB
                         (id autogenerado, created_at, etc.)
    """
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
```

**Concepto clave — `session.add()` + `session.commit()` + `session.refresh()`:**

Cuando hacés `session.add(user)`, el objeto `user` **todavía no tiene `id` ni `created_at`**. Esos campos los genera PostgreSQL al hacer el INSERT. Recién después de `session.commit()` existen en la DB, y `session.refresh(user)` los trae de vuelta al objeto Python. Si intentás acceder a `user.id` antes del `commit()`, vas a ver el UUID que generó Python (OK), pero `user.created_at` va a ser `None` hasta el `refresh()`.

**Verificá:**
```bash
python -c "from app.repositories.user import get_user_by_email, get_user_by_id, create_user; print('Repositorio user OK')"
```

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `ImportError: cannot import name 'User' from 'app.models.user'` | La clase no se llama `User` o el archivo no está | Abrí `app/models/user.py` y verificá que la clase se llama exactamente `User` |
| `NameError: name 'select' is not defined` | No importaste `select` | Agregá `from sqlmodel import Session, select` |
| `AttributeError: 'User' object has no attribute 'password'` | Estás intentando acceder a `user.password` | El modelo tiene `hashed_password`, no `password`. `UserCreate` (schema) tiene `password`. Son clases distintas. |
| `jose.exceptions.JWTError: Signature verification failed` | El token fue creado con una SECRET_KEY distinta a la que usás para decodificar | Verificá que `settings.SECRET_KEY` sea la misma en ambos momentos |
| `datetime.utcnow()` no existe o da warning | Estás usando la función deprecada | Usá `datetime.now(timezone.utc)` con `from datetime import timezone` |

### Criterios de aceptación Incidencia 02a

- [ ] `hash_password("test")` devuelve un string que empieza con `$2b$`
- [ ] `verify_password("test", hash)` devuelve `True`
- [ ] `verify_password("mala", hash)` devuelve `False`
- [ ] `create_access_token({"sub": "x"})` devuelve un string JWT (3 partes separadas por puntos)
- [ ] `decode_access_token(token)` devuelve el dict original con `sub` y `exp`
- [ ] `decode_access_token("token_falso")` lanza `ValueError`
- [ ] `from app.repositories.user import get_user_by_email, get_user_by_id, create_user` funciona sin error
- [ ] Tests existentes (30) siguen pasando
- [ ] Commit con: `feat(security): agregar JWT, bcrypt y repositorio de usuarios`

---
