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