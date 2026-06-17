## INCIDENCIA 06 — Migrar agente de IA de Gemini a Groq

## Resumen

Esta incidencia reemplaza Google Gemini como proveedor de IA por Groq (Llama 3.1 8B Instant). El cambio es transparente para el resto del equipo: la firma de `IAAgent.generar_respuesta_emocional()` no cambia y los servicios que la consumen (`SaludService`) no requieren ninguna modificación. Groq ofrece JSON mode nativo (`response_format={"type": "json_object"}`) y una cuota gratuita 720x mayor que Gemini.

**Rama:** `incidencia/06-migrar-groq`  
**Duración estimada:** 2-3 horas.  
**Depende de:** 03 terminada (el agente ya existe con Gemini).  
**Asignada a:** 1 dev.

### ¿Por qué migrar?

| | Gemini (antes) | Groq (ahora) |
|---|---|---|
| Modelo | gemini-2.5-flash | llama-3.1-8b-instant |
| Requests por día | 20 | ~14,400 |
| Requests por minuto | 5-10 | 30 |
| JSON mode nativo | `response_mime_type` en config | `response_format={"type": "json_object"}` |
| SDK | `google-generativeai` | `groq` |

### ¿Qué vas a aprender?

| Concepto | ¿Qué es? |
|----------|---------|
| API de chat (system + user) | Separar instrucciones del sistema de los datos del usuario |
| `response_format` | JSON mode nativo en APIs OpenAI-compatibles |
| `_sanear_respuesta()` | Defensa contra modelos que omiten claves del JSON |
| SDK de Groq | `AsyncGroq` client, `chat.completions.create()` |

### Pre-lectura (15 min)

1. [Groq API Docs — Chat Completions](https://console.groq.com/docs/api-reference#chat-create)
2. `app/services/ia_agent.py` actual — entendé la estructura antes de cambiarla
3. `app/core/config.py` — verificá `GROQ_API_KEY` y `GROQ_MODEL`

### Antes de codear

**Conseguí tu API key de Groq:**
1. Andá a https://console.groq.com/keys
2. Creá una API key
3. Agregala a `backend/.env`:
   ```
   GROQ_API_KEY=gsk_... (tu key real)
   GROQ_MODEL=llama-3.1-8b-instant
   ```
4. Eliminá las variables viejas de Gemini del `.env` (`IA_API_KEY`, `IA_MODEL`)
5. Verificá que carga:
   ```bash
   python -c "from app.core.config import settings; print(settings.GROQ_API_KEY[:10] + '...')"
   ```

### Flujo git

```bash
git checkout develop
git pull origin develop
git checkout -b incidencia/06-migrar-groq
```

### Archivos a modificar

| Archivo | Acción |
|---------|--------|
| `backend/app/core/config.py` | Remover `IA_API_KEY`, `IA_MODEL`. Agregar `GROQ_API_KEY`, `GROQ_MODEL`. |
| `backend/app/services/ia_agent.py` | Reemplazar SDK de Gemini por SDK de Groq. |
| `backend/requirements.txt` | Remover `google-generativeai==0.8.4`. Agregar `groq>=0.18.0`. |

### Paso a paso

#### 1. Instalar dependencia

```bash
pip install groq
```

#### 2. `app/core/config.py` — Cambiar credenciales

```python
# Groq — LLM para el agente de bienestar (IA)
GROQ_API_KEY: str = ""
GROQ_MODEL: str = "llama-3.1-8b-instant"
```

#### 3. `app/services/ia_agent.py` — Reescritura del SDK

**Cambios clave respecto a Gemini:**

```python
# ANTES (Gemini)
import google.generativeai as genai
genai.configure(api_key=settings.IA_API_KEY)
self.model = genai.GenerativeModel(model_name=..., generation_config={...})
response = await self.model.generate_content_async(prompt)
return self._limpiar_respuesta(response.text)

# DESPUÉS (Groq)
from groq import AsyncGroq
self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
response = await self.client.chat.completions.create(
    messages=messages,
    model=self.model,
    temperature=0.7,
    max_tokens=300,
    response_format={"type": "json_object"},
)
return self._sanear_respuesta(
    self._limpiar_respuesta(response.choices[0].message.content),
    humor,
)
```

**Nuevo método `_construir_messages()`:**

Groq usa formato chat (system + user), no string único como Gemini:

```python
def _construir_messages(self, humor, nota, contexto):
    return [
        {"role": "system", "content": "Eres un acompañante empático..."},
        {"role": "user", "content": f"Estado: {humor}, nota {nota}/10..."},
    ]
```

**Nuevo método `_sanear_respuesta()`:**

Llama 3.1 a veces omite la clave `accion` del JSON. Este método garantiza que ambas claves existan:

```python
def _sanear_respuesta(self, data: dict, humor: str) -> dict[str, str]:
    if "mensaje" not in data or "accion" not in data:
        return self._fallback(humor)
    return {"mensaje": data["mensaje"], "accion": data["accion"]}
```

#### 4. `requirements.txt`

```
groq>=0.18.0
```

### Verificación

```bash
python -c "
import asyncio
from app.services.ia_agent import IAAgent

async def probar():
    agente = IAAgent()
    for humor in ['happy', 'tired', 'sad', 'anxious', 'overwhelmed']:
        r = await agente.generar_respuesta_emocional(humor, 7, 'trabajando desde casa')
        print(f'{humor}: mensaje={r[\"mensaje\"][:60]}... accion={r[\"accion\"][:60]}...')

asyncio.run(probar())
"
```

**Esperado:** Los 5 moods devuelven mensaje y acción generados por IA, sin fallbacks.

### Errores específicos de esta incidencia

| Error | Causa | Solución |
|-------|-------|----------|
| `Connection error` | `GROQ_API_KEY` vacía o inválida | Verificá que esté en `.env` y cargue correctamente |
| `KeyError: 'accion'` | Llama omitió la clave en el JSON | `_sanear_respuesta()` lo detecta y usa fallback |
| `json.JSONDecodeError` | La respuesta no es JSON válido | `_limpiar_respuesta()` extrae `{...}` del texto |
| Respuestas en inglés | El system prompt no es claro | Reforzar "Responde en español neutro" en el prompt |

### Criterios de aceptación

- [ ] Los 5 moods devuelven JSON válido desde Groq (no fallback)
- [ ] Cada respuesta tiene `mensaje` y `accion`
- [ ] Las respuestas están en español neutro
- [ ] Las acciones son concretas (nombres reales de recursos)
- [ ] La API key se lee de `settings.GROQ_API_KEY` (no hardcodeada)
- [ ] `_sanear_respuesta()` protege contra claves faltantes
- [ ] Sin referencias a Gemini en el código fuente
- [ ] `.env` no contiene `IA_API_KEY` ni `IA_MODEL`
- [ ] Commit con: `feat(ia): migrar agente de Gemini a Groq (Llama 3.1)`
