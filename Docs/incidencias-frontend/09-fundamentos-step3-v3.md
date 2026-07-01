## INCIDENCIA 09 — Fundamentos Step 3 v3: Tipos, Validación y Componentes Base

## Resumen

Esta incidencia construye toda la base de datos, validación y componentes reutilizables que necesita el nuevo Step 3 del registro. Actualiza los tipos de TypeScript para reflejar los 7 nuevos campos del modelo `User` (dejando los 3 legacy como opcionales), reescribe el schema de validación Zod con las reglas del nuevo formulario, actualiza el mapeo de campos entre el frontend y la API, extrae los estilos de `react-select` a un archivo compartido, crea un catálogo de constantes con sectores laborales, áreas de interés, tecnologías predefinidas y demás opciones, y construye dos componentes UI nuevos: `SearchableSelect` (wrapper configurable de react-select con soporte para multiselect y creación de opciones) y `CharCounter` (contador visual de caracteres).

**Rama:** `incidencia/09-fundamentos-step3-v3`  
**Duración estimada:** 1 día (6-8 horas).  
**Depende de:** Incidencia backend 07 mergeada (necesitás saber los nombres de los nuevos campos).  
**Asignada a:** 1 dev frontend.  
**Por qué existe separada de 10:** Estos archivos son la base. Sin ellos, el dev de la incidencia 10 no puede escribir el formulario. Al terminar esto, los tipos, schemas y componentes ya están listos para consumir.

### ¿Qué vas a aprender de TypeScript/React en esta incidencia?

| Concepto | ¿Qué es? |
|----------|---------|
| `z.object({...}).refine()` | Validación condicional en Zod — "si A entonces B es obligatorio" |
| `z.array(z.object({...}))` | Array de objetos tipados en Zod — para `knownTechnologies` |
| `sa_column=Column(JSON)` → `list[dict]` en TypeScript | Cómo se mapea un JSON de PostgreSQL a un tipo de TS |
| `forwardRef` con react-select | Por qué react-select necesita `Controller` de react-hook-form en vez de `register` |
| `StylesConfig<Option, IsMulti>` | Tipado genérico de estilos de react-select — single vs multi |
| `isMulti` + `isCreatable` en un solo componente | Cómo un wrapper puede alternar entre `Select` y `CreatableSelect` |

### Pre-lectura (30 min)

| Archivo | ¿Por qué? |
|---------|----------|
| `frontend/src/types/api.ts` | Vas a modificar las interfaces `User` y `UserCreateRequest` |
| `frontend/src/lib/validations.ts` | Vas a reescribir `registerStep3Schema` |
| `frontend/src/lib/fieldMappings.ts` | Vas a reescribir `mapRegisterFormToApi()` |
| `frontend/src/modules/auth/registerSteps/registerStep2.tsx` | Vas a extraer `selectStyles` de acá — entendé cómo usa react-select |
| `frontend/package.json` | Verificá que `react-select` ya está instalado (versión 5.x) |

### Antes de codear: flujo git

```bash
git checkout main
git pull origin main
git checkout -b incidencia/09-fundamentos-step3-v3
```

### Paso a paso

#### Archivo 1: `frontend/src/lib/selectStyles.ts` (NUEVO)

Extraé los estilos de react-select de `registerStep2.tsx` a un archivo compartido.

**¿Por qué?** El nuevo Step 3 usa react-select en 3 lugares (sector, áreas de interés, tecnologías). Si dejamos los estilos duplicados, cualquier cambio de color hay que hacerlo en 4 archivos. Un solo archivo = una sola fuente de verdad.

