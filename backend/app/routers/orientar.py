from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.orientar import OrientarRequest, OrientarResponse
from app.services.orientar import OrientarService

router = APIRouter(prefix="/orientar", tags=["orientar"])


@router.post("", response_model=OrientarResponse)
def orientar(
    request: OrientarRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Analiza el perfil profesional del usuario autenticado.

    Calcula el gap porcentual, sugiere trayectoria de formación
    (Programa ONE, Google GEAR) y muestra vacantes compatibles.
    """
    service = OrientarService(session)
    return service.analizar_perfil(
        user=current_user,
        perfil=request.perfil,
        nivel=request.nivel,
        region=request.region,
        idioma=request.idioma,
        lat=request.lat,
        lng=request.lng,
    )
