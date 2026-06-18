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