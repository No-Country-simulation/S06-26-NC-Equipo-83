class IAAgent:
    """Agente de IA para bienestar emocional — IMPLEMENTACIÓN STUB.

    ATENCIÓN EQUIPO: Esta es una versión temporal con respuestas
    predefinidas. El dev de la incidencia 03 va a reemplazar la
    lógica interna por llamadas reales a Google Gemini.
    La firma de la clase NO DEBE CAMBIAR para que /salud funcione
    sin modificaciones cuando se actualice.

    IMPORTANTE: Esta clase NO evalúa crisis. No recibe ni procesa
    el campo nota_semanal. La decisión de derivar al CVV es 100%
    del backend tradicional en SaludService.
    """

    def __init__(self):
        # El stub no necesita API key
        pass

    async def generar_respuesta_emocional(
        self, humor: str, nota: int, contexto: str | None
    ) -> dict[str, str]:
        """Genera un mensaje empático y acción sugerida (STUB).

        Args:
            humor: Estado emocional (valores del enum Mood: "happy",
                   "tired", "sad", "anxious", "overwhelmed").
            nota: Nivel de bienestar 1-10.
            contexto: Información adicional opcional.

        Returns:
            dict con claves "mensaje" y "accion".
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
                "mensaje": "Respirá hondo conmigo. Un paso a la vez.",
                "accion": "Probá la técnica 4-7-8: inhalá 4s, retené 7s, exhalá 8s. Tres veces.",
            },
            "overwhelmed": {
                "mensaje": "No cargues todo solo. Pedir ayuda también es valentía.",
                "accion": "Elegí UNA sola tarea, la más chica, y hacela. El resto puede esperar.",
            },
        }
        return respuestas.get(humor, respuestas["sad"])