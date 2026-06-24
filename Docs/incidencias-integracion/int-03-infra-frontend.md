## INCIDENCIA INT-03 — Infraestructura Frontend (Axios, Vite, Env, Tipos)

## Resumen

Esta incidencia configura la base técnica para que el frontend pueda comunicarse con el backend. Crea el cliente HTTP con interceptors de JWT, configura el proxy de Vite para desarrollo, define las variables de entorno, escribe los schemas Zod para validación de formularios, y documenta el mapeo de campos entre el frontend (español/camelCase) y el backend (inglés/snake_case). Sin esta incidencia, cualquier intento de conectar páginas individuales fracasa porque no hay un axios configurado ni tipos compartidos.

**Rama:** `incidencia/int-03-infra-frontend`  
**Duración estimada:** 3-4 horas.  
**Depende de:** Ninguna del lado frontend. Del lado backend, INT-00 completada (necesitás saber que `GET /auth/me` existe).  
**Asignada a:** 1 dev frontend.

### ¿Qué vas a aprender?

| Concepto | ¿Qué es? |
|----------|---------|
| Axios interceptors | Funciones que se ejecutan ANTES de enviar un request (agregar JWT) y DESPUÉS de recibir un response (manejar 401) |
| Vite proxy | Redirige requests de desarrollo al backend sin CORS — `/api/*` → `http://localhost:8000/*` |
| Variables de entorno en Vite | `VITE_` prefix obligatorio. Se acceden con `import.meta.env.VITE_API_URL` |
| Zod schemas | Validación de formularios con tipos TypeScript inferidos automáticamente |
| Mapeo de campos | `experienceLevel` (frontend) → `professional_level` (backend) |

### Pre-lectura (15 min)

| Archivo | Pregunta que responde |
|---------|----------------------|
| `frontend/vite.config.ts` | ¿Tiene proxy configurado? (no, está vacío) |
| `frontend/src/config/axios.tsx` | ¿Qué hay en el archivo? (vacío) |
| `frontend/src/types/api.ts` | ¿Qué tipos existen? `UserCreateRequest`, `SaludRequest`, `SaludResponse`, etc. |
| `backend/app/schemas/user.py` | ¿Qué campos espera `UserCreate`? `full_name`, `professional_level`, `career_objective`... |
| `frontend/src/modules/auth/register.tsx` | ¿Qué nombres de campo usa el form? `fullName`, `experienceLevel`, `currentGoal`... |

### Antes de codear: flujo git

```bash
git checkout main
git pull origin main
git checkout -b incidencia/int-03-infra-frontend
```

### Paso a paso

#### Archivo 1: `frontend/.env.example`

Este archivo SÍ se commitea. Le dice al próximo dev qué variables necesita.

```env
# URL del backend. En desarrollo apunta al proxy de Vite.
# En producción, apunta a la URL real del backend desplegado.
VITE_API_URL=http://localhost:8000
```

#### Archivo 2: `frontend/.env`

Este archivo NO se commitea (ya está en `.gitignore`). Lo creás vos localmente:

```env
VITE_API_URL=http://localhost:8000
```

**IMPORTANTE:** Si tu backend corre en otro puerto (ej: Render, Railway, o Supabase Edge Functions), poné la URL real. En desarrollo local con `uvicorn`, lo normal es `http://localhost:8000`.

#### Archivo 3: `frontend/vite.config.ts` — Proxy de desarrollo

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

**¿Qué hace esto?** En desarrollo, cuando el frontend llama a `/api/auth/login`, Vite intercepta el request y lo redirige a `http://localhost:8000/auth/login`. El backend recibe `/auth/login` (sin el prefijo `/api`). Esto evita CORS en desarrollo.

**¿Por qué `/api` como prefijo?** Es una convención. Separa las requests a la API de las requests a assets estáticos. En producción, Nginx o el load balancer hace el mismo rewrite.

#### Archivo 4: `frontend/src/config/axios.ts` — Cliente HTTP

**Renombrá** `axios.tsx` a `axios.ts` (no es un componente React, no necesita JSX).

```typescript
import axios from "axios";

// ---------------------------------------------------------------------------
// Instancia de axios preconfigurada.
// Todas las llamadas a la API usan esta instancia.
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------------------------------------------------------------------
// INTERCEPTOR DE REQUEST: adjuntar token JWT automáticamente
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// INTERCEPTOR DE RESPONSE: manejar errores globalmente
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized → token expirado o inválido → logout
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Redirigir al login solo si no estamos ya en una página pública
      if (!window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/register")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

**¿Por qué `window.location.href` y no `react-router` navigate?** Porque el interceptor de axios está fuera del árbol de React. No tiene acceso a hooks ni al router. `window.location.href` es un hard redirect que limpia todo el estado — justo lo que querés cuando el token expiró.

**Alternativa avanzada:** Si más adelante querés evitar el hard redirect, podés importar el store de Zustand directamente (Zustand se puede usar fuera de React) y llamar `useAuthStore.getState().logout()`. Pero para este MVP, `window.location.href` es suficiente.

#### Archivo 5: `frontend/src/lib/validations.ts` — Schemas Zod

Creá la carpeta `frontend/src/lib/` y este archivo:

```typescript
import { z } from "zod";

