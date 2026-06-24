import json

from groq import AsyncGroq

from app.core.config import settings


class IAAgent:
    """Agente de bienestar emocional usando Groq (Llama 3.1).

    ATENCIÓN — CONTRATO CON EL EQUIPO:
    Esta clase:
    - GENERA respuestas empáticas y sugerencias de bienestar.
    - NO evalúa si el usuario está en crisis (eso es SaludService).
    - NO diagnostica, receta ni actúa como psicólogo.
    - Si la API falla, devuelve un fallback predefinido.

    La firma de generar_respuesta_emocional() NO DEBE CAMBIAR.
    """

    def __init__(self):
        """Inicializa el cliente asincrónico de Groq."""
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL

    async def generar_respuesta_emocional(
        self, humor: str, nota: int, contexto: str | None
    ) -> dict[str, str]:
        """Genera un mensaje empático y acción concreta usando Groq.

        Args:
            humor: Estado emocional (valores del enum Mood).
            nota: Bienestar 1-10. SOLO se reciben valores >= 4.
                  La validación nota < 4 → crisis la hace SaludService.
            contexto: Info adicional opcional.

        Returns:
            dict con claves "mensaje" y "accion".
        """
        messages = self._construir_messages(humor, nota, contexto)

        try:
            response = await self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=0.7,
                max_tokens=300,
                response_format={"type": "json_object"},
            )
            return self._sanear_respuesta(
                self._limpiar_respuesta(
                    response.choices[0].message.content
                ),
                humor,
            )
        except Exception as e:
            print(f"[IAAgent] Groq falló, usando fallback. Error: {e}")
            return self._fallback(humor)

    # ------------------------------------------------------------------
    # Métodos privados
    # ------------------------------------------------------------------

    def _construir_messages(
        self, humor: str, nota: int, contexto: str | None
    ) -> list[dict[str, str]]:
        """Construye la lista de mensajes system + user para Groq."""
        contexto_str = contexto or "No proporcionado"

        system = (
            "Eres un acompañante empático para una persona sub-representada "
            "en tecnología en LATAM.\n\n"
            "Reglas estrictas:\n"
            "- NO diagnostiques ni recetes medicación.\n"
            "- Máximo 2 oraciones en total. Sé cálido y humano.\n"
            "- Responde en español neutro, breve, sin regionalismos.\n"
            "- La acción debe ser CONCRETA (nombre real de podcast, libro o técnica).\n"
            '- NUNCA digas "haz ejercicio", "descansa" o frases genéricas.\n'
            "- Responde SOLO este JSON exacto, sin backticks ni texto extra:\n"
            '{"mensaje": "...", "accion": "..."}'
        )

        user = (
            f"Estado: se siente {humor}, nota {nota}/10, "
            f"contexto: {contexto_str}"
        )

        return [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]

    def _limpiar_respuesta(self, texto: str) -> dict[str, str]:
        """Limpia la respuesta y la convierte a dict.

        Los modelos a veces devuelven JSON envuelto en backticks de markdown,
        o con texto antes/después del JSON. Esta función lo limpia.
        """
        texto = texto.strip()

        # Quitar backticks de markdown si existen
        if texto.startswith("```"):
            primera_linea = texto.find("\n")
            if primera_linea != -1:
                texto = texto[primera_linea + 1:]
            ultimo_backtick = texto.rfind("```")
            if ultimo_backtick != -1:
                texto = texto[:ultimo_backtick]
            texto = texto.strip()

        # Extraer el primer objeto JSON si hay texto alrededor
        inicio = texto.find("{")
        fin = texto.rfind("}")
        if inicio != -1 and fin != -1:
            texto = texto[inicio:fin + 1]

        return json.loads(texto)

    def _sanear_respuesta(
        self, data: dict, humor: str
    ) -> dict[str, str]:
        """Garantiza que la respuesta tenga las claves 'mensaje' y 'accion'.

        Si el modelo omite alguna clave, se usa el fallback para ese humor.
        """
        if "mensaje" not in data or "accion" not in data:
            return self._fallback(humor)
        return {"mensaje": data["mensaje"], "accion": data["accion"]}

    def _fallback(self, humor: str) -> dict[str, str]:
        """Respuestas de emergencia si la API no responde.

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
            "stressed": {
                "mensaje": "El estrés es la respuesta del cuerpo ante la exigencia. Lo que sentís es válido, y también es temporal.",
                "accion": "Probá la técnica 5-4-3-2-1: nombrá 5 cosas que ves, 4 que tocás, 3 que escuchás, 2 que olés y 1 que saboreás.",
            },
            "angry": {
                "mensaje": "El enojo es energía — no lo reprimas, pero tampoco dejes que te controle. Esa intensidad, bien canalizada, puede mover montañas.",
                "accion": "Escribí todo lo que te enoja en un papel, sin filtro. Después rompelo en pedacitos. Libera tensión acumulada.",
            },
            "depressed": {
                "mensaje": "Hoy no voy a llenarte de frases motivacionales. Solo quiero que sepas que tu dolor es real y no estás exagerando. El simple hecho de haberte levantado hoy ya es una victoria.",
                "accion": "Llamá al CVV — Centro de Valorización de la Vida: 188. Es gratuito, confidencial y disponible 24 horas. No estás solo en esto.",
            },
        }
        return respuestas.get(humor, respuestas["sad"])
