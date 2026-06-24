## INCIDENCIA INT-05 — Services Frontend (Salud + Orientar + Profile)

## Resumen

Esta incidencia implementa la capa de servicios HTTP y stores de Zustand para las tres funcionalidades principales que consumen datos del backend: salud mental, orientación profesional y perfil de usuario. Cada service encapsula las llamadas a la API. Cada store maneja el estado de carga, datos y errores. Al terminar, los stores están listos para que las páginas (INT-06, 07, 08) los consuman.

**Rama:** `incidencia/int-05-services-frontend`  
**Duración estimada:** 4-5 horas.  
**Depende de:** INT-03 completada (axios, tipos). Puede hacerse en paralelo con INT-04.  
**Asignada a:** 1 dev frontend.

### ¿Qué vas a aprender?

| Concepto | ¿Qué es? |
|----------|---------|
| Stores específicos por dominio | Un store para salud, otro para orientar — separación de responsabilidades |
| `Mood` enum en TypeScript | Mapeo de los 7 moods del frontend a los valores del backend |
| Estados de carga asíncronos en Zustand | `isLoading`, `error`, `data` — el patrón para toda llamada API |
| Tipado estricto de respuestas | Usar los tipos de `types/api.ts` para que TypeScript valide las respuestas |

### Pre-lectura (15 min)

| Archivo | Pregunta que responde |
|---------|----------------------|
| `frontend/src/types/api.ts` | `SaludRequest`, `SaludResponse`, `OrientarResponse`, `User`, `Mood` |
| `frontend/src/config/axios.ts` | La instancia `api` ya tiene interceptors. Solo hacés `api.post(...)`. |
| `backend/app/schemas/salud.py` | `SaludRequest` YA NO TIENE `usuario_id` (INT-01). Solo `humor`, `nota_semanal`, `contexto`. |
| `backend/app/schemas/orientar.py` | `OrientarRequest` YA NO TIENE `usuario_id` (INT-02). |
| `backend/app/routers/salud.py` | `POST /salud` requiere auth. |
| `backend/app/routers/orientar.py` | `POST /orientar` requiere auth. |

### Antes de codear: flujo git

```bash
git checkout incidencia/int-03-infra-frontend
git pull origin incidencia/int-03-infra-frontend
git checkout -b incidencia/int-05-services-frontend
```

### Paso a paso

#### Archivo 1: `frontend/src/services/saludService.ts`

```typescript
import api from "../config/axios";
import type { SaludRequest, SaludResponse } from "../types/api";

export const saludService = {
  /** POST /salud — Envía el check-in emocional diario */
  async sendCheckin(data: SaludRequest): Promise<SaludResponse> {
    const { data: response } = await api.post<SaludResponse>("/salud", data);
    return response;
  },
};
```

#### Archivo 2: `frontend/src/services/orientarService.ts`

```typescript
import api from "../config/axios";
import type { OrientarResponse } from "../types/api";

export interface OrientarRequestParams {
  perfil: string;
  nivel: string;
  region: string;
  idioma: string;
  lat: number;
  lng: number;
}

export const orientarService = {
  /** POST /orientar — Analiza el perfil profesional */
  async getAnalysis(params: OrientarRequestParams): Promise<OrientarResponse> {
    const { data } = await api.post<OrientarResponse>("/orientar", params);
    return data;
  },
};
```

#### Archivo 3: `frontend/src/services/profileService.ts`

```typescript
import api from "../config/axios";
import type { User } from "../types/api";

export const profileService = {
  /** GET /auth/me — Ya existe en authService, pero lo reexportamos por conveniencia */
  async getProfile(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  /** PUT /users/{id} — Actualiza datos del perfil (pendiente de implementar en backend) */
  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const { data: response } = await api.put<User>(`/users/${userId}`, data);
    return response;
  },
};
```

#### Archivo 4: `frontend/src/store/useSaludStore.ts`

```typescript
import { create } from "zustand";
import type { SaludResponse, SaludRequest } from "../types/api";
import { saludService } from "../services/saludService";

interface SaludState {
  // Estado
  currentResponse: SaludResponse | null;
  isLoading: boolean;
  error: string | null;

  // Acciones
  sendCheckin: (data: SaludRequest) => Promise<void>;
  clearResponse: () => void;
}

export const useSaludStore = create<SaludState>((set) => ({
  currentResponse: null,
  isLoading: false,
  error: null,

  sendCheckin: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await saludService.sendCheckin(data);
      set({ currentResponse: response, isLoading: false });
    } catch (err: any) {
      const message =
        err.response?.data?.detail || "Error al procesar el check-in.";
      set({ isLoading: false, error: message });
    }
  },

  clearResponse: () => set({ currentResponse: null, error: null }),
}));
```

#### Archivo 5: `frontend/src/store/useOrientarStore.ts`

```typescript
import { create } from "zustand";
import type { OrientarResponse, VacancyResponse } from "../types/api";
import {
  orientarService,
  type OrientarRequestParams,
} from "../services/orientarService";

interface OrientarState {
  // Estado
  data: OrientarResponse | null;
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchAnalysis: (params: OrientarRequestParams) => Promise<void>;
  clearData: () => void;
}

export const useOrientarStore = create<OrientarState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchAnalysis: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await orientarService.getAnalysis(params);
      set({ data, isLoading: false });
    } catch (err: any) {
      const message =
        err.response?.data?.detail || "Error al obtener el análisis.";
      set({ isLoading: false, error: message });
    }
  },

  clearData: () => set({ data: null, error: null }),
}));
```

### Verificación

```bash
cd frontend
npx tsc --noEmit
```

Como los stores no están conectados a ninguna página todavía, la verificación real se hace en INT-06, 07 y 08. Por ahora, confirmá que:

1. Los archivos compilan sin errores de tipo
2. Los imports de `types/api.ts` coinciden con los schemas del backend
3. `SaludRequest` NO incluye `usuario_id` (se eliminó en INT-01)
4. `OrientarRequestParams` NO incluye `usuario_id` (se eliminó en INT-02)

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `Property 'usuario_id' is missing in type` | Estás pasando `usuario_id` en el request, pero el schema ya no lo tiene | Eliminá `usuario_id` del objeto que pasás a `SaludRequest`. El backend lo obtiene del JWT. |
| `Type 'OrientarResponse' is not assignable` | Los tipos en `types/api.ts` no coinciden con el backend | Revisá `backend/app/schemas/orientar.py`. `gap_porcentual: float`, `vacantes_compatibles: List[VacancyResponse]`. |
| `Cannot find module '../services/saludService'` | El archivo no existe o la ruta es incorrecta | `frontend/src/services/saludService.ts` (no `.tsx`, no es un componente) |
| `'Mood' is declared but never used` | Importaste tipos que no usás directamente | Es un warning, no un error. Podés ignorarlo o eliminar el import. |

### Criterios de aceptación INT-05

- [ ] `saludService.sendCheckin()` llama a `POST /salud` con el body correcto (sin `usuario_id`)
- [ ] `orientarService.getAnalysis()` llama a `POST /orientar` con los parámetros correctos
- [ ] `profileService.getProfile()` llama a `GET /auth/me`
- [ ] `useSaludStore.sendCheckin()` maneja loading, success y error
- [ ] `useOrientarStore.fetchAnalysis()` maneja loading, success y error
- [ ] Todos los stores tienen tipado estricto (no `any` en los datos)
- [ ] `npx tsc --noEmit` compila sin errores
- [ ] Commit con: `feat(services): implementar servicios de salud, orientar y perfil`

---