```typescript
import type { StylesConfig } from "react-select";

const brandColor = "#99462A";

export const SELECT_MENU_PROPS = {
  menuPosition: "fixed" as const,
  maxMenuHeight: 200,
};

export const selectStyles: StylesConfig<{ value: string; label: string }, false> = {
  control: (base) => ({
    ...base,
    minHeight: "3.5rem",
    borderRadius: "0.75rem",
    borderColor: "transparent",
    backgroundColor: "#f5f5f4",
    boxShadow: "none",
    "&:hover": { borderColor: "transparent" },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "rgba(153, 70, 42, 0.1)" : "white",
    color: state.isFocused ? brandColor : "#292524",
    cursor: "pointer",
    fontSize: "0.875rem",
    padding: "0.625rem 0.75rem",
  }),
  singleValue: (base) => ({ ...base, color: "#292524", fontSize: "0.875rem" }),
  placeholder: (base) => ({ ...base, color: "#a8a29e", fontSize: "0.875rem" }),
  menu: (base) => ({ ...base, borderRadius: "0.75rem", marginTop: "0.25rem" }),
  menuList: (base) => ({ ...base, padding: "0.25rem" }),
  // Estilos para modo multiselect (chips)
  multiValue: (base) => ({
    ...base,
    backgroundColor: "rgba(153, 70, 42, 0.1)",
    borderRadius: "0.5rem",
    margin: "2px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: brandColor,
    fontSize: "0.8125rem",
    padding: "2px 6px",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: brandColor,
    borderRadius: "0 0.5rem 0.5rem 0",
    ":hover": {
      backgroundColor: "rgba(153, 70, 42, 0.2)",
      color: "#292524",
    },
  }),
};

// Versión para multiselect (isMulti = true)
export const selectStylesMulti: StylesConfig<{ value: string; label: string }, true> =
  selectStyles as unknown as StylesConfig<{ value: string; label: string }, true>;
```

**Por qué hay dos exports:** `selectStyles` está tipado para single-select (`false`), `selectStylesMulti` para multiselect (`true`). TypeScript no permite asignar uno al otro sin cast — de ahí el `as unknown as`.

#### Archivo 2: `frontend/src/lib/registrationData.ts` (NUEVO)

Catálogo de todas las opciones estáticas del nuevo formulario. Datos, no lógica.

```typescript
// Situación actual (3 opciones)
export const CURRENT_SITUATION_OPTIONS = [
  { value: "student", label: "Estudiante" },
  { value: "unemployed", label: "Desempleado" },
  { value: "employed", label: "Actualmente trabajando" },
] as const;

// Sectores laborales (14 opciones — para CreatableSelect)
export const WORK_SECTORS = [
  { value: "it", label: "Informática / IT" },
  { value: "education", label: "Educación" },
  { value: "health", label: "Salud" },
  { value: "finance", label: "Finanzas" },
  { value: "commerce", label: "Comercio" },
  { value: "industry", label: "Industria" },
  { value: "construction", label: "Construcción" },
  { value: "logistics", label: "Logística" },
  { value: "marketing", label: "Marketing" },
  { value: "hr", label: "Recursos Humanos" },
  { value: "administration", label: "Administración" },
  { value: "telecom", label: "Telecomunicaciones" },
  { value: "government", label: "Gobierno" },
  { value: "tourism", label: "Turismo y Hotelería" },
];

// Seniority (3 opciones)
export const SENIORITY_OPTIONS = [
  { value: "junior", label: "Junior" },
  { value: "semi_senior", label: "Semi Senior" },
  { value: "senior", label: "Senior" },
] as const;

// ¿Qué estás buscando? (4 opciones — single select)
export const CURRENT_SEARCH_OPTIONS = [
  { value: "study", label: "Estudiar" },
  { value: "define_path", label: "Definir mi camino profesional" },
  { value: "find_job", label: "Buscar empleo" },
  { value: "change_job", label: "Cambiar de empleo" },
] as const;

// Áreas de interés (15 opciones — multiselect + creatable)
export const INTEREST_AREAS = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Full Stack" },
  { value: "mobile", label: "Mobile" },
  { value: "ai_ml", label: "IA/Machine Learning" },
  { value: "data_science", label: "Ciencia de Datos" },
  { value: "devops", label: "DevOps" },
  { value: "cloud", label: "Cloud" },
  { value: "cybersecurity", label: "Ciberseguridad" },
  { value: "qa_testing", label: "QA/Testing" },
  { value: "ux_ui", label: "UX/UI" },
  { value: "product_management", label: "Product Management" },
  { value: "blockchain", label: "Blockchain" },
  { value: "iot", label: "IoT" },
  { value: "game_development", label: "Game Development" },
];

// Tecnologías predefinidas (~50 opciones — multiselect + creatable)
export const PREDEFINED_TECHNOLOGIES = [
  "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust",
  "Ruby", "PHP", "Kotlin", "Swift", "Dart", "Scala", "R", "SQL",
  "React", "Angular", "Vue.js", "Svelte", "Next.js", "Nuxt",
  "Django", "Flask", "FastAPI", "Spring Boot", ".NET",
  "Express", "NestJS", "Laravel", "Ruby on Rails",
  "Flutter", "React Native", "Electron",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite",
  "Firebase", "DynamoDB", "Elasticsearch",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP",
  "Terraform", "Ansible", "CI/CD", "Linux", "Git",
  "Figma", "Jira", "Notion", "GraphQL", "REST API",
  "Webpack", "Vite", "Tailwind CSS", "Sass",
];
```

