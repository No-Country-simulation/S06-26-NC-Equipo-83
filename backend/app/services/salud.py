from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.mental_health import MentalHealthLog
from app.repositories.mental_health import create_mental_health_log
from app.repositories.user import get_user_by_id
from app.schemas.salud import SaludRequest, SaludResponse
from app.services.ia_agent import IAAgent


# ---------------------------------------------------------------------------
# MENSAJE DE CRISIS — Constante a nivel módulo.
# Este mensaje NUNCA se genera con IA. Es 100% determinista.
# Se activa cuando nota_semanal < 4.
# ---------------------------------------------------------------------------
MENSAJE_CRISIS = (
    "Sabés qué, no estás solo en esto. A veces necesitamos hablar con alguien "
    "que sepa escuchar sin juzgar. El CVV (Centro de Valorización de la Vida) "
    "está disponible las 24 horas de forma gratuita y confidencial. "
    "Llamá al 188 o entrá a cvv.org.br. Ellos están ahí para vos, ahora mismo."
)

ACCION_CRISIS = "Llamá ahora al CVV: 188 (gratuito, 24 horas, confidencial)."


class SaludService:
    """Servicio de salud mental y bienestar emocional.

    REGLA DE ORO — NO MODIFICAR SIN AUTORIZACIÓN:
    Si nota_semanal < 4, el sistema activa el protocolo de crisis
    de forma 100% DETERMINISTA. La IA NO se consulta en este caso.
    La IA solo se llama cuando nota_semanal >= 4.
    """

    def __init__(self, session: Session):
        self.session = session
        self.ia_agent = IAAgent()

    async def procesar_checkin(self, request: SaludRequest, user_id: UUID) -> SaludResponse:
        """Procesa el check-in emocional diario del usuario.

        Flujo:
        1. Validar que el usuario existe → 404 si no.
        2. Si nota < 4 → CRISIS (determinista, sin IA).
        3. Si nota >= 4 → BIENESTAR (llama a IA para respuesta empática).
        4. En AMBOS casos, guarda el check-in en la DB.
        """
        # ------------------------------------------------------------------
        # PASO 1: Validar existencia del usuario
        # ------------------------------------------------------------------
        usuario = get_user_by_id(self.session, user_id)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado.",
            )

        # ------------------------------------------------------------------
        # PASO 2: EVALUACIÓN DE CRISIS (MATEMÁTICA, SIN IA)
        # ------------------------------------------------------------------
        if request.nota_semanal < 4:
            return self._responder_crisis(request, user_id)

        # ------------------------------------------------------------------
        # PASO 3: BIENESTAR — solo para notas >= 4
        # ------------------------------------------------------------------
        return await self._responder_bienestar(request, user_id)

    def _responder_crisis(self, request: SaludRequest, user_id: UUID) -> SaludResponse:
        """Protocolo de crisis: mensaje fijo, derivación al CVV.

        La IA NO se consulta. La respuesta es determinista.
        El check-in se guarda en DB con derivate_cvv=True.
        """
        log = MentalHealthLog(
            user_id=user_id,
            mood=request.humor,
            weekly_score=request.nota_semanal,
            context=request.contexto,
            response_message=MENSAJE_CRISIS,
            suggested_action=ACCION_CRISIS,
            derivate_cvv=True,
            alert_triggered=True,
            created_at=datetime.now(timezone.utc),
        )
        create_mental_health_log(self.session, log)

        return SaludResponse(
            mensaje=MENSAJE_CRISIS,
            accion_sugerida=ACCION_CRISIS,
            derivar_cvv=True,
            nota_actual=request.nota_semanal,
            alerta=True,
            created_at=log.created_at,
        )

    async def _responder_bienestar(
        self, request: SaludRequest, user_id: UUID
    ) -> SaludResponse:
        """Llama al agente de IA para generar una respuesta empática.

        request.humor es un enum (Mood.ANXIOUS).
        request.humor.value devuelve el string ("anxious") que espera el agente.
        """
        respuesta_ia = await self.ia_agent.generar_respuesta_emocional(
            humor=request.humor.value,  # .value = string del enum
            nota=request.nota_semanal,
            contexto=request.contexto,
        )

        log = MentalHealthLog(
            user_id=user_id,
            mood=request.humor,
            weekly_score=request.nota_semanal,
            context=request.contexto,
            response_message=respuesta_ia["mensaje"],
            suggested_action=respuesta_ia["accion"],
            derivate_cvv=False,
            alert_triggered=False,
            created_at=datetime.now(timezone.utc),
        )
        create_mental_health_log(self.session, log)

        return SaludResponse(
            mensaje=respuesta_ia["mensaje"],
            accion_sugerida=respuesta_ia["accion"],
            derivar_cvv=False,
            nota_actual=request.nota_semanal,
            alerta=False,
            created_at=log.created_at,
        )