## INCIDENCIA 10 — Formulario Step 3 v3

## Resumen

Esta incidencia reemplaza el Step 3 del registro de usuario (3 selects simples: nivel de experiencia, área de interés única, objetivo único) por un formulario de 7 campos con lógica condicional, multiselect, creación de opciones personalizadas y contador de caracteres. También actualiza el componente padre `register.tsx` para que use los nuevos campos en sus defaultValues, stepFields y validación, y refactoriza `registerStep2.tsx` para que importe los estilos de react-select del archivo compartido creado en la incidencia 09.

**Rama:** `incidencia/10-formulario-step3-v3`  
**Duración estimada:** 1 día (6-8 horas).  
**Depende de:** 09 terminada y mergeada a main.  
**Asignada a:** 1 dev frontend (puede ser el mismo de 09 u otro).  
**Por qué esta incidencia existe separada de 09:** La incidencia 09 construye las herramientas (tipos, schemas, componentes). Esta incidencia las USA para construir el formulario. Separarlas permite que el dev de 09 entregue rápido y el dev de 10 arranque sin bloqueos.

### ¿Qué vas a aprender de React/TypeScript en esta incidencia?

| Concepto | ¿Qué es? |
|----------|---------|
| `Controller` de react-hook-form | Cómo integrar componentes no nativos (react-select) con el estado del formulario |
| `watch("campo")` + renderizado condicional | Mostrar/ocultar campos según el valor de otro campo |
| `setValue("campo", "", { shouldValidate: false })` | Limpiar campos dependientes cuando cambia el campo padre |
| `setError("campo", { message })` en onSubmit | Validación manual que solo se ejecuta al hacer submit |
| `CreatableSelect` con `onCreateOption` | Agregar opciones personalizadas a un select en runtime |
| `buildTechOptions()` — estado derivado | Reconstruir la lista de opciones combinando predefinidas + custom |

### Pre-lectura (30 min)

| Archivo | ¿Por qué? |
|---------|----------|
| `frontend/src/modules/auth/register.tsx` | Vas a modificar `defaultValues`, `stepFields`, `onSubmit` y cómo se pasa `form` a Step 3 |
| `frontend/src/modules/auth/registerSteps/registerStep2.tsx` | Vas a hacer un refactor mínimo — sacar los estilos locales e importarlos de `lib/selectStyles` |
| `frontend/src/modules/auth/registerSteps/registerStep3.tsx` | Vas a reescribirlo completo |
| `frontend/src/lib/validations.ts` | Revisá `RegisterFormData` y `registerStep3Schema` que creó el dev de 09 |
| `frontend/src/lib/registrationData.ts` | Constantes que vas a usar en el JSX |
| `frontend/src/components/ui/SearchableSelect.tsx` | API del componente que creó el dev de 09 |

### Antes de codear: flujo git

```bash
git checkout main
git pull origin main            # 09 ya debe estar mergeado
git checkout -b incidencia/10-formulario-step3-v3
```

### Paso a paso

#### Archivo 1: `frontend/src/modules/auth/register.tsx` (MODIFICAR)

Tres cambios en este archivo:

**1a. Actualizar `defaultValues`:**

Reemplazá las 3 líneas viejas:
```typescript
experienceLevel: "",
technologyArea: "",
currentGoal: "",
```
Por las 7 nuevas:
```typescript
currentSituation: "",
workSector: "",
seniority: "",
interestAreas: [],
currentSearch: "",
knownTechnologies: [],
bio: "",
```

**1b. Actualizar `stepFields[3]`:**

Antes:
```typescript
3: ["experienceLevel", "technologyArea", "currentGoal"],
```
Después:
```typescript
3: ["currentSituation", "interestAreas", "currentSearch"],
```

Los campos `workSector` y `seniority` son condicionales — no se validan en el trigger del step. `knownTechnologies` y `bio` son opcionales.

**1c. Agregar validación condicional en `onSubmit`:**

La validación de "si trabaja → sector y seniority obligatorios" DEBE ir en el `onSubmit`, NO en el schema Zod. Esto asegura que el error solo aparezca cuando el usuario clickea "Finalizar registro", no mientras está tipeando.

Agregá al principio del `onSubmit` (antes del `setIsSubmitting(true)`):

```typescript
const onSubmit = async (data: RegisterFormData) => {
  clearError();

  // Validación condicional: si trabaja, sector y seniority obligatorios
  if (data.currentSituation === "employed") {
    if (!data.workSector || data.workSector.trim().length === 0) {
      setError("workSector", {
        message: "Completá el sector en que trabajás",
      });
      return;
    }
    if (!data.seniority) {
      setError("seniority", {
        message: "Seleccioná tu nivel de seniority",
      });
      return;
    }
  }

  setIsSubmitting(true);
  // ... resto del try/catch sin cambios ...
};
```

