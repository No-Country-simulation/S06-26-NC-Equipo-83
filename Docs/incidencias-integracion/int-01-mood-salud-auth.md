## INCIDENCIA INT-01 — Extender Mood + Refactor `/salud` con Autenticación

## Resumen

Esta incidencia alinea el backend con lo que el frontend ya muestra: 7 estados de ánimo en vez de 5. Extiende el enum `Mood` con `STRESSED`, `ANGRY` y `DEPRESSED`, actualiza el agente de IA para que responda a estos nuevos moods, y —lo más importante— refactoriza el endpoint `/salud` para que obtenga el `user_id` del token JWT autenticado en vez de recibirlo por body. Esto cierra un agujero de seguridad donde cualquier persona podía enviar check-ins a nombre de otro usuario.

**Rama:** `incidencia/int-01-mood-salud-auth`  
**Duración estimada:** 3-4 horas.  
**Depende de:** INT-00 completada (`get_current_user` funcionando).  
**Asignada a:** 1 dev backend.

### ¿Qué vas a aprender?

| Concepto | ¿Qué es? |
|----------|---------|
| Extender un `StrEnum` | Agregar nuevos miembros sin romper los existentes ni la base de datos |
| Refactor con seguridad | Cambiar la firma de un endpoint sin romper el contrato con el frontend |
| `Depends()` en cascada | Un endpoint que usa `get_current_user` → `get_session` → `SaludService` |
| Eliminar campos de un schema Pydantic | Quitar `usuario_id` de `SaludRequest` porque ahora viene del JWT |

### Pre-lectura (20 min)

| Archivo | Pregunta que responde |
|---------|----------------------|
| `app/enums/mood.py` | ¿Qué valores acepta `Mood` hoy? (5: happy, tired, sad, anxious, overwhelmed) |
| `app/schemas/salud.py` | ¿Qué campos tiene `SaludRequest`? `usuario_id` está ahí — lo vas a eliminar |
| `app/services/salud.py` | ¿Dónde se usa `request.usuario_id`? Buscá todas las ocurrencias |
| `app/services/ia_agent.py` | ¿Cómo responde el agente a cada mood? Vas a agregar fallbacks para los nuevos |
| `app/routers/salud.py` | ¿Cómo recibe los parámetros el endpoint? Vas a agregar `current_user` |

### Mapeo de moods — Frontend vs Backend

El frontend tiene estos 7 emojis con sus labels en español:

| Emoji | Label frontend | Mood backend (antes) | Mood backend (después) |
|-------|---------------|---------------------|----------------------|
| 😊 | Feliz | `happy` | `happy` (sin cambios) |
| 🥱 | Cansado | `tired` | `tired` (sin cambios) |
| 😢 | Triste | `sad` | `sad` (sin cambios) |
| 😰 | Ansioso | `anxious` | `anxious` (sin cambios) |
| 🤯 | Estresado | `overwhelmed` (forzado) | **`stressed`** (nuevo) |
| 😡 | Enojado | ❌ no existe | **`angry`** (nuevo) |
| 😔 | Deprimido | ❌ no existe | **`depressed`** (nuevo) |

**IMPORTANTE:** `overwhelmed` NO se elimina. Sigue existiendo para mantener compatibilidad hacia atrás. Los nuevos moods se AGREGAN, no reemplazan.

### Antes de codear: flujo git

```bash
git checkout incidencia/int-00-auth-middleware
git pull origin incidencia/int-00-auth-middleware
git checkout -b incidencia/int-01-mood-salud-auth
```

### Paso a paso

#### Archivo 1: Extender `Mood` en `backend/app/enums/mood.py`

```python
from enum import Enum


class Mood(str, Enum):
    HAPPY = "happy"
    TIRED = "tired"
    SAD = "sad"
    ANXIOUS = "anxious"
    OVERWHELMED = "overwhelmed"
    STRESSED = "stressed"    # NUEVO — 🤯 Estresado
    ANGRY = "angry"          # NUEVO — 😡 Enojado
    DEPRESSED = "depressed"  # NUEVO — 😔 Deprimido
```

