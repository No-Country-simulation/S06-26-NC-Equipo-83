## INCIDENCIA 19 — Perfil de usuario v3: mostrar campos profesionales y vincular bio

## Resumen

Esta incidencia reescribe la página de perfil (`/profile`) para mostrar los campos profesionales v3 del registro en lugar de los 3 campos legacy. Los campos `professional_level`, `tech_area` y `career_objective` se eliminan de la vista. En su lugar, se muestran `education_level`, `current_situation`, `work_sector` (condicional), `seniority` (condicional), `current_search`, `interest_areas` (chips) y `known_technologies` (chips). Estos campos son de solo lectura — se leen del store `user`. Además, el textarea de bio se bindea a `user.bio`. La edición se limita a `full_name` y `whatsapp_e164` en Datos Personales, y `bio` en Biografía/Intereses, todo controlado por un único botón "Editar".

**Rama:** `incidencia/19-perfil-v3`
**Duración estimada:** 3-4 horas.
**Depende de:** Incidencia 09 (backend: `PUT /users/{id}`) e Incidencia 16 (frontend: `skillLabels.ts`).
**Asignada a:** 1 dev frontend.

### ¿Qué vas a aprender de React/TypeScript en esta incidencia?

| Concepto | ¿Qué es? |
|----------|---------|
| Renderizado condicional de campos | Cómo mostrar/ocultar `work_sector` y `seniority` según `current_situation` del `user` store |
| `Record<string, string>` como lookup table | Cómo mapear valores internos (`"student"`) a labels legibles (`"Estudiante"`) sin if/else anidados |
| `map()` para chips | Cómo mostrar arrays (`interest_areas`, `known_technologies`) como badges de colores en modo lectura |
| Separación de concerns por sección | Cada sección del perfil tiene su propia card con header + body, sin mezclar lógica |
| `useState` con objeto parcial | Cómo manejar un form con solo los campos editables (full_name, whatsapp, bio) |

### Pre-lectura (15 min)

| Archivo | ¿Por qué? |
|---------|----------|
| `frontend/src/modules/profile/userProfilePage.tsx` | Vas a reescribir completamente las secciones del perfil |
| `frontend/src/lib/registrationData.ts` | Constante `INTEREST_AREAS` — array de `{value, label}` para áreas de interés |
| `frontend/src/lib/skillLabels.ts` | Mapeo `Record<string, string>` de skills normalizados a labels legibles |
| `frontend/src/services/profileService.ts` | `updateProfile()` — verifica que llame a `PUT /users/{userId}` |
| `frontend/src/types/api.ts` | Interfaz `User` — campos `current_situation`, `interest_areas`, `known_technologies`, etc. |

### Antes de codear: flujo git

```bash
git checkout develop
git pull origin develop
git checkout -b incidencia/19-perfil-v3
```

### Paso a paso

#### Archivo único: `frontend/src/modules/profile/userProfilePage.tsx` (REESCRIBIR completo)

El archivo actual tiene una estructura con campos legacy. Vas a reemplazar prácticamente todo el contenido JSX manteniendo el mismo layout de sidebar + contenido principal.

#### 1. Imports

Reemplazá los imports actuales por:

```typescript
import React, { useState } from "react";
import { User, MapPin, Briefcase, FileText, Settings, Lock, Bell, Globe, Calendar, Camera, Loader2, Pencil, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { profileService } from "../../services/profileService";
import { INTEREST_AREAS } from "../../lib/registrationData";
import { SKILL_LABELS } from "../../lib/skillLabels";
```

#### 2. Label helpers (fuera del componente)

Copiá estos diccionarios y el componente `SettingsRow` al principio del archivo, después de los imports:

```typescript
const SITUATION_LABEL: Record<string, string> = {
  student: "Estudiante",
  unemployed: "Desempleado",
  employed: "Actualmente trabajando",
};

const SEARCH_LABEL: Record<string, string> = {
  study: "Estudiar",
  define_path: "Definir mi camino profesional",
  find_job: "Buscar empleo",
  change_job: "Cambiar de empleo",
};

const EDUCATION_LABEL: Record<string, string> = {
  secundario: "Secundario",
  terciario: "Terciario",
  universitario: "Universitario",
  posgrado: "Posgrado",
};

const SENIORITY_LABEL_ES: Record<string, string> = {
  junior: "Junior",
  semi_senior: "Semi Senior",
  senior: "Senior",
};
```

> **`SKILL_LABELS`** ya existe en `frontend/src/lib/skillLabels.ts` (incidencia 16). Si ese archivo no existe todavía en tu branch, crealo con el mapeo de skills.

#### 3. Estado del componente

Dentro de `UserProfilePage`, reemplazá el estado actual por:

