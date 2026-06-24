## INCIDENCIA INT-04 — Auth Frontend (Service, Store, Login, Register)

## Resumen

Esta incidencia conecta el flujo de autenticación del frontend con el backend real. Implementa el servicio HTTP para login y registro, crea un store de Zustand que reemplaza el React Context actual (maneja `user`, `token`, estados de carga y error), integra el formulario de login para llamar a `POST /auth/login`, integra el wizard de registro de 3 pasos para llamar a `POST /auth/register` con el mapeo de campos correcto, agrega validación Zod en ambos formularios, y maneja loading/error states. Al terminar, un usuario real puede crear una cuenta y loguearse.

**Rama:** `incidencia/int-04-auth-frontend`  
**Duración estimada:** 6-8 horas (la incidencia más grande de la serie).  
**Depende de:** INT-03 completada (axios, tipos, validaciones, mapeo).  
**Asignada a:** 1 dev frontend.

### ¿Qué vas a aprender?

| Concepto | ¿Qué es? |
|----------|---------|
| Zustand store fuera de React | Zustand no necesita Provider — se subscribe cualquier componente directamente |
| `getState()` en interceptors | Acceder al store desde fuera del árbol de React |
| `react-hook-form` + `zod` | Formularios con validación tipada y mensajes de error en español |
| `useNavigate` después de login | Redirigir programáticamente al dashboard |
| `try/catch` en handlers de formulario | Manejar errores de API y mostrarlos al usuario |
| Mapeo de datos de formulario → API | `fullName` → `full_name`, `experienceLevel` → `professional_level` |

### Pre-lectura (20 min)

| Archivo | Pregunta que responde |
|---------|----------------------|
| `frontend/src/config/axios.ts` | ¿Cómo se llama la instancia? `api`. Ya tiene interceptors. |
| `frontend/src/lib/validations.ts` | ¿Qué schemas Zod existen? `loginSchema`, `registerStep1Schema`, etc. |
| `frontend/src/lib/fieldMappings.ts` | ¿Cómo se mapean los campos? `mapRegisterFormToApi()` |
| `frontend/src/context/authContext.tsx` | ¿Qué provee actualmente? `isAuthenticated`, `login(token)`, `logout()` |
| `frontend/src/modules/auth/login.tsx` | ¿Cómo se maneja el estado hoy? `useState` para email/password. `handleSubmit` solo hace `console.log`. |
| `frontend/src/modules/auth/register.tsx` | ¿Cómo fluyen los datos entre pasos? `formData` object con `updateField()`. |
| `backend/app/schemas/user.py` | `UserCreate` — campos exactos que espera el backend. `UserLogin` — solo email y password. `TokenResponse` — `access_token` + `token_type`. |
| `backend/app/routers/auth.py` | Endpoints: `POST /auth/register`, `POST /auth/login` |

### Antes de codear: flujo git

```bash
git checkout incidencia/int-03-infra-frontend
git pull origin incidencia/int-03-infra-frontend
git checkout -b incidencia/int-04-auth-frontend
```

### Paso a paso

#### Archivo 1: `frontend/src/services/authService.ts`

```typescript
import api from "../config/axios";
import type {
  User,
  UserCreateRequest,
} from "../types/api";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  /** POST /auth/login — Autentica al usuario y devuelve un JWT */
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  /** POST /auth/register — Crea una cuenta nueva */
  async register(userData: UserCreateRequest): Promise<User> {
    const { data } = await api.post<User>("/auth/register", userData);
    return data;
  },

  /** GET /auth/me — Obtiene el usuario autenticado desde el JWT */
  async getMe(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
};
```

#### Archivo 2: `frontend/src/store/useAuthStore.ts`

