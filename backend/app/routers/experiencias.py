"""Router de Experiencias Estructurantes — dataset Vísent CDRView + eventos reales."""

from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.security import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.models.event import Event
from app.schemas.experiencias import ExperienciasRequest, ExperienciasResponse
from app.services.experiencias import ExperienciasService

router = APIRouter(prefix="/experiencias", tags=["experiencias"])


@router.post("", response_model=ExperienciasResponse)
def recomendar_experiencias(
    request: ExperienciasRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Recomienda eventos, destinos y contenido offline según ubicación y perfil.

    Usa el dataset Vísent CDRView (antenas, concentración, flujo OD)
    más los eventos reales creados por la comunidad guardados en la DB.
    """
    # Obtener eventos reales de la DB
    eventos_db = session.exec(
        select(Event).order_by(Event.created_at.desc()).limit(20)
    ).all()

    return ExperienciasService.recomendar(request, eventos_db)