**¿Por qué `str, Enum` y no solo `Enum`?** Porque `str, Enum` hace que `Mood.STRESSED == "stressed"` sea `True`. Esto es importante cuando el valor del enum se compara con strings en tests o en el agente de IA. Sin `str` como base, `Mood.STRESSED == "stressed"` sería `False`.

**Verificá:**
```bash
python -c "from app.enums.mood import Mood; print(Mood.STRESSED.value); print(Mood.ANGRY.value); print(Mood.DEPRESSED.value)"
# Debe imprimir: stressed, angry, depressed
```

#### Archivo 2: Actualizar `IAAgent` en `backend/app/services/ia_agent.py`

El agente tiene un diccionario de fallback con respuestas predefinidas para cada mood. Necesitás agregar entradas para los 3 nuevos. Buscá el diccionario (probablemente se llame `_fallback_responses` o similar) y agregá:

```python
# Agregar estas entradas al diccionario de fallback existente:

"stressed": {
    "mensaje": "El estrés es la respuesta natural del cuerpo ante la exigencia. Hoy no te pido que bajes el ritmo del todo — solo que respires profundo tres veces antes de cada tarea. Lo que sentís es válido, y también es temporal.",
    "accion": "Probá la técnica 5-4-3-2-1: nombrá 5 cosas que ves, 4 que tocás, 3 que escuchás, 2 que olés y 1 que saboreás. Te trae de vuelta al presente en 60 segundos.",
},
"angry": {
    "mensaje": "El enojo es energía — no lo reprimas, pero tampoco dejes que te controle. Esa intensidad que sentís bien canalizada puede mover montañas. Hoy, antes de reaccionar, preguntate: ¿esto va a importar en 5 años?",
    "accion": "Escribí en un papel todo lo que te enoja, sin filtro. Después rompelo en pedacitos. El acto físico de destruir lo escrito libera tensión acumulada.",
},
"depressed": {
    "mensaje": "Sabés qué, hoy no voy a llenarte de frases motivacionales. Solo quiero que sepas que tu dolor es real y no estás exagerando. A veces el simple hecho de haberte levantado hoy ya es una victoria. No te midas con la vara de los días buenos — hoy alcanza con estar.",
    "accion": "Llamá al CVV — Centro de Valorización de la Vida: 188. Es gratuito, confidencial y disponible 24 horas. No estás solo en esto.",
},
```

**IMPORTANTE:** Fijate que `depressed` tiene `derivar_cvv: true`. En el `SaludService`, el protocolo de crisis evalúa `nota_semanal < 4`. El fallback del agente para `depressed` debe ser empático PERO el sistema ya maneja la derivación al CVV automáticamente cuando la nota es < 4. Si el usuario pone nota 7 y mood `depressed`, el sistema NO va a derivar al CVV (porque `nota >= 4`). La recomendación del CVV en el mensaje de fallback es un extra de seguridad por si el agente real de Groq no responde.

#### Archivo 3: Refactorizar `SaludRequest` en `backend/app/schemas/salud.py`

**Antes:**
```python
class SaludRequest(SQLModel):
    usuario_id: UUID
    humor: Mood
    nota_semanal: int = Field(ge=1, le=10)
    contexto: str | None = None
```

**Después:**
```python
from uuid import UUID  # Ya no se necesita para el request

class SaludRequest(SQLModel):
    humor: Mood
    nota_semanal: int = Field(ge=1, le=10)
    contexto: str | None = None
```

**¿Por qué eliminar `usuario_id` del request?** Porque ahora el `user_id` viene del token JWT validado por `get_current_user`. Si lo dejás en el body, un usuario malicioso podría enviar `usuario_id` de otra persona y registrar check-ins a nombre de ella. Con `get_current_user`, el backend IGNORA lo que diga el body y usa el ID del token.

#### Archivo 4: Refactorizar `SaludService` en `backend/app/services/salud.py`

El cambio es sutil pero CRÍTICO. Buscá TODAS las ocurrencias de `request.usuario_id` y reemplazalas por el `user_id` que ahora llega COMO PARÁMETRO del método (no desde el request).

**Antes:**
```python
async def procesar_checkin(self, request: SaludRequest) -> SaludResponse:
    usuario = get_user_by_id(self.session, request.usuario_id)
    # ...
```

