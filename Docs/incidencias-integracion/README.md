# Incidencias de Integración Frontend ↔ Backend — App BiT

> **LEÉ ESTO ANTES DE TOCAR UNA SOLA LÍNEA.**
>
> Esta serie de incidencias conecta el frontend React con el backend FastAPI. Asume que:
> - El backend tiene los endpoints de auth (`/auth/register`, `/auth/login`) y salud (`/salud`) funcionando.
> - El frontend tiene todas las pantallas construidas con mocks locales.
> - La base de datos PostgreSQL está corriendo en **Supabase** (nube). La conexión es vía connection string directa con pooler (puerto 6543), ya configurada en `DATABASE_URL`.

---

## Reglas de oro de la integración

1. **NUNCA hagas `console.log` en vez de llamar a la API.** Si ves un `console.log(formData)` o `console.log({ email, password })`, ese código todavía no está integrado. Reemplazalo por la llamada real al service.

2. **Siempre manejá loading, error y success.** Toda llamada a la API tiene 3 estados. Si solo manejás el éxito, el usuario se queda mirando una pantalla congelada cuando algo falla.

3. **El token JWT va en TODAS las requests autenticadas.** El interceptor de axios lo adjunta automáticamente. No lo hagas manual en cada llamada.

4. **Los mocks se eliminan, no se comentan.** Cuando una página esté integrada, borrá el import del mock. No dejes código muerto.

5. **Nunca expongas `hashed_password` en el frontend.** El backend ya lo filtra con `response_model`. No tenés que hacer nada — pero no inventes un campo `password` en la respuesta.

---

## Índice de Incidencias

| # | Archivo | ¿Qué se construye? | Stack | Duración |
|---|---------|-------------------|-------|----------|
| **INT-00** | [int-00-auth-middleware.md](./int-00-auth-middleware.md) | `get_current_user` + `GET /auth/me` | Python | 3-4h |
| **INT-01** | [int-01-mood-salud-auth.md](./int-01-mood-salud-auth.md) | Extender Mood (7 moods) + refactor `/salud` con JWT | Python | 3-4h |
| **INT-02** | [int-02-orientar-endpoint.md](./int-02-orientar-endpoint.md) | `POST /orientar` (router + service determinista) | Python | 5-6h |
| **INT-03** | [int-03-infra-frontend.md](./int-03-infra-frontend.md) | Axios, Vite proxy, .env, tipos Zod, mapeo de campos | TypeScript/React | 3-4h |
| **INT-04** | [int-04-auth-frontend.md](./int-04-auth-frontend.md) | Auth service + Zustand store + Login + Register integrados | TypeScript/React | 6-8h |
| **INT-05** | [int-05-services-frontend.md](./int-05-services-frontend.md) | Salud + Orientar + Profile services + stores | TypeScript/React | 4-5h |
| **INT-06** | [int-06-dashboard.md](./int-06-dashboard.md) | Dashboard conectado a `/salud` y `/orientar` | TypeScript/React | 4-5h |
| **INT-07** | [int-07-orientacion-salud.md](./int-07-orientacion-salud.md) | Páginas de Orientación y Salud Mental conectadas | TypeScript/React | 4-5h |
| **INT-08** | [int-08-perfil.md](./int-08-perfil.md) | Página de Perfil conectada a `/auth/me` | TypeScript/React | 4-5h |
| **INT-09** | [int-09-ux-loading-error.md](./int-09-ux-loading-error.md) | Skeletons, spinners, toast, error handling, 401 redirect | TypeScript/React | 3-4h |

---

## Mapa de Dependencias

```
FASE BACKEND (1 dev, 2-3 días)
─────────────────────────────────
INT-00 (auth middleware) ──┬── INT-02 (orientar)
INT-01 (mood + salud)    ──┘
                           │
                           ▼
FASE INFRAESTRUCTURA FE (1 dev, 2 días)
─────────────────────────────────────────
INT-03 (axios, env, proxy, tipos)
  │
  ├── INT-04 (auth FE: service + store + login + register)
  └── INT-05 (salud + orientar services + stores)
        │
        ▼
FASE PÁGINAS (1-2 devs, 3-4 días)
────────────────────────────────────
INT-06 (dashboard) ── depende de INT-04 + INT-05
INT-07 (orient+salud) ── depende de INT-05
INT-08 (perfil) ─────── depende de INT-04
        │
        ▼
FASE UX (1 dev, 1 día)
────────────────────────
INT-09 (loading, error, toast)
```

