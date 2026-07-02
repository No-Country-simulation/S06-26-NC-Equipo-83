## INCIDENCIA 16 — Skills normalizados en el formulario de registro

## Resumen

El motor de matching del backend usa 47 skills normalizados (ej: `"frontend"`, `"react"`, `"docker"`, `"python"`). Para que el matching funcione, las tecnologías que el usuario selecciona en el Step 3 del registro deben ser exactamente esos skills normalizados, no las tecnologías sueltas que había antes (`"JavaScript"`, `"React"`, `"Next.js"`).

Esta incidencia reemplaza `PREDEFINED_TECHNOLOGIES` por los skills normalizados, crea un archivo de labels para mostrar nombres legibles en el select, y actualiza los helpers de `registerStep3.tsx` para que usen `value != label` (ej: valor `"frontend"` se muestra como `"Frontend"`).

**Rama:** `incidencia/16-skills-normalizados-registro`
**Duración estimada:** 1-2 horas.
**Depende de:** Nada (es independiente de 15, 17 y 18).
**Asignada a:** 1 dev frontend.
**Por qué existe:** Sin este cambio, el usuario selecciona "React" y el backend recibe `{name: "React", is_custom: false}`. El motor de matching no sabe qué skill normalizado le corresponde a "React". Al seleccionar skills directamente, el backend recibe `{name: "react", is_custom: false}` y el matching es directo.

### ¿Qué vas a aprender de React/TypeScript en esta incidencia?

| Concepto | ¿Qué es? |
|----------|----------|
| Value vs Label en selects | Cómo separar el identificador interno (`"frontend"`) del texto que ve el usuario (`"Frontend"`) |
| `Record<string, string>` | Cómo tipar un diccionario de mapeo clave-valor en TypeScript |
| Migración de datos de formulario | Cómo cambiar las opciones de un select sin romper la API ni la UI |

### Pre-lectura (10 min)

| Archivo | ¿Por qué? |
|---------|----------|
| `frontend/src/lib/registrationData.ts` | Vas a reemplazar `PREDEFINED_TECHNOLOGIES` (línea 60-74) |
| `frontend/src/modules/auth/registerSteps/registerStep3.tsx` | Vas a modificar `techsToOptions()` y `buildTechOptions()` |

### Antes de codear: flujo git

```bash
git checkout main
git pull origin main
git checkout -b incidencia/16-skills-normalizados-registro
```

### Paso a paso

#### Archivo 1: `frontend/src/lib/skillLabels.ts` (NUEVO)

Creá este archivo con un diccionario que mapea cada skill normalizado a su nombre legible:

```typescript
export const SKILL_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  mobile: "Mobile",
  fullstack: "Full Stack",
  react: "React",
  angular: "Angular",
  vue: "Vue.js",
  svelte: "Svelte",
  nextjs: "Next.js",
  javascript: "JavaScript",
  typescript: "TypeScript",
  node: "Node.js",
  java: "Java",
  python: "Python",
  csharp: "C#",
  kotlin: "Kotlin",
  swift: "Swift",
  rust: "Rust",
  php: "PHP",
  ruby: "Ruby",
  go: "Go",
  dart: "Dart",
  scala: "Scala",
  cpp: "C++",
  r: "R",
  sql: "SQL",
  nosql: "NoSQL",
  database: "Bases de datos",
  api: "APIs",
  rest: "REST",
  graphql: "GraphQL",
  css: "CSS",
  uiux: "UI/UX",
  git: "Git",
  linux: "Linux",
  docker: "Docker",
  kubernetes: "Kubernetes",
  devops: "DevOps",
  cloud: "Cloud",
  cicd: "CI/CD",
  testing: "Testing",
  security: "Seguridad",
  ai: "IA / ML",
  data_science: "Ciencia de datos",
  blockchain: "Blockchain",
  game_development: "Game Development",
  product_management: "Product Management",
  iot: "IoT",
};
```

#### Archivo 2: `frontend/src/lib/registrationData.ts` (MODIFICAR)

Reemplazá `PREDEFINED_TECHNOLOGIES` (líneas 60-74). Donde antes había:

```typescript
export const PREDEFINED_TECHNOLOGIES = [
  "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust",
  "Ruby", "PHP", "Kotlin", "Swift", "Dart", "Scala", "R", "SQL",
  "React", "Angular", "Vue.js", "Svelte", "Next.js", "Nuxt",
  // ... 55 tecnologías sueltas
];
```

Ahora va:

```typescript
// Skills normalizados del motor de matching (47 opciones - multiselect + creatable)
export const PREDEFINED_TECHNOLOGIES = [
  "frontend", "backend", "mobile", "fullstack",
  "react", "angular", "vue", "svelte", "nextjs",
  "javascript", "typescript",
  "node", "java", "python", "csharp", "kotlin", "swift",
  "rust", "php", "ruby", "go", "dart", "scala", "cpp", "r",
  "sql", "nosql", "database",
  "api", "rest", "graphql",
  "css", "uiux",
  "git", "linux", "docker", "kubernetes",
  "devops", "cloud", "cicd", "testing", "security",
  "ai", "data_science", "blockchain", "game_development",
  "product_management", "iot",
];
```

