from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.orientar import OrientarRequest, OrientarResponse
from app.services.orientar import OrientarService

router = APIRouter(prefix="/orientar", tags=["orientar"])


@router.post("", response_model=OrientarResponse)
def orientar(request: OrientarRequest, session: Session = Depends(get_session)):
    """Analiza el perfil profesional y sugiere trayectoria de formación
    y vacantes compatibles, mostrando el gap porcentual."""
    service = OrientarService(session)
    return service.analizar_perfil(
        usuario_id=request.usuario_id,
        perfil=request.perfil,
        nivel=request.nivel,
        region=request.region,
        idioma=request.idioma,
        lat=request.lat,
        lng=request.lng,
    )