**Después:**
```python
from uuid import UUID

async def procesar_checkin(self, request: SaludRequest, user_id: UUID) -> SaludResponse:
    usuario = get_user_by_id(self.session, user_id)
    # ...
```

Y en los métodos privados `_responder_crisis` y `_responder_bienestar`, también reemplazá `request.usuario_id` por `user_id`:

```python
def _responder_crisis(self, request: SaludRequest, user_id: UUID) -> SaludResponse:
    log = MentalHealthLog(
        user_id=user_id,  # ← antes era request.usuario_id
        mood=request.humor,
        # ... resto igual
    )

async def _responder_bienestar(self, request: SaludRequest, user_id: UUID) -> SaludResponse:
    log = MentalHealthLog(
        user_id=user_id,  # ← antes era request.usuario_id
        mood=request.humor,
        # ... resto igual
    )
```

**Buscá con Ctrl+F `usuario_id` en TODO el archivo.** Cada ocurrencia debe cambiarse. Si se te escapa una, el endpoint va a fallar con `AttributeError: 'SaludRequest' has no attribute 'usuario_id'`.

#### Archivo 5: Refactorizar el router en `backend/app/routers/salud.py`

**Antes:**
```python
@router.post("", response_model=SaludResponse)
async def checkin_emocional(
    request: SaludRequest,
    session: Session = Depends(get_session),
):
    service = SaludService(session)
    return await service.procesar_checkin(request)
```

**Después:**
```python
from app.core.security import get_current_user
from app.models.user import User

@router.post("", response_model=SaludResponse)
async def checkin_emocional(
    request: SaludRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Procesa el check-in emocional diario.

    El usuario se obtiene del token JWT, no del body del request.
    """
    service = SaludService(session)
    return await service.procesar_checkin(request, current_user.id)
```

**Concepto clave:** `current_user.id` es un `UUID`. Se lo pasás al service que ahora espera `user_id: UUID`. El `usuario_id` que antes venía en el body del request YA NO SE USA — de hecho, el schema `SaludRequest` ya ni lo tiene.

### Verificación

```bash
# 1. App carga sin errores
python -c "from app.main import app; print('App OK')"

# 2. Tests existentes
python -m pytest tests/ -v
# Si algún test usa SaludRequest con usuario_id, va a fallar. Actualizalo.

# 3. Levantá el servidor
uvicorn app.main:app --reload
```

En Swagger, primero obtené un token con `POST /auth/login`, ponelo en el candado 🔒, y probá estos escenarios:

**A) Check-in con mood nuevo (stressed):**
```json
POST /salud
{
  "humor": "stressed",
  "nota_semanal": 6,
  "contexto": "sprint deadline mañana"
}
```
**Esperado:** 200 OK. `derivar_cvv: false`. La respuesta contiene un mensaje personalizado para estrés.

**B) Check-in con mood nuevo (angry):**
```json
POST /salud
{
  "humor": "angry",
  "nota_semanal": 5,
  "contexto": "discusión con un compañero"
}
```
**Esperado:** 200 OK. La respuesta es empática, sin derivación a CVV (nota >= 4).

**C) Check-in con mood nuevo (depressed) + nota baja:**
```json
POST /salud
{
  "humor": "depressed",
  "nota_semanal": 2,
  "contexto": "no tengo ganas de nada"
}
```
**Esperado:** 200 OK. `derivar_cvv: true`, `alerta: true`. El protocolo de crisis se activa por nota < 4.

**D) Verificar que `usuario_id` en body es IGNORADO:**
En Swagger, el schema de `SaludRequest` YA NO DEBE mostrar el campo `usuario_id`. Si todavía aparece, no actualizaste bien el schema.

