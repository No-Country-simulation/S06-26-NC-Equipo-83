from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import jwt, JWTError
from sqlmodel import Session

from app.core.config import settings
from app.db.session import get_session


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


# ---------------------------------------------------------------------------
# Esquema OAuth2 — le dice a FastAPI de dónde sacar el token
# ---------------------------------------------------------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
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

    # Lazy imports para evitar imports circulares
    from app.repositories.user import get_user_by_id

    user = get_user_by_id(session, UUID(user_id_str))
    if user is None:
        raise credentials_exception

    return user
