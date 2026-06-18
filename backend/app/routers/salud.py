from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.salud import SaludRequest, SaludResponse
from app.services.salud import SaludService

router = APIRouter(prefix="/salud", tags=["salud"])


@router.post("", response_model=SaludResponse)
async def checkin_emocional(
    request: SaludRequest, session: Session = Depends(get_session)
):
    """Procesa el check-in emocional diario.

    Comportamiento:
    - nota_semanal < 4: activa protocolo de crisis (derivación al CVV).
    - nota_semanal >= 4: genera respuesta empática personalizada con IA.
    """
    service = SaludService(session)
    return await service.procesar_checkin(request)