**Para usar `setError`:** Agregá `setError` en la desestructuración de `form`:
```typescript
const {
  register, handleSubmit, trigger, watch,
  setFocus, setValue, setError,
  formState: { errors },
} = form;
```

**1d. Cambiar cómo se pasa el form a Step 3:**

Antes:
```tsx
<RegisterStep3 register={register} trigger={trigger} errors={errors} />
```
Después:
```tsx
<RegisterStep3 form={form} />
```

El nuevo Step 3 recibe el objeto `form` completo (mismo patrón que Step 2) porque necesita `control`, `watch`, `setValue` además de `register` y `errors`.

**1e. Remover la segunda `.refine()` del `fullSchema`:**

Si el dev de 09 la dejó, borrala. La validación condicional ahora está en `onSubmit`.

El `fullSchema` debe tener SOLO el refine de contraseñas:
```typescript
const fullSchema = registerStep1Schema
  .merge(registerStep2Schema)
  .merge(registerStep3Schema)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
```

**1f. Cast del resolver (OBLIGATORIO con Zod 4):**

El `fullSchema` usa `.merge()` + `.refine()`. En Zod 4 esto produce un tipo que react-hook-form no puede inferir correctamente. El cast `as any` es necesario — **siempre**, no solo "si se queja". Sin esto, `npx tsc --noEmit` falla.

Cambiá:
```typescript
resolver: zodResolver(fullSchema),
```
Por:
```typescript
resolver: zodResolver(fullSchema) as any,
```

#### Archivo 2: `frontend/src/modules/auth/registerSteps/registerStep3.tsx` (REESCRIBIR)

Este es el archivo principal de la incidencia. Borrá TODO el contenido actual y reescribilo desde cero.

**Props:**
```typescript
interface RegisterStep3Props {
  form: UseFormReturn<RegisterFormData, any, any>;
}
```

**Estructura del JSX (7 campos en orden):**

```
1. currentSituation → <Select> nativo (3 opciones)
2. [condicional: currentSituation === "employed"]
   └─ workSector → <Controller> + <SearchableSelect isCreatable />
   └─ seniority  → <Select> nativo
3. interestAreas → <Controller> + <SearchableSelect isMulti isCreatable />
   └─ hint: "Podés elegir más de una. Si no ves la tuya, escribila para agregarla."
4. currentSearch → <Select> nativo (4 opciones)
5. knownTechnologies → <Controller> + <SearchableSelect isMulti isCreatable />
   └─ hint: "Seleccioná una o más. Si no encontrás la tuya, escribila para agregarla."
6. bio → <textarea> nativo (max 500) + contador "n/500"
7. Mensaje informativo (ya existía, mantener)
```

**Lógica de los helpers para tecnologías:**

Las tecnologías conocidas se almacenan como `KnownTechnology[]` (array de `{name, is_custom}`), pero react-select trabaja con `Option[]` (array de `{value, label}`). Necesitás 3 funciones de conversión:

```typescript
/** Convierte KnownTechnology[] a Option[] para react-select */
function techsToOptions(techs: KnownTechnology[]): Option[] {
  return techs.map((t) => ({ value: t.name, label: t.name }));
}

/** Convierte Option[] a KnownTechnology[], preservando el flag is_custom */
function optionsToTechs(
  opts: readonly Option[],
  existing: KnownTechnology[],
): KnownTechnology[] {
  return opts.map((opt) => {
    const prev = existing.find((t) => t.name === opt.value);
    return prev ?? { name: opt.value, is_custom: false };
  });
}

/** Arma las options predefinidas + las custom ya seleccionadas (evita duplicados) */
function buildTechOptions(selected: KnownTechnology[]): Option[] {
  const predefined = PREDEFINED_TECHNOLOGIES.map((name) => ({
    value: name,
    label: name,
  }));
  const customs = selected
    .filter((t) => t.is_custom)
    .map((t) => ({ value: t.name, label: t.name }));
  const predefinedValues = new Set(predefined.map((o) => o.value));
  const uniqueCustoms = customs.filter((c) => !predefinedValues.has(c.value));
  return [...predefined, ...uniqueCustoms];
}
```

**Lógica condicional — `watch` + `setValue`:**

Cuando el usuario cambia `currentSituation` de "employed" a otra cosa, los campos `workSector` y `seniority` deben limpiarse:

```typescript
const currentSituation = watch("currentSituation");
const bio = watch("bio");
const isEmployed = currentSituation === "employed";
```

En el `onChange` del Select de situación actual:
```typescript
onChange: () => {
  setValue("workSector", "", { shouldValidate: false });
  setValue("seniority", "", { shouldValidate: false });
  form.trigger("currentSituation");
}
```

