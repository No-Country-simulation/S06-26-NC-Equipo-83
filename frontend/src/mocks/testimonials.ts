export interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ana Silva",
    role: "Desarrolladora Frontend",
    quote:
      "App BiT me ayudó a recuperar la confianza para volver a postularme a oportunidades en tecnología.",
  },
  {
    id: 2,
    name: "Carlos Menezes",
    role: "Desarrollador Junior",
    quote:
      "Gracias a las recomendaciones personalizadas encontré exactamente qué habilidades debía fortalecer.",
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "Analista de Datos",
    quote:
      "La mentoría me permitió ordenar mis objetivos profesionales y avanzar con claridad.",
  },
  {
    id: 4,
    name: "María González",
    role: "UX Designer",
    quote:
      "Por primera vez sentí que una plataforma entendía tanto mi desarrollo profesional como mi bienestar.",
  },
  {
    id: 5,
    name: "Lucas Pereira",
    role: "QA Tester",
    quote:
      "El acompañamiento emocional fue tan valioso como las oportunidades laborales que encontré.",
  },
  {
    id: 6,
    name: "Fatima Hassan",
    role: "Product Manager",
    quote:
      "Conecté con una comunidad que me impulsó a seguir creciendo dentro de la industria tecnológica.",
  },
];