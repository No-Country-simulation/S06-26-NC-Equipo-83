import type { OrientarResponse } from "../types/api"
import { mockUsers } from "./users"

export const mockOrientarResponses: OrientarResponse[] = [
  // ── Perfil 1 — Frontend Junior ──────────────────────────────────────────
  {
    gap_porcentual: 25.0,
    gap_items: [
      "CSS avanzado y diseño responsive",
      "Next.js para aplicaciones server-side rendering",
      "Angular y TypeScript para proyectos enterprise",
    ],
    trayectoria_sugerida: [
      "Curso: CSS for JS Developers — Josh Comeau",
      "Curso: Next.js Foundations — Vercel",
      "Curso: Angular - The Complete Guide — Udemy",
    ],
    vacantes_compatibles: [
      {
        id: "job-fe-01",
        title: "Desarrollador Frontend React",
        company: "Mercado Libre",
        location: "Remoto - LATAM",
        description:
          "Construye la cara visible de la plataforma de e-commerce más grande de LATAM. Trabajamos con React, TypeScript y un design system propio. Buscamos alguien con ganas de crecer en un equipo que mueve millones de usuarios.",
        area: "frontend",
        seniority: "semi-senior",
        salary: "ARS 1.800.000 - 2.500.000",
        gap_porcentual: 25.0,
        matched_skills: ["Frontend", "React", "JavaScript"],
        missing_skills: ["CSS"],
        required_skills: ["Frontend", "React", "JavaScript", "CSS"],
        optional_skills: ["TypeScript", "Next.js", "Git", "Testing"],
        recommended_courses: [
          {
            title: "CSS for JS Developers",
            provider: "Josh Comeau",
            duration: "20 horas",
            url: "https://css-for-js.dev/",
          },
        ],
      },
      {
        id: "job-fe-02",
        title: "Desarrollador Next.js",
        company: "Globant",
        location: "Remoto - Argentina",
        description:
          "Súmate al equipo de frontend que construye experiencias digitales para clientes Fortune 500. Usamos Next.js con App Router, TypeScript y Tailwind. Valoramos la curiosidad y las ganas de aprender sobre los años de experiencia.",
        area: "frontend",
        seniority: "junior",
        salary: "ARS 1.500.000 - 2.200.000",
        gap_porcentual: 25.0,
        matched_skills: ["React", "TypeScript", "CSS"],
        missing_skills: ["Next.js"],
        required_skills: ["React", "Next.js", "TypeScript", "CSS"],
        optional_skills: ["JavaScript", "Git", "GraphQL", "Testing"],
        recommended_courses: [
          {
            title: "Next.js Foundations",
            provider: "Vercel",
            duration: "8 horas",
            url: "https://nextjs.org/learn",
          },
        ],
      },
      {
        id: "job-fe-03",
        title: "Desarrollador Angular",
        company: "Accenture",
        location: "Remoto - LATAM",
        description:
          "Buscamos developers con mentalidad de crecimiento para sumarse a proyectos enterprise de gran escala. Trabajamos con Angular, TypeScript y arquitecturas basadas en micro-frontends. Si tienes bases sólidas de frontend, el resto lo aprendes aquí.",
        area: "frontend",
        seniority: "trainee",
        salary: "USD 800 - 1.200",
        gap_porcentual: 75.0,
        matched_skills: ["Git"],
        missing_skills: ["Angular", "TypeScript", "Frontend"],
        required_skills: ["Angular", "TypeScript", "Frontend", "Git"],
        optional_skills: ["JavaScript", "CSS", "Testing", "Docker"],
        recommended_courses: [
          {
            title: "Angular - The Complete Guide",
            provider: "Udemy",
            duration: "36 horas",
            url: "https://www.udemy.com/course/the-complete-guide-to-angular-2/",
          },
          {
            title: "TypeScript para Angular Developers",
            provider: "Platzi",
            duration: "12 horas",
            url: "https://platzi.com/cursos/typescript/",
          },
        ],
      },
    ],
    confianza: 0.88,
  },

  // ── Perfil 2 — Backend Junior ───────────────────────────────────────────
  {
    gap_porcentual: 30.0,
    gap_items: [
      "APIs RESTful y diseño de endpoints",
      "Bases de datos relacionales (SQL, PostgreSQL)",
      "Python y Django para servicios web",
    ],
    trayectoria_sugerida: [
      "Curso: Node.js API Masterclass — freeCodeCamp",
      "Curso: SQL para Backend — Programa ONE (Oracle + Alura)",
      "Curso: Python Django — Coursera (Universidad de Michigan)",
    ],
    vacantes_compatibles: [
      {
        id: "job-be-01",
        title: "Desarrollador Backend Node.js",
        company: "Rappi",
        location: "Remoto - LATAM",
        description:
          "Forma parte del equipo que construye la infraestructura que soporta millones de pedidos diarios. Trabajamos con Node.js, microservicios y bases de datos a escala. Buscamos personas con buenas bases de JavaScript y ganas de aprender arquitecturas distribuidas.",
        area: "backend",
        seniority: "junior",
        salary: "COP 5.000.000 - 7.500.000",
        gap_porcentual: 30.0,
        matched_skills: ["JavaScript", "Node.js"],
        missing_skills: ["APIs", "REST", "Bases de datos"],
        required_skills: [
          "JavaScript",
          "Node.js",
          "APIs",
          "REST",
          "Bases de datos",
        ],
        optional_skills: ["Git", "Docker", "TypeScript", "Linux"],
        recommended_courses: [
          {
            title: "Node.js API Masterclass",
            provider: "freeCodeCamp",
            duration: "15 horas",
            url: "https://www.freecodecamp.org/news/build-a-restful-api-with-node-js/",
          },
          {
            title: "Bases de datos relacionales con PostgreSQL",
            provider: "Platzi",
            duration: "8 horas",
            url: "https://platzi.com/cursos/postgresql/",
          },
        ],
      },
      {
        id: "job-be-02",
        title: "Desarrollador Python/Django",
        company: "Eventbrite",
        location: "Remoto - LATAM",
        description:
          "Trabaja en la plataforma que conecta millones de personas con eventos alrededor del mundo. Nuestro stack es Python, Django, PostgreSQL y GraphQL. Valoramos la curiosidad técnica y la capacidad de resolver problemas complejos con código limpio.",
        area: "backend",
        seniority: "junior",
        salary: "USD 1.500 - 2.200",
        gap_porcentual: 40.0,
        matched_skills: ["JavaScript", "APIs", "REST"],
        missing_skills: ["Python", "Bases de datos"],
        required_skills: [
          "JavaScript",
          "Python",
          "APIs",
          "REST",
          "Bases de datos",
        ],
        optional_skills: ["Django", "Git", "Docker", "GraphQL"],
        recommended_courses: [
          {
            title: "Python para Backend",
            provider: "Coursera (U. de Michigan)",
            duration: "30 horas",
            url: "https://www.coursera.org/specializations/python",
          },
          {
            title: "SQL para Backend",
            provider: "Programa ONE (Oracle + Alura)",
            duration: "10 horas",
            url: "https://www.oracle.com/ar/education/oracle-next-education/",
          },
        ],
      },
      {
        id: "job-be-03",
        title: "Desarrollador Java/Spring",
        company: "Santander",
        location: "Remoto - LATAM",
        description:
          "Súmate al equipo de ingeniería del banco más grande de LATAM. Construimos servicios bancarios core con Java, Spring Boot, SQL y Kafka. Buscamos talento con ganas de aprender y crecer en un entorno de misión crítica con mentoría dedicada.",
        area: "backend",
        seniority: "trainee",
        salary: "EUR 1.800 - 2.500",
        gap_porcentual: 80.0,
        matched_skills: ["JavaScript"],
        missing_skills: ["Java", "Spring", "SQL", "APIs", "REST"],
        required_skills: [
          "Java",
          "Spring",
          "SQL",
          "APIs",
          "REST",
          "JavaScript",
        ],
        optional_skills: ["Git", "Docker", "Linux", "Kubernetes"],
        recommended_courses: [
          {
            title: "Java para Desarrollo Backend",
            provider: "Oracle University",
            duration: "40 horas",
            url: "https://education.oracle.com/java",
          },
          {
            title: "Spring Boot Basics",
            provider: "Baeldung",
            duration: "10 horas",
            url: "https://www.baeldung.com/spring-boot",
          },
          {
            title: "Fundamentos de SQL",
            provider: "Khan Academy",
            duration: "6 horas",
            url: "https://www.khanacademy.org/computing/computer-programming/sql",
          },
        ],
      },
    ],
    confianza: 0.82,
  },
]

export function getOrientarByUserId(
  userId: string,
): OrientarResponse | undefined {
  const index = mockUsers.findIndex((u) => u.id === userId)
  if (index === -1) return undefined
  return mockOrientarResponses[index % mockOrientarResponses.length]
}
