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
                texto = texto[primera_linea + 1:]
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
