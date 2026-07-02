# Frontend: Actualizar el formulario de registro con skills normalizados

## Contexto

El backend ahora usa un motor de matching determinístico con 47 skills normalizados (ej: `frontend`, `react`, `docker`, `python`). Para que el matching funcione correctamente, las tecnologías que el usuario selecciona en el Step 3 del registro deben ser exactamente esos skills normalizados, no las tecnologías sueltas que había antes (`"React"`, `"Next.js"`, etc.).

Esto elimina la necesidad de un mapping intermedio entre lo que elige el usuario y lo que calcula el motor.

## Qué hay que hacer

### Paso 1: `src/lib/registrationData.ts` (línea 60-74)

Reemplazar `PREDEFINED_TECHNOLOGIES` completo. Donde antes había:
```typescript
export const PREDEFINED_TECHNOLOGIES = [
  "JavaScript", "TypeScript", "Python", "Java", ...
  "React", "Angular", "Vue.js", ...
  "Docker", "Kubernetes", "AWS", ...
];
```

Ahora debe contener los 47 skills normalizados:

```typescript
// Skills normalizados del motor de matching (47 opciones — multiselect + creatable)
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

> **Importante:** Los valores son identificadores en minúsculas con snake_case. Estos mismos strings son los que el backend espera recibir en `known_technologies[].name`.

### Paso 2: `src/modules/auth/registerSteps/registerStep3.tsx`

El problema: en el select de tecnologías, el `value` y el `label` ahora son diferentes. Por ejemplo, el valor `"frontend"` debe mostrarse como `"Frontend"`, `"game_development"` como `"Game Development"`.

**2a. Agregar el mapa de labels.** Crear un nuevo archivo `src/lib/skillLabels.ts`:

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

**2b. Modificar `registerStep3.tsx`.** Importar `SKILL_LABELS` y modificar las funciones helper para usar el label correcto:

```typescript
import { SKILL_LABELS } from "../../../lib/skillLabels";
```

- **`techsToOptions`** (línea 24-26):
  ```typescript
  function techsToOptions(techs: KnownTechnology[]): Option[] {
    return techs.map((t) => ({
      value: t.name,
      label: SKILL_LABELS[t.name] ?? t.name,  // usa label legible
    }));
  }
  ```

- **`buildTechOptions`** (línea 37-44):
  ```typescript
  function buildTechOptions(selected: KnownTechnology[]): Option[] {
    const predefined = PREDEFINED_TECHNOLOGIES.map((t) => ({
      value: t,
      label: SKILL_LABELS[t] ?? t,  // usa label legible
    }));
    const customOpts = selected
      .filter((t) => t.is_custom)
      .filter((t) => !PREDEFINED_TECHNOLOGIES.includes(t.name))
      .map((t) => ({ value: t.name, label: t.name }));  // custom usa el nombre tal cual
    return [...predefined, ...customOpts];
  }
  ```

- **`optionsToTechs`** (línea 28-35): no necesita cambios. Ya funciona con values.

### Resultado esperado

- El select muestra `"Frontend"`, `"React"`, `"Docker"` (nombres legibles).
- Los datos enviados al backend contienen `"frontend"`, `"react"`, `"docker"` (identificadores).
- Las tecnologías custom (ej: `"Zustand"`) se muestran y guardan con el nombre ingresado por el usuario.
- Nada más del formulario de registro cambia. Solo el campo de tecnologías conocidas.
