# App BiT - Frontend 🚀

Este es el repositorio oficial del frontend para **App BiT**, una aplicación enfocada en el crecimiento profesional y el bienestar humano. El proyecto está estructurado de forma modular y escalable utilizando un ecosistema tipado y componentes reutilizables.

---

## 🛠️ Stack Tecnológico

*   **Framework:** React (Vite)
*   **Lenguaje:** TypeScript (`.tsx` / `.ts`)
*   **Estilos:** Tailwind CSS
*   **Gestión de Estado Global:** Zustand (para autenticación y flujos complejos)
*   **Iconografía:** Lucide React

---

## 📁 Estructura del Proyecto

Para mantener el código limpio y desacoplado, nos regimos estrictamente por la siguiente estructura de carpetas dentro de `/src`:

*   `components/` -> Componentes globales, atómicos y reutilizables (Botones, Inputs, Modales generales).
*   `modules/` -> Secciones de la app divididas por dominio de negocio. Cada módulo contiene sus propias vistas.
    *   `modules/auth/` -> Módulo exclusivo de autenticación. Contiene `login.tsx`, `register.tsx` y la subcarpeta `registerSteps/` (para los pasos 1, 2 y 3 del formulario).
*   `store/` -> Stores globales de Zustand (ej. `useAuthStore.tsx` y `useAiStore.tsx`).
*   `services/` -> Lógica de comunicación externa y peticiones HTTP (ej. `authService.tsx` y `aiService.tsx`). *Nota: En esta fase del MVP, los servicios consumen la lógica simulada de los mocks.*
*   `mocks/` -> Contratos de datos y API simulada provistos por el equipo para el desarrollo offline.
*   `types/` -> Centralización de interfaces de TypeScript (ej. `authTypes.ts` y `api.ts`) para asegurar un tipado fuerte sin usar `any`.
*   `config/` -> Archivos de configuración global de la aplicación.

---

## 📋 Flujo de Trabajo e Incidencias

El progreso del desarrollo se gestiona de forma centralizada en el **Issue #19** de GitHub. Todas las tareas de la interfaz se basan en los prototipos validados en **Google Stitch** y siguen el roadmap oficial:

1.  `frontend-01` Onboarding, registro y perfil.
2.  `frontend-02` Home dashboard.
3.  `frontend-03` Checkin emocional emojis.

---

## 💻 Configuración Local

Si acabas de clonar el proyecto o te has traído los últimos cambios de tus compañeros, sigue estos pasos para levantar el entorno:

1.  **Instalar dependencias necesarias** (Esto instalará `zustand`, `lucide-react` y demás librerías del `package.json`):
```bash
    npm install
    ```

2.  **Correr el servidor de desarrollo:**
```bash
    npm run dev
    ```

---
💡 *Nota para el equipo: Mantengamos el tipado estricto en cada componente creado y evitemos subir la carpeta `node_modules` al repositorio.*