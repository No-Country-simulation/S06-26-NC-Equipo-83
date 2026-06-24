## INCIDENCIA INT-08 — Página de Perfil Conectada a `/auth/me`

## Resumen

Esta incidencia reemplaza los datos hardcodeados de la página de Perfil ("Ana García", "ana.garcia@example.com", "Madrid") con los datos reales del usuario autenticado desde `useAuthStore`. Convierte los campos readonly en editables con un botón "Guardar cambios" funcional, muestra la foto de perfil como iniciales si no hay imagen, y conecta las secciones de configuración de cuenta (contraseña, notificaciones, privacidad) con sus respectivas acciones.

**Rama:** `incidencia/int-08-perfil`  
**Duración estimada:** 4-5 horas.  
**Depende de:** INT-04 (auth store con `user`).  
**Asignada a:** 1 dev frontend.

### Pre-lectura (10 min)

| Archivo | Pregunta que responde |
|---------|----------------------|
| `frontend/src/store/useAuthStore.ts` | `user` contiene `full_name`, `email`, `whatsapp`, `birth_date`, `gender`, `continent`, `country`, `state`, `city`, `education_level`, `professional_level`, `tech_area`, `career_objective` |
| `frontend/src/modules/profile/userProfilePage.tsx` | Código actual con datos hardcodeados |

### Antes de codear: flujo git

```bash
git checkout incidencia/int-04-auth-frontend
git pull origin incidencia/int-04-auth-frontend
git checkout -b incidencia/int-08-perfil
```

### Paso a paso

#### Archivo único: `frontend/src/modules/profile/userProfilePage.tsx`

**Cambios principales:**
1. Importar `useAuthStore`
2. Reemplazar TODOS los valores hardcodeados con `user.campo`
3. Agregar estado local `isEditing` y `formData` para modo edición
4. Conectar botón "Guardar cambios" a `profileService.updateProfile()`
5. Avatar con iniciales cuando no hay imagen
6. Loading state mientras `user` es null