#### Archivo 3: `frontend/src/components/ui/SearchableSelect.tsx` (NUEVO)

Un SOLO componente que cubre los 3 casos de uso del formulario:
- Sector laboral: single-select + creatable
- Áreas de interés: multiselect + creatable
- Tecnologías: multiselect + creatable

Props clave: `isMulti`, `isCreatable`. Si `isCreatable` es true, renderiza `CreatableSelect` en vez de `Select`.

```typescript
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import {
  selectStyles,
  selectStylesMulti,
  SELECT_MENU_PROPS,
} from "../../lib/selectStyles";

export interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  id?: string;
  options: Option[];
  value: Option | Option[] | null;
  onChange: (value: any) => void;
  onBlur?: () => void;
  placeholder?: string;
  isMulti?: boolean;
  isCreatable?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  noOptionsMessage?: string;
  formatCreateLabel?: (inputValue: string) => string;
  onCreateOption?: (inputValue: string) => void;
}

export default function SearchableSelect({
  id, options, value, onChange, onBlur,
  placeholder = "Seleccioná...",
  isMulti = false, isCreatable = false,
  isDisabled = false, isLoading = false,
  error, label, required,
  noOptionsMessage, formatCreateLabel, onCreateOption,
}: SearchableSelectProps) {
  const commonProps = {
    inputId: id,
    ...SELECT_MENU_PROPS,
    options, value, onChange, onBlur, placeholder,
    isDisabled, isLoading,
    isClearable: true,
    noOptionsMessage: () => noOptionsMessage ?? "Sin resultados",
    styles: isMulti ? (selectStylesMulti as any) : (selectStyles as any),
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-stone-800">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {isCreatable ? (
        <CreatableSelect
          {...commonProps}
          isMulti={isMulti}
          formatCreateLabel={formatCreateLabel ?? ((input) => `Agregar "${input}"`)}
          onCreateOption={onCreateOption}
        />
      ) : (
        <Select {...commonProps} isMulti={isMulti} />
      )}

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
```

**¿Por qué `onChange: (value: any)` en vez de un tipo más estricto?** react-select cambia el tipo de `onChange` según `isMulti`. Con `isMulti=false` recibe `SingleValue<Option>`; con `isMulti=true` recibe `MultiValue<Option>`. Como el componente alterna entre ambos en runtime, `any` es la opción pragmática. El padre (registerStep3) sabe qué tipo esperar según el contexto.

#### Archivo 4: `frontend/src/components/ui/CharCounter.tsx` (NUEVO)

Contador visual de caracteres con barra de progreso. Cambia de color al acercarse al límite.