**Integración con react-hook-form:**

Para `interestAreas`, `workSector` y `knownTechnologies` (los que usan `SearchableSelect`), usá `Controller`:

```tsx
<Controller
  name="interestAreas"
  control={control}
  render={({ field }) => (
    <SearchableSelect
      isMulti
      isCreatable
      value={field.value?.map(...)}
      onChange={(opts) => setValue("interestAreas", opts.map(o => o.value), { shouldValidate: true })}
      ...
    />
  )}
/>
```

**Para el textarea del bio:**

No uses `CharCounter` (barra de progreso). Solo mostrá el texto `n/500`:

```tsx
<div className="flex justify-end">
  <span className={`text-xs ${(bio?.length ?? 0) > 500 ? "text-red-500 font-medium" : "text-stone-400"}`}>
    {bio?.length ?? 0}/500
  </span>
</div>
```

El archivo completo debe ocupar aproximadamente 280 líneas.

**Especificación precisa de cada campo (seguí este orden exacto):**

| # | Campo | Componente | Propiedades clave |
|---|-------|-----------|------------------|
| 1 | `currentSituation` | `<Select>` nativo | `id="currentSituation"`, `label="Situación actual"`, `required`, options con `""` + `CURRENT_SITUATION_OPTIONS`, `onChange` con `setValue` para limpiar sector y seniority |
| 2a | `workSector` | `<Controller>` + `<SearchableSelect>` | `id="workSector"`, `label="¿En qué sector trabajás?"`, `required`, `isCreatable`, `placeholder="Seleccioná o escribí tu sector"`, `options={WORK_SECTORS}`. Solo se renderiza si `isEmployed`. |
| 2b | `seniority` | `<Select>` nativo | `id="seniority"`, `label="Seniority"`, `required`, options con `""` + `SENIORITY_OPTIONS`. Solo se renderiza si `isEmployed`. |
| 3 | `interestAreas` | `<Controller>` + `<SearchableSelect>` | `id="interestAreas"`, `label="Áreas de interés"`, `required`, `isMulti`, `isCreatable`, `placeholder="Seleccioná una o más áreas..."`, `options={INTEREST_AREAS}`, `noOptionsMessage="Escribí para agregar"`. Debajo: `<p>` con hint *"Podés elegir más de una. Si no ves la tuya, escribila para agregarla."* |
| 4 | `currentSearch` | `<Select>` nativo | `id="currentSearch"`, `label="¿Qué estás buscando actualmente?"`, `required`, options con `""` + `CURRENT_SEARCH_OPTIONS` |
| 5 | `knownTechnologies` | `<Controller>` + `<SearchableSelect>` | `id="knownTechnologies"`, `label="¿Qué tecnologías conocés?"`, `isMulti`, `isCreatable`, `placeholder="Buscá o escribí tecnologías (podés elegir varias)..."`, `options={buildTechOptions(field.value)}`, `onCreateOption`, `noOptionsMessage="Escribí para agregar"`. Debajo: `<p>` con hint *"Seleccioná una o más. Si no encontrás la tuya, escribila para agregarla."* |
| 6 | `bio` | `<textarea>` nativo | `id="bio"`, `label="Cuéntanos sobre ti"`, `rows={4}`, `maxLength={500}`, `placeholder="Compartí algo sobre vos, tu trayectoria o lo que te motiva..."`. Debajo: `<span>` con `{bio?.length ?? 0}/500` en `text-xs`, rojo si >500. **Sin barra de progreso.** |
| 7 | — | `<div>` | Mensaje informativo con fondo `bg-stone-100`: *"Tus respuestas nos ayudarán a personalizar recomendaciones..."* |

**Si necesitás ver el resultado exacto, el archivo de referencia está en la branch `feat/step3-v3` (o la branch donde se implementó originalmente).**

#### Archivo 3: `frontend/src/modules/auth/registerSteps/registerStep2.tsx` (REFACTOR)

**Dos cambios en este archivo.**

**3a. Cambiar los imports:**

Antes:
```typescript
import Select, { type SingleValue, type StylesConfig } from "react-select";
import CreatableSelect from "react-select/creatable";
// ... ~30 líneas de estilos locales (brandColor, SELECT_MENU_PROPS, selectStyles)
```

Después:
```typescript
import Select, { type SingleValue } from "react-select";
import CreatableSelect from "react-select/creatable";
import { selectStyles, SELECT_MENU_PROPS } from "../../../lib/selectStyles";
```

**3b. Actualizar la interfaz de props:**

El tipo `UseFormReturn<RegisterFormData>` ya no es compatible porque el `useForm` de `register.tsx` ahora tiene el cast `as any` que le da un tipo más ancho. Cambiá:

