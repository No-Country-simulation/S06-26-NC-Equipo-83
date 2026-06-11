## INCIDENCIA 04 — `/salud` — Check-in Emocional con Regla de Crisis

## Resumen

Esta incidencia implementa el check-in emocional diario donde cada persona evalúa cómo se siente, califica su bienestar en una escala del 1 al 10 y comparte el contexto de su día. El sistema aplica una regla de seguridad fundamental: si la calificación es menor a 4, activa un protocolo de crisis que responde con un mensaje fijo y deriva a ayuda profesional sin consultar a la inteligencia artificial. Cuando la calificación es 4 o mayor, el sistema consulta al agente de inteligencia artificial para generar un mensaje empático personalizado y una acción concreta de bienestar. En ambos casos, el registro queda guardado para seguimiento.

**Rama:** `incidencia/04-salud-checkin`  
**Duración estimada:** 1.5 días (10-12 horas).  
**Depende de:** 01 terminada (DB, stub de IA) + 02a terminada (`repositories/user.py`). NO espera a 02b ni 03.  
**Asignada a:** 1 dev.  
**Por qué puede arrancar ANTES que 03:** Usa el stub de `IAAgent` de la incidencia 01. Cuando 03 esté lista, se reemplaza el archivo `ia_agent.py` sin tocar NADA de este código. Necesitás `get_user_by_id` de 02a — pedile al dev de 02a que la tenga lista en sus primeras 2-3 horas.

### ¿Qué vas a aprender?

| Concepto | ¿Qué es? |
|----------|---------|
| `async/await` en cascada | Endpoint async → service async → agente async |
| Persistencia con SQLModel | Guardar datos en la DB desde un service |
| Constantes a nivel módulo | Variables en MAYÚSCULAS fuera de funciones — visibles en todo el archivo |
| `.value` en enums | Obtener el string de un enum: `Mood.ANXIOUS.value == "anxious"` |
| `datetime.now(timezone.utc)` | Timestamps con zona horaria |

### Pre-lectura (25 min)

| Archivo | Pregunta que responde |
|---------|----------------------|
| `app/schemas/salud.py` | ¿Qué campos recibe y devuelve el endpoint? |
| `app/models/mental_health.py` | ¿Qué columnas tiene la tabla `mental_health_logs`? |
| `app/services/ia_agent.py` | ¿Qué método voy a llamar y qué devuelve? |
| `docs/Descripción General.md` — sección SALUD MENTAL | ¿Qué espera el cliente de este endpoint? |

### Antes de codear: flujo git

```bash
git checkout main
git pull origin main
git checkout -b incidencia/04-salud-checkin
```

### Paso a paso

#### Archivo 1: `backend/app/repositories/mental_health.py`

```python
from uuid import UUID
from sqlmodel import Session, select
from app.models.mental_health import MentalHealthLog


def create_mental_health_log(
    session: Session, log: MentalHealthLog
) -> MentalHealthLog:
    """Guarda un check-in emocional en la base de datos."""
    session.add(log)
    session.commit()
    session.refresh(log)
    return log


def get_logs_by_user(
    session: Session, user_id: UUID, limit: int = 10
) -> list[MentalHealthLog]:
    """Devuelve los últimos N check-ins de un usuario, ordenados del más
    reciente al más viejo (ORDER BY created_at DESC)."""
    statement = (
        select(MentalHealthLog)
        .where(MentalHealthLog.user_id == user_id)
        .order_by(MentalHealthLog.created_at.desc())  # .desc() = descendente
        .limit(limit)
    )
    return list(session.exec(statement).all())


def get_latest_log(
    session: Session, user_id: UUID
) -> MentalHealthLog | None:
    """Devuelve el check-in más reciente de un usuario, o None si nunca hizo uno."""
    statement = (
        select(MentalHealthLog)
        .where(MentalHealthLog.user_id == user_id)
        .order_by(MentalHealthLog.created_at.desc())
        .limit(1)
    )
    return session.exec(statement).first()
```

**Verificá:**
```bash
python -c "from app.repositories.mental_health import create_mental_health_log, get_logs_by_user, get_latest_log; print('Repo salud OK')"
```

#### Archivo 2: `backend/app/services/salud.py`

**LEÉ ESTE ARCHIVO COMPLETO DOS VECES ANTES DE TOCARLO. LA REGLA DE ORO ESTÁ ACÁ.**

```python
from datetime import datetime, timezone
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

    async def procesar_checkin(self, request: SaludRequest) -> SaludResponse:
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
        usuario = get_user_by_id(self.session, request.usuario_id)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado.",
            )

        # ------------------------------------------------------------------
        # PASO 2: EVALUACIÓN DE CRISIS (MATEMÁTICA, SIN IA)
        # Este if DEBE ser lo primero. Si invertís el orden, rompés
        # la regla de negocio más importante del proyecto.
        # ------------------------------------------------------------------
        if request.nota_semanal < 4:
            return self._responder_crisis(request)

        # ------------------------------------------------------------------
        # PASO 3: BIENESTAR — solo para notas >= 4
        # ------------------------------------------------------------------
        return await self._responder_bienestar(request)

    def _responder_crisis(self, request: SaludRequest) -> SaludResponse:
        """Protocolo de crisis: mensaje fijo, derivación al CVV.

        La IA NO se consulta. La respuesta es determinista.
        El check-in se guarda en DB con derivate_cvv=True.
        """
        log = MentalHealthLog(
            user_id=request.usuario_id,
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
        self, request: SaludRequest
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
            user_id=request.usuario_id,
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
```