**E) Sin token (prueba de seguridad):**
Quitá el token del candado y ejecutá `POST /salud`.
**Esperado:** 401 Unauthorized. Ya no se puede hacer check-in sin autenticación.

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `AttributeError: 'SaludRequest' object has no attribute 'usuario_id'` | Queda algún `request.usuario_id` en `salud.py` que no cambiaste | Ctrl+F `usuario_id` en TODO el archivo de service. Cada ocurrencia debe usar `user_id`. |
| `422 Unprocessable Entity` | Swagger muestra `usuario_id` como campo requerido pero ya no existe en el schema | Verificá que `SaludRequest` no tenga el campo `usuario_id`. Si lo borraste pero Swagger muestra el schema viejo, reiniciá el servidor (uvicorn --reload a veces cachea). |
| `ValueError: 'stressed' is not a valid Mood` | El enum `Mood` no tiene el nuevo valor | Verificá que `STRESSED = "stressed"` esté en `mood.py` y que hayas guardado el archivo |
| `KeyError: 'stressed'` en el agente de IA | El diccionario de fallback no tiene entrada para el nuevo mood | Agregá la entrada al `_fallback_responses` en `ia_agent.py` |
| `ImportError: cannot import name 'get_current_user'` | No estás basado en la rama de INT-00 | `git merge incidencia/int-00-auth-middleware` o asegurate de que `get_current_user` existe en `security.py` |
| Tests que usan `SaludRequest(usuario_id=..., ...)` fallan | El constructor de `SaludRequest` ya no acepta `usuario_id` | Actualizá los tests: eliminá `usuario_id` de la creación del request. Si el test necesita un usuario, crealo con `get_user_by_id` o mockeá `get_current_user`. |

### Criterios de aceptación INT-01

- [ ] `Mood` tiene 8 valores: `happy`, `tired`, `sad`, `anxious`, `overwhelmed`, `stressed`, `angry`, `depressed`
- [ ] `SaludRequest` NO tiene campo `usuario_id`
- [ ] `POST /salud` requiere autenticación (sin token → 401)
- [ ] `POST /salud` con token válido obtiene el `user_id` del JWT, no del body
- [ ] Check-in con `humor: "stressed"` y nota ≥ 4 funciona (respuesta de IA o fallback)
- [ ] Check-in con `humor: "angry"` y nota ≥ 4 funciona
- [ ] Check-in con `humor: "depressed"` y nota < 4 activa protocolo de crisis (`derivar_cvv: true`)
- [ ] Los moods originales (`happy`, `tired`, `sad`, `anxious`, `overwhelmed`) siguen funcionando
- [ ] El agente de IA tiene fallbacks para los 3 nuevos moods
- [ ] Swagger muestra los 8 valores en el dropdown de `humor`
- [ ] Tests existentes que no dependen de `usuario_id` en `SaludRequest` siguen pasando
- [ ] Commit con: `feat(salud): extender moods a 7 y proteger endpoint con JWT`

---

## 🔄 Actualizaciones durante la integración real

### Textos de fallback más concisos

Los textos de fallback para los nuevos moods en `ia_agent.py` son versiones más concisas que las del spec original. El contenido semántico es equivalente pero la redacción es más directa:

- **stressed:** "El estrés es la respuesta del cuerpo ante la exigencia. Lo que sentís es válido, y también es temporal." (spec original: versión más larga con técnica 5-4-3-2-1)
- **angry:** "El enojo es energía — no lo reprimas, pero tampoco dejes que te controle." (spec original: incluía ejercicio de escribir y romper papel)
- **depressed:** Mantiene la derivación al CVV (188) pero con texto más breve.

### Constantes `MENSAJE_CRISIS` y `ACCION_CRISIS`

El spec no menciona estas constantes, pero el código las define a nivel módulo en `services/salud.py`:

```python
# backend/app/services/salud.py
MENSAJE_CRISIS = (
    "Reconocemos que este es un momento difícil. "
    "No estás solo. El CVV — Centro de Valorización de la Vida "
    "está disponible 24 horas al 188 de forma gratuita y confidencial."
)
ACCION_CRISIS = "Llamar ahora al 188 — CVV (gratuito, 24h, confidencial)"
```

Estas constantes se usan en `_responder_crisis()` cuando `nota_semanal < 4`, reemplazando la respuesta del agente de IA con un mensaje determinista de emergencia.

### `usuario_id` en `MentalHealthLog`

El spec menciona que `_responder_crisis` y `_responder_bienestar` crean un `MentalHealthLog` con `user_id=user_id`. En el código real, el modelo `MentalHealthLog` se crea en `_guardar_log()` con:

```python
log = MentalHealthLog(
    user_id=user_id,
    mood=request.humor,
    weekly_score=request.nota_semanal,
    contexto=request.contexto,
)
```

---
