## INCIDENCIA 20 — Refinamientos de perfil: contraseña, edición por sección y limpieza de settings

## Resumen

Esta incidencia toma la página de perfil construida en la incidencia 19 y le agrega 4 mejoras de UX: (1) formulario de cambio de contraseña con validación en tiempo real y toggle de visibilidad, (2) separación de los botones "Editar" por sección — Datos Personales y Biografía/Intereses cada uno con su propio botón, (3) limpieza de Ajustes de Cuenta eliminando las filas "Eliminar cuenta" y "Privacidad", y (4) el botón de contraseña pasa a decir "Editar" en vez de "Actualizar".

**Rama:** `incidencia/20-profile-refinements`
**Duración estimada:** 3-4 horas.
**Depende de:** Incidencia 19 (frontend) e Incidencia 10 (backend: `PUT /users/{id}/password`).
**Asignada a:** 1 dev frontend.

### ¿Qué vas a aprender en esta incidencia?

| Concepto | ¿Qué es? |
|----------|---------|
| Validación client-side con regex | Cómo validar requisitos de contraseña en tiempo real antes de enviar al backend |
| Estados múltiples coordinados | Cómo manejar `editingDatos` y `editingBio` por separado sin que se pisen |
| Cancel handlers con reset | Cómo restaurar valores originales del store al cancelar una edición |
| Toggle de visibilidad en inputs password | Cómo alternar `type="password"` ↔ `type="text"` con estado local |
| Separación de payloads por sección | Cómo enviar solo los campos de la sección que se editó (no todo formData) |

### Pre-lectura (15 min)

| Archivo | ¿Por qué? |
|---------|----------|
| `frontend/src/modules/profile/userProfilePage.tsx` | Vas a modificar el estado, los handlers y el JSX de varias secciones |
| `frontend/src/services/profileService.ts` | Vas a agregar `changePassword()` |
| `backend/app/routers/users.py` | Referencia: endpoint `PUT /users/{id}/password` (204, 401, 422, 403) |

### Antes de codear: flujo git

```bash
git checkout develop
git pull origin develop
git checkout -b incidencia/20-profile-refinements
```

### Paso a paso

#### Archivo 1: `frontend/src/services/profileService.ts` (MODIFICAR)

Agregá el método `changePassword()` al `profileService`:

```typescript
async changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<void> {
  await api.put(`/users/${userId}/password`, {
    current_password: currentPassword,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });
}
```

> El backend devuelve 204 No Content. No hay response body. Si falla (401, 422, 403), axios lanza el error que se atrapa en el componente.

#### Archivo 2: `frontend/src/modules/profile/userProfilePage.tsx` (MODIFICAR)

Este es el archivo principal. Vas a hacer cambios en 7 zonas.

---

##### 2a. Imports

Agregá `Eye` y `EyeOff` a los imports de lucide-react:

```typescript
import { User, MapPin, Briefcase, FileText, Settings, Lock, Bell, Eye, EyeOff, Globe, Calendar, Camera, Loader2, Pencil, X } from "lucide-react";
```

Agregá el import del service:

```typescript
import { profileService } from "../../services/profileService";
```

> Si `profileService` ya está importado, no lo dupliques.

---

##### 2b. Regex de validación (fuera del componente)

Agregá después de los label helpers:

```typescript
const REQ_MIN_8 = /^.{8,}$/;
const REQ_UPPER = /[A-Z]/;
const REQ_NUMBER = /[0-9]/;

function ReqLine({ met, label }: { met: boolean; label: string }) {
  return (
    <span className={`text-xs ${met ? "text-[#A04E2D]" : "text-stone-400"}`}>
      {met ? "\u2713" : "\u25CB"} {label}
    </span>
  );
}
```

> `ReqLine` es un componente chiquito que muestra ✓ o ○ según si el requisito se cumple. Se usa para dar feedback en tiempo real mientras el usuario tipea la nueva contraseña.

