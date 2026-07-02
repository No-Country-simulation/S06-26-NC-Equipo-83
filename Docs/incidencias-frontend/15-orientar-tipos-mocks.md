## INCIDENCIA 15 — Tipos de API y mocks para el nuevo endpoint `/orientar`

## Resumen

El backend `POST /orientar` fue reescrito con un motor de matching determinístico. La respuesta ahora incluye datos mucho más ricos por vacante: skills matcheadas y faltantes, cursos recomendados por vacante, área de interés asociada, y gap porcentual real calculado contra 45 vacantes mock. Esta incidencia actualiza los tipos de TypeScript para reflejar el nuevo contrato y reescribe los mocks para que se pueda desarrollar sin el backend.

**Rama:** `incidencia/15-orientar-tipos-mocks`
**Duración estimada:** 1-2 horas.
**Depende de:** Nada (es la primera de la serie 15-18).
**Asignada a:** 1 dev frontend.
**Por qué existe separada de 17-18:** Los tipos y mocks son la base. Sin ellos, los devs de 17 (componente) y 18 (página) no pueden compilar. Esta incidencia se entrega rápido y desbloquea el resto.

### ¿Qué vas a aprender de TypeScript en esta incidencia?

| Concepto | ¿Qué es? |
|----------|----------|
| Interfaces anidadas | Cómo tipar respuestas de API con arrays de objetos complejos que a su vez contienen otros arrays de objetos |
| `export type` en barrel files | Cómo re-exportar tipos desde un índice central (`mocks/index.ts`) |
| Migración de tipos | Cómo reemplazar una interfaz por otra sin romper imports existentes |

### Pre-lectura (15 min)

| Archivo | ¿Por qué? |
|---------|----------|
| `frontend/src/types/api.ts` | Vas a agregar `CourseRecommendation` y `JobMatchDetail`, y modificar `OrientarResponse` |
| `frontend/src/mocks/index.ts` | Vas a actualizar los re-exports de tipos |
| `frontend/src/mocks/orientar.ts` | Vas a reescribir los mocks con el nuevo formato |

### Antes de codear: flujo git

```bash
git checkout main
git pull origin main
git checkout -b incidencia/15-orientar-tipos-mocks
```

### Contrato del backend

**Request** `POST /orientar` (requiere auth Bearer token):
```json
{ "perfil": "frontend", "nivel": "junior", "region": "LATAM", "idioma": "es", "lat": 0, "lng": 0 }
```

**Response** (ejemplo real de un usuario con React, TypeScript y Next.js — interés `frontend`):

```json
{
  "gap_porcentual": 25.0,
  "gap_items": ["CSS", "Next.js", "Angular", "UI/UX", "Vue.js", "Svelte"],
  "trayectoria_sugerida": ["CSS for JS Developers", "Next.js Foundations", "Angular - The Complete Guide"],
  "vacantes_compatibles": [
    {
      "id": "job-fe-01",
      "title": "Desarrollador Frontend React",
      "company": "Mercado Libre",
      "location": "Remoto - LATAM",
      "description": "Construi la cara visible de la plataforma de e-commerce mas grande de LATAM...",
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

**Notas sobre el contrato:**
- `gap_porcentual` va de 0 a 100. Es el inverso del match: 25% de gap = 75% de compatibilidad. Menor gap = mejor.
- `area` contiene strings identicos a los valores de `INTEREST_AREAS` del registro (`"frontend"`, `"backend"`, `"fullstack"`, `"mobile"`, `"ai_ml"`, `"data_science"`, `"devops"`, `"cloud"`, `"cybersecurity"`, `"qa_testing"`, `"ux_ui"`, `"product_management"`, `"blockchain"`, `"iot"`, `"game_development"`).
- `matched_skills`, `missing_skills`, `required_skills`, `optional_skills` son **strings con nombres legibles en espanol** (ej: `"Frontend"`, `"Node.js"`, `"Bases de datos"`, `"IA / ML"`). NO son keys internas ni codigos.
- `recommended_courses` es por vacante — son los cursos que cubren las skills faltantes de ESE puesto especifico, seleccionados por algoritmo greedy.
- Siempre se devuelven maximo 3 vacantes, ordenadas de menor a mayor gap (las mas cercanas al perfil).

### Paso a paso

#### Archivo 1: `frontend/src/types/api.ts` (MODIFICAR)

Buscá la seccion `// Orientar` (alrededor de linea 116).

**Agregá `CourseRecommendation`:**

```typescript
export interface CourseRecommendation {
  title: string;
  provider: string;
  duration: string;
  url?: string | null;
}
```

**Agregá `JobMatchDetail`:**

```typescript
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

**Modificá `OrientarResponse`:**

```typescript
// ANTES
export interface OrientarResponse {
  gap_porcentual: number;
  gap_items: string[];
  trayectoria_sugerida: string[];
  vacantes_compatibles: VacancyResponse[];
  confianza: number;
}

