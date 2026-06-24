## INCIDENCIA INT-09 — UX Transversal (Loading, Error, Toast, 401 Redirect)

## Resumen

Esta incidencia unifica la experiencia de usuario en todos los estados que no son el "camino feliz". Crea componentes reutilizables de Spinner y Skeleton para estados de carga, implementa un sistema de toast notifications para feedback asíncrono (éxito, error, info), mejora el interceptor de errores de axios para mostrar toasts automáticamente en errores 4xx/5xx, y refina el redirect 401 para que no se sienta brusco. Es la última capa de pulido antes de considerar la integración completa.

**Rama:** `incidencia/int-09-ux-loading-error`  
**Duración estimada:** 3-4 horas.  
**Depende de:** INT-03 (axios config) + idealmente todas las páginas integradas (INT-06, 07, 08).  
**Asignada a:** 1 dev frontend.

### Pre-lectura (10 min)

| Archivo | Pregunta que responde |
|---------|----------------------|
| `frontend/src/config/axios.ts` | ¿Qué pasa actualmente con un 401? Redirect duro. ¿Y un 500? Nada. |
| `frontend/package.json` | ¿Está `react-hot-toast` instalado? Probablemente no. |
| `frontend/src/App.tsx` | ¿Dónde se monta la app? Acá va el `Toaster`. |

### Antes de codear: flujo git

```bash
git checkout incidencia/int-03-infra-frontend  # o la rama más avanzada que tengas
git pull origin incidencia/int-03-infra-frontend
git checkout -b incidencia/int-09-ux-loading-error
```

### Paso a paso

#### Archivo 0: Instalar dependencia

```bash
cd frontend
npm install react-hot-toast
```

#### Archivo 1: `frontend/src/components/ui/Spinner.tsx`

```typescript
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <Loader2
      className={`animate-spin text-[#A04E2D] ${sizeMap[size]} ${className}`}
    />
  );
}

/** Spinner centrado a pantalla completa */
export function PageSpinner({ message }: { message?: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      {message && (
        <p className="text-sm text-gray-500 font-medium">{message}</p>
      )}
    </main>
  );
}

/** Spinner inline para botones */
export function ButtonSpinner() {
  return <Spinner size="sm" className="text-white" />;
}
```

#### Archivo 2: `frontend/src/components/ui/Skeleton.tsx`

```typescript
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-xl ${className}`}
    />
  );
}

/** Skeleton de una tarjeta del dashboard */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm space-y-4 min-h-[400px]">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-32" />
    </div>
  );
}

/** Skeleton de una línea de texto */
export function TextSkeleton({ lines = 1 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
        />
      ))}
    </div>
  );
}
```

#### Archivo 3: `frontend/src/components/ui/Toast.tsx`

```typescript
// Este archivo configura react-hot-toast.
// No necesitás un componente React — es solo configuración.

import toast from "react-hot-toast";

/** Toast de éxito (verde) */
export function showSuccess(message: string) {
  toast.success(message, {
    duration: 4000,
    position: "top-right",
    style: {
      borderRadius: "12px",
      background: "#ECFDF5",
      color: "#065F46",
      border: "1px solid #A7F3D0",
      fontSize: "14px",
      fontWeight: 500,
    },
  });
}

/** Toast de error (rojo) */
export function showError(message: string) {
  toast.error(message, {
    duration: 5000,
    position: "top-right",
    style: {
      borderRadius: "12px",
      background: "#FEF2F2",
      color: "#991B1B",
      border: "1px solid #FECACA",
      fontSize: "14px",
      fontWeight: 500,
    },
  });
}

/** Toast informativo (azul) */
export function showInfo(message: string) {
  toast(message, {
    duration: 3000,
    position: "top-right",
    style: {
      borderRadius: "12px",
      background: "#EFF6FF",
      color: "#1E40AF",
      border: "1px solid #BFDBFE",
      fontSize: "14px",
      fontWeight: 500,
    },
  });
}
```

#### Archivo 4: Mejorar `frontend/src/config/axios.ts` — Interceptor de errores con toast

