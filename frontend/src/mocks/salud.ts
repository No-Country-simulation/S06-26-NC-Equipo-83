import type { SaludResponse } from "../types/api"
import { mockUsers } from "./users"

export const mockSaludResponses: SaludResponse[] = [
  {
    mensaje:
      "Qué alegría verte así, Ana. La energía que traés hoy es contagiosa. Recordá que este buen momento es fruto de tu dedicación diaria. Aprovechá esta claridad mental para avanzar en ese proyecto personal que venís postergando.",
    accion_sugerida:
      "Escuchá el episodio 'El poder de la constancia' del podcast Código Limpio mientras das una caminata al aire libre.",
    derivar_cvv: false,
    nota_actual: 8,
    alerta: false,
    created_at: "2026-06-10T08:15:00Z",
  },
  {
    mensaje:
      "Carlos, notamos que hoy el cansancio pesa más de lo habitual. No te exijas al 100% todos los días — descansar también es avanzar. A veces una pausa consciente rinde más que tres horas forzadas frente a la pantalla.",
    accion_sugerida:
      "Probá la técnica Pomodoro inversa: 15 minutos de trabajo, 10 de descanso. Alejate del celular en las pausas.",
    derivar_cvv: false,
    nota_actual: 6,
    alerta: false,
    created_at: "2026-06-10T09:30:00Z",
  },
  {
    mensaje:
      "María, sabemos que no todos los días brillan igual. La tristeza también merece espacio — no la escondas. Lo que estás construyendo requiere coraje, y tener días grises no borra todo lo que ya caminaste.",
    accion_sugerida:
      "Ponete 'Oração' de A Barca Mais Além y escribí en un papel tres cosas que sí lograste esta semana, por más chiquitas que parezcan.",
    derivar_cvv: false,
    nota_actual: 5,
    alerta: false,
    created_at: "2026-06-09T18:45:00Z",
  },
  {
    mensaje:
      "Pedro, la ansiedad es el exceso de futuro. Volvé al presente: ¿qué podés controlar ahora mismo? Solo este minuto. Ya enfrentaste cosas más difíciles y saliste adelante — esta no va a ser la excepción.",
    accion_sugerida:
      "Respiración 4-7-8: inhalá en 4 segundos, retené 7, exhalá en 8. Repetilo 5 veces con las manos sobre las rodillas.",
    derivar_cvv: false,
    nota_actual: 5,
    alerta: false,
    created_at: "2026-06-10T07:00:00Z",
  },
  {
    mensaje:
      "Laura, cuando todo parece demasiado, detenete. No tenés que resolver el mapa entero hoy. Elegí UNA sola cosa — la más chiquita, la más concreta — y hacela. Después, la siguiente. Paso a paso.",
    accion_sugerida:
      "Abrí tu diario personal y escribí: 'Hoy solo necesito hacer ______'. Que sea una sola línea. Después tachala cuando esté hecha.",
    derivar_cvv: false,
    nota_actual: 4,
    alerta: true,
    created_at: "2026-06-10T10:20:00Z",
  },
  {
    mensaje:
      "Diego, ¡qué lindo verte con esta energía! Hoy es un día para compartir. Escribile un mensaje de agradecimiento a alguien que te haya ayudado en tu camino profesional — ese gesto vuelve multiplicado.",
    accion_sugerida:
      "Leé el capítulo 'Las buenas ideas nacen del intercambio' de De Dónde Vienen las Buenas Ideas de Steven Johnson.",
    derivar_cvv: false,
    nota_actual: 9,
    alerta: false,
    created_at: "2026-06-09T14:30:00Z",
  },
  {
    mensaje:
      "Isabela, la sensación de estar abrumada al inicio de un camino nuevo es completamente normal. Nadie nace sabiendo, y todo profesional que admirás empezó exactamente donde estás vos ahora. La diferencia fue que ellos siguieron a pesar del miedo.",
    accion_sugerida:
      "Mirá los primeros 20 minutos de la película Reina de Katwe. Después volvé a la app y contanos qué sentiste.",
    derivar_cvv: false,
    nota_actual: 6,
    alerta: false,
    created_at: "2026-06-09T20:00:00Z",
  },
  {
    mensaje:
      "Andrés, el entusiasmo que tenés es tu mayor ventaja competitiva. Mientras otros se detienen por miedo, vos avanzás con ganas. Canalizá esa energía en algo concreto hoy: un pull request, un artículo en Dev.to, una clase en YouTube.",
    accion_sugerida:
      "Escribí un hilo en LinkedIn contando algo que aprendiste esta semana. No importa si es básico — hay alguien que necesita leerlo.",
    derivar_cvv: false,
    nota_actual: 8,
    alerta: false,
    created_at: "2026-06-10T08:00:00Z",
  },
  {
    mensaje:
      "Camila, el mercado tech puede parecer inalcanzable, pero tu experiencia ya vale mucho más de lo que creés. No te compares con el senior que tiene 10 años — comparate con vos misma hace 6 meses. La diferencia es enorme y real.",
    accion_sugerida:
      "Agendá 30 minutos para actualizar tu LinkedIn con los proyectos que hiciste en el último año. Cada uno es una prueba de lo que sabés.",
    derivar_cvv: false,
    nota_actual: 7,
    alerta: false,
    created_at: "2026-06-10T09:00:00Z",
  },
  {
    mensaje:
      "Roberto, notamos que la carga está pesada esta semana. No estás solo en esto. A veces la mejor decisión profesional es saber cuándo pedir ayuda. Un mentor, un colega, una comunidad — hay gente dispuesta a tender una mano.",
    accion_sugerida:
      "Unite a la comunidad de Discord AppBiT a las 19h. Hoy hay roda de conversación abierta. No necesitás hablar, solo escuchar.",
    derivar_cvv: false,
    nota_actual: 5,
    alerta: false,
    created_at: "2026-06-10T07:45:00Z",
  },
  {
    mensaje:
      "Yara, arrancar desde cero en otro país, en otro idioma, con otra cultura... eso requiere una fortaleza que mucha gente no entiende. No te midas con la vara de quien tuvo el camino allanado. Tu trayectoria ya es extraordinaria.",
    accion_sugerida:
      "Escuchá el podcast 'Afrotalent' episodio sobre mujeres angoleñas en tecnología. Hay referencias que te van a hablar directo al corazón.",
    derivar_cvv: false,
    nota_actual: 7,
    alerta: false,
    created_at: "2026-06-10T11:00:00Z",
  },
  {
    mensaje:
      "Fernando, la frustración es parte del aprendizaje, no una señal de que estás fallando. Cada error en el código, cada 'rechazado' en un proceso, es información valiosa. No es un NO definitivo — es un TODAVÍA NO.",
    accion_sugerida:
      "Hacé una lista de 5 rechazos o errores que tuviste y al lado escribí qué aprendiste de cada uno. Vas a sorprenderte de cuánto creciste.",
    derivar_cvv: false,
    nota_actual: 6,
    alerta: false,
    created_at: "2026-06-10T08:30:00Z",
  },
  {
    mensaje:
      "Ana, queremos que sepas que estamos acá. Lo que estás sintiendo es real y válido. Hoy no te vamos a sugerir cursos ni productividad — solo queremos recordarte que hay personas que te valoran exactamente como sos. Si el peso se vuelve demasiado grande, no dudes en buscar ayuda profesional.",
    accion_sugerida:
      "Llamá al CVV — Centro de Valorización de la Vida: 188. Es gratuito, confidencial y disponible 24 horas. No estás sola.",
    derivar_cvv: true,
    nota_actual: 3,
    alerta: true,
    created_at: "2026-06-09T22:30:00Z",
  },
  {
    mensaje:
      "Carlos, reconocemos que esta semana fue especialmente difícil. No minimices tu dolor ni te juzgues por sentirlo. El primer paso para sanar ya lo diste: registraste cómo te sentís. Ahora dejá que alguien capacitado te acompañe en el segundo paso.",
    accion_sugerida:
      "Comunicate con el CVV llamando al 188 o por chat en cvv.org.br. Escuchar sin juzgar ya es el inicio de la cura.",
    derivar_cvv: true,
    nota_actual: 2,
    alerta: true,
    created_at: "2026-06-09T23:15:00Z",
  },
  {
    mensaje:
      "María, hoy el marcador está bajo y lo notamos. No hay vergüenza en eso. Todo el equipo de App BiT cree en vos. Pero también sabemos que hay momentos en que el apoyo profesional es necesario. No es debilidad — es sabiduría saber pedir ayuda.",
    accion_sugerida:
      "Derivación al CVV: marcá 188 ahora mismo. También podés escribirnos a nosotros cuando quieras. Estamos siempre.",
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
