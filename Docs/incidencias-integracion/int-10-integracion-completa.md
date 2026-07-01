## INCIDENCIA INT-10 — Integración Frontend ↔ Backend

## Resumen

Conecta todas las pantallas del frontend React con los endpoints del backend FastAPI. Reemplaza datos mock por llamadas reales a la API, protege endpoints con JWT, extiende el modelo de moods a 8 valores, crea el endpoint `POST /orientar`, y agrega manejo de errores y estados de carga en toda la app.

**Rama:** `feat/integration`
**Duración real:** ~30 horas
**Asignada a:** 2 devs (1 backend, 1 frontend)
**Depende de:** Incidencias backend 01, 02a, 02b, 04, 06 completas. Frontend con todas las pantallas construidas con mocks.

### Cambios realizados

#### Backend

| Archivo | Cambio |
|---------|--------|
| `app/core/security.py` | `get_current_user` + `oauth2_scheme` |
| `app/routers/auth.py` | `GET /auth/me`, `POST /auth/register` → `RegisterResponse` |
| `app/routers/salud.py` | Protegido con `Depends(get_current_user)` |
| `app/routers/orientar.py` | **Nuevo** — `POST /orientar` |
| `app/services/orientar.py` | **Nuevo** — análisis de gap, trayectoria y vacantes |
| `app/services/salud.py` | Refactorizado: `user_id` por parámetro en vez de `request.usuario_id` |
| `app/services/ia_agent.py` | Fallbacks para `stressed`, `angry`, `depressed` |
| `app/enums/mood.py` | Extendido de 5 a 8 valores |
| `app/schemas/salud.py` | Eliminado `usuario_id` |
| `app/schemas/orientar.py` | Eliminado `usuario_id` |
| `app/schemas/user.py` | **Nuevo** `RegisterResponse` (token + user) |
| `app/main.py` | Registrado `orientar.router` |
| `tests/test_enums.py` | Actualizado a 8 moods |

#### Frontend

| Archivo | Cambio |
|---------|--------|
| `.env.example` | **Nuevo** — `VITE_API_URL` |
| `vite.config.ts` | Proxy `/api` → `:8000` |
| `src/config/axios.ts` | **Nuevo** — interceptors JWT + manejo de errores con Toast |
| `src/lib/validations.ts` | **Nuevo** — schemas Zod para login y registro |
| `src/lib/fieldMappings.ts` | **Nuevo** — mapeo de campos frontend → backend |
| `src/lib/errorUtils.ts` | **Nuevo** — normalización de errores de FastAPI |
| `src/services/authService.ts` | **Nuevo** — login, register, getMe |
| `src/services/saludService.ts` | **Nuevo** — sendCheckin |
| `src/services/orientarService.ts` | **Nuevo** — getAnalysis |
| `src/services/profileService.ts` | **Nuevo** — getProfile, updateProfile |
| `src/store/useAuthStore.ts` | **Nuevo** — Zustand: user, token, auth flows |
| `src/store/useSaludStore.ts` | **Nuevo** — check-in state |
| `src/store/useOrientarStore.ts` | **Nuevo** — análisis state |
| `src/context/authContext.tsx` | Adaptado a Zustand |
| `src/modules/auth/login.tsx` | Conectado a `POST /auth/login` (split-panel, loading, error) |
| `src/modules/auth/register.tsx` | Conectado a `POST /auth/register` (wizard 3 pasos, educationLevel) |
| `src/modules/dashboard/dashboardPage.tsx` | Sin mocks — conectado a `/salud` y `/orientar` |
| `src/modules/orientation/orientationPage.tsx` | Sin mocks — gap, trayectoria, vacantes reales |
| `src/modules/mental-health/mentalHealthPage.tsx` | Sin mocks — último check-in, botón de crisis |
| `src/modules/profile/userProfilePage.tsx` | Datos reales del usuario, modo edición |
| `src/components/ui/Spinner.tsx` | **Nuevo** — 3 variantes |
| `src/components/ui/Skeleton.tsx` | **Nuevo** — 3 variantes |
| `src/components/ui/Toast.tsx` | **Nuevo** — success, error, info |
| `src/App.tsx` | `Toaster` + rutas actualizadas |

### Bugs conocidos

| # | Descripción | Severidad |
|---|------------|-----------|
| 1 | Register redirige a `/dashboard` sin guardar token → Layout fuerza redirect a `/login`. El usuario no ve confirmación de registro exitoso. | Alta |
| 2 | Perfil: `formData` no se resetea al cancelar edición. | Media |
| 3 | Perfil: `professional_level` y `career_objective` son texto libre, deberían ser `<Select>` con valores de enum. | Media |
| 4 | `PUT /users/{id}` no implementado en backend — botón "Guardar cambios" en perfil no funciona. | Media |

### Correcciones aplicadas durante la integración

- **Mobile horizontal fix:** `overflow-hidden` + `overflow-y-auto` en Login (commit `23d6aaf`)
- **Enrutamiento:** 19 archivos corregidos en commit `c4d5e90` (App, Layout, BottomNavbar, Input, Select, authContext, refactor de login/register)
- **Interceptor de errores:** Unificado con `extractErrorMessage` desde el día 1 (en vez de esperar a INT-09)

### Verificación

```bash
# Backend — 30 tests
cd backend && python -m pytest tests/ -v

# Frontend — compilación
cd frontend && npx tsc --noEmit

# Flujo E2E manual
# 1. Registro → Login → Dashboard (nombre dinámico)
# 2. Check-in emocional (7 moods + nota semanal) → respuesta IA
# 3. Orientación → gap circular, trayectoria, vacantes
# 4. Salud Mental → botón de crisis → derivación CVV
# 5. Perfil → datos reales, modo edición
```

### Criterios de aceptación

- [ ] `POST /auth/register` devuelve token + user
- [ ] `GET /auth/me` valida JWT y devuelve datos del usuario
- [ ] `POST /salud` requiere autenticación, `user_id` viene del token
- [ ] `POST /orientar` devuelve gap, trayectoria, vacantes según `professional_level`
- [ ] Login: spinner, error inline, redirect a dashboard
- [ ] Register: 3 pasos con `educationLevel`, mapeo correcto de campos
- [ ] Dashboard: 7 moods, slider nota semanal, respuesta IA, barra de progreso
- [ ] Orientación: carga desde API, loading state, reintentar en error
- [ ] Salud Mental: botón de crisis funcional, último check-in visible
- [ ] Perfil: datos reales, avatar con iniciales, email no editable
- [ ] Toast notifications en errores 4xx/5xx (excepto auth)
- [ ] 401: toast + redirect a login tras 1.5s
- [ ] 30 tests backend en verde
- [ ] `npx tsc --noEmit` compila sin errores
- [ ] Commit: `feat: integracion frontend-backend completa`

### Commits

```
f308f8e feat(frontend): paginas conectadas a API
ed8b8f9 feat(frontend): servicios y stores
2af986e feat(frontend): infraestructura y UX
67c8a20 feat(backend): auth, salud y orientar
```

---