**Tres conceptos que DEBÉS entender de este código:**

1. **`request.humor.value`** — `request.humor` es un enum, tipo `Mood.ANXIOUS`. Si hacés `print(request.humor)` ves `Mood.ANXIOUS`. Para obtener el string `"anxious"` necesitás `.value`. Esto es importante porque el agente de IA espera strings, no objetos enum.

2. **`if request.nota_semanal < 4` ANTES que la llamada a IA.** Si ponés la IA primero y después evaluás crisis, rompés todo. Una persona en crisis (nota=2) recibiría una respuesta generada por IA en vez del protocolo CVV. **Este orden es innegociable.**

3. **El check-in se guarda en DB en AMBOS caminos.** `_responder_crisis` y `_responder_bienestar` ambos crean un `MentalHealthLog` y lo persisten. La diferencia está en los campos `derivate_cvv` y `alert_triggered`.

#### Archivo 3: `backend/app/routers/salud.py`

```python
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
```

**¿Por qué el endpoint es `async def`?** Porque llama a `await service.procesar_checkin()`, que a su vez llama a `await self.ia_agent.generar_respuesta_emocional()`. La cadena completa debe ser async. FastAPI lo maneja sin problema — detecta `async def` y lo ejecuta en el event loop.

#### Archivo 4: Modificar `backend/app/main.py`

```python
from app.routers import salud
app.include_router(salud.router)
```

### Verificación crítica — 3 escenarios, si uno falla NO MERGEES

Levantá el servidor y abrí Swagger. Para cada escenario, primero necesitás un usuario — crealo con `POST /auth/register`.

**Escenario A — CRISIS (nota 2, IA NO debe ejecutarse):**
```json
POST /salud
{
  "usuario_id": "el-uuid-de-tu-usuario",
  "humor": "sad",
  "nota_semanal": 2,
  "contexto": "perdí el trabajo"
}
```
Esperado: `derivar_cvv: true`, `alerta: true`. El mensaje contiene "CVV" o "188". **Verificá en los logs del servidor que NO aparece `[IAAgent]`** — eso confirmaría que la IA no fue llamada.

**Escenario B — BIENESTAR (nota 6, IA debe ejecutarse):**
```json
POST /salud
{
  "usuario_id": "mismo-uuid",
  "humor": "anxious",
  "nota_semanal": 6,
  "contexto": "entrevista mañana"
}
```
Esperado: `derivar_cvv: false`, `alerta: false`. Mensaje personalizado. Si aún tenés el stub, el mensaje va a ser el del diccionario. Si ya está Gemini, va a ser generado.

**Escenario C — LÍMITE (nota = 4, es el caso borde que más se pifa):**
```json
POST /salud
{
  "usuario_id": "mismo-uuid",
  "humor": "tired",
  "nota_semanal": 4,
  "contexto": null
}
```
Esperado: `derivar_cvv: false`. **Nota = 4 NO es crisis.** La condición es `nota < 4`, estricto. Si tu código usa `<=` en vez de `<`, este test falla. Revisalo.

### Errores frecuentes

| Error | Causa | Solución |
|-------|-------|----------|
| `ValueError: 'feliz' is not a valid Mood` | Estás pasando strings en español al enum | Los valores del enum son en inglés: `"happy"`, `"tired"`, etc. Swagger te muestra las opciones válidas en el dropdown. |
| `AttributeError: 'Mood' object has no attribute 'lower'` | Estás tratando el enum como string sin `.value` | Usá `request.humor.value` para obtener el string |
| `RuntimeWarning: coroutine was never awaited` | Olvidaste el `await` antes de una función async | `await self.ia_agent.generar_respuesta_emocional(...)` |
| `404 Not Found` para el usuario | No creaste el usuario antes o el UUID no coincide | Creá el usuario con `/auth/register` y copiá el `id` del response |
| `IntegrityError: duplicate key` | Estás usando el mismo usuario en tests repetidos | Eso es normal — el check-in se puede hacer varias veces. El error es otro. |

### Criterios de aceptación Incidencia 04

- [ ] `nota_semanal = 2` → `derivar_cvv: true`, `alerta: true`, IA NO se llama
- [ ] `nota_semanal = 4` → `derivar_cvv: false`, IA SÍ se llama (el límite es `< 4`, no `<= 4`)
- [ ] `nota_semanal = 8` → `derivar_cvv: false`, respuesta generada por IA o fallback
- [ ] Usuario inexistente → 404
- [ ] El check-in se persiste en `mental_health_logs` en AMBOS caminos (crisis y bienestar)
- [ ] Swagger muestra el endpoint con request/response documentados
- [ ] Tests existentes (30) siguen pasando
- [ ] Commit con: `feat(salud): implementar check-in emocional con regla de crisis`

---