```typescript
const user = useAuthStore((s) => s.user);
const [isEditing, setIsEditing] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [saveMessage, setSaveMessage] = useState<string | null>(null);

const [formData, setFormData] = useState({
  full_name: user?.full_name || "",
  whatsapp_e164: user?.whatsapp_e164 || "",
  bio: user?.bio || "",
});
```

> **Solo 3 campos editables**: `full_name`, `whatsapp_e164`, `bio`. Los demás (`education_level`, `current_situation`, `interest_areas`, etc.) NO están en formData porque NO se editan — solo se muestran desde `user`.

#### 4. Loading state

Antes del return, mantené el guard para cuando `user` es null:

```typescript
if (!user) return (
  <main className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-[#A04E2D]" />
  </main>
);

const initials = user.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
```

#### 5. handleSave

```typescript
const handleSave = async () => {
  setIsSaving(true); setSaveMessage(null);
  try {
    await profileService.updateProfile(user.id, formData as any);
    setSaveMessage("Perfil actualizado correctamente."); setIsEditing(false);
    await useAuthStore.getState().fetchMe();
  } catch (err: any) { setSaveMessage(err.response?.data?.detail || "Error al guardar."); }
  finally { setIsSaving(false); }
};
```

> `formData as any` es seguro porque el backend (incidencia 09) usa `exclude_unset=True` y solo actualiza los campos que recibe.

#### 6. Sidebar izquierdo

El sidebar queda igual que el actual: avatar con iniciales + badge de plan + selector de idioma. No hace falta tocarlo.

#### 7. Sección: Datos Personales

Esta sección va PRIMERA en la columna derecha. Tiene un botón "Editar" que activa el modo edición para todo el formulario (full_name, whatsapp, bio).

```tsx
<section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
  <header className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
    <div className="flex items-center gap-2.5">
      <User className="text-[#A04E2D] h-5 w-5" />
      <h2 className="text-base font-bold text-gray-900">Datos Personales</h2>
    </div>
    <button onClick={() => setIsEditing(!isEditing)} className="text-xs font-bold text-[#A04E2D] hover:underline flex items-center gap-1">
      {isEditing ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
      {isEditing ? "Cancelar" : "Editar"}
    </button>
  </header>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">Nombre completo</label>
      <input
        type="text"
        readOnly={!isEditing}
        value={formData.full_name}
        onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
        className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-colors ${isEditing ? "bg-white border border-[#A04E2D]/30 focus:ring-2 focus:ring-[#A04E2D]/20 text-gray-800" : "bg-[#F4F1EC]/60 text-gray-800"}`}
      />
    </div>
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">Correo electrónico</label>
      <p className="px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800">{user.email}</p>
    </div>
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">WhatsApp</label>
      <input
        type="text"
        readOnly={!isEditing}
        value={formData.whatsapp_e164}
        onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp_e164: e.target.value }))}
        className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-colors ${isEditing ? "bg-white border border-[#A04E2D]/30 focus:ring-2 focus:ring-[#A04E2D]/20 text-gray-800" : "bg-[#F4F1EC]/60 text-gray-800"}`}
      />
    </div>
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">Fecha de nacimiento</label>
      <div className="relative">
        <p className="px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800">{user.birth_date?.split("T")[0] || "—"}</p>
        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
      </div>
    </div>
  </div>
  {isEditing && (
    <div className="flex justify-end mt-4">
      <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto px-8 py-2.5 bg-[#A04E2D] hover:bg-[#853F22] text-white font-medium text-sm rounded-full shadow-sm disabled:opacity-70 flex items-center gap-2">
        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSaving ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  )}
</section>
```

> **Email y Fecha de nacimiento** son display-only siempre. **Nombre y WhatsApp** se vuelven editables cuando `isEditing` es true.

#### 8. Sección: Ubicación (solo lectura)

```tsx
<section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
  <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-5">
    <MapPin className="text-[#A04E2D] h-5 w-5" />
    <h2 className="text-base font-bold text-gray-900">Ubicación</h2>
  </header>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">Continente</label>
      <p className="px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800">{user.continent_name || "—"}</p>
    </div>
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">País</label>
      <p className="px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800">{user.country_name || "—"}</p>
    </div>
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">Ciudad</label>
      <p className="px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800">{user.city_name || "—"}</p>
    </div>
  </div>
</section>
```

#### 9. Sección: Perfil Profesional (solo lectura, desde user store)

Esta sección reemplaza los 3 campos legacy. Todo se lee directamente del store `user` — no usa `formData`.