---

##### 2c. Separar estado de edición

Reemplazá:

```typescript
const [isEditing, setIsEditing] = useState(false);
```

Por:

```typescript
const [editingDatos, setEditingDatos] = useState(false);
const [editingBio, setEditingBio] = useState(false);
```

> **Dos estados independientes.** `editingDatos` controla los inputs de Datos Personales (full_name, whatsapp). `editingBio` controla el textarea de Biografía. Pueden estar activos al mismo tiempo o por separado.

---

##### 2d. Separar handlers de save y cancel

Reemplazá el `handleSave` existente por:

```typescript
const handleSaveDatos = async () => {
  setIsSaving(true); setSaveMessage(null);
  try {
    await profileService.updateProfile(user.id, { full_name: formData.full_name, whatsapp_e164: formData.whatsapp_e164 });
    setSaveMessage("Datos personales actualizados correctamente."); setEditingDatos(false);
    await useAuthStore.getState().fetchMe();
  } catch (err: any) { setSaveMessage(err.response?.data?.detail || "Error al guardar."); }
  finally { setIsSaving(false); }
};

const handleSaveBio = async () => {
  setIsSaving(true); setSaveMessage(null);
  try {
    await profileService.updateProfile(user.id, { bio: formData.bio });
    setSaveMessage("Biografía actualizada correctamente."); setEditingBio(false);
    await useAuthStore.getState().fetchMe();
  } catch (err: any) { setSaveMessage(err.response?.data?.detail || "Error al guardar."); }
  finally { setIsSaving(false); }
};

const handleCancelDatos = () => {
  setFormData((prev) => ({ ...prev, full_name: user?.full_name || "", whatsapp_e164: user?.whatsapp_e164 || "" }));
  setEditingDatos(false);
};

const handleCancelBio = () => {
  setFormData((prev) => ({ ...prev, bio: user?.bio || "" }));
  setEditingBio(false);
};
```

> **`handleSaveDatos`** solo envía `full_name` y `whatsapp_e164`. **`handleSaveBio`** solo envía `bio`. **Los cancel handlers** restauran los valores originales desde el store `user` antes de salir del modo edición.

---

##### 2e. Estado del formulario de contraseña

Agregá estos estados nuevos (al lado de los existentes):

```typescript
const [showPasswordForm, setShowPasswordForm] = useState(false);
const [passwordData, setPasswordData] = useState({ current_password: "", new_password: "", confirm_password: "" });
const [passwordError, setPasswordError] = useState<string | null>(null);
const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
const [isChangingPassword, setIsChangingPassword] = useState(false);
const [showCurrentPass, setShowCurrentPass] = useState(false);
const [showNewPass, setShowNewPass] = useState(false);
const [showConfirmPass, setShowConfirmPass] = useState(false);
```

Handler de cambio de contraseña:

```typescript
const handleChangePassword = async () => {
  setPasswordError(null); setPasswordSuccess(null);

  if (!passwordData.current_password) {
    setPasswordError("Ingresá tu contraseña actual.");
    return;
  }
  if (!passwordData.new_password) {
    setPasswordError("Ingresá una nueva contraseña.");
    return;
  }
  if (passwordData.new_password.length < 8) {
    setPasswordError("La contraseña debe tener al menos 8 caracteres.");
    return;
  }
  if (!REQ_UPPER.test(passwordData.new_password)) {
    setPasswordError("Debe contener al menos una mayúscula.");
    return;
  }
  if (!REQ_NUMBER.test(passwordData.new_password)) {
    setPasswordError("Debe contener al menos un número.");
    return;
  }
  if (!passwordData.confirm_password) {
    setPasswordError("Confirmá tu nueva contraseña.");
    return;
  }
  if (passwordData.new_password !== passwordData.confirm_password) {
    setPasswordError("Las contraseñas no coinciden.");
    return;
  }

  setIsChangingPassword(true);
  try {
    await profileService.changePassword(user.id, passwordData.current_password, passwordData.new_password, passwordData.confirm_password);
    setPasswordSuccess("Contraseña actualizada correctamente.");
    setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    setShowPasswordForm(false);
    setShowCurrentPass(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
  } catch (err: any) {
    setPasswordError(err.response?.data?.detail || "Error al cambiar la contraseña.");
  } finally {
    setIsChangingPassword(false);
  }
};
```

