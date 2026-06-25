from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.db.session import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, TokenResponse, RegisterResponse, UserLogin
from app.services.auth import AuthService
from app.repositories.user import get_user_by_email

# Crear un router con prefijo y tag para Swagger
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un nuevo usuario",
)
def register(user_data: UserCreate, session: Session = Depends(get_session)):
    """Crea una cuenta nueva y devuelve token + datos del usuario.

    El response_model=RegisterResponse incluye access_token para que
    el frontend inicie sesión automáticamente después del registro.
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


@router.get(
    "/check-email",
    summary="Verificar si un email ya está registrado",
)
def check_email(
    email: str = Query(..., description="Email a verificar"),
    session: Session = Depends(get_session),
):
    """Devuelve si el email ya está registrado en el sistema.

    El frontend usa este endpoint para validación en tiempo real
    durante el formulario de registro.
    """
    user = get_user_by_email(session, email)
    return {"registered": user is not None}


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