> **Importante:** Estos strings son los que viajan al backend en `known_technologies[].name`. No los cambies.

#### Archivo 3: `frontend/src/modules/auth/registerSteps/registerStep3.tsx` (MODIFICAR)

**3a. Agregá el import de `SKILL_LABELS`** al principio del archivo:

```typescript
import { SKILL_LABELS } from "../../../lib/skillLabels";
```

**3b. Modificá `techsToOptions`** (línea 24-26). Antes usaba `t.name` como label (ej: el label de `"frontend"` era `"frontend"`). Ahora debe mostrar el nombre legible:

```typescript
// ANTES
function techsToOptions(techs: KnownTechnology[]): Option[] {
  return techs.map((t) => ({ value: t.name, label: t.name }));
}

// DESPUES
function techsToOptions(techs: KnownTechnology[]): Option[] {
  return techs.map((t) => ({
    value: t.name,
    label: SKILL_LABELS[t.name] ?? t.name,
  }));
}
```

**3c. Modificá `buildTechOptions`** (línea 37-44). Mismo cambio — usar `SKILL_LABELS` para las opciones predefinidas:

```typescript
// ANTES
function buildTechOptions(selected: KnownTechnology[]): Option[] {
  const predefined = PREDEFINED_TECHNOLOGIES.map((t) => ({ value: t, label: t }));
  // ...
}

// DESPUES
function buildTechOptions(selected: KnownTechnology[]): Option[] {
  const predefined = PREDEFINED_TECHNOLOGIES.map((t) => ({
    value: t,
    label: SKILL_LABELS[t] ?? t,
  }));
  const customOpts = selected
    .filter((t) => t.is_custom)
    .filter((t) => !PREDEFINED_TECHNOLOGIES.includes(t.name))
    .map((t) => ({ value: t.name, label: t.name })); // custom usa el nombre tal cual
  return [...predefined, ...customOpts];
}
```

> **¿Por qué `SKILL_LABELS[t] ?? t`?** Si `t` no está en `SKILL_LABELS` (ej: un skill custom que el usuario escribió, como `"Zustand"`), el `?? t` asegura que se muestre el string original.

**3d. `optionsToTechs`** (línea 28-35) no necesita cambios. Ya trabaja con `opt.value` que es el identificador interno.

### Resultado esperado

- El select de tecnologías muestra `"Frontend"`, `"React"`, `"Docker"` (nombres legibles en español).
- Los datos enviados al backend contienen `{name: "frontend", is_custom: false}`, `{name: "react", is_custom: false}` (identificadores internos).
- Las tecnologías custom (ej: `"Zustand"`) se muestran y guardan con el nombre ingresado por el usuario: `{name: "Zustand", is_custom: true}`.
- Nada más del formulario de registro cambia. Solo el campo de tecnologías conocidas.

### Verificación completa

```bash
cd frontend
npx tsc --noEmit
# Esperado: 0 errores
npm run dev
# Abrí http://localhost:5173/register, llegá al Step 3
```

**Pruebas manuales:**

| Escenario | Qué esperar |
|-----------|------------|
| Abrir el select de tecnologías | Ves "Frontend", "Backend", "React", "Docker"... con nombres legibles |
| Seleccionar "Frontend" | El chip muestra "Frontend". Internamente `{name: "frontend", is_custom: false}` |
| Seleccionar "React" | El chip muestra "React". Internamente `{name: "react", is_custom: false}` |
| Escribir "Zustand" y crearlo | El chip muestra "Zustand". Internamente `{name: "Zustand", is_custom: true}` |
| Volver a abrir el select | Las custom ya seleccionadas aparecen en la lista de opciones |

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot find module '../../../lib/skillLabels'` | No creaste el archivo `skillLabels.ts` | Crealo en `frontend/src/lib/skillLabels.ts` con el contenido del paso 1 |
| El select muestra "frontend" en vez de "Frontend" | `buildTechOptions` no usa `SKILL_LABELS` | Revisá el paso 3c |
| Los chips seleccionados muestran "frontend" | `techsToOptions` no usa `SKILL_LABELS` | Revisá el paso 3b |
| `SKILL_LABELS` tiene error de tipo | El tipo no es `Record<string, string>` | Declaralo como `export const SKILL_LABELS: Record<string, string> = { ... }` |

### Criterios de aceptación Incidencia 16

- [ ] `skillLabels.ts` existe con los 47 skills mapeados a nombres legibles
- [ ] `PREDEFINED_TECHNOLOGIES` contiene skills normalizados (no tecnologías sueltas)
- [ ] `techsToOptions` usa `SKILL_LABELS` para mostrar nombres legibles
- [ ] `buildTechOptions` usa `SKILL_LABELS` para las opciones predefinidas
- [ ] Las tecnologías custom se muestran con su nombre original
- [ ] `npx tsc --noEmit` compila sin errores
- [ ] El formulario de registro sigue funcionando: todos los demás campos intactos
- [ ] Commit con: `feat(register): reemplazar tecnologias por skills normalizados`