```typescript
import { create } from "zustand";
import type { User } from "../types/api";
import { authService } from "../services/authService";

interface AuthState {
  // Estado
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Acciones
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Parameters<typeof authService.register>[0]) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  clearError: () => void;
  hydrate: () => void; // Restaura el token del localStorage al montar la app
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(email, password);
      const token = response.access_token;
      localStorage.setItem("token", token);
      set({ token, isAuthenticated: true, isLoading: false });

      // Después del login, obtener datos del usuario
      await get().fetchMe();
    } catch (err: any) {
      const message =
        err.response?.data?.detail || "Error al iniciar sesión. Verificá tus credenciales.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(userData);
      // No hacemos login automático — el usuario debe loguearse después
      set({ isLoading: false });
    } catch (err: any) {
      const message =
        err.response?.data?.detail || "Error al crear la cuenta. ¿Ya existe ese email?";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  fetchMe: async () => {
    try {
      const user = await authService.getMe();
      set({ user });
    } catch {
      // Si falla getMe, el token probablemente expiró
      get().logout();
    }
  },

  clearError: () => set({ error: null }),

  hydrate: () => {
    const token = localStorage.getItem("token");
    if (token) {
      set({ token, isAuthenticated: true });
      get().fetchMe(); // Validar que el token sigue siendo válido
    }
  },
}));
```

**Concepto clave: `hydrate()`** — Se llama UNA vez cuando la app monta. Si hay un token en `localStorage` de una sesión anterior, intenta validarlo con `GET /auth/me`. Si el backend responde 401, `fetchMe` llama a `logout()` automáticamente. Esto evita que el usuario vea un dashboard vacío con un token expirado.

#### Archivo 3: Adaptar `frontend/src/context/authContext.tsx`

El `AuthContext` actual usaba React Context. Ahora delegamos a Zustand. **Mantenemos compatibilidad** para no romper los componentes que ya usan `useAuth()`.

```typescript
import React, { createContext, useContext, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, login, logout, hydrate } = useAuthStore();

  // Al montar la app, validar el token existente
  useEffect(() => {
    hydrate();
  }, []);

  // Wrapper para mantener compatibilidad con la API vieja (login(token: string))
  const legacyLogin = (token: string) => {
    localStorage.setItem("token", token);
    useAuthStore.setState({ token, isAuthenticated: true });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login: legacyLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
```

#### Archivo 4: Integrar Login en `frontend/src/modules/auth/login.tsx`

El archivo actual usa `useState` y `console.log`. Vas a reemplazar `handleSubmit` y agregar estados visuales.

Cambios principales:
1. Importar `useAuthStore` y `useNavigate`
2. Agregar estado `isSubmitting` para el spinner del botón
3. Agregar estado `errorMessage` para mostrar errores debajo del form
4. Llamar a `useAuthStore.getState().login(email, password)` en vez de `console.log`
5. Navegar a `/dashboard` con `useNavigate` después del login exitoso

**El diff completo del archivo es largo, pero los cambios se concentran en la parte superior (imports y estados) y en `handleSubmit`:**

```typescript
// === NUEVOS IMPORTS (agregar al inicio) ===
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import logoApp from "../../assets/Logo.png";
import { useAuthStore } from "../../store/useAuthStore";

export default function Login() {
  const navigate = useNavigate();
  const loginAction = useAuthStore((s) => s.login);
  const storeError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const errorMessage = localError || storeError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Validación básica antes de llamar a la API
    if (!email.trim()) {
      setLocalError("El email es obligatorio.");
      return;
    }
    if (password.length < 8) {
      setLocalError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      await loginAction(email, password);
      navigate("/dashboard", { replace: true });
    } catch {
      // El error ya está en el store (storeError)
      setIsSubmitting(false);
    }
  };

  // ... (el JSX se mantiene igual, solo cambian algunas partes)
```

**Modificaciones en el JSX:**

Agregar mensaje de error DEBAJO del encabezado "Iniciar sesión" y ANTES del `<form>`:

```tsx
{/* Mensaje de error */}
{errorMessage && (
  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
    {errorMessage}
  </div>
)}
```

Modificar el botón de submit para mostrar spinner durante la carga:

```tsx
<button
  type="submit"
  disabled={isSubmitting}
  className="w-full py-3 px-4 bg-[#99462A] hover:bg-[#823a22] text-white font-semibold rounded-xl transition-colors shadow-md mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
>
  {isSubmitting ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      Iniciando sesión...
    </>
  ) : (
    "Entrar"
  )}
</button>
```

#### Archivo 5: Integrar Register en `frontend/src/modules/auth/register.tsx`

