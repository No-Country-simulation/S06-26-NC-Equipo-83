## INCIDENCIA 03 — Agente de IA con Google Gemini (Real)

## Resumen

Esta incidencia reemplaza el agente de inteligencia artificial temporal por una conexión real con Google Gemini. El nuevo agente genera mensajes empáticos personalizados según el estado emocional de cada persona y sugiere acciones concretas de bienestar con nombres reales de recursos como podcasts, libros o técnicas específicas. Incluye un mecanismo de respaldo: si la inteligencia artificial falla por falta de internet o límites de uso, el sistema automáticamente devuelve respuestas seguras predefinidas sin interrumpir el funcionamiento.

**Rama:** `incidencia/03-ia-agent`  
**Duración estimada:** 1 día (6-8 horas). La mitad del tiempo es código, la otra mitad es iterar el prompt.  
**Depende de:** 01 terminada (necesita `settings.IA_API_KEY`). NO depende de 02a ni 02b.  
**Asignada a:** 1 dev. Ideal para quien tenga más paciencia con pruebas iterativas.  
**Por qué este orden:** Se hace en paralelo con 02a/02b. Cuando terminás, el dev de salud (04) reemplaza el stub por tu implementación sin tocar una línea de su código.

### ¿Qué vas a aprender?

| Concepto | ¿Qué es? |
|----------|---------|
| `async/await` | Funciones asincrónicas — no bloquean el servidor mientras esperan respuesta de Gemini |
| SDK de Google Gemini | Llamadas a un LLM desde Python, configuración de temperatura, tokens, formato de respuesta |
| `json.loads()` | Convertir un string JSON en un diccionario de Python |
| `try/except Exception` | Manejar errores sin que el servidor se caiga — si Gemini falla, damos fallback |
| Prompt engineering | Cómo escribir instrucciones para que un LLM responda EXACTAMENTE lo que necesitás |

### Pre-lectura (30 min)