```tsx
<section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
  <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-5">
    <Briefcase className="text-[#A04E2D] h-5 w-5" />
    <h2 className="text-base font-bold text-gray-900">Perfil Profesional</h2>
  </header>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">Nivel Educativo</label>
      <p className="px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800">
        {EDUCATION_LABEL[user.education_level] || user.education_level || "—"}
      </p>
    </div>
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">Situación actual</label>
      <p className="px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800">
        {SITUATION_LABEL[user.current_situation] || user.current_situation || "—"}
      </p>
    </div>
    {user.current_situation === "employed" && (
      <>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">Sector laboral</label>
          <p className="px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800">{user.work_sector || "—"}</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">Seniority</label>
          <p className="px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800">
            {SENIORITY_LABEL_ES[user.seniority ?? ""] || user.seniority || "—"}
          </p>
        </div>
      </>
    )}
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">¿Qué estás buscando?</label>
      <p className="px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800">
        {SEARCH_LABEL[user.current_search ?? ""] || user.current_search || "—"}
      </p>
    </div>
  </div>
  <div className="mt-4 space-y-1.5">
    <label className="text-xs font-semibold text-gray-600">Áreas de interés</label>
    <div className="flex flex-wrap gap-1.5">
      {(user.interest_areas ?? []).length > 0 ? (
        (user.interest_areas ?? []).map((area: string) => (
          <span key={area} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FDF2EC] text-[#A04E2D] text-xs font-semibold border border-[#F5DFD3]">
            {INTEREST_AREAS.find((a) => a.value === area)?.label ?? area}
          </span>
        ))
      ) : (
        <span className="text-sm text-gray-400">—</span>
      )}
    </div>
  </div>
  <div className="mt-4 space-y-1.5">
    <label className="text-xs font-semibold text-gray-600">Tecnologías que conocés</label>
    <div className="flex flex-wrap gap-1.5">
      {(user.known_technologies ?? []).length > 0 ? (
        (user.known_technologies ?? []).map((tech: any) => (
          <span key={tech.name} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FDF2EC] text-[#A04E2D] text-xs font-semibold border border-[#F5DFD3]">
            {SKILL_LABELS[tech.name] ?? tech.name}
            {tech.is_custom && <span className="ml-1 text-[10px] text-[#A04E2D]/50">(custom)</span>}
          </span>
        ))
      ) : (
        <span className="text-sm text-gray-400">—</span>
      )}
    </div>
  </div>
</section>
```

> **`work_sector` y `seniority`** son condicionales: solo se muestran si `user.current_situation === "employed"`. **Todos los campos vienen del store `user`**, no de formData — son de solo lectura.

#### 10. Sección: Biografía / Intereses

```tsx
<section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
  <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-5">
    <FileText className="text-[#A04E2D] h-5 w-5" />
    <h2 className="text-base font-bold text-gray-900">Biografía / Intereses</h2>
  </header>
  <div className="space-y-4">
    <textarea
      readOnly={!isEditing}
      rows={3}
      value={formData.bio ?? ""}
      onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
      className={`w-full p-4 rounded-xl text-sm font-medium text-gray-700 outline-none resize-none leading-relaxed ${isEditing ? "bg-white border border-[#A04E2D]/30 focus:ring-2 focus:ring-[#A04E2D]/20" : "bg-[#F4F1EC]/60"}`}
      placeholder="Describí brevemente tu experiencia, tus intereses y qué te motiva..."
      maxLength={500}
    />
    <div className="flex items-center justify-between">
      <span className={`text-xs ${(formData.bio ?? "").length > 500 ? "text-red-500 font-medium" : "text-stone-400"}`}>
        {(formData.bio ?? "").length}/500
      </span>
    </div>
  </div>
</section>
```

> **No tiene botón "Guardar" propio.** El guardado se hace desde el botón unificado en Datos Personales. La biografía se vuelve editable cuando `isEditing` es true.

#### 11. Sección: Ajustes de Cuenta (placeholder)

```tsx
<section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
  <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-4">
    <Settings className="text-[#A04E2D] h-5 w-5" />
    <h2 className="text-base font-bold text-gray-900">Ajustes de Cuenta</h2>
  </header>
  <div className="divide-y divide-gray-100">
    <div className="py-4 flex items-start gap-3">
      <span className="rounded-full p-2 mt-0.5 bg-emerald-50 text-emerald-600"><Lock className="h-4 w-4" /></span>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-900">Contraseña</h3>
        <p className="text-xs text-gray-400 font-medium">Cambiá tu contraseña periódicamente</p>
      </div>
      <button className="text-xs font-bold text-[#A04E2D] hover:underline">Actualizar</button>
    </div>
    <div className="py-4 flex items-start gap-3">
      <span className="rounded-full p-2 mt-0.5 bg-emerald-50 text-emerald-600"><Bell className="h-4 w-4" /></span>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-900">Notificaciones</h3>
        <p className="text-xs text-gray-400 font-medium">Alertas de comunidad y mensajes</p>
      </div>
      {/* toggle switch */}
    </div>
  </div>
</section>
```