// DESPUES
export interface OrientarResponse {
  gap_porcentual: number;
  gap_items: string[];
  trayectoria_sugerida: string[];
  vacantes_compatibles: JobMatchDetail[];
  confianza: number;
}
```

**`VacancyResponse`:** Podes eliminarla o mantenerla. Si la eliminas, asegurate de que nadie la importe (ver paso 2).

#### Archivo 2: `frontend/src/mocks/index.ts` (MODIFICAR)

Agrega los nuevos tipos al barrel de re-exports (linea 14-21):

```typescript
export type {
  User,
  VacancyResponse,
  JobMatchDetail,
  CourseRecommendation,
  OrientarResponse,
  SaludRequest,
  SaludResponse,
  UserCreateRequest,
} from "../types/api";
```

#### Archivo 3: `frontend/src/mocks/orientar.ts` (REESCRIBIR)

El archivo actual tiene vacantes con formato viejo (`VacancyResponse` con `match_percentage`). Reescribilo completo con `JobMatchDetail`.

Cada objeto en `vacantes_compatibles` debe tener esta estructura:

```typescript
{
  id: "job-fe-01",
  title: "Desarrollador Frontend React",
  company: "Mercado Libre",
  location: "Remoto - LATAM",
  description: "Descripcion humana del puesto, contando por que es una buena oportunidad...",
  area: "frontend",
  seniority: "semi-senior",
  salary: "ARS 1.800.000 - 2.500.000",
  gap_porcentual: 25.0,
  matched_skills: ["Frontend", "React", "JavaScript"],
  missing_skills: ["CSS"],
  required_skills: ["Frontend", "React", "JavaScript", "CSS"],
  optional_skills: ["TypeScript", "Next.js", "Git", "Testing"],
  recommended_courses: [
    { title: "CSS for JS Developers", provider: "Josh Comeau", duration: "20 horas", url: "https://css-for-js.dev/" }
  ]
}
```

Necesitas al menos 2 perfiles (`OrientarResponse` completos), 3 vacantes cada uno.

**Perfil 1 — Frontend Junior** (usuario con React, CSS, Git):

| Vacante | Gap | Skills que faltan |
|---------|-----|-------------------|
| React Developer (Mercado Libre) | 25% | CSS |
| Next.js Developer (Globant) | 25% | Next.js |
| Angular Developer (Accenture) | 75% | Angular, TypeScript |

**Perfil 2 — Backend Junior** (usuario con JavaScript, Node, Git):

| Vacante | Gap | Skills que faltan |
|---------|-----|-------------------|
| Backend Node.js (Rappi) | 30% | APIs, REST, Bases de datos |
| Python/Django (Eventbrite) | 40% | Python, APIs, REST |
| Java/Spring (Santander) | 80% | Java, SQL, APIs, REST |

**Reglas para skills:**
- Los strings de skills deben ser **nombres legibles en espanol**, NO keys tecnicas. Lista completa de skills validos:
```
Frontend, Backend, Full Stack, Mobile, React, Angular, Vue.js, Svelte, Next.js,
JavaScript, TypeScript, Node.js, Java, Python, C#, Kotlin, Swift, Rust, PHP,
Ruby, Go, Dart, Scala, C++, R, SQL, NoSQL, Bases de datos, APIs, REST,
GraphQL, CSS, UI/UX, Git, Linux, Docker, Kubernetes, DevOps, Cloud, CI/CD,
Testing, Seguridad, IA / ML, Ciencia de datos, Blockchain, Game Development,
Product Management, IoT
```
- `matched_skills` + `missing_skills` = `required_skills` (subconjunto exacto).
- El `gap_porcentual` debe ser consistente: si cumple 3 de 4 required skills, gap = 25%.
- Cada vacante debe tener al menos 1 curso en `recommended_courses`.

**Reglas para `area`:**
Usa exactamente estos strings (los mismos del formulario de registro):
```
frontend, backend, fullstack, mobile, ai_ml, data_science, devops,
cloud, cybersecurity, qa_testing, ux_ui, product_management,
blockchain, iot, game_development
```

**La funcion `getOrientarByUserId(userId)`** debe seguir funcionando con la misma firma.

### Verificacion completa

```bash
cd frontend
npx tsc --noEmit
# Esperado: 0 errores (o solo errores preexistentes en otros archivos)
```

### Errores que te vas a encontrar

| Error | Causa | Solucion |
|-------|-------|----------|
| `Property 'match_percentage' does not exist on type 'JobMatchDetail'` | Los mocks viejos usan `match_percentage` | Reemplaza por `gap_porcentual`. El match es `100 - gap_porcentual`. |
| `Cannot find name 'CourseRecommendation'` | No agregaste la interfaz en `types/api.ts` | Revisa el paso 1a. |
| `Type 'VacancyResponse[]' is not assignable to type 'JobMatchDetail[]'` | No actualizaste `OrientarResponse.vacantes_compatibles` | Cambia el tipo en la interfaz (paso 1c). |
| `Module '"../types/api"' has no exported member 'JobMatchDetail'` en mocks/index.ts | Re-export antes de que el tipo exista | Hace primero el paso 1 (types/api.ts), despues el paso 2 (mocks/index.ts). |
| `gap_porcentual` dice 75% pero `matched_skills` tiene 3 y `required_skills` tiene 4 | Inconsistencia en datos mock | El gap es el % que FALTA. Si cumple 3/4, el gap es (1/4)*100 = 25%. |

### Criterios de aceptacion Incidencia 15

- [ ] `CourseRecommendation` y `JobMatchDetail` existen en `types/api.ts`
- [ ] `OrientarResponse.vacantes_compatibles` es `JobMatchDetail[]`
- [ ] `mocks/index.ts` re-exporta `JobMatchDetail` y `CourseRecommendation`
- [ ] `mockOrientarResponses` tiene al menos 2 perfiles con 3 vacantes cada uno
- [ ] Cada vacante mock incluye `area`, `matched_skills`, `missing_skills`, `required_skills`, `recommended_courses`
- [ ] Los strings de skills son nombres legibles en espanol (no keys tecnicas)
- [ ] `gap_porcentual` es consistente con `matched_skills.length / required_skills.length`
- [ ] `npx tsc --noEmit` no introduce NUEVOS errores en los archivos de esta incidencia
- [ ] Commit con: `feat(orientar): agregar tipos y mocks para el nuevo endpoint /orientar`