// ---------------------------------------------------------------------------
// Validación de Login
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Formato de email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Validación de Registro (3 pasos)
// ---------------------------------------------------------------------------
export const registerStep1Schema = z.object({
  fullName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Formato de email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  birthDate: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria"),
  gender: z
    .string()
    .min(1, "Seleccioná una opción"),
  educationLevel: z
    .string()
    .min(1, "Seleccioná tu nivel educativo"),
});

export const registerStep2Schema = z.object({
  continent: z.string().min(1, "Seleccioná un continente"),
  country: z.string().min(1, "Seleccioná un país"),
  state: z.string().min(1, "La provincia es obligatoria"),
  city: z.string().min(1, "La ciudad es obligatoria"),
  phoneCode: z.string().min(1, "Seleccioná un código"),
  whatsapp: z
    .string()
    .min(6, "Número de WhatsApp inválido"),
});

export const registerStep3Schema = z.object({
  experienceLevel: z.string().min(1, "Seleccioná tu nivel"),
  technologyArea: z.string().min(1, "Seleccioná un área"),
  currentGoal: z.string().min(1, "Seleccioná un objetivo"),
});

export type RegisterFormData = z.infer<typeof registerStep1Schema> &
  z.infer<typeof registerStep2Schema> &
  z.infer<typeof registerStep3Schema>;
```

#### Archivo 6: `frontend/src/lib/fieldMappings.ts` — Mapeo frontend → backend

```typescript
import type { RegisterFormData } from "./validations";

/**
 * MAPEO DE CAMPOS: Frontend (camelCase, español) → Backend (snake_case, inglés)
 *
 * El formulario de registro usa nombres amigables para el usuario.
 * El backend espera nombres técnicos en inglés.
 * Esta función traduce entre ambos mundos.
 */

/** Mapea los valores del dropdown de nivel a los valores del enum ProfessionalLevel */
export const EXPERIENCE_LEVEL_MAP: Record<string, string> = {
  "student": "beginner",
  "junior": "junior",
  "semi-senior": "semi_senior",
  "senior": "senior",
};

/** Mapea los valores del dropdown de objetivo a los valores del enum CareerObjective */
export const CURRENT_GOAL_MAP: Record<string, string> = {
  "first-job": "find_job",
  "career-change": "change_job",
  "grow": "define_path",
  "mentoring": "study",
};

/** Convierte los datos del formulario al formato que espera el backend */
export function mapRegisterFormToApi(formData: RegisterFormData) {
  return {
    email: formData.email,
    password: formData.password,
    full_name: formData.fullName,
    birth_date: formData.birthDate,
    gender: formData.gender,
    education_level: formData.educationLevel,
    continent: formData.continent,
    country: formData.country,
    state: formData.state,
    city: formData.city,
    whatsapp: `${formData.phoneCode}${formData.whatsapp}`,
    professional_level: EXPERIENCE_LEVEL_MAP[formData.experienceLevel] || "junior",
    tech_area: formData.technologyArea,
    career_objective: CURRENT_GOAL_MAP[formData.currentGoal] || "define_path",
  };
}
```

**Punto importante:** `whatsapp` se concatena: `+54` + `1123456789` → `"+541123456789"`. El backend espera un solo string. No hay campo `phoneCode` en el modelo `User`.

### Verificación

```bash
# 1. Instalar zod (ya debería estar en package.json, pero verificá)
cd frontend
npm ls zod

# 2. Verificar que compila
npx tsc --noEmit
# Debe compilar sin errores. Si hay errores de tipos, revisá los imports.

# 3. Levantar el frontend
npm run dev
# Abrí http://localhost:5173. La app debe cargar sin errores en consola.

# 4. Probar el proxy
# Con el backend corriendo en :8000, abrí http://localhost:5173/api/health
# Deberías ver la respuesta JSON del health check del backend.
```

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot find module 'zod'` | Zod no está instalado | `npm install zod` (debería estar en `package.json`) |
| `import.meta.env.VITE_API_URL is undefined` | No creaste `.env` o usaste un nombre sin `VITE_` prefix | El `.env` debe estar en `frontend/`, y la variable DEBE empezar con `VITE_` |
| `TS2307: Cannot find module './lib/validations'` | No creaste la carpeta `src/lib/` o el archivo está en otro lado | `frontend/src/lib/validations.ts` |
| Proxy no funciona (404 en `/api/health`) | Vite no está corriendo con la nueva config, o el backend no está en `:8000` | Reiniciá `npm run dev` (Vite no recarga cambios de `vite.config.ts` en caliente) |
| `window is not defined` durante SSR | Axios se importa en un componente que hace SSR | Este proyecto no usa SSR (es Vite SPA). Si ves este error, es porque importaste axios en un lugar extraño. |
| `localStorage is not defined` | Similar al anterior | No debería pasar en una SPA. Si pasa, es porque el interceptor se ejecuta en el servidor. |