```typescript
import axios from "axios";
import { showError } from "../components/ui/Toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── REQUEST INTERCEPTOR ───
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

// ─── RESPONSE INTERCEPTOR ───
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No mostrar toast si el error viene de login/register
    // (esas páginas manejan sus propios mensajes de error inline)
    const isAuthEndpoint =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          if (!isAuthEndpoint && !window.location.pathname.startsWith("/login")) {
            localStorage.removeItem("token");
            showError("Tu sesión expiró. Iniciá sesión nuevamente.");
            // Pequeño delay para que el toast se vea antes del redirect
            setTimeout(() => {
              window.location.href = "/login";
            }, 1500);
          }
          break;

        case 403:
          showError("No tenés permisos para realizar esta acción.");
          break;

        case 404:
          showError(data?.detail || "El recurso solicitado no existe.");
          break;

        case 409:
          // Conflicto (ej: email duplicado) — lo maneja la página específica
          if (!isAuthEndpoint) {
            showError(data?.detail || "Conflicto al procesar la solicitud.");
          }
          break;

        case 422:
          // Error de validación — mostrar solo en desarrollo
          if (import.meta.env.DEV) {
            console.error("Validation error:", data);
          }
          break;

        case 500:
        default:
          showError("Error interno del servidor. Intentá de nuevo más tarde.");
          break;
      }
    } else if (error.request) {
      // No hubo respuesta del servidor
      showError("No se pudo conectar con el servidor. Verificá tu conexión.");
    }

    return Promise.reject(error);
  }
);

export default api;
```

**Punto importante:** Los endpoints de auth (`/auth/login`, `/auth/register`) NO muestran toast en errores. Esas páginas tienen mensajes inline. El interceptor lo detecta con `isAuthEndpoint`.

#### Archivo 5: Agregar `Toaster` a `frontend/src/App.tsx`

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/authContext";
import Login from "./modules/auth/login";
import Register from "./modules/auth/register";
import { Layout } from "./components/Layout";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<Layout />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
```

### Verificación

```bash
cd frontend
npx tsc --noEmit
npm run dev
```

**A) Probar toast de error:**
1. Logueate normalmente
2. En el dashboard, forzá un error (ej: desconectá el backend)
3. Hacé un check-in de ánimo
4. **Esperado:** Toast rojo en la esquina superior derecha: "No se pudo conectar con el servidor."

**B) Probar 401 redirect con toast:**
1. Eliminá manualmente el token de `localStorage`
2. Intentá navegar a `/orientation`
3. **Esperado:** Toast rojo "Tu sesión expiró". Después de 1.5s, redirect a `/login`.

**C) Probar login sin toast:**
1. Intentá loguearte con credenciales incorrectas
2. **Esperado:** Mensaje de error INLINE (debajo del título), NO un toast.

**D) Probar spinner en páginas:**
1. Navegá a `/orientation`
2. **Esperado:** Durante la carga, se ve un spinner centrado (usa `PageSpinner` de Spinner.tsx).

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot find module 'react-hot-toast'` | No instalaste la dependencia | `npm install react-hot-toast` |
| Los toasts no se ven | `Toaster` no está en el árbol de React | Agregá `<Toaster />` en `App.tsx` DENTRO de `<BrowserRouter>` |
| Toast aparece en login con credenciales incorrectas | `isAuthEndpoint` no está detectando bien la URL | El `error.config?.url` es relativo (`/auth/login`, no `http://localhost:8000/auth/login`). Verificá con `console.log(error.config?.url)`. |
| Doble toast en errores | La página muestra su propio error Y el interceptor también muestra toast | Si una página maneja el error con `try/catch`, el interceptor no debería mostrar toast para ese caso. Podés ignorar el error en la página (no hacer nada en el catch) y dejar que el interceptor lo maneje. |
| `window is not defined` | `localStorage` se ejecuta en SSR | No aplica (SPA con Vite). Si pasa, envolvés el interceptor en `if (typeof window !== 'undefined')`. |

### Criterios de aceptación INT-09

- [ ] `Spinner` y `PageSpinner` disponibles para usar en cualquier página
- [ ] `Skeleton` y `CardSkeleton` disponibles para estados de carga
- [ ] Toast de éxito (verde), error (rojo) e info (azul) funcionando
- [ ] Interceptor de axios muestra toast automático en errores 4xx/5xx (excepto auth)
- [ ] 401: toast + redirect a login después de 1.5s
- [ ] 500: toast genérico "Error interno del servidor"
- [ ] Sin conexión: toast "No se pudo conectar con el servidor"
- [ ] Login/Register NO muestran toast (errores inline)
- [ ] `<Toaster />` montado en `App.tsx`
- [ ] `npx tsc --noEmit` compila sin errores
- [ ] Commit con: `feat(ux): agregar estados de carga, toast notifications y manejo global de errores`