1. [Google AI Studio — Quickstart Python](https://ai.google.dev/gemini-api/docs/quickstart?lang=python) — 10 minutos
2. `app/core/config.py` — verificá que `settings.IA_MODEL` y `settings.IA_API_KEY` existen
3. `app/services/ia_agent.py` actual (el stub) — **tu trabajo es REESCRIBIR este archivo**, no crear uno nuevo. La firma de `generar_respuesta_emocional` NO puede cambiar.

### Antes de codear

**Conseguí tu API key:**
1. Andá a https://aistudio.google.com/apikey
2. Click en "Create API Key"
3. Copiala
4. Abrí tu archivo `backend/.env` y reemplazá el placeholder:
   ```
   IA_API_KEY=AIzaSy... (tu key real)
   ```
5. Verificá que carga:
   ```bash
   python -c "from app.core.config import settings; print(settings.IA_API_KEY[:10] + '...')"
   ```
   Debe mostrar el inicio de TU key, no "tu-api-key...".

### Flujo git

```bash
git checkout main
git pull origin main
git checkout -b incidencia/03-ia-agent
```

### Archivo único: Reescribir `backend/app/services/ia_agent.py`

**Abrí el archivo que creó la incidencia 01. Borrá todo su contenido y reemplazalo por esto:**

```python
import json
import google.generativeai as genai
from app.core.config import settings


# ---------------------------------------------------------------------------
# Configuración global del SDK de Gemini.
# Se ejecuta UNA sola vez cuando Python importa este módulo.
# ---------------------------------------------------------------------------
genai.configure(api_key=settings.IA_API_KEY)


class IAAgent:
    """Agente de bienestar emocional usando Google Gemini.

    ATENCIÓN — CONTRATO CON EL EQUIPO:
    Esta clase:
    - GENERA respuestas empáticas y sugerencias de bienestar.
    - NO evalúa si el usuario está en crisis (eso es SaludService).
    - NO diagnostica, receta ni actúa como psicólogo.
    - Si Gemini falla, devuelve un fallback predefinido.

    La firma de generar_respuesta_emocional() NO DEBE CAMBIAR.
    El dev de /salud ya la está usando con el stub.
    """

    def __init__(self):
        """Inicializa el modelo de Gemini con configuración para JSON."""
        self.model = genai.GenerativeModel(
            model_name=settings.IA_MODEL,
            generation_config={
                "temperature": 0.7,          # Creatividad media-alta
                "top_p": 0.9,                # Diversidad en respuestas
                "max_output_tokens": 150,    # Respuestas breves
                "response_mime_type": "application/json",  # Forzar JSON
            },
        )

    async def generar_respuesta_emocional(
        self, humor: str, nota: int, contexto: str | None
    ) -> dict[str, str]:
        """Genera un mensaje empático y acción concreta usando Gemini.

        Args:
            humor: Estado emocional (valores del enum Mood).
            nota: Bienestar 1-10. SOLO se reciben valores >= 4.
                  La validación nota < 4 → crisis la hace SaludService.
            contexto: Info adicional opcional.

        Returns:
            dict con claves "mensaje" y "accion".
        """
        prompt = self._construir_prompt(humor, nota, contexto)

        try:
            response = await self.model.generate_content_async(prompt)
            return self._limpiar_respuesta(response.text)
        except Exception as e:
            # Si Gemini falla (sin internet, cuota excedida, error de
            # API), no crasheamos — devolvemos un fallback seguro.
            print(f"[IAAgent] Gemini falló, usando fallback. Error: {e}")
            return self._fallback(humor)

    # ------------------------------------------------------------------
    # Métodos privados (el _ al principio es convención Python:
    # "esto es interno, no lo uses desde afuera de la clase")
    # ------------------------------------------------------------------

    def _construir_prompt(self, humor: str, nota: int, contexto: str | None) -> str:
        """Construye el prompt completo con sistema + usuario."""
        contexto_str = contexto or "No proporcionado"

        return f"""Eres un acompañante empático para una persona de un grupo 
sub-representado en tecnología en LATAM. Validás sus emociones y 
sugerís UNA acción concreta de bienestar cotidiano.

Reglas estrictas:
- NO diagnostiques. NO recetes medicación. NO actúes como psicólogo.
- Sé cálido y humano. Máximo 3 oraciones en total.
- Hablá en español rioplatense (usá "vos" en lugar de "tú" o "usted").
- La acción debe ser CONCRETA: nombre real de un podcast, libro con 
  autor, ejercicio específico. NUNCA digas "hacé ejercicio".
- Respondé ÚNICA y EXCLUSIVAMENTE un objeto JSON válido, sin texto 
  antes ni después, sin backticks de markdown:
  {{"mensaje": "...", "accion": "..."}}

Estado actual de la persona:
- Se siente: {humor}
- Nivel de bienestar general: {nota}/10
- Contexto compartido: {contexto_str}"""

    def _limpiar_respuesta(self, texto: str) -> dict[str, str]:
        """Limpia la respuesta de Gemini y la convierte a dict.

        Gemini a veces devuelve JSON envuelto en backticks de markdown:
        ```json
        {"mensaje": "...", "accion": "..."}
        ```
        O con texto antes/después del JSON. Esta función lo limpia.
        """
        texto = texto.strip()

        # Quitar backticks de markdown si existen
        if texto.startswith("```"):
            # Encontrar el primer salto de línea (fin de ```json)
            primera_linea = texto.find("\n")
            if primera_linea != -1:
                texto = texto[primera_linea + 1 :]
            # Buscar el ÚLTIMO ``` y cortar ahí
            ultimo_backtick = texto.rfind("```")
            if ultimo_backtick != -1:
                texto = texto[:ultimo_backtick]
            texto = texto.strip()

        return json.loads(texto)

    def _fallback(self, humor: str) -> dict[str, str]:
        """Respuestas de emergencia si la API de Gemini no responde.

        Las claves DEBEN coincidir con los valores del enum Mood:
        "happy", "tired", "sad", "anxious", "overwhelmed"
        """
        respuestas = {
            "happy": {
                "mensaje": "¡Qué bueno verte así! Disfrutá este momento y guardalo en la memoria.",
                "accion": "Compartí tu energía con alguien que la necesite hoy.",
            },
            "tired": {
                "mensaje": "El descanso también es avanzar. No subestimes una pausa.",
                "accion": "Salí a caminar 15 minutos sin el celular. Solo mirá los árboles.",
            },
            "sad": {
                "mensaje": "Te escucho. No todos los días pesan lo mismo.",
                "accion": "Escuchá 'El poder de la vulnerabilidad' de Brené Brown en YouTube.",
            },
            "anxious": {
                "mensaje": "Respirá hondo conmigo. Un paso a la vez, no todo tiene que resolverse hoy.",
                "accion": "Probá la técnica 4-7-8: inhalá 4 segundos, retené 7, exhalá 8. Tres veces.",
            },
            "overwhelmed": {
                "mensaje": "No cargues todo solo. Pedir ayuda también es valentía.",
                "accion": "Elegí UNA sola tarea, la más chica, y hacela. El resto puede esperar.",
            },
        }
        return respuestas.get(humor, respuestas["sad"])
```

**El método `_limpiar_respuesta()` es crítico.** Gemini 2.0 Flash con `response_mime_type="application/json"` DEBERÍA devolver JSON limpio... pero a veces agrega backticks de markdown o texto antes del JSON. Esta función lo limpia sí o sí. Si no lo hacés, `json.loads()` va a tirar `JSONDecodeError` y el usuario va a recibir un fallback genérico en vez de la respuesta de IA.

### Iterá el prompt — este es el trabajo real

El código de arriba es un punto de partida. El verdadero trabajo de esta incidencia es probar y ajustar el prompt hasta que:

1. **Siempre devuelva JSON válido.** Si ves `JSONDecodeError` en los logs, el prompt no está siendo lo suficientemente estricto.
2. **Responda en español rioplatense.** Si ves "tú" en vez de "vos", ajustá.
3. **Las acciones sean ESPECÍFICAS.** "Hacé ejercicio" → MAL. "Caminá 15 minutos por tu barrio sin mirar el celular" → BIEN.

**Script de prueba (ejecutalo CADA VEZ que cambies el prompt):**

```bash
python -c "
import asyncio
from app.services.ia_agent import IAAgent

async def probar():
    agente = IAAgent()
    humores = ['happy', 'tired', 'sad', 'anxious', 'overwhelmed']
    for humor in humores:
        r = await agente.generar_respuesta_emocional(humor, 7, 'trabajando desde casa')
        print(f'{humor}: {r[\"mensaje\"][:80]}...')

asyncio.run(probar())
"
```

Ejecutá esto al menos 3 veces. Si en alguna falla con `JSONDecodeError`, mejorá `_limpiar_respuesta()` o endurecé más el prompt.

### Errores específicos de esta incidencia

| Error | Causa | Solución |
|-------|-------|----------|
| `json.decoder.JSONDecodeError: Expecting value` | Gemini no devolvió JSON — devolvió texto libre, markdown, o un error | Mejorá `_limpiar_respuesta()` para manejar backticks. Probá agregar `response_mime_type="application/json"` (ya está en el código de arriba). |
| `google.api_core.exceptions.ResourceExhausted: 429` | Superaste la cuota gratuita de Gemini | Esperá unos minutos o creá otra API key. La cuota gratuita es generosa pero no infinita. |
| `RuntimeError: This event loop is already running` | Estás en un entorno que ya tiene un event loop (como Jupyter) | En vez de `asyncio.run()`, usá `await agente.generar_respuesta_emocional(...)` directamente |
| `NameError: name 'genai' is not defined` | No importaste `google.generativeai` | `import google.generativeai as genai` al principio del archivo |
| Gemini responde en inglés | El prompt no especifica claramente el idioma | Reforzá "Hablá en español rioplatense" en el prompt |

### Criterios de aceptación Incidencia 03

- [ ] `generar_respuesta_emocional("happy", 7, None)` devuelve `{"mensaje": "...", "accion": "..."}`
- [ ] Funciona para los 5 humores del enum Mood
- [ ] Las respuestas están en español rioplatense (voseo)
- [ ] Las acciones son concretas (contienen nombres reales)
- [ ] Si la API key es inválida o no hay internet, usa `_fallback()` sin crashear
- [ ] La API key NUNCA está hardcodeada — se lee de `settings.IA_API_KEY`
- [ ] El archivo NO importa schemas de HTTP (nada de `SaludRequest`, `FastAPI`, etc.)
- [ ] La firma de `generar_respuesta_emocional` es IDÉNTICA a la del stub de 01
- [ ] Commit con: `feat(ia): implementar agente de bienestar con Google Gemini`

---