```typescript
// Antes
interface RegisterStep2Props {
  form: UseFormReturn<RegisterFormData>;
}

// Después
interface RegisterStep2Props {
  form: UseFormReturn<RegisterFormData, any, any>;
}
```

Sin este cambio, `npx tsc --noEmit` falla con un error de `handleSubmit` incompatible.

Borrá también las definiciones locales de `brandColor`, `SELECT_MENU_PROPS` y `selectStyles`. El resto del archivo no se toca.

#### Archivo 4: `frontend/src/mocks/users.ts` (MODIFICAR)

Los mocks de usuarios necesitan los 3 nuevos campos requeridos. Agregá a cada mock:

```typescript
current_situation: "student",
interest_areas: ["frontend"],
known_technologies: [],
```

Si un mock representa a alguien que trabaja, usá `"employed"` y agregá `work_sector` y `seniority`.

### Verificación completa

```bash
# 1. TypeScript compila sin errores
cd frontend
npx tsc --noEmit
# Esperado: 0 errores

# 2. La app levanta en dev
npm run dev
# Abrí http://localhost:5173/register
```

**Pruebas manuales en el navegador:**

| Escenario | Qué esperar |
|-----------|------------|
| Seleccionar "Estudiante" | Solo se muestran los campos base (áreas, búsqueda, tecnologías, bio). Sector y seniority NO aparecen. |
| Seleccionar "Desempleado" | Ídem. |
| Seleccionar "Actualmente trabajando" | Aparecen sector (creatable) y seniority. |
| Escribir un sector que no está en la lista | El CreatableSelect muestra "Agregar '...'" y lo agrega. |
| Seleccionar varias áreas de interés | Se muestran como chips removibles. |
| Escribir un área que no está en la lista | El CreatableSelect permite agregarla. |
| Buscar una tecnología y seleccionarla | Se agrega como chip con `is_custom = false`. |
| Escribir una tecnología nueva (ej: "COBOL") | Se agrega como chip con `is_custom = true`. |
| Escribir en el textarea | El contador `n/500` se actualiza en tiempo real. |
| Dejar sector o seniority vacío y clickear "Finalizar registro" | Aparece error en el campo correspondiente. |
| Llenar todo correctamente y clickear "Finalizar registro" | Se envía el formulario sin errores. |

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `Type 'UseFormReturn<...>' is not assignable to type 'UseFormReturn<RegisterFormData>'` | Los genéricos de react-hook-form no coinciden | Cambiá las props de Step 3 a `UseFormReturn<RegisterFormData, any, any>` |
| Los campos condicionales NO se limpian al cambiar situación | No pusiste `setValue` en el `onChange` | Agregá `setValue("workSector", "", { shouldValidate: false })` |
| El error de "sector y seniority obligatorios" aparece mientras tipeo | La validación está en el schema Zod en vez de en `onSubmit` | Movela a `onSubmit` con `setError` |
| `watch("bio")` devuelve `undefined` en vez de `""` | El default value de bio no se inicializó | Verificá que `defaultValues` tenga `bio: ""` |
| Las opciones custom no aparecen en el dropdown de tecnologías | `buildTechOptions` no incluye las custom ya seleccionadas | Revisá que estés pasando `field.value` a `buildTechOptions()` |
| `registerStep2` no compila después del refactor | Quedó una referencia a `StylesConfig` o `brandColor` | Buscá `StylesConfig` y `brandColor` en el archivo — no deberían existir |
| Las opciones de react-select no tienen los colores de marca | No se está importando `selectStyles` correctamente | Verificá que los 3 lugares (Step 2, Step 3 workSector, Step 3 interestAreas) importen del mismo archivo |

### Criterios de aceptación Incidencia 10

- [ ] Step 3 muestra los 7 campos nuevos en el orden correcto
- [ ] Sector y seniority solo aparecen cuando `currentSituation === "employed"`
- [ ] Al cambiar situación a "Estudiante" o "Desempleado", sector y seniority se limpian
- [ ] Sector usa CreatableSelect — se puede elegir de la lista o escribir uno nuevo
- [ ] Áreas de interés es multiselect + creatable con chips
- [ ] "¿Qué estás buscando?" es single-select con 4 opciones fijas
- [ ] Tecnologías es multiselect + creatable — distingue predefinidas de custom (`is_custom`)
- [ ] Bio muestra contador `n/500` (sin barra de progreso)
- [ ] Al hacer submit sin sector o seniority (si trabaja), aparece error en el campo faltante
- [ ] Al hacer submit con todo completo, se envía correctamente
- [ ] Step 2 sigue funcionando exactamente igual (solo cambió de dónde importa los estilos)
- [ ] `npx tsc --noEmit` compila sin errores
- [ ] Commit con: `feat(register): implementar Step 3 v3 con 7 campos profesionales`

---