---

## 🔄 Actualizaciones durante la integración real

### El interceptor de errores se implementó en INT-03, no en INT-09

Durante la integración real, el interceptor de axios con Toast se construyó directamente en INT-03 (infraestructura). INT-09 no modificó el interceptor porque ya estaba completo. El spec de INT-03 fue actualizado para reflejar el código real.

**Diferencias con el spec original de INT-09:**

| Status Code | Spec INT-09 original | Código real (en axios.ts desde INT-03) |
|-------------|---------------------|--------------------------------------|
| 401 | Toast fijo + 1.5s delay + redirect | ✅ Igual |
| 403 | "No tenés permisos..." | ✅ Igual |
| 404 | "El recurso solicitado no existe." | Usa `extractErrorMessage()` → mensaje del backend |
| 409 | "Conflicto al procesar la solicitud." (no-auth) | Usa `extractErrorMessage()` → mensaje del backend |
| 422 | Solo `console.error` en DEV | Usa `extractErrorMessage()` → muestra errores de validación |
| 500/default | "Error interno del servidor..." | Usa `extractErrorMessage()` → mensaje del backend |

**Decisión de diseño:** Se optó por usar `extractErrorMessage(err)` en vez de mensajes fijos para 404, 409, 422, y 500. Esto permite que el frontend refleje automáticamente los mensajes del backend sin necesidad de mantener strings duplicados.

### ⚠️ Riesgo: 422 muestra toast en producción

El spec original decía que 422 solo debía loguearse en desarrollo. El código implementado muestra toast para 422 en todos los entornos. Esto puede exponer mensajes de validación internos (ej: "email: value is not a valid email address") a usuarios finales. **Pendiente de decisión:** si filtrar 422 en producción o mantener el comportamiento actual.

### `extractErrorMessage` como utilidad compartida

El archivo `lib/errorUtils.ts` (no documentado en ningún spec original) fue creado para normalizar los errores de FastAPI. Es usado por:
- `config/axios.ts` (interceptor)
- `store/useAuthStore.ts`, `useSaludStore.ts`, `useOrientarStore.ts` (stores)

Maneja dos formatos de `detail`:
- `string` — errores 401, 404, 409, 500
- `Array<{loc, msg}>` — errores 422 de validación

### Componentes UI creados

Además de los especificados, se crearon componentes auxiliares que no estaban en el spec original pero son parte del sistema de UX:

- **`Spinner.tsx`** — tres variantes: `Spinner` (genérico), `PageSpinner` (pantalla completa), `ButtonSpinner` (inline para botones)
- **`Skeleton.tsx`** — tres variantes: `Skeleton` (genérico), `CardSkeleton` (tarjetas), `TextSkeleton` (líneas de texto)
- **`Toast.tsx`** — configuración de `react-hot-toast` con estilos personalizados para éxito, error e info

### Dependencia agregada

```bash
npm install react-hot-toast
```

---

## 🎉 Integración completa

Al terminar INT-09, la aplicación está completamente integrada:

| Flujo | Frontend | Backend | Estado |
|-------|----------|---------|--------|
| Registro | Form 3 pasos con Zod | `POST /auth/register` | ✅ |
| Login | Form con validación | `POST /auth/login` → JWT | ✅ |
| Auth state | Zustand store + token en localStorage | `GET /auth/me` | ✅ |
| Dashboard | Mood selector + nota semanal | `POST /salud` | ✅ |
| Progreso profesional | Barra de gap dinámica | `POST /orientar` | ✅ |
| Orientación | Gap, trayectoria, vacantes | `POST /orientar` | ✅ |
| Salud Mental | Check-in, botón crisis | `POST /salud` | ✅ |
| Perfil | Datos editables | `GET /auth/me` | ✅ |
| UX | Spinners, skeletons, toasts | — | ✅ |

**Lo que queda para futuras iteraciones:**
- `PUT /users/{id}` en backend (edición de perfil)
- `GET /salud/history` (historial de check-ins)
- Internacionalización (i18n)
- PWA (service worker, offline)
- Notificaciones push