> La validación es client-side primero (antes de llamar al backend). El backend también valida, pero esto da feedback instantáneo.

---

##### 2f. Actualizar sección Datos Personales

Cambiá las referencias de `isEditing` a `editingDatos`:
- El botón del header: `onClick={() => editingDatos ? handleCancelDatos() : setEditingDatos(true)}`
- El texto del botón: `editingDatos ? "Cancelar" : "Editar"`
- `readOnly={!editingDatos}` en ambos inputs
- Clases condicionales: `editingDatos ? "bg-white border..." : "bg-[#F4F1EC]/60..."`
- El bloque del botón "Guardar cambios": `{editingDatos && (` y `onClick={handleSaveDatos}`

> Buscá TODAS las ocurrencias de `isEditing` en esta sección y cambialas por `editingDatos`.

---

##### 2g. Actualizar sección Biografía / Intereses

Agregá el botón de edición al header (antes no tenía):

```tsx
<header className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
  <FileText className="text-[#A04E2D] h-5 w-5" />
  <h2 className="text-base font-bold text-gray-900">Biografía / Intereses</h2>
  <button onClick={() => editingBio ? handleCancelBio() : setEditingBio(true)} className="text-xs font-bold text-[#A04E2D] hover:underline flex items-center gap-1">
    {editingBio ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
    {editingBio ? "Cancelar" : "Editar"}
  </button>
</header>
```

Cambiá el textarea: `readOnly={!editingBio}`, clases condicionales con `editingBio`.

Agregá el botón "Guardar cambios" dentro de la sección (solo visible cuando `editingBio`):

```tsx
<div className="flex items-center justify-between">
  <span className={`text-xs ${(formData.bio ?? "").length > 500 ? "text-red-500 font-medium" : "text-stone-400"}`}>
    {(formData.bio ?? "").length}/500
  </span>
  {editingBio && (
    <button onClick={handleSaveBio} disabled={isSaving} className="w-full sm:w-auto px-8 py-2.5 bg-[#A04E2D] hover:bg-[#853F22] text-white font-medium text-sm rounded-full shadow-sm disabled:opacity-70 flex items-center gap-2">
      {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
      {isSaving ? "Guardando..." : "Guardar cambios"}
    </button>
  )}
</div>
```

---

##### 2h. Reemplazar sección Ajustes de Cuenta

Reemplazá toda la sección de Ajustes de Cuenta por esta versión con el formulario de contraseña inline:

