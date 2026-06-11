import type { OrientarResponse } from "../types/api"
import { mockUsers } from "./users"

export const mockOrientarResponses: OrientarResponse[] = [
  {
    gap_porcentual: 72.5,
    gap_items: [
      "Falta experiencia con TypeScript en proyectos reales",
      "Hacen falta conceptos de testing automatizado (Jest, Vitest)",
      "No tiene portfolio con componentes accesibles (a11y)",
    ],
    trayectoria_sugerida: [
      "Curso: JavaScript Avanzado — Programa ONE (Oracle + Alura)",
      "Curso: React con TypeScript — Cloud Skills Boost (Google Cloud GEAR)",
      "Práctica: Construir 3 componentes con tests y publicarlos en GitHub Pages",
      "Mentoría: Agenda una práctica guiada con un mentor Frontend Senior",
    ],
    vacantes_compatibles: [
      {
        id: "vac-001",
        title: "Desarrolladora Frontend Junior",
        company: "Nubank",
        match_percentage: 72.5,
      },
      {
        id: "vac-002",
        title: "React Developer Trainee",
        company: "Globant",
        match_percentage: 68.0,
      },
      {
        id: "vac-003",
        title: "UI Developer",
        company: "Mercado Libre",
        match_percentage: 61.2,
      },
    ],
    confianza: 0.88,
  },
  {
    gap_porcentual: 56.0,
    gap_items: [
      "No domina Git avanzado (rebase, cherry-pick, hooks)",
      "Falta experiencia con integración y entrega continua (CI/CD)",
      "Necesita profundizar en monitoreo y observabilidad",
      "No tiene certificación en plataforma cloud",
    ],
    trayectoria_sugerida: [
      "Curso: Git y GitHub Avanzado — Programa ONE (Oracle + Alura)",
      "Curso: DevOps Essentials — Cloud Skills Boost (Google Cloud GEAR)",
      "Curso: Docker y Kubernetes — Programa ONE (Oracle + Alura)",
      "Certificación: Google Cloud Associate Cloud Engineer",
    ],
    vacantes_compatibles: [
      {
        id: "vac-004",
        title: "DevOps Engineer Semi-Senior",
        company: "ContaAzul",
        match_percentage: 56.0,
      },
      {
        id: "vac-005",
        title: "SRE Junior",
        company: "UOL",
        match_percentage: 49.5,
      },
      {
        id: "vac-006",
        title: "Cloud Support Engineer",
        company: "AWS Latam",
        match_percentage: 44.8,
      },
    ],
    confianza: 0.79,
  },
  {
    gap_porcentual: 45.3,
    gap_items: [
      "Sin experiencia con Python para análisis de datos",
      "No conoce bibliotecas de manipulación de datos (Pandas, NumPy)",
      "No tiene proyectos de visualización de datos en portfolio",
      "Falta dominio de estadística aplicada y probabilidad",
      "No tiene experiencia con SQL más allá de SELECT básico",
    ],
    trayectoria_sugerida: [
      "Curso: Python para Data Science — Programa ONE (Oracle + Alura)",
      "Curso: Data Engineering Fundamentals — Cloud Skills Boost (Google Cloud GEAR)",
      "Curso: BigQuery y SQL Avanzado — Cloud Skills Boost (Google Cloud GEAR)",
      "Proyecto práctico: Análisis de datos públicos del INE con visualización en Streamlit",
      "Mentoría: Sesión con Data Scientist para definir ruta de aprendizaje",
    ],
    vacantes_compatibles: [
      {
        id: "vac-007",
        title: "Data Analyst Trainee",
        company: "Rappi",
        match_percentage: 45.3,
      },
      {
        id: "vac-008",
        title: "Analista de Datos Junior",
        company: "Falabella",
        match_percentage: 40.1,
      },
      {
        id: "vac-009",
        title: "Business Intelligence Intern",
        company: "Banco Itaú",
        match_percentage: 37.5,
      },
    ],
    confianza: 0.72,
  },
  {
    gap_porcentual: 80.8,
    gap_items: [
      "No tiene experiencia con Jetpack Compose",
      "Falta conocimiento en arquitectura MVVM para Android",
    ],
    trayectoria_sugerida: [
      "Curso: Kotlin con Jetpack Compose — Programa ONE (Oracle + Alura)",
      "Curso: Arquitectura Android Moderna — Cloud Skills Boost (Google Cloud GEAR)",
    ],
    vacantes_compatibles: [
      {
        id: "vac-010",
        title: "Android Developer Senior",
        company: "iFood",
        match_percentage: 80.8,
      },
      {
        id: "vac-011",
        title: "Mobile Tech Lead",
        company: "PicPay",
        match_percentage: 75.3,
      },
      {
        id: "vac-012",
        title: "Desarrollador Mobile Senior",
        company: "Nubank",
        match_percentage: 72.1,
      },
    ],
    confianza: 0.92,
  },
  {
    gap_porcentual: 63.7,
    gap_items: [
      "No domina testing automatizado con Cypress o Playwright",
      "Falta experiencia con pruebas de performance (JMeter, k6)",
      "No conoce testing de APIs con Postman o Insomnia",
      "Necesita practicar en entornos ágiles (Scrum, Kanban)",
    ],
    trayectoria_sugerida: [
      "Curso: Testing Automatizado con Cypress — Programa ONE (Oracle + Alura)",
      "Curso: Performance Testing Fundamentals — Cloud Skills Boost (Google Cloud GEAR)",
      "Proyecto práctico: Crear suite de tests E2E para una app React open source",
      "Mentoría: Sombra de QA Senior en ciclo de release real",
    ],
    vacantes_compatibles: [
      {
        id: "vac-013",
        title: "QA Analyst Junior",
        company: "Softtek",
        match_percentage: 63.7,
      },
      {
        id: "vac-014",
        title: "Test Automation Engineer",
        company: "Globant",
        match_percentage: 58.9,
      },
      {
        id: "vac-015",
        title: "QA Manual & Automation",
        company: "Kavak",
        match_percentage: 54.2,
      },
    ],
    confianza: 0.83,
  },
]

export function getOrientarByUserId(userId: string): OrientarResponse | undefined {
  const index = mockUsers.findIndex((u) => u.id === userId)
  if (index === -1) return undefined
  return mockOrientarResponses[index % mockOrientarResponses.length]
}