Cambios principales:
1. Importar `useAuthStore`, `mapRegisterFormToApi`, `useNavigate`
2. Agregar `educationLevel` al `formData` inicial (el backend lo requiere)
3. Agregar `isSubmitting`, `errorMessage`
4. Llamar a `useAuthStore.getState().register(mappedData)` en `handleSubmit`
5. Navegar a `/login` después del registro exitoso

**Agregar `educationLevel` al estado inicial:**

```typescript
const [formData, setFormData] = useState({
  fullName: "",
  email: "",
  password: "",
  birthDate: "",
  gender: "",
  educationLevel: "",    // ← NUEVO (requerido por el backend)
  continent: "",
  country: "",
  state: "",
  city: "",
  phoneCode: "+54",
  whatsapp: "",
  experienceLevel: "",
  technologyArea: "",
  currentGoal: "",
});
```

**Nuevo `handleSubmit`:**

```typescript
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { mapRegisterFormToApi } from "../../lib/fieldMappings";

// Dentro del componente:
const navigate = useNavigate();
const registerAction = useAuthStore((s) => s.register);
const storeError = useAuthStore((s) => s.error);
const clearError = useAuthStore((s) => s.clearError);
const [isSubmitting, setIsSubmitting] = useState(false);
const [localError, setLocalError] = useState<string | null>(null);

const handleSubmit = async () => {
  setLocalError(null);
  clearError();
  setIsSubmitting(true);

  try {
    const apiData = mapRegisterFormToApi(formData);
    await registerAction(apiData);
    navigate("/login", {
      replace: true,
      state: { registered: true },
    });
  } catch {
    setIsSubmitting(false);
  }
};
```

**Modificar el botón final:**

```tsx
<Button
  type="button"
  onClick={step === 3 ? handleSubmit : nextStep}
  disabled={isSubmitting}
  className={`py-3 rounded-xl font-semibold text-sm shadow-md transition-all 
    ${step > 1 ? 'w-2/3' : 'w-full'}
    disabled:opacity-70 disabled:cursor-not-allowed`}
>
  {isSubmitting ? (
    <span className="flex items-center justify-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      Creando cuenta...
    </span>
  ) : (
    step === 3 ? "Finalizar registro" : "Siguiente paso"
  )}
</Button>
```

#### Archivo 6: Agregar `educationLevel` al Step 1

`registerStep1.tsx` necesita un nuevo campo `educationLevel` que no existe actualmente. Agregalo DESPUÉS del campo `gender`:

```tsx
interface RegisterStep1Props {
  formData: {
    fullName: string;
    email: string;
    password: string;
    birthDate: string;
    gender: string;
    educationLevel: string;  // ← NUEVO
  };
  updateField: (field: string, value: string) => void;
}

// Dentro del JSX, después del Select de gender:
<div className="space-y-2">
  <Select
    id="educationLevel"
    label="Nivel educativo"
    value={formData.educationLevel}
    onChange={(e) => updateField("educationLevel", e.target.value)}
    options={[
      { value: "", label: "Seleccionar" },
      { value: "secundario", label: "Secundario" },
      { value: "terciario", label: "Terciario / Técnico" },
      { value: "universitario", label: "Universitario" },
      { value: "posgrado", label: "Posgrado / Máster" },
    ]}
  />
</div>
```

### Verificación

Con el backend corriendo (`uvicorn app.main:app --reload`):

```bash
# 1. Compilar
cd frontend
npx tsc --noEmit

# 2. Levantar frontend
npm run dev

# 3. Flujo completo en el navegador:
```

**Escenario A — Registro exitoso:**
1. Ir a `/register`
2. Llenar los 3 pasos con datos válidos
3. Click en "Finalizar registro"
4. **Esperado:** Botón muestra spinner. Al terminar, redirige a `/login`.
5. Verificar en Swagger `GET /auth/register` (o PGAdmin) que el usuario se creó.

**Escenario B — Login con credenciales correctas:**
1. Ir a `/login`
2. Ingresar email y password del usuario recién creado
3. Click en "Entrar"
4. **Esperado:** Spinner en botón. Redirige a `/dashboard`. El nombre en el header del dashboard muestra `full_name` del usuario.

**Escenario C — Error de credenciales:**
1. Ir a `/login`
2. Ingresar email correcto pero password incorrecto
3. **Esperado:** Mensaje de error rojo debajo del título. Botón vuelve a "Entrar" (sin spinner).

**Escenario D — Logout:**
1. Estando en el dashboard, click en el menú de usuario → Cerrar sesión
2. **Esperado:** Redirige a `/login`. `localStorage` no tiene token.

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `TypeError: Cannot read properties of undefined (reading 'login')` | `useAuthStore` no se importó correctamente | `import { useAuthStore } from "../../store/useAuthStore"` — sin llaves extra |
| 422 Unprocessable Entity en `/auth/register` | Campos con nombre incorrecto o faltan campos requeridos | Verificá `mapRegisterFormToApi`. Compará con `UserCreate` del backend. |
| `KeyError: 'education_level'` en el backend | `educationLevel` no existe en el `formData` del frontend | Agregá `educationLevel: ""` al estado inicial y el campo al Step 1 |
| 409 Conflict en `/auth/register` | Email duplicado | Probá con un email distinto. El mensaje de error debería mostrarse en rojo. |
| `useNavigate() may be used only in the context of a <Router>` | El componente no está dentro de `<BrowserRouter>` | Login y Register están dentro de `<BrowserRouter>` en `App.tsx`. Si falla, revisá la jerarquía. |
| Error CORS: `No 'Access-Control-Allow-Origin'` | Estás llamando a `http://localhost:8000` directamente sin proxy | Usá `/api` como prefijo o configurá el proxy en `vite.config.ts`. El interceptor de axios usa `VITE_API_URL` — asegurate de que sea `/api` o la URL del proxy. |
| `localStorage.getItem(...) called during SSR` | No debería pasar | Si pasa, es porque el store se está ejecutando en el servidor. Este proyecto es SPA con Vite, no SSR. |
| El botón queda en spinner para siempre | La promesa de login no se resolvió ni rechazó | El `catch` en el store debería setear `isLoading: false`. Si no, revisá que `login` en el store tenga `set({ isLoading: false })` en el catch. |

### Criterios de aceptación INT-04

- [ ] `authService.login()` llama a `POST /auth/login` y devuelve `access_token`
- [ ] `authService.register()` llama a `POST /auth/register` y devuelve `RegisterResponse` (token + user)
- [ ] `useAuthStore.login()` guarda el token en `localStorage` y obtiene el usuario con `GET /auth/me`
- [ ] `useAuthStore.register()` crea el usuario y redirige a login
- [ ] Login page: spinner en botón durante carga, mensaje de error en rojo, redirect a dashboard
- [ ] Register page: campo `educationLevel` en Step 1, mapeo correcto de `experienceLevel` y `currentGoal`
- [ ] Register page: spinner en botón "Finalizar registro", redirect a login con mensaje de éxito
- [ ] Logout limpia `localStorage` y redirige a `/login`
- [ ] `hydrate()` valida el token al montar la app (si expiró, logout automático)
- [ ] `AuthProvider` mantiene compatibilidad con componentes que usan `useAuth()` (Layout)
- [ ] `npx tsc --noEmit` compila sin errores
- [ ] Commit con: `feat(auth): integrar login y registro con backend`

---

## 🔄 Actualizaciones durante la integración real

### Backend: Nuevo schema `RegisterResponse`

Durante la integración, el backend fue modificado para que `POST /auth/register` devuelva un token JWT junto con los datos del usuario, permitiendo auto-login. Se creó el schema `RegisterResponse`:

**Archivo:** `backend/app/schemas/user.py` (líneas 64-67)

```python
class RegisterResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
```

El endpoint `POST /auth/register` ahora usa `response_model=RegisterResponse` y el service `register()` genera el JWT y retorna un dict con `access_token`, `token_type` y `user`.

### Frontend: `authService.register()` actualizado

El servicio de registro cambió su tipo de retorno de `Promise<User>` a `Promise<RegisterResponse>`:

```typescript
// frontend/src/services/authService.ts
async register(userData: UserCreateRequest): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>("/auth/register", userData);
    return data;
}
```

El tipo `RegisterResponse` debe agregarse en `frontend/src/types/api.ts`:

```typescript
export interface RegisterResponse {
  access_token: string;
  token_type: string;
  user: User;
}
```

