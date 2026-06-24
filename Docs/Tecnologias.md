# Tecnologías — App BiT

> Archivo vivo para registrar las decisiones tecnológicas del equipo.
> Completar a medida que se definan durante el proyecto.

---

## Frontend

| Decisión   | Opciones                                   | Elegido              |
| ---------- | ------------------------------------------ | -------------------- |
| Framework  | React + Vite / Next.js / Angular / Svelte | React + Vite         |
| Lenguaje   | JavaScript / TypeScript                    | TypeScript           |
| Estilos    | CSS / Tailwind / Bootstrap / Sass          | TailwindCSS          |
| Estado     | Redux / Zustand / Context API / Pinia      | Context API          |
| PWA        | Workbox / vite-plugin-pwa / next-pwa       | _(por definir)_      |
| UI Library | Material UI / Chakra / Ant Design / Shadcn | Ninguna (TailwindCSS) |

**Notas:**
- React + Vite se eligió por su rapidez de desarrollo, tipado estático con TypeScript, y TailwindCSS para estilos utilitarios sin fricción.
- No se usará librería de componentes UI para mantener el bundle ligero y control total del diseño.
- El manejo de estado con Context API cubre las necesidades actuales; si escala se evaluará Zustand.

---

## Backend

| Decisión  | Opciones                  | Elegido    |
| --------- | ------------------------- | ---------- |
| Lenguaje  | Python                    | Python     |
| Framework | FastAPI / Flask / Django  | FastAPI    |
| API Style | REST                      | REST       |
| Auth      | JWT / OAuth / Supabase Auth | JWT + Supabase Auth |

**Notas:**
- FastAPI elegido sobre Flask/Django por: tipado con Pydantic, documentación automática (Swagger/OpenAPI), y async nativo.
- Autenticación con JWT manejado manualmente + integración con Supabase Auth para roles y sesiones.

---

## Base de Datos

| Decisión    | Opciones                                   | Elegido    |
| ----------- | ------------------------------------------ | ---------- |
| Motor       | PostgreSQL / MySQL / SQLite                | PostgreSQL |
| ORM         | Prisma / SQLAlchemy / Mongoose             | SQLAlchemy |
| Hosting     | Supabase / Neon / Railway Postgres         | Supabase   |

**Notas:**
- PostgreSQL vía Supabase: base de datos administrada + APIs en tiempo real + autenticación integrada.
- SQLAlchemy como ORM con Alembic para migraciones.

---

## IA

| Decisión  | Opciones                           | Elegido       |
| --------- | ---------------------------------- | ------------- |
| Proveedor | OpenAI / Google AI / Groq         | OpenAI + Groq |
| SDK       | openai / langchain / llama-index  | openai SDK    |
| Modelo    | GPT-4o / GPT-3.5 / Claude / Gemini | GPT-4o        |

**Notas:**
- Integración directa con el SDK de OpenAI (sin n8n ni LangChain por ahora) para mantener el control y simplicidad.
- Groq se agregó como alternativa de menor latencia para tareas específicas.
- Si el proyecto escala en complejidad de prompts, se evaluará LangChain.

---

## Deploy

| Decisión      | Opciones                               | Elegido              |
| ------------- | -------------------------------------- | -------------------- |
| Plataforma    | Railway / Render / Vercel / Netlify    | Railway o Render     |
| Frontend      | Vercel / Netlify / Railway             | Railway              |
| Backend       | Railway / Render / Fly.io              | Railway              |
| Base de Datos | Supabase (ya incluido)                 | Supabase             |
| CI/CD         | GitHub Actions / Railway Auto Deploy   | Railway Auto Deploy  |

**Notas:**
- Railway elegido por su simplicidad: despliegue desde GitHub, HTTPS automático, y base de datos PostgreSQL integrada.
- Alternativa: Render si se requiere mayor control de recursos gratis. Decisión final al momento del deploy.

---

## Herramientas del Equipo

| Herramienta   | Opciones                                   | Elegido                |
| ------------- | ------------------------------------------ | ---------------------- |
| Editor        | VS Code / PyCharm / WebStorm               | VS Code                |
| Testing       | Vitest / Pytest                            | Vitest (FE) + Pytest (BE) |
| HTTP Client   | REST Client (VS Code) / Postman / Insomnia | REST Client (VS Code)  |
| Documentación | Obsidian / Notion / Markdown               | Obsidian               |
| Comunicación  | Discord / Slack / WhatsApp                 | Discord                |
| Control de Versiones | Git + GitHub                       | GitHub                 |

**Notas:**
- VS Code como editor unificado con extensiones compartidas (REST Client, ESLint, Prettier, Python).
- Testing: Vitest para frontend (integración con Vite) y Pytest para backend.
- Toda la documentación técnica se mantiene en Docs/ con Obsidian para edición local.

---

## Historial de Decisiones

| Fecha       | Decisión                    | Motivo                                                |
| ----------- | --------------------------- | ----------------------------------------------------- |
| 2026-06-24  | React + Vite + TypeScript   | Rapidez de desarrollo, tipado estático, ecosistema    |
| 2026-06-24  | FastAPI                     | Tipado Pydantic, Swagger automático, async nativo     |
| 2026-06-24  | Supabase (PostgreSQL + Auth) | Base de datos administrada + auth integrado           |
| 2026-06-24  | OpenAI SDK directo          | Simple, control total, sin overhead de orquestadores  |
| 2026-06-24  | TailwindCSS                 | Estilos utilitarios, sin fricción, bundle ligero      |
| 2026-06-24  | Railway                     | Deploy simple desde GitHub, HTTPS automático          |
