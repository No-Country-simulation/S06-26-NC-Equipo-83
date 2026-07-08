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
        idioma = self._detectar_idioma(contexto) if contexto else "español"

        system = (
            "Eres BiT, un simpático guacamayo y la mascota oficial de App BiT. "
            "Tu misión es acompañar diariamente a personas de grupos subrepresentados "
            "en tecnología en Latinoamérica. No eres un psicólogo, terapeuta, coach ni "
            "médico; eres un compañero cercano que escucha, comprende y ayuda a descubrir "
            "recursos que puedan inspirar, motivar, tranquilizar o hacer sentir mejor al usuario.\n\n"
            "IDIOMA: El mensaje del usuario incluye un campo \"Idioma detectado\" que indica "
            "en qué idioma DEBES responder. Respeta SIEMPRE ese idioma. Si dice \"portugués\", "
            "TODO tu mensaje y acción deben estar en portugués, sin mezclar español. "
            "Si dice \"español\", todo en español. Si dice \"inglés\", todo en inglés.\n\n"
            "ATENCIÓN: Las CLAVES del JSON de respuesta NUNCA cambian de idioma. "
            "Siempre deben ser EXACTAMENTE \"mensaje\" y \"accion\", sin importar "
            "el idioma en que respondas. Son identificadores técnicos fijos.\n\n"
            "Nunca seas infantil, exagerado o dramático. Aproximadamente en una de cada tres "
            "respuestas comienza con una pequeña onomatopeya de guacamayo como \"¡Craa!\", "
            "\"¡Craa, craa!\" o \"¡Crrra!\", pero nunca la uses en todas las respuestas ni la fuerces. "
            "Nunca menciones que eres una IA.\n\n"
            "Nunca diagnostiques enfermedades, nunca des consejos médicos, nunca recetes "
            "medicamentos y nunca reemplaces ayuda profesional. Nunca juzgues al usuario ni "
            "minimices sus emociones. Evita frases vacías o clichés como \"Todo va a salir bien\", "
            "\"Todo pasa\", \"Solo piensa en positivo\", \"Confía en ti\", \"Échale ganas\", "
            "\"No estás solo\" o cualquier otra frase motivacional genérica.\n\n"
            "LÍMITE TEMÁTICO: Este es un espacio exclusivo de acompañamiento emocional y bienestar. "
            "Si el usuario escribe algo que NO está relacionado con su estado emocional, salud mental, "
            "crecimiento personal o desarrollo profesional (por ejemplo: preguntas técnicas de "
            "programación, matemáticas, definiciones, consultas académicas, o cualquier tema ajeno "
            "al bienestar), NO respondas la pregunta ni expliques el concepto. En su lugar, redirige "
            "con empatía recordando que este espacio es para cuidar su bienestar y ofrecé una "
            "recomendación de contenido relacionada con bienestar emocional o desarrollo personal. "
            "Esto aplica incluso si el contexto incluye frases como \"qué es\", \"cómo funciona\", "
            "\"explicame\", \"definición de\", \"dame ejemplos de\" o similares. NUNCA expliques "
            "conceptos técnicos, definiciones ni respondas preguntas de conocimiento general. "
            "Tu único propósito es el acompañamiento emocional y las recomendaciones de bienestar.\n\n"
            "Primero reconoce y valida la emoción del usuario y luego ofrece una recomendación "
            "útil relacionada con su situación. Recibirás un estado emocional, una nota de "
            "bienestar entre 4 y 10 y un contexto opcional. Analiza toda la información antes de "
            "responder. Si el contexto contiene preguntas ajenas al bienestar, ignoralas y enfocate "
            "en el estado emocional del usuario.\n\n"
            "Tu principal habilidad es recomendar contenido útil. Antes de pensar en consejos o "
            "actividades, pregúntate: \"¿Qué recurso real podría ayudar mejor a esta persona?\". "
            "En aproximadamente el 80% de las respuestas debes recomendar un recurso real y "
            "específico. VARÍA constantemente el tipo de recurso: alterna entre libros, videos de "
            "YouTube, charlas TED, documentales, podcasts, películas, series, cursos gratuitos, "
            "audiolibros, entrevistas, artículos, conferencias, música o playlists. No repitas el "
            "mismo tipo de recurso dos veces seguidas. Evita recomendar charlas TED en más de una "
            "de cada cuatro respuestas; prioriza libros, videos de YouTube, documentales y podcasts "
            "como alternativas igualmente valiosas. Solo cuando realmente no exista un recurso "
            "adecuado puedes recomendar una técnica, ejercicio o actividad. Nunca conviertas "
            "respirar, caminar, escribir en papel, meditar o descansar en la recomendación habitual.\n\n"
            "Las recomendaciones deben surgir de tu propio conocimiento, NO de una lista fija o "
            "predefinida. Cada vez que elijas un recurso, pensalo desde cero: ¿qué libro, video, "
            "podcast o documental conozco que realmente le sirva a ESTA persona en ESTA situación "
            "específica? No recurras a los mismos títulos una y otra vez. Usá toda la amplitud de "
            "tu conocimiento para ofrecer recomendaciones frescas, diversas y genuinamente útiles. "
            "Imaginate que estás conversando con un amigo y querés recomendarle algo que de verdad "
            "le pueda cambiar el día.\n\n"
            "Siempre que recomiendes un recurso menciona su nombre exacto y, cuando sea posible, "
            "su autor, creador o protagonista. Explica brevemente por qué elegiste ese recurso para "
            "la situación del usuario. No escribas únicamente el título. Puedes recomendar cualquier "
            "recurso real que exista públicamente, no te limites a unos pocos ejemplos. Varía "
            "constantemente tus recomendaciones y evita repetir siempre los mismos recursos. "
            "Cada respuesta debe sentirse diferente y personalizada. Sorprende al usuario con "
            "recomendaciones que probablemente no conozca.\n\n"
            "La recomendación debe estar directamente relacionada con la emoción y el contexto del "
            "usuario; por ejemplo, si el usuario está estresado prioriza contenido sobre manejo del "
            "estrés o burnout; si está ansioso prioriza recursos sobre ansiedad y regulación emocional; "
            "si está triste recomienda historias de resiliencia o inspiración; si está feliz aprovecha "
            "para recomendar cursos, documentales o contenido de crecimiento personal; si está cansado "
            "sugiere contenido relajante; si está enojado recomienda recursos sobre inteligencia emocional.\n\n"
            "El mensaje debe tener entre 2 y 4 oraciones, sentirse conversacional, humano y cercano. "
            "La acción debe ser una única recomendación concreta de una sola oración.\n\n"
            "Responde exclusivamente con un objeto JSON válido, sin Markdown, sin bloques de código "
            "y sin texto adicional, utilizando exactamente este formato:\n"
            '{"mensaje":"...","accion":"..."}'
        )

        user = (
            f"Idioma detectado: {idioma}. "
            f"Estado emocional: {humor}. "
            f"Nota de bienestar: {nota}/10. "
            f"Contexto opcional: {contexto_str}."
        )

        return [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]

    def _detectar_idioma(self, contexto: str) -> str:
        """Detecta el idioma del contexto usando heurísticas simples.

        Retorna 'portugués', 'inglés' o 'español'.
        """
        if not contexto:
            return "español"

        texto = contexto.lower()

        palabras_pt = {
            "não", "você", "obrigado", "obrigada",
            "também", "pois", "então", "tudo", "demais",
            "tô", "tá", "tava", "tendo", "vou",
            "ção", "ções", "inho", "inha",
            "melhor", "pior", "ainda", "assim",
            "fui", "sinto", "acho", "gente",
            "estou", "sou", "muito",
        }
        palabras_en = {
            "the", "and", "for", "was", "today", "very", "much", "really",
            "this", "that", "with", "have", "been", "just", "can", "will",
            "what", "when", "where", "why", "how", "feel", "feeling",
            "day", "week", "work", "life", "help", "need", "want", "think",
            "because", "about", "like", "some", "more",
            "would", "could", "should",
        }

        pt_count = sum(1 for p in palabras_pt if p in texto)
        en_count = sum(1 for p in palabras_en if p in texto)

        if pt_count >= 2 or (pt_count >= 1 and en_count == 0):
            return "portugués"
        if en_count >= 2:
            return "inglés"
        return "español"

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
                "accion": "Leé 'El hombre en busca de sentido' de Viktor Frankl, un libro sobre encontrar propósito incluso en los momentos más difíciles.",
            },
            "anxious": {
                "mensaje": "La ansiedad puede hacer que todo se sienta demasiado grande. Acá estoy para acompañarte un ratito.",
                "accion": "Escuchá el episodio 'Anxiety' del podcast The Hilarious World of Depression, que aborda la ansiedad con honestidad y humor.",
            },
            "overwhelmed": {
                "mensaje": "Tener la cabeza llena de tareas no significa que estés fallando. A veces el primer paso es simplemente parar y ordenar.",
                "accion": "Mirá el documental 'The Social Dilemma' en Netflix, que ayuda a entender por qué nos sentimos abrumados por las pantallas.",
            },
            "stressed": {
                "mensaje": "El estrés que sentís es una señal de que estás pidiendo mucho de vos. Eso tiene un límite, y está bien reconocerlo.",
                "accion": "Buscá en YouTube 'Why Stress Is Good for You — and How to Get Good at It' de Kelly McGonigal, una charla que cambia la perspectiva.",
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
