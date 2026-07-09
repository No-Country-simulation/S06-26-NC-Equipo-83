import type { SaludResponse } from "../types/api"
import { mockUsers } from "./users"

export const mockSaludResponses: SaludResponse[] = [
  {
    mensaje:
      "Qué alegría verte así, Ana. La energía que traes hoy es contagiosa. Recuerda que este buen momento es fruto de tu dedicación diaria. Aprovecha esta claridad mental para avanzar en ese proyecto personal que vienes postergando.",
    accion_sugerida:
      "Escucha el episodio 'El poder de la constancia' del podcast Código Limpio mientras das una caminata al aire libre.",
    derivar_cvv: false,
    nota_actual: 8,
    alerta: false,
    created_at: "2026-06-10T08:15:00Z",
  },
  {
    mensaje:
      "Carlos, notamos que hoy el cansancio pesa más de lo habitual. No te exijas al 100% todos los días — descansar también es avanzar. A veces una pausa consciente rinde más que tres horas forzadas frente a la pantalla.",
    accion_sugerida:
      "Prueba la técnica Pomodoro inversa: 15 minutos de trabajo, 10 de descanso. Aléjate del celular en las pausas.",
    derivar_cvv: false,
    nota_actual: 6,
    alerta: false,
    created_at: "2026-06-10T09:30:00Z",
  },
  {
    mensaje:
      "María, sabemos que no todos los días brillan igual. La tristeza también merece espacio — no la escondas. Lo que estás construyendo requiere coraje, y tener días grises no borra todo lo que ya caminaste.",
    accion_sugerida:
      "Ponte 'Oração' de A Barca Mais Além y escribe en un papel tres cosas que sí lograste esta semana, por más pequeñas que parezcan.",
    derivar_cvv: false,
    nota_actual: 5,
    alerta: false,
    created_at: "2026-06-09T18:45:00Z",
  },
  {
    mensaje:
      "Pedro, la ansiedad es el exceso de futuro. Vuelve al presente: ¿qué puedes controlar ahora mismo? Solo este minuto. Ya enfrentaste cosas más difíciles y saliste adelante — esta no va a ser la excepción.",
    accion_sugerida:
      "Respiración 4-7-8: inhala en 4 segundos, retén 7, exhala en 8. Repítelo 5 veces con las manos sobre las rodillas.",
    derivar_cvv: false,
    nota_actual: 5,
    alerta: false,
    created_at: "2026-06-10T07:00:00Z",
  },
  {
    mensaje:
      "Laura, cuando todo parece demasiado, detente. No tienes que resolver el mapa entero hoy. Elige UNA sola cosa — la más pequeña, la más concreta — y hazla. Después, la siguiente. Paso a paso.",
    accion_sugerida:
      "Abre tu diario personal y escribe: 'Hoy solo necesito hacer ______'. Que sea una sola línea. Después táchala cuando esté hecha.",
    derivar_cvv: false,
    nota_actual: 4,
    alerta: true,
    created_at: "2026-06-10T10:20:00Z",
  },
  {
    mensaje:
      "Diego, ¡qué lindo verte con esta energía! Hoy es un día para compartir. Escríbele un mensaje de agradecimiento a alguien que te haya ayudado en tu camino profesional — ese gesto vuelve multiplicado.",
    accion_sugerida:
      "Lee el capítulo 'Las buenas ideas nacen del intercambio' de De Dónde Vienen las Buenas Ideas de Steven Johnson.",
    derivar_cvv: false,
    nota_actual: 9,
    alerta: false,
    created_at: "2026-06-09T14:30:00Z",
  },
  {
    mensaje:
      "Isabela, la sensación de estar abrumada al inicio de un camino nuevo es completamente normal. Nadie nace sabiendo, y todo profesional que admiras empezó exactamente donde estás tú ahora. La diferencia fue que ellos siguieron a pesar del miedo.",
    accion_sugerida:
      "Mira los primeros 20 minutos de la película Reina de Katwe. Después vuelve a la app y cuéntanos qué sentiste.",
    derivar_cvv: false,
    nota_actual: 6,
    alerta: false,
    created_at: "2026-06-09T20:00:00Z",
  },
  {
    mensaje:
      "Andrés, el entusiasmo que tienes es tu mayor ventaja competitiva. Mientras otros se detienen por miedo, tú avanzas con ganas. Canaliza esa energía en algo concreto hoy: un pull request, un artículo en Dev.to, una clase en YouTube.",
    accion_sugerida:
      "Escribe un hilo en LinkedIn contando algo que aprendiste esta semana. No importa si es básico — hay alguien que necesita leerlo.",
    derivar_cvv: false,
    nota_actual: 8,
    alerta: false,
    created_at: "2026-06-10T08:00:00Z",
  },
  {
    mensaje:
      "Camila, el mercado tech puede parecer inalcanzable, pero tu experiencia ya vale mucho más de lo que crees. No te compares con el senior que tiene 10 años — compárate contigo misma hace 6 meses. La diferencia es enorme y real.",
    accion_sugerida:
      "Agenda 30 minutos para actualizar tu LinkedIn con los proyectos que hiciste en el último año. Cada uno es una prueba de lo que sabes.",
    derivar_cvv: false,
    nota_actual: 7,
    alerta: false,
    created_at: "2026-06-10T09:00:00Z",
  },
  {
    mensaje:
      "Roberto, notamos que la carga está pesada esta semana. No estás solo en esto. A veces la mejor decisión profesional es saber cuándo pedir ayuda. Un mentor, un colega, una comunidad — hay gente dispuesta a tender una mano.",
    accion_sugerida:
      "Únete a la comunidad de Discord AppBiT a las 19h. Hoy hay ronda de conversación abierta. No necesitas hablar, solo escuchar.",
    derivar_cvv: false,
    nota_actual: 5,
    alerta: false,
    created_at: "2026-06-10T07:45:00Z",
  },
  {
    mensaje:
      "Yara, arrancar desde cero en otro país, en otro idioma, con otra cultura... eso requiere una fortaleza que mucha gente no entiende. No te midas con la vara de quien tuvo el camino allanado. Tu trayectoria ya es extraordinaria.",
    accion_sugerida:
      "Escucha el podcast 'Afrotalent' episodio sobre mujeres angoleñas en tecnología. Hay referencias que te van a hablar directo al corazón.",
    derivar_cvv: false,
    nota_actual: 7,
    alerta: false,
    created_at: "2026-06-10T11:00:00Z",
  },
  {
    mensaje:
      "Fernando, la frustración es parte del aprendizaje, no una señal de que estás fallando. Cada error en el código, cada 'rechazado' en un proceso, es información valiosa. No es un NO definitivo — es un TODAVÍA NO.",
    accion_sugerida:
      "Haz una lista de 5 rechazos o errores que tuviste y al lado escribe qué aprendiste de cada uno. Vas a sorprenderte de cuánto creciste.",
    derivar_cvv: false,
    nota_actual: 6,
    alerta: false,
    created_at: "2026-06-10T08:30:00Z",
  },
  {
    mensaje:
      "Ana, queremos que sepas que estamos aquí. Lo que estás sintiendo es real y válido. Hoy no te vamos a sugerir cursos ni productividad — solo queremos recordarte que hay personas que te valoran exactamente como eres. Si el peso se vuelve demasiado grande, no dudes en buscar ayuda profesional.",
    accion_sugerida:
      "Llama al CVV — Centro de Valorización de la Vida: 188. Es gratuito, confidencial y disponible 24 horas. No estás sola.",
    derivar_cvv: true,
    nota_actual: 3,
    alerta: true,
    created_at: "2026-06-09T22:30:00Z",
  },
  {
    mensaje:
      "Carlos, reconocemos que esta semana fue especialmente difícil. No minimices tu dolor ni te juzgues por sentirlo. El primer paso para sanar ya lo diste: registraste cómo te sientes. Ahora deja que alguien capacitado te acompañe en el segundo paso.",
    accion_sugerida:
      "Comunícate con el CVV llamando al 188 o por chat en cvv.org.br. Escuchar sin juzgar ya es el inicio de la cura.",
    derivar_cvv: true,
    nota_actual: 2,
    alerta: true,
    created_at: "2026-06-09T23:15:00Z",
  },
  {
    mensaje:
      "María, hoy el marcador está bajo y lo notamos. No hay vergüenza en eso. Todo el equipo de App BiT cree en ti. Pero también sabemos que hay momentos en que el apoyo profesional es necesario. No es debilidad — es sabiduría saber pedir ayuda.",
    accion_sugerida:
      "Derivación al CVV: marca 188 ahora mismo. También puedes escribirnos a nosotros cuando quieras. Estamos siempre.",
    derivar_cvv: true,
    nota_actual: 3,
    alerta: true,
    created_at: "2026-06-10T01:00:00Z",
  },
]

export function getSaludByUserId(userId: string): SaludResponse[] {
  const userIndex = mockUsers.findIndex((u) => u.id === userId)
  if (userIndex === -1) return []

  const startIndex = userIndex % mockSaludResponses.length
  const count = 3

  const result: SaludResponse[] = []
  for (let i = 0; i < count; i++) {
    result.push(mockSaludResponses[(startIndex + i) % mockSaludResponses.length])
  }
  return result
}
