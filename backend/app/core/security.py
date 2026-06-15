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