```tsx
<section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
  <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-4">
    <Settings className="text-[#A04E2D] h-5 w-5" />
    <h2 className="text-base font-bold text-gray-900">Ajustes de Cuenta</h2>
  </header>
  <div className="divide-y divide-gray-100">
    <div className="py-4">
      <div className="flex items-start gap-3">
        <span className="rounded-full p-2 mt-0.5 bg-emerald-50 text-emerald-600"><Lock className="h-4 w-4" /></span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">Contraseña</h3>
          <p className="text-xs text-gray-400 font-medium">{passwordSuccess || "Cambiá tu contraseña periódicamente"}</p>
        </div>
        <button onClick={() => { setShowPasswordForm(!showPasswordForm); setPasswordError(null); setPasswordSuccess(null); }} className="text-xs font-bold text-[#A04E2D] hover:underline">
          {showPasswordForm ? "Cancelar" : "Editar"}
        </button>
      </div>
      {showPasswordForm && (
        <div className="mt-3 ml-11 space-y-3 p-4 bg-[#F4F1EC]/60 rounded-xl">
          {passwordError && <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">{passwordError}</p>}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Contraseña actual</label>
            <div className="relative">
              <input
                type={showCurrentPass ? "text" : "password"}
                value={passwordData.current_password}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, current_password: e.target.value }))}
                className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm font-medium bg-white border border-gray-200 focus:ring-2 focus:ring-[#A04E2D]/20 outline-none"
              />
              <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                value={passwordData.new_password}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, new_password: e.target.value }))}
                className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm font-medium bg-white border border-gray-200 focus:ring-2 focus:ring-[#A04E2D]/20 outline-none"
                placeholder="Mínimo 8 caracteres"
              />
              <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
              <ReqLine met={REQ_MIN_8.test(passwordData.new_password)} label="Mínimo 8 caracteres" />
              <ReqLine met={REQ_UPPER.test(passwordData.new_password)} label="Al menos 1 mayúscula" />
              <ReqLine met={REQ_NUMBER.test(passwordData.new_password)} label="Al menos 1 número" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Confirmar nueva contraseña</label>
            <div className="relative">
              <input
                type={showConfirmPass ? "text" : "password"}
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirm_password: e.target.value }))}
                className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm font-medium bg-white border border-gray-200 focus:ring-2 focus:ring-[#A04E2D]/20 outline-none"
              />
              <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {passwordData.new_password && passwordData.confirm_password && passwordData.new_password === passwordData.confirm_password && (
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">{"\u2713"} Las contraseñas coinciden</p>
          )}
          {passwordData.new_password && passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">Las contraseñas no coinciden</p>
          )}

          <button onClick={handleChangePassword} disabled={isChangingPassword} className="w-full px-6 py-2.5 bg-[#A04E2D] hover:bg-[#853F22] text-white font-medium text-sm rounded-full shadow-sm disabled:opacity-70 flex items-center justify-center gap-2">
            {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
            {isChangingPassword ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </div>
      )}
    </div>
    {/* Notificaciones — solo toggle, sin acción */}
    <div className="py-4 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="rounded-full p-2 mt-0.5 bg-emerald-50 text-emerald-600"><Bell className="h-4 w-4" /></span>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Notificaciones</h3>
          <p className="text-xs text-gray-400 font-medium">Alertas de comunidad y mensajes</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked className="sr-only peer" />
        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
      </label>
    </div>
  </div>
</section>
```

> **Atención**: La versión anterior de Ajustes de Cuenta tenía filas para "Eliminar cuenta" y "Privacidad" — esas filas NO están en este código. Las eliminamos a propósito.

### Resumen de cambios

| Zona | Antes (incidencia 19) | Después (incidencia 20) |
|------|----------------------|------------------------|
| Edición | Un solo `isEditing` global | `editingDatos` y `editingBio` independientes |
| Save | `handleSave` envía todo formData | `handleSaveDatos` envía solo nombre+whatsapp, `handleSaveBio` envía solo bio |
| Cancel | No reseteaba formData | `handleCancelDatos` y `handleCancelBio` restauran valores del store |
| Biografía header | Sin botón de editar | Tiene su propio botón Editar/Cancelar |
| Biografía save | Usaba el botón de Datos Personales | Tiene su propio botón "Guardar cambios" |
| Contraseña | Botón "Actualizar" sin funcionalidad | Botón "Editar" que despliega formulario completo con validación |
| Validación password | No existía | 3 requisitos en tiempo real (mín 8, mayúscula, número) + match feedback |
| Visibilidad password | No existía | Toggle 👁 en los 3 campos de contraseña |
| Eliminar cuenta | Fila presente en Ajustes | Eliminada |
| Privacidad | Fila presente en Ajustes | Eliminada |

### Verificación completa

```bash
cd frontend
npx tsc --noEmit
# Esperado: 0 errores

npm run dev
# Abrí http://localhost:5173/profile
```