**Paralelismo:**
- INT-00 e INT-01 pueden hacerse en paralelo (distintos archivos, sin conflicto).
- INT-03 e INT-04 pueden arrancar apenas INT-00 esté listo (necesitan `GET /auth/me`).
- INT-05 puede arrancar junto con INT-03 (no depende de endpoints nuevos).
- INT-06, INT-07 e INT-08 pueden hacerse en paralelo si hay 2 devs frontend.

**Ningún dev queda bloqueado más de lo que tarda INT-00 en terminarse (3-4 horas).**

---

## Estado de Implementación — `feat/integration`

| # | Incidencia | Estado | Commits Relacionados | Divergencias |
|---|-----------|--------|---------------------|-------------|
| **INT-00** | Auth Middleware | ✅ Implementado | — | `get_session` import a nivel módulo (no lazy) |
| **INT-01** | Mood + Salud Auth | ✅ Implementado | — | Textos de fallback más concisos; constantes `MENSAJE_CRISIS` / `ACCION_CRISIS` |
| **INT-02** | Orientar Endpoint | ✅ Implementado | — | Ninguna — 100% fiel al spec |
| **INT-03** | Infra Frontend | ✅ Implementado | `258c0ee`, `c4d5e90` | Interceptor fusionado con INT-09 (usa `extractErrorMessage` + Toast desde día 1) |
| **INT-04** | Auth Frontend | ⚠️ Implementado con divergencias | `258c0ee`, `c4d5e90`, `23d6aaf` | [Ver detalle abajo](#divergencias-int-04) |
| **INT-05** | Services Frontend | ✅ Implementado | — | Usa `extractErrorMessage` en stores |
| **INT-06** | Dashboard | ✅ Implementado | `c4d5e90` | Ninguna — 100% fiel al spec |
| **INT-07** | Orientación + Salud | ✅ Implementado | `c4d5e90` | Cambios visuales menores (botón "Ver todos los cursos" eliminado) |
| **INT-08** | Perfil | ⚠️ Implementado con bugs | `c4d5e90` | [Ver detalle abajo](#divergencias-int-08) |
| **INT-09** | UX Transversal | ✅ Implementado (parcialmente en INT-03) | — | Interceptor construido en INT-03; 422 muestra toast en prod |

### Divergencias INT-04

1. **Register auto-login incompleto:** El backend devuelve `RegisterResponse` (token + user) pero el frontend ignora el token. `register.tsx` navega a `/dashboard` sin autenticar → `Layout` redirige a `/login`. **Bug: el usuario nunca ve confirmación de registro exitoso.**
2. **Diseño split-panel:** Login y Register tienen layout completo con hero images, botones sociales, y componentes `AuthLayout`/`PasswordInput`/`Divider` no documentados en el spec original.
3. **Mobile horizontal fix (commit `23d6aaf`):** Se agregó `overflow-hidden` + `overflow-y-auto` para corregir scroll horizontal en mobile.
4. **Corrección de enrutamiento (commit `c4d5e90`):** 19 archivos modificados consolidando routing, layout, y componentes UI.

### Divergencias INT-08

1. **Descripción del perfil eliminada** (el párrafo "Enfocada en el crecimiento..." no está en el código).
2. **`formData` no se resetea al cancelar edición** — bug de UX: al cancelar y volver a editar, se ven valores previos.
3. **Campos `professional_level` y `career_objective` como texto libre** — deberían ser `<Select>` con opciones de enum.
4. **`PUT /users/{id}` no implementado en backend** — el endpoint no existe aún.

### Archivos nuevos no documentados en specs originales

| Archivo | Creado en | Propósito |
|---------|-----------|-----------|
| `frontend/src/lib/errorUtils.ts` | INT-03/09 | Normaliza errores de FastAPI (`detail: string` y `detail: [{loc, msg}]`) |
| `backend/app/schemas/user.py:64-67` (`RegisterResponse`) | INT-04 | Schema con `access_token` + `user` en respuesta de registro |
| `frontend/src/components/ui/Select.tsx` | `c4d5e90` | Componente select reutilizable (47 líneas) |
| `frontend/src/context/authContext.tsx` | `c4d5e90` | Wrapper de compatibilidad para `useAuth()` |
| `frontend/src/components/auth/*` | `258c0ee` | `AuthLayout`, `Divider`, `SocialButton`, `Logo`, `PasswordInput` |