### ⚠️ Divergencia: Register redirige a `/dashboard` sin guardar el token

El código implementado en `register.tsx:66` navega a `/dashboard` después del registro, pero **NO guarda el token** devuelto por `RegisterResponse`. Esto causa que el `Layout` detecte `isAuthenticated === false` y redirija a `/login` sin mostrar confirmación de éxito.

```typescript
// ❌ Código actual (register.tsx:58-69)
const handleSubmit = async () => {
    // ...
    await registerAction(apiData);
    navigate("/dashboard", { replace: true });  // ← sin guardar token
};
```

**Solución aplicada (pendiente):**
- **Opción A (simple):** Cambiar `navigate("/dashboard")` → `navigate("/login", { state: { registered: true } })` y mostrar toast de éxito en `/login`.
- **Opción B (auto-login completo):** Modificar `useAuthStore.register()` para extraer el token de `RegisterResponse`, guardarlo en `localStorage`, setear `isAuthenticated: true`, llamar `fetchMe()`, y luego navegar a `/dashboard`.

### Frontend: Diseño split-panel en Login y Register

Ambas páginas recibieron un diseño visual completo tipo SaaS no documentado en el spec original:

**Login (`login.tsx`):**
- Layout split-panel: hero image (`/heroLogin.png`) a la izquierda, formulario a la derecha
- Botones sociales (Google, LinkedIn) con `SocialButton`
- Link "¿Olvidaste tu contraseña?"
- `AuthLayout`, `PasswordInput`, `Divider`, `Logo` como componentes reutilizables
- Commit `258c0ee` — "Add auth components, pages and router"

**Register (`register.tsx`):**
- Layout split-panel: hero image (`/heroRegister.png`) a la izquierda, wizard a la derecha
- `ProgressBar` con indicador de paso (1/3, 2/3, 3/3)
- Botón "Volver" en pasos 2 y 3
- Link "¿Ya tienes una cuenta? Iniciar sesión" al final

### 🐛 Error corregido: Login en mobile horizontal

**Commit:** `23d6aaf` — "fix: login en version mobile horizontal arreglado"

**Problema:** En dispositivos móviles en orientación horizontal, la página de login mostraba scroll horizontal no deseado.

**Solución:** Se agregó `overflow-hidden` al contenedor principal y `overflow-y-auto` para permitir scroll vertical sin afectar el horizontal.

```tsx
// login.tsx:46 — después del fix
<main className="min-h-screen overflow-y-auto h-screen w-full bg-background flex items-center justify-center overflow-hidden lg:p-6">
```

### Frontend: `extractErrorMessage` en stores

Los stores de Zustand (`useAuthStore`, `useSaludStore`, `useOrientarStore`) usan `extractErrorMessage(err)` del archivo `lib/errorUtils.ts` en vez del patrón `err.response?.data?.detail || "mensaje fijo"` que especifica el doc original. Esto maneja correctamente tanto errores con `detail: string` (401, 404, 409, 500) como errores de validación 422 con `detail: [{loc, msg}]`.

```typescript
// useAuthStore.ts:37 — implementación real
catch (err: any) {
    set({ isLoading: false, error: extractErrorMessage(err) });
    throw err;
}
```

### 🐛 Corrección de errores y enrutamiento

**Commit:** `c4d5e90` — "fix: correccion de errores y enrutamiento listo"  
**19 archivos modificados, 511 inserciones, 597 eliminaciones**

Este commit consolidó múltiples fixes del equipo en:
- `App.tsx` — reestructuración de rutas
- `Layout.tsx` — rediseño de navegación
- `BottomNavbar.tsx` — ajustes de UI
- `Header.tsx` — simplificación
- `Input.tsx` — mejoras de accesibilidad
- `Select.tsx` — nuevo componente (47 líneas)
- `authContext.tsx` — nuevo archivo (41 líneas)
- Refactor de `login.tsx` (317 líneas reelaboradas)
- Refactor de `register.tsx` (188 líneas reelaboradas)
- Simplificación de `registerStep1/2/3`
- Ajustes menores en `dashboardPage.tsx`, `mentalHealthPage.tsx`, `orientationPage.tsx`

---