**Pruebas manuales:**

| Escenario | Qué esperar |
|-----------|------------|
| Clickear "Editar" en Datos Personales | Solo nombre y WhatsApp se vuelven editables. Bio NO se activa |
| Clickear "Editar" en Biografía | Solo el textarea de bio se vuelve editable. Nombre y WhatsApp NO se activan |
| Editar ambas secciones a la vez | Se puede — cada una tiene su propio botón "Guardar cambios" |
| Cancelar edición en Datos Personales | Los campos vuelven a los valores originales del store |
| Cancelar edición en Biografía | La bio vuelve al valor original del store |
| Clickear "Editar" en Contraseña | Se despliega el formulario con 3 inputs + requisitos + botón "Cambiar contraseña" |
| Tipear contraseña que no cumple requisitos | Los indicadores ○ no se marcan hasta que se cumple cada requisito |
| Tipear contraseñas que no coinciden | Aparece mensaje rojo "Las contraseñas no coinciden" |
| Tipear contraseñas que coinciden | Aparece mensaje verde "✓ Las contraseñas coinciden" |
| Clickear 👁 en un campo | El texto se vuelve visible, el ícono cambia a 👁‍🗨 |
| Cambiar contraseña exitosamente | Mensaje verde, formulario se cierra, campos se limpian |
| Contraseña actual incorrecta | Error 401: "La contraseña actual es incorrecta" |
| Ajustes de Cuenta | Solo se ven 2 filas: Contraseña y Notificaciones |

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `ReferenceError: isEditing is not defined` | Quedó alguna referencia al estado viejo | Buscá `isEditing` en todo el archivo y reemplazalo por `editingDatos` o `editingBio` según corresponda |
| `property 'changePassword' does not exist on type` | No agregaste el método a `profileService` | Revisá el paso 1 |
| Error 404 al cambiar contraseña | Incidencia 10 no está mergeada | Verificá que el backend tenga el endpoint `PUT /users/{id}/password` |
| La bio se edita pero el botón "Guardar" no aparece | `editingBio` no está controlando la visibilidad del botón | Asegurate de que el botón esté dentro de `{editingBio && (...)}` |
| Al cancelar, los campos no se restauran | `handleCancelDatos` o `handleCancelBio` no están usando `user?.full_name` sino `formData` | Verificá que usen `user?.full_name` (del store) como valor de reset, no `formData.full_name` |
| El toggle de notificaciones no funciona | Es un toggle decorativo sin estado | Es esperado — no hay backend para notificaciones todavía |

### Criterios de aceptación Incidencia 20

- [ ] Datos Personales y Biografía tienen cada uno su propio botón "Editar" / "Cancelar"
- [ ] Cada sección tiene su propio botón "Guardar cambios" que solo envía los campos de esa sección
- [ ] Cancelar en Datos Personales restaura `full_name` y `whatsapp_e164` a los valores del store
- [ ] Cancelar en Biografía restaura `bio` al valor del store
- [ ] El botón de contraseña en Ajustes dice "Editar" y despliega el formulario
- [ ] El formulario de contraseña muestra 3 requisitos con indicadores ✓/○ en tiempo real
- [ ] Los 3 campos de contraseña tienen toggle 👁 para mostrar/ocultar
- [ ] Al tipear contraseñas que coinciden, aparece "✓ Las contraseñas coinciden" en verde
- [ ] Al tipear contraseñas que no coinciden, aparece "Las contraseñas no coinciden" en rojo
- [ ] Cambio exitoso: cierra formulario, limpia campos, muestra mensaje verde
- [ ] Error de contraseña actual: muestra mensaje de error del backend (401)
- [ ] Las filas "Eliminar cuenta" y "Privacidad" NO aparecen en Ajustes de Cuenta
- [ ] `npx tsc --noEmit` compila sin errores
- [ ] Commit con: `feat(profile): split edit controls, add password form, clean settings`

---