```typescript
interface CharCounterProps {
  current: number;
  max: number;
}

export default function CharCounter({ current, max }: CharCounterProps) {
  const percentage = Math.min((current / max) * 100, 100);
  const isNearLimit = current >= max * 0.8;
  const isOverLimit = current > max;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-stone-400">{current}/{max}</span>
        {isOverLimit && (
          <span className="text-xs text-red-500 font-medium">Excediste el límite</span>
        )}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
        <div
          className={`h-full transition-all duration-200 rounded-full ${
            isOverLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-[#99462A]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

#### Archivo 5: `frontend/src/types/api.ts` (MODIFICAR)

Agregá la interfaz `KnownTechnology` y actualizá `User` y `UserCreateRequest`. **Copiá estas interfaces exactamente — no improvises nombres de campos.**

```typescript
export interface KnownTechnology {
  name: string;
  is_custom: boolean;
}
```

**`User`:**
```typescript
export interface User {
  id: string;
  email: string;
  full_name: string;
  birth_date: string;
  gender: string;
  education_level: string;

  continent_code: string;
  continent_name: string;
  country_code: string;
  country_name: string;
  state_code: string;
  state_name: string;
  city_name: string;
  whatsapp_e164: string;

  language_code: string;

  // ── Step 3 v3 — nuevos campos ──────────────────────────────────────────
  current_situation: string;
  work_sector?: string | null;
  seniority?: string | null;
  interest_areas: string[];
  current_search?: string | null;
  known_technologies: KnownTechnology[];
  bio?: string | null;

  // ── Legacy (nullable para nuevos usuarios) ─────────────────────────────
  professional_level?: ProfessionalLevel | null;
  tech_area?: string | null;
  career_objective?: CareerObjective | null;

  created_at: string;
}
```

**`UserCreateRequest`:**
```typescript
export interface UserCreateRequest {
  email: string;
  password: string;
  full_name: string;
  birth_date: string;
  gender: string;
  education_level: string;

  continent_code: string;
  continent_name: string;
  country_code: string;
  country_name: string;
  state_code: string;
  state_name: string;
  city_name: string;
  whatsapp_e164: string;

  language_code: string;

  // ── Step 3 v3 — nuevos campos ──────────────────────────────────────────
  current_situation: string;
  work_sector?: string | null;
  seniority?: string | null;
  interest_areas: string[];
  current_search?: string | null;
  known_technologies: KnownTechnology[];
  bio?: string | null;

  // ── Legacy ─────────────────────────────────────────────────────────────
  professional_level?: ProfessionalLevel | null;
  tech_area?: string | null;
  career_objective?: CareerObjective | null;
}
```

**IMPORTANTE:** Los nombres van en **snake_case** (`current_situation`, `interest_areas`, `known_technologies`) porque estas interfaces se usan directamente en el body del POST a la API. No los confundas con los nombres camelCase del formulario (`currentSituation`, `interestAreas`).

#### Archivo 6: `frontend/src/lib/validations.ts` (MODIFICAR)

Reemplazá `registerStep3Schema` completo:

```typescript
export const registerStep3Schema = z.object({
  currentSituation: z.string().min(1, "Seleccioná tu situación actual"),
  workSector: z.string().optional(),
  seniority: z.string().optional(),
  interestAreas: z
    .array(z.string())
    .min(1, "Seleccioná al menos un área de interés"),
  currentSearch: z.string().min(1, "Seleccioná qué estás buscando"),
  knownTechnologies: z
    .array(z.object({ name: z.string(), is_custom: z.boolean() }))
    .optional()
    .default([]),
  bio: z.string().max(500, "Máximo 500 caracteres").optional().default(""),
});
```

**IMPORTANTE:** NO pongas `.refine()` para la validación condicional de "si trabaja → sector y seniority obligatorios". Esa validación va en el `onSubmit` del formulario (incidencia 10), no en el schema Zod. Si la ponés acá, el error aparece mientras el usuario está tipeando en vez de solo al hacer submit.

El tipo `RegisterFormData` se actualiza solo — está inferido del merge de los 3 schemas.

#### Archivo 7: `frontend/src/lib/fieldMappings.ts` (MODIFICAR)

Reemplazá `mapRegisterFormToApi()`. Los campos viejos (`professional_level`, `tech_area`, `career_objective`) se envían como `null`. Los campos condicionales (`work_sector`, `seniority`) solo se envían si `currentSituation === "employed"`.

```typescript
export function mapRegisterFormToApi(formData: RegisterFormData): UserCreateRequest {
  return {
    // ... campos existentes sin cambios ...
    
    // Step 3 v3 — nuevos campos
    current_situation: formData.currentSituation,
    work_sector: formData.currentSituation === "employed" && formData.workSector
      ? formData.workSector : null,
    seniority: formData.currentSituation === "employed" && formData.seniority
      ? formData.seniority : null,
    interest_areas: formData.interestAreas,
    current_search: formData.currentSearch || null,
    known_technologies: formData.knownTechnologies,
    bio: formData.bio || null,

    // Legacy — no se envían
    professional_level: null,
    tech_area: null,
    career_objective: null,
  };
}
```

Borrá los exports `EXPERIENCE_LEVEL_MAP` y `CURRENT_GOAL_MAP` — ya no se usan.

### Verificación completa

```bash
# 1. TypeScript compila sin errores
cd frontend
npx tsc --noEmit
# Esperado: 0 errores (puede haber errores PREEXISTENTES en otros archivos — solo asegurate de no introducir nuevos)

# 2. Archivos creados
ls src/lib/selectStyles.ts src/lib/registrationData.ts src/components/ui/SearchableSelect.tsx src/components/ui/CharCounter.tsx
```

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot find module 'react-select/creatable'` | `CreatableSelect` se importa de un subpath | `import CreatableSelect from "react-select/creatable"` (sin llaves) |
| `Type 'StylesConfig<Option, false>' is not assignable to type 'StylesConfig<Option, true>'` | Los tipos de single y multi son incompatibles | Usá `as unknown as StylesConfig<...>` como en el ejemplo |
| `Property 'interestAreas' does not exist on type 'RegisterFormData'` | No actualizaste `registerStep3Schema` | Revisá que el schema nuevo tenga `interestAreas` (camelCase en frontend) |
| `Type 'null' is not assignable to type 'ProfessionalLevel'` | Estás pasando `null` a `professional_level` en `UserCreateRequest` pero el tipo no lo permite | Hiciste bien el paso 5 — `professional_level` debe ser `ProfessionalLevel \| null` en `UserCreateRequest` |
| El `Select` de `react-select` no se estila | No estás importando `selectStyles` del archivo compartido | Verificá que `SearchableSelect` importe de `../../lib/selectStyles` y que los estilos se pasen vía la prop `styles` |

### Criterios de aceptación Incidencia 09

- [ ] `selectStyles.ts` exporta estilos compartidos para single y multi
- [ ] `registrationData.ts` contiene las 5 constantes de opciones + tecnologías predefinidas
- [ ] `SearchableSelect.tsx` alterna entre `Select` y `CreatableSelect` según la prop `isCreatable`
- [ ] `SearchableSelect.tsx` soporta `isMulti` en ambos modos
- [ ] `CharCounter.tsx` muestra barra de progreso con cambio de color a 80% y 100%
- [ ] `User` y `UserCreateRequest` tienen los 7 campos nuevos y los 3 legacy como opcionales
- [ ] `registerStep3Schema` valida los 7 campos con las reglas correctas
- [ ] `mapRegisterFormToApi` envía `null` para los campos legacy
- [ ] `npx tsc --noEmit` no introduce NUEVOS errores en los archivos de esta incidencia
- [ ] Commit con: `feat(ui): agregar tipos, validación y componentes base para Step 3 v3`

---