> El botón "Actualizar" de contraseña es un placeholder — no hace nada todavía. La funcionalidad de cambio de contraseña se agrega en la incidencia 20.

#### 12. Mensaje de feedback

Justo antes de la primera sección (Datos Personales), mostrá el mensaje de save:

```tsx
{saveMessage && (
  <div className={`p-4 rounded-xl text-sm font-medium ${saveMessage.includes("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
    {saveMessage}
  </div>
)}
```

### Resumen visual: antes vs después

| Sección | Antes (legacy) | Después (v3) |
|---------|---------------|-------------|
| Perfil Profesional | `professional_level` (texto), `tech_area` (texto), `career_objective` (texto) | `education_level`, `current_situation`, `work_sector` + `seniority` (condicionales), `current_search`, `interest_areas` (chips), `known_technologies` (chips) — todo solo lectura |
| Biografía | Textarea hardcodeado con texto falso | Textarea bindeado a `user.bio` con contador `n/500` |
| Datos Personales | Solo nombre y email | Nombre + WhatsApp editables, email + fecha nacimiento display |
| Ubicación | No existía | Nueva sección con continente, país, ciudad |

### Verificación completa

```bash
cd frontend
npx tsc --noEmit
# Esperado: 0 errores

npm run dev
# Abrí http://localhost:5173/profile (necesitás estar logueado)
```

**Pruebas manuales:**

| Escenario | Qué esperar |
|-----------|------------|
| Entrar a /profile sin editar | Ves todos los campos v3 en modo lectura: situación actual, búsqueda, áreas (chips), tecnologías (chips), bio real, ubicación |
| Clickear "Editar" | Nombre y WhatsApp se vuelven inputs editables. Bio se vuelve textarea editable. Perfil Profesional y Ubicación siguen sin cambio |
| Clickear "Cancelar" | Vuelve al modo lectura |
| Modificar nombre y bio, clickear "Guardar cambios" | Se llama a `PUT /users/{id}`, se refresca el store con `fetchMe()`, aparece mensaje verde |
| Recargar la página | Los cambios persisten (se leen desde `/auth/me`) |
| Usuario con `current_situation: "employed"` | Se ven Sector laboral y Seniority |
| Usuario con `current_situation: "student"` | NO se ven Sector laboral ni Seniority |

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot find module '../../lib/skillLabels'` | El archivo no existe | Creá `frontend/src/lib/skillLabels.ts` con el mapeo `Record<string, string>` de skills a labels |
| `Property 'interest_areas' does not exist on type 'User'` | El type `User` no tiene los campos v3 | Actualizá la interfaz `User` en `types/api.ts` con los campos de la incidencia 07 |
| `Property 'current_situation' does not exist on type 'User'` | Ídem | Ídem |
| Error 404 al guardar | El endpoint `PUT /users/{id}` no existe | Verificá que la incidencia 09 esté mergeada en el branch actual |
| Los chips no muestran labels legibles | `INTEREST_AREAS.find()` retorna undefined | Verificá que los valores de `interest_areas` del backend coincidan con los `value` de `INTEREST_AREAS` |
| `SKILL_LABELS[tech.name]` es undefined | El skill no está en el diccionario | El fallback `?? tech.name` muestra el nombre crudo — es válido |
| Save no incluye bio | `formData` no tiene `bio` en su definición | Asegurate de que `useState` incluya `bio: user?.bio || ""` |

### Criterios de aceptación Incidencia 19

- [ ] Campos legacy (`professional_level`, `tech_area`, `career_objective`) no aparecen en /profile
- [ ] `education_level` se muestra con label legible en español
- [ ] `current_situation` se muestra con label legible en español
- [ ] `work_sector` y `seniority` solo aparecen cuando `current_situation === "employed"`
- [ ] `current_search` se muestra con label legible en español
- [ ] `interest_areas` se muestran como chips de colores con labels de `INTEREST_AREAS`
- [ ] `known_technologies` se muestran como chips de colores con labels de `SKILL_LABELS`
- [ ] Ubicación muestra continente, país y ciudad desde el store `user`
- [ ] El textarea de bio está bindeado a `user.bio` (no es texto hardcodeado)
- [ ] El contador `n/500` se actualiza en tiempo real al tipear
- [ ] `full_name` y `whatsapp_e164` son editables al clickear "Editar"
- [ ] `email` es display-only siempre
- [ ] `birth_date` se muestra formateado (`YYYY-MM-DD`) y es display-only
- [ ] El botón "Guardar cambios" persiste los cambios vía `PUT /users/{id}`
- [ ] Al guardar, se llama a `fetchMe()` para refrescar el store
- [ ] `npx tsc --noEmit` compila sin errores
- [ ] Commit con: `feat(profile): mostrar campos profesionales v3 y bindear bio`

---