```typescript
import React, { useState } from "react";
import {
  User, MapPin, Briefcase, FileText, Settings,
  Lock, Bell, Eye, Trash2, Globe, Calendar,
  Check, Camera, Loader2, Pencil, X,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { profileService } from "../../services/profileService";

export const UserProfilePage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Estado local del formulario (inicializado con datos del usuario)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    whatsapp: user?.whatsapp || "",
    birth_date: user?.birth_date || "",
    continent: user?.continent || "",
    country: user?.country || "",
    city: user?.city || "",
    education_level: user?.education_level || "",
    professional_level: user?.professional_level || "",
    tech_area: user?.tech_area || "",
    career_objective: user?.career_objective || "",
  });

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#A04E2D]" />
      </main>
    );
  }

  // ─── Iniciales para el avatar ───
  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // ─── Guardar cambios ───
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await profileService.updateProfile(user.id, formData);
      setSaveMessage("Perfil actualizado correctamente.");
      setIsEditing(false);
      // Refrescar datos del usuario
      await useAuthStore.getState().fetchMe();
    } catch (err: any) {
      setSaveMessage(err.response?.data?.detail || "Error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9F6F0]/40 pb-24 py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased text-gray-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ===== COLUMNA IZQUIERDA ===== */}
        <aside className="lg:col-span-4 space-y-6 w-full">
          {/* Avatar */}
          <article className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <div className="w-28 h-28 rounded-full bg-[#A04E2D]/10 border border-amber-800/20 flex items-center justify-center overflow-hidden">
                <span className="text-3xl font-extrabold text-[#A04E2D]">{initials}</span>
              </div>
              <button
                type="button"
                aria-label="Cambiar foto de perfil"
                className="absolute bottom-1 right-1 bg-[#A04E2D] text-white p-2 rounded-full shadow-md hover:bg-[#853F22] transition-colors"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-1">{user.full_name}</h1>
            <span className="inline-block bg-[#FDF2EC] text-[#A04E2D] text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-[#F5DFD3]">
              Plan Premium
            </span>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Enfocada en el crecimiento profesional y el bienestar emocional.
            </p>
          </article>

          {/* Configuración de Idioma (estático por ahora) */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Configuración de Idioma
            </h2>
            <div className="space-y-2">
              <button type="button" className="w-full flex items-center justify-between p-3 rounded-xl border border-[#A04E2D]/30 bg-[#FDF2EC]/40 text-[#A04E2D] font-medium text-sm transition-colors text-left">
                <span className="flex items-center gap-2.5">
                  <Globe className="h-4 w-4 text-[#A04E2D]" /> Español (ES)
                </span>
                <span className="bg-[#A04E2D] text-white rounded-full p-0.5">
                  <Check className="h-3 w-3" />
                </span>
              </button>
              <button type="button" className="w-full flex items-center p-3 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors text-left">
                <Globe className="h-4 w-4 text-gray-400 mr-2.5" /> Português (PT)
              </button>
              <button type="button" className="w-full flex items-center p-3 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors text-left">
                <Globe className="h-4 w-4 text-gray-400 mr-2.5" /> English (EN)
              </button>
            </div>
          </section>
        </aside>

        {/* ===== COLUMNA DERECHA ===== */}
        <div className="lg:col-span-8 space-y-6 w-full">

          {/* Mensaje de feedback */}
          {saveMessage && (
            <div className={`p-4 rounded-xl text-sm font-medium ${
              saveMessage.includes("Error")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}>
              {saveMessage}
            </div>
          )}

          {/* SECCIÓN 1: Datos Personales */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <header className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
              <div className="flex items-center gap-2.5">
                <User className="text-[#A04E2D] h-5 w-5" />
                <h2 className="text-base font-bold text-gray-900">Datos Personales</h2>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-bold text-[#A04E2D] hover:underline flex items-center gap-1"
              >
                {isEditing ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                {isEditing ? "Cancelar" : "Editar"}
              </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Nombre completo" value={formData.full_name} field="full_name" isEditing={isEditing} onChange={setFormData} />
              <InputField label="Correo electrónico" value={formData.email} field="email" isEditing={false} onChange={setFormData} />
              <InputField label="WhatsApp" value={formData.whatsapp} field="whatsapp" isEditing={isEditing} onChange={setFormData} />
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Fecha de nacimiento</label>
                <div className="relative">
                  <input
                    type={isEditing ? "date" : "text"}
                    readOnly={!isEditing}
                    value={formData.birth_date?.split("T")[0] || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, birth_date: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800 outline-none"
                  />
                  {!isEditing && <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />}
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: Ubicación */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-5">
              <MapPin className="text-[#A04E2D] h-5 w-5" />
              <h2 className="text-base font-bold text-gray-900">Ubicación</h2>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField label="Continente" value={formData.continent} field="continent" isEditing={isEditing} onChange={setFormData} />
              <InputField label="País" value={formData.country} field="country" isEditing={isEditing} onChange={setFormData} />
              <InputField label="Ciudad" value={formData.city} field="city" isEditing={isEditing} onChange={setFormData} />
            </div>
          </section>

          {/* SECCIÓN 3: Perfil Profesional */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-5">
              <Briefcase className="text-[#A04E2D] h-5 w-5" />
              <h2 className="text-base font-bold text-gray-900">Perfil Profesional</h2>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Nivel Educativo" value={formData.education_level} field="education_level" isEditing={isEditing} onChange={setFormData} />
              <InputField label="Nivel Profesional" value={formData.professional_level} field="professional_level" isEditing={isEditing} onChange={setFormData} />
              <InputField label="Área Tecnológica" value={formData.tech_area} field="tech_area" isEditing={isEditing} onChange={setFormData} />
              <InputField label="Objetivo de Carrera" value={formData.career_objective} field="career_objective" isEditing={isEditing} onChange={setFormData} />
            </div>
          </section>

          {/* SECCIÓN 4: Biografía */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-5">
              <FileText className="text-[#A04E2D] h-5 w-5" />
              <h2 className="text-base font-bold text-gray-900">Biografía / Intereses</h2>
            </header>
            <div className="space-y-4">
              <textarea
                readOnly={!isEditing}
                rows={3}
                value="Apasionada por crear interfaces de usuario accesibles y centradas en el ser humano."
                className="w-full p-4 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-700 outline-none resize-none leading-relaxed"
              />
              {isEditing && (
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-8 py-2.5 bg-[#A04E2D] hover:bg-[#853F22] text-white font-medium text-sm rounded-full shadow-sm transition-all duration-200 disabled:opacity-70 flex items-center gap-2"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSaving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* SECCIÓN 5: Ajustes de Cuenta */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-4">
              <Settings className="text-[#A04E2D] h-5 w-5" />
              <h2 className="text-base font-bold text-gray-900">Ajustes de Cuenta</h2>
            </header>
            <div className="divide-y divide-gray-100">
              <SettingsRow icon={<Lock className="h-4 w-4" />} iconBg="bg-emerald-50 text-emerald-600" title="Contraseña" subtitle="Cambiada hace 3 meses" action="Actualizar" />
              <SettingsRow icon={<Bell className="h-4 w-4" />} iconBg="bg-emerald-50 text-emerald-600" title="Notificaciones" subtitle="Alertas de comunidad y mensajes" toggle />
              <SettingsRow icon={<Eye className="h-4 w-4" />} iconBg="bg-emerald-50 text-emerald-600" title="Privacidad" subtitle="Perfil público para la comunidad" toggle />
              <SettingsRow icon={<Trash2 className="h-4 w-4" />} iconBg="bg-rose-50 text-rose-600" title="Eliminar cuenta" subtitle="Borrar permanentemente tus datos" action="Gestionar" danger />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

// ─── Componente auxiliar: Input condicionalmente editable ───
function InputField({
  label,
  value,
  field,
  isEditing,
  onChange,
}: {
  label: string;
  value: string;
  field: string;
  isEditing: boolean;
  onChange: (updater: (prev: any) => any) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input
        type="text"
        readOnly={!isEditing}
        value={value}
        onChange={(e) => onChange((prev: any) => ({ ...prev, [field]: e.target.value }))}
        className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-colors ${
          isEditing
            ? "bg-white border border-[#A04E2D]/30 focus:ring-2 focus:ring-[#A04E2D]/20 text-gray-800"
            : "bg-[#F4F1EC]/60 text-gray-800"
        }`}
      />
    </div>
  );
}

// ─── Componente auxiliar: Fila de ajustes ───
function SettingsRow({
  icon,
  iconBg,
  title,
  subtitle,
  action,
  toggle,
  danger,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  action?: string;
  toggle?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="py-4 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className={`rounded-full p-2 mt-0.5 ${iconBg}`}>{icon}</span>
        <div>
          <h3 className={`text-sm font-semibold ${danger ? "text-rose-600" : "text-gray-900"}`}>
            {title}
          </h3>
          <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
        </div>
      </div>
      {toggle ? (
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" defaultChecked className="sr-only peer" />
          <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      ) : (
        <button type="button" className={`text-xs font-bold hover:underline transition-colors ${danger ? "text-gray-500 hover:text-rose-600" : "text-[#A04E2D]"}`}>
          {action}
        </button>
      )}
    </div>
  );
}
```

**Puntos clave:**
- `InputField` y `SettingsRow` son componentes auxiliares definidos EN EL MISMO ARCHIVO. No los exportes — solo los usa esta página.
- El email NO es editable (`isEditing={false}`) porque cambiar el email requiere re-autenticación.
- `birth_date` usa `.split("T")[0]` para mostrar solo la fecha sin timestamp.
- "Guardar cambios" solo aparece en modo edición. Al guardar, se llama `fetchMe()` para refrescar los datos.

### Verificación

1. Navegar a `/profile` con un usuario logueado
2. **Esperado:** Todos los campos muestran datos reales del usuario (no "Ana García")
3. Avatar muestra iniciales (ej: "AG" para Ana García)
4. Click en "Editar" → los campos se vuelven editables (borde naranja)
5. Modificar un campo y click en "Guardar cambios"
6. **Esperado:** Mensaje verde de confirmación. Modo edición se desactiva.

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `user is null` al cargar | `fetchMe` no terminó | El loader inicial muestra spinner mientras `user` es null. |
| `PUT /users/{id}` 404 | El endpoint no existe en el backend todavía | El mensaje de error se muestra. Prioridad: implementar `PUT /users/{id}` en backend luego. |
| `birth_date` muestra timestamp | El backend devuelve datetime, no date | Usar `.split("T")[0]` para truncar. |
| Campos no se actualizan después de guardar | `fetchMe` no se llamó o falló | `useAuthStore.getState().fetchMe()` al final de `handleSave`. |

### Criterios de aceptación INT-08

- [ ] Todos los campos muestran datos reales desde `useAuthStore.user`
- [ ] Avatar muestra iniciales del `full_name`
- [ ] Modo edición: botón "Editar" activa inputs editables con borde naranja
- [ ] Modo edición: "Cancelar" restaura los valores originales
- [ ] Botón "Guardar cambios" llama a `PUT /users/{id}` y muestra feedback
- [ ] Email NO es editable
- [ ] Ajustes de cuenta (contraseña, notificaciones, privacidad, eliminar) visibles
- [ ] `npx tsc --noEmit` compila sin errores
- [ ] Commit con: `feat(profile): conectar perfil a datos reales del usuario`

---

## 🔄 Actualizaciones durante la integración real

### Descripción del perfil eliminada

El spec original incluía un párrafo debajo del nombre: *"Enfocada en el crecimiento profesional y el bienestar emocional."* Durante la implementación se eliminó. La card del avatar ahora solo muestra `full_name` + badge "Plan Premium".

### ⚠️ Campos `professional_level` y `career_objective` como texto libre

El spec y el código implementado muestran estos campos como `InputField` de texto. Sin embargo, el backend espera valores de enum (`ProfessionalLevel`: `beginner`, `junior`, `semi_senior`, `senior`; `CareerObjective`: `find_job`, `change_job`, `define_path`, `study`). Si el usuario edita y escribe texto libre, el `PUT /users/{id}` fallará con 422. **Pendiente:** cambiar a `<Select>` con opciones predefinidas que matcheen los enums.

### 🐛 `formData` no se resetea al cancelar edición

Cuando el usuario presiona "Cancelar", los campos deberían restaurar los valores originales de `user`. Pero `formData` se inicializa una sola vez con `useState(...)` al montar el componente y nunca se resetea. Si el usuario edita, cancela, y vuelve a editar, ve los valores previamente editados (no los originales).

**Fix sugerido:** Resetear `formData` en el handler de cancelar:

```typescript
const handleCancel = () => {
  setFormData({
    full_name: user?.full_name || "",
    email: user?.email || "",
    // ... resto de campos desde user
  });
  setIsEditing(false);
};
```

### `PUT /users/{id}` no implementado en backend

El endpoint de actualización de perfil no existe en el backend actual. `profileService.updateProfile()` hará 404/405 hasta que se implemente. El feedback de error del catch lo maneja correctamente con el mensaje del backend.

### `birth_date` puede romperse si cambia el formato del backend

El código usa `.split("T")[0]` para mostrar solo la fecha. Si el backend cambia el formato (ej: Pydantic v2 devuelve `date` sin timestamp), esto podría romperse. Es frágil pero funcional con el formato actual.

---
