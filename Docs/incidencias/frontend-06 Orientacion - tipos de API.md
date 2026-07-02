# Frontend: Tipos de API para el endpoint `/orientar`

## Contexto

El backend `POST /orientar` fue reescrito. La respuesta ahora incluye datos mucho más ricos por vacante. Los tipos de TypeScript en `src/types/api.ts` deben actualizarse para reflejar el nuevo contrato.

## Qué hay que hacer

### Archivo: `src/types/api.ts`

**1. Agregar dos interfaces nuevas** debajo del bloque `// ── Orientar ──` (línea 116):

```typescript
export interface CourseRecommendation {
  title: string;
  provider: string;
  duration: string;
  url?: string | null;
}

export interface JobMatchDetail {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  area: string;
  seniority: string;
  salary?: string | null;
  gap_porcentual: number;
  matched_skills: string[];
  missing_skills: string[];
  required_skills: string[];
  optional_skills: string[];
  recommended_courses: CourseRecommendation[];
}
```

**2. Modificar `OrientarResponse`** — `vacantes_compatibles` cambia de `VacancyResponse[]` a `JobMatchDetail[]`:

```typescript
export interface OrientarResponse {
  gap_porcentual: number;
  gap_items: string[];
  trayectoria_sugerida: string[];
  vacantes_compatibles: JobMatchDetail[];  // ANTES: VacancyResponse[]
  confianza: number;
}
```

**3. La interfaz `VacancyResponse`** (líneas 118-123) puede mantenerse para compatibilidad o eliminarse. Si se elimina, revisar que ningún otro archivo la importe.

## Respuesta real del backend (ejemplo)

```json
{
  "gap_porcentual": 25.0,
  "gap_items": ["CSS", "Next.js", "Angular"],
  "trayectoria_sugerida": ["CSS for JS Developers", "Next.js Foundations"],
  "vacantes_compatibles": [
    {
      "id": "job-fe-01",
      "title": "Desarrollador Frontend React",
      "company": "Mercado Libre",
      "location": "Remoto — LATAM",
      "description": "Construí la cara visible de la plataforma...",
      "area": "frontend",
      "seniority": "semi-senior",
      "salary": "ARS 1.800.000 - 2.500.000",
      "gap_porcentual": 25.0,
      "matched_skills": ["Frontend", "React", "JavaScript"],
      "missing_skills": ["CSS"],
      "required_skills": ["Frontend", "React", "JavaScript", "CSS"],
      "optional_skills": ["TypeScript", "Next.js", "Git", "Testing"],
      "recommended_courses": [
        {
          "title": "CSS for JS Developers",
          "provider": "Josh Comeau",
          "duration": "20 horas",
          "url": "https://css-for-js.dev/"
        }
      ]
    }
  ],
  "confianza": 0.88
}
```

## Notas

- `area` contiene valores como `"frontend"`, `"backend"`, `"fullstack"`, `"mobile"`, etc. — los mismos que usa el formulario de registro en `INTEREST_AREAS`.
- `gap_porcentual` es el inverso del match: 25% de gap = 75% de compatibilidad.
- `recommended_courses` es un array de cursos seleccionados por algoritmo greedy para cubrir las skills faltantes de esa vacante específica.
- Siempre se devuelven máximo 3 vacantes, ordenadas de menor a mayor gap (las más cercanas al perfil del usuario).