### Criterios de aceptación INT-03

- [ ] `.env.example` existe con `VITE_API_URL`
- [ ] `.env` existe localmente con la URL del backend (NO se commitea)
- [ ] `vite.config.ts` tiene proxy de `/api` → `http://localhost:8000`
- [ ] `config/axios.ts` tiene interceptors de request (JWT) y response (401 redirect)
- [ ] `lib/validations.ts` tiene schemas Zod para login y registro (3 pasos)
- [ ] `lib/fieldMappings.ts` tiene mapeo completo de campos frontend → backend
- [ ] `mapRegisterFormToApi` concatena `phoneCode` + `whatsapp` correctamente
- [ ] `npx tsc --noEmit` compila sin errores
- [ ] `npm run dev` levanta la app sin errores en consola
- [ ] Proxy `/api/health` devuelve la respuesta del backend
- [ ] Commit con: `feat(frontend): configurar axios, proxy, env y schemas de validacion`

---

## 🔄 Actualizaciones durante la integración real

### Interceptor de errores: fusión con INT-09

Durante la implementación, el interceptor de axios se construyó directamente con el manejo de Toast que el spec original recién introducía en INT-09. Esto significa que **INT-03 e INT-09 se fusionaron**: el interceptor nació con `showError()` y `extractErrorMessage()` desde el día 1.

**Diferencias con el spec original:**

| Aspecto | Spec INT-03 original | Código implementado |
|---------|---------------------|-------------------|
| Mensajes de error | Hardcodeados por status code | Usa `extractErrorMessage(err)` → mensaje real del backend |
| 401 redirect | `window.location.href = "/login"` inmediato | Toast + `setTimeout(1500ms)` + redirect |
| 403 | No existía | Agregado: "No tenés permisos para realizar esta acción." |
| Casos 404/409/422/500 | Múltiples `if` separados con mensajes fijos | Colapsados en `default:` con `extractErrorMessage()` |
| Auth endpoints | No se excluían | `isAuthEndpoint` evita toast en `/auth/login` y `/auth/register` |

**Archivo real:** `frontend/src/config/axios.ts` (56 líneas)

```typescript
import axios from "axios";
import { showError } from "../components/ui/Toast";
import { extractErrorMessage } from "../lib/errorUtils";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");

    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 401:
          if (!isAuthEndpoint && !window.location.pathname.startsWith("/login")) {
            localStorage.removeItem("token");
            showError("Tu sesión expiró. Iniciá sesión nuevamente.");
            setTimeout(() => { window.location.href = "/login"; }, 1500);
          }
          break;
        case 403:
          showError("No tenés permisos para realizar esta acción.");
          break;
        case 404: case 409: case 422: case 500:
        default:
          if (!isAuthEndpoint) {
            showError(extractErrorMessage(error));
          }
          break;
      }
    } else if (error.request) {
      showError("No se pudo conectar con el servidor. Verificá tu conexión.");
    }
    return Promise.reject(error);
  }
);
```

### Nuevo archivo: `frontend/src/lib/errorUtils.ts`

No documentado en el spec original. Creado durante la implementación para normalizar los errores de FastAPI:

```typescript
export function extractErrorMessage(err: any): string {
  const detail = err?.response?.data?.detail;
  if (!detail) return "Error inesperado. Intentá de nuevo.";

  // FastAPI 422: detail es un array de objetos con loc y msg
  if (Array.isArray(detail)) {
    return detail
      .map((d: any) => {
        const field = d.loc?.slice(1).join(".") || "campo";
        return `${field}: ${d.msg}`;
      })
      .join(". ");
  }

  // FastAPI otros errores: detail es un string
  return String(detail);
}
```

Este utilitario es usado por:
- `config/axios.ts` (interceptor de errores)
- `store/useAuthStore.ts` (errores de login/register)
- `store/useSaludStore.ts` (errores de check-in)
- `store/useOrientarStore.ts` (errores de análisis)

### Tipado más estricto en `fieldMappings.ts`

Los mapeos usan los tipos exportados de `types/api.ts` en vez de `Record<string, string>`:

```typescript
import { ProfessionalLevel, CareerObjective, type UserCreateRequest } from "../types/api";

export const EXPERIENCE_LEVEL_MAP: Record<string, ProfessionalLevel> = { ... };
export const CURRENT_GOAL_MAP: Record<string, CareerObjective> = { ... };
export function mapRegisterFormToApi(formData: RegisterFormData): UserCreateRequest { ... }
```

---
