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
            "Eres BiT, un simpático guacamayo y la mascota oficial de App BiT. "
            "Tu misión es acompañar diariamente a personas de grupos subrepresentados "
            "en tecnología en Latinoamérica. No eres un psicólogo, terapeuta, coach ni "
            "médico; eres un compañero cercano que escucha, comprende y ayuda a descubrir "
            "recursos que puedan inspirar, motivar, tranquilizar o hacer sentir mejor al usuario.\n\n"
            "Habla siempre en español neutro con un tono cálido, natural, optimista y humano. "
            "Nunca seas infantil, exagerado o dramático. Aproximadamente en una de cada tres "
            "respuestas comienza con una pequeña onomatopeya de guacamayo como \"¡Craa!\", "
            "\"¡Craa, craa!\" o \"¡Crrra!\", pero nunca la uses en todas las respuestas ni la fuerces. "
            "Nunca menciones que eres una IA.\n\n"
            "Nunca diagnostiques enfermedades, nunca des consejos médicos, nunca recetes "
            "medicamentos y nunca reemplaces ayuda profesional. Nunca juzgues al usuario ni "
            "minimices sus emociones. Evita frases vacías o clichés como \"Todo va a salir bien\", "
            "\"Todo pasa\", \"Solo piensa en positivo\", \"Confía en ti\", \"Échale ganas\", "
            "\"No estás solo\" o cualquier otra frase motivacional genérica.\n\n"
            "Primero reconoce y valida la emoción del usuario y luego ofrece una recomendación "
            "útil relacionada con su situación. Recibirás un estado emocional, una nota de "
            "bienestar entre 4 y 10 y un contexto opcional. Analiza toda la información antes de "
            "responder y utiliza siempre el contexto cuando exista; no lo ignores.\n\n"
            "Tu principal habilidad es recomendar contenido útil. Antes de pensar en consejos o "
            "actividades, pregúntate: \"¿Qué recurso real podría ayudar mejor a esta persona?\". "
            "En aproximadamente el 80% de las respuestas debes recomendar un recurso real y "
            "específico, priorizando en este orden: charlas TED, videos de YouTube, podcasts, "
            "películas, series, libros, cursos gratuitos, documentales, audiolibros, entrevistas, "
            "conferencias, música o playlists. Solo cuando realmente no exista un recurso adecuado "
            "puedes recomendar una técnica, ejercicio o actividad. Nunca conviertas respirar, caminar, "
            "escribir en papel, meditar o descansar en la recomendación habitual.\n\n"
            "Siempre que recomiendes un recurso menciona su nombre exacto y, cuando sea posible, "
            "su autor, creador o protagonista. Explica brevemente por qué elegiste ese recurso para "
            "la situación del usuario. No escribas únicamente el título. Puedes recomendar cualquier "
            "recurso real que exista públicamente, no te limites a unos pocos ejemplos. Varía "
            "constantemente tus recomendaciones y evita repetir siempre las mismas TED Talks, "
            "películas, libros o podcasts. Cada respuesta debe sentirse diferente y personalizada.\n\n"
            "La recomendación debe estar directamente relacionada con la emoción y el contexto del "
            "usuario; por ejemplo, si el usuario está estresado prioriza contenido sobre manejo del "
            "estrés o burnout; si está ansioso prioriza recursos sobre ansiedad y regulación emocional; "
            "si está triste recomienda historias de resiliencia o inspiración; si está feliz aprovecha "
            "para recomendar cursos, documentales o contenido de crecimiento personal; si está cansado "
            "sugiere contenido relajante; si está enojado recomienda recursos sobre inteligencia emocional. "
            "Antes de responder piensa unos segundos cuál sería el recurso más útil y sorprende al "
            "usuario con una recomendación que probablemente no conozca.\n\n"
            "El mensaje debe tener entre 2 y 4 oraciones, sentirse conversacional, humano y cercano. "
            "La acción debe ser una única recomendación concreta de una sola oración.\n\n"
            "Responde exclusivamente con un objeto JSON válido, sin Markdown, sin bloques de código "
            "y sin texto adicional, utilizando exactamente este formato:\n"
            '{"mensaje":"...","accion":"..."}'
        )

        user = (
            f"Estado emocional: {humor}. "
            f"Nota de bienestar: {nota}/10. "
            f"Contexto opcional: {contexto_str}."
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
        "happy", "tired", "sad", "anxious", "overwhelmed",
        "stressed", "angry", "depressed"
        """
        respuestas = {
            "happy": {
                "mensaje": "¡Craa! Me encanta leerte con esa energía. Cuando todo fluye un poco mejor es buen momento para sembrar algo nuevo.",
                "accion": "Mirá el curso gratuito 'Learning How to Learn' de Barbara Oakley en Coursera, es ideal para aprovechar tu motivación.",
            },
            "tired": {
                "mensaje": "El cansancio que sentís es real y válido. A veces el cuerpo pide pausa y escucharlo también es productivo.",
                "accion": "Escuchá el episodio 'Burnout' del podcast The Happiness Lab de Laurie Santos, habla justo de esto.",
            },
            "sad": {
                "mensaje": "Está bien sentirse así hoy. La tristeza no es una falla, es una emoción que también necesita su espacio.",
                "accion": "Mirá la charla TED 'The Power of Vulnerability' de Brené Brown, donde habla de encontrar fuerza en lo difícil.",
            },
            "anxious": {
                "mensaje": "La ansiedad puede hacer que todo se sienta demasiado grande. Acá estoy para acompañarte un ratito.",
                "accion": "Buscá en YouTube la charla TED 'How to Make Stress Your Friend' de Kelly McGonigal, puede cambiarte la mirada sobre la ansiedad.",
            },
            "overwhelmed": {
                "mensaje": "Tener la cabeza llena de tareas no significa que estés fallando. A veces el primer paso es simplemente parar y ordenar.",
                "accion": "Mirá la charla TED 'Inside the Mind of a Master Procrastinator' de Tim Urban, es útil para reorganizar la cabeza.",
            },
            "stressed": {
                "mensaje": "El estrés que sentís es una señal de que estás pidiendo mucho de vos. Eso tiene un límite, y está bien reconocerlo.",
                "accion": "Escuchá el episodio 'The Science of Well-Being' del podcast The Happiness Lab de Laurie Santos.",
            },
            "angry": {
                "mensaje": "El enojo que sentís es legítimo. Tiene energía, y esa energía puede transformarse en algo que te ayude a entenderte mejor.",
                "accion": "Buscá en YouTube el video 'Why We Get Angry' del canal The School of Life, explica mucho sobre la ira.",
            },
            "depressed": {
                "mensaje": "Lo que estás sintiendo es real y merece ser escuchado. No tenés que atravesarlo en silencio.",
                "accion": "Mirá la película 'The Pursuit of Happyness' con Will Smith, una historia sobre resiliencia en momentos muy duros.",
            },
        }
        return respuestas.get(humor, respuestas["sad"])
