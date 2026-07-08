<div align="center">
  <img src="https://img.shields.io/badge/status-MVP%20en%20desarrollo-yellow?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/licencia-MIT-blue?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/version-1.0.0--alpha-brightgreen?style=for-the-badge" alt="Version">
</div>

<br>

<div align="center">
  <h1>App BiT</h1>
  <p><strong>Orientación Personal 360°</strong></p>
  <p>Plataforma web con IA para acompañar a grupos subrepresentados en su desarrollo profesional y personal.</p>
</div>

---

## Tabla de Contenidos

- [Descripción](#descripcion)
- [Problema](#problema)
- [Servicios MVP](#servicios-mvp)
- [Flujos de la Aplicación](#flujos-de-la-aplicacion)
- [Arquitectura](#arquitectura)
- [Stack Tecnológico](#stack-tecnologico)
- [Estrategia Git](#estrategia-git)
- [API](#api)
- [Equipo](#equipo)
- [Instalación](#instalacion)
- [Documentación](#documentacion)

---

## Descripción

App BiT integra **formación, empleabilidad, mentorías, experiencias y salud mental** en una única experiencia digital impulsada por inteligencia artificial. Un ecosistema 360° con empatía, acompañamiento y relevancia cultural.

---

## Problema

Personas de grupos subrepresentados enfrentan barreras simultáneas de empleo, formación y salud mental **sin un soporte integrado, humanizado y culturalmente relevante**.

Estas barreras generan ciclos de exclusión que dificultan el acceso a oportunidades dentro del mercado tecnológico. App BiT busca romper ese ciclo.

---

## Servicios MVP

### 1. Formaciones
Cursos gratuitos (Programa GEAR de Google Cloud, Programa ONE de Oracle & Alura) y trayectorias personalizadas según el gap del perfil del usuario.

### 2. Empleabilidad
Match automático entre perfil y vacantes. Muestra el gap de forma clara: *"Cumples el 70% — ve qué falta y cómo resolverlo"*.

### 3. Experiencias Estructurantes
Eventos en vivo y grabados con testimonios de CEOs, líderes y profesionales que superaron las mismas barreras.

### 4. Mentorías
Networking humanizado — mentores que invitan a una práctica, no solo a una entrevista formal.

### 5. Salud Mental
Check-in diario vía emojis. El agente de IA detecta el estado emocional y sugiere acciones concretas. En crisis, deriva automáticamente al CVV.

---

![Flujo Usuario](Docs/Flujo%20User.png)

---

## Arquitectura

```
Usuario
   |
   v
Frontend
   |
   v
Backend API
   |
   ├── Gestión de Usuarios
   ├── Orientación Profesional
   ├── Salud Mental
   ├── Vacantes
   ├── Mentorías
   ├── Eventos
   └── IA Externa
           |
           v
        Proveedor IA
```

### Módulos MVP

| Módulo | Estado |
|--------|--------|
| Autenticación | Pendiente |
| Perfil de Usuario | Pendiente |
| Orientación Profesional | Pendiente |
| Salud Mental | Pendiente |

---

## Stack Tecnológico

| Capa | Tecnología | Icono |
|------|-----------|-------|
| **Frontend** | React.js + Vite + TypeScript | ![react](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![typescript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) |
| **Estilos** | TailwindCSS | ![tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) |
| **Backend** | Python + FastAPI | ![python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) ![fastapi](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white) |
| **Base de Datos** | Supabase (PostgreSQL) | ![supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white) ![postgresql](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) |
| **IA** | OpenAI / Azure OpenAI | ![openai](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white) |
| **Auth** | JWT + Supabase Auth | ![jwt](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) |
| **Deploy** | Frontend: Vercel · Backend: Render | ![vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) ![render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white) |
| **Control de Versiones** | Git + GitHub | ![git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) ![github](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white) |
| **Comunicación** | Discord | ![discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white) |

---## Estrategia Git

### Ramas principales

**main**
* Rama estable de produccion.

**develop**
* Rama de integracion. Las funcionalidades completadas se fusionan aqui antes de pasar a main.

### Flujo de trabajo

Las ramas de incidencia se crean desde develop para cada issue del GitHub Project.

`
incidencia/[id]-[descripcion-corta]
`

**Ejemplos:**
`
incidencia/01-onboarding
incidencia/02-orientar-endpoint
incidencia/03-salud-checkin
`

### Proceso

1. Crear rama desde develop.
2. Implementar la funcionalidad o correccion.
3. Abrir Pull Request hacia develop.
4. Code Review por al menos un integrante.
5. Merge a develop.
6. Al completar un hito, hacer merge de develop hacia main.
7. Eliminar la rama de incidencia.

## API

### POST /orientar

Endpoint de orientación profesional. Analiza el perfil y recomienda trayectorias.

```json
// Request
{
  "usuario_id": 1,
  "perfil": "Frontend Developer",
  "nivel": "Junior",
  "region": "LATAM"
}

// Response
{
  "gap_porcentual": 30,
  "trayectoria_sugerida": [],
  "vacantes_compatibles": []
}
```

### POST /salud

Endpoint de salud mental. Procesa el check-in emocional y sugiere acciones.

```json
// Request
{
  "usuario_id": 1,
  "humor": "ansioso",
  "nota_semanal": 5
}

// Response
{
  "mensaje": "Sugerencia personalizada",
  "accion_sugerida": "Realizar una caminata"
}
```

> **Nota:** `nota_semanal < 4` activa `derivar_cvv: true` (situación de crisis)

---

## Equipo

| Foto | Rol | Nombre | Contacto |
|------|-----|--------|----------|
| <img src="https://media.licdn.com/dms/image/v2/D4D35AQEFky5c9mjq0w/profile-framedphoto-shrink_400_400/profile-framedphoto-shrink_400_400/0/1735406313026?e=1783706400&v=beta&t=bNl9huw64hz-hIy12msztVRsYxK8czdScuZUqzC5WeI" width="48" height="48" style="border-radius:50%"> | **Project Manager** | Orlando Cardenas Villegas | [LinkedIn](https://www.linkedin.com/in/orlandocardenasvillegas/) |
|  | **Backend Developer** | Dante Escalona Bustos | [LinkedIn](https://www.linkedin.com/in/DanteJac) |
| <img src="https://media.licdn.com/dms/image/v2/D4D03AQFdepvrOc09Hg/profile-displayphoto-crop_800_800/B4DZwuXZOSIgAI-/0/1770304411180?e=1785369600&v=beta&t=uziEQJxmtKa7k3fVYdO7KjdVJvf-mlkbkBnMl0hZn0c" width="48" height="48" style="border-radius:50%"> | **Backend Developer** | Matias Solanes | [LinkedIn](https://www.linkedin.com/in/matias-solanes/) |
| <img src="https://media.licdn.com/dms/image/v2/D4E03AQHg8cIJyTxViA/profile-displayphoto-scale_400_400/B4EZnj_L_tGcAg-/0/1760466641041?e=1784764800&v=beta&t=7TzFE200yVZ1hYjTqlWOpSY12kFviqGmA_k2uwv3Ilc" width="48" height="48" style="border-radius:50%"> | **Full Stack Developer** | Luis Feliz | [LinkedIn](https://www.linkedin.com/in/luis-antonio-feliz/) |
| <img src="https://media.licdn.com/dms/image/v2/D4D03AQFY7xcJSkWVLQ/profile-displayphoto-crop_800_800/B4DZ2x66yMI4AI-/0/1776806511380?e=1785369600&v=beta&t=wmUohpgZLrN85SRTztMTcrYHzV7zhoZZhiTEHo8ZOGY" width="48" height="48" style="border-radius:50%"> | **Full Stack Developer** | Hugo Ariel Seijo | [LinkedIn](https://www.linkedin.com/in/arielseijo/) |
| <img src="https://media.licdn.com/dms/image/v2/D4D03AQG-tP22zcud6w/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1698798694955?e=1785369600&v=beta&t=KnYZ7h1Hvjo7_sm_dcLEtFlN7CTDRmiBZQeTKGSwfhY" width="48" height="48" style="border-radius:50%"> | **Frontend Developer** | Elias Marolla | [LinkedIn](https://www.linkedin.com/in/elias-marolla/) |
| <img src="https://media.licdn.com/dms/image/v2/C4D03AQGKUU3tLER_rA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1655925781874?e=1785369600&v=beta&t=QUqb-aw1bdnvctvws3EHczCaRGSHMKOsEU4IK7g2V2w" width="48" height="48" style="border-radius:50%"> | **Backend Developer** | Gabriel Braga | [LinkedIn](https://www.linkedin.com/in/gabriel-braga-24b546232/) |

---

## Instalació

### Prerrequisitos

- **Python 3.12 o 3.13** (no usar Python 3.14 — `pydantic-core` compila con PyO3, que aún no soporta 3.14)
- **Node.js 18+**
- **npm**
- **PostgreSQL** (recomendado: [Supabase](https://supabase.com) — gratis)
- **Git**

---

### 1. Clonar el repositorio

```bash
git clone https://github.com/No-Country-simulation/S06-26-NC-Equipo-83
cd S06-26-NC-Equipo-83
```

---

### 2. Backend (Python + FastAPI)

#### 2.1. Crear el entorno virtual

# Windows (PowerShell):
```powershell
cd backend
py -3.12 -m venv venv
venv\Scripts\activate
```

# macOS / Linux:
```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate
```

> **Tip:** Ejecutá `py --list` para ver qué versiones de Python tenés instaladas. Usá `py -3.12 -m venv venv` en Windows o `python3.12 -m venv venv` en Linux/macOS (reemplazá `3.12` por tu versión disponible).

#### 2.2. Instalar dependencias

Con el venv activado:

```bash
pip install -r requirements.txt
```

> Si falla `pydantic-core` por la versión de Python, probá:
> ```powershell
> # Windows PowerShell:
> $env:PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1
> pip install -r requirements.txt
> ```

#### 2.3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus datos:

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-------------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | [Supabase](https://supabase.com) → Settings → Database → Connection string (Pooler) |
| `SECRET_KEY` | Clave para firmar JWT (mín. 32 caracteres) | Generá con: `openssl rand -hex 32` |
| `GROQ_API_KEY` | API key para el agente de IA (bienestar) | [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | Modelo de Groq a usar | `llama-3.1-8b-instant` (default) |

#### 2.4. Crear las tablas en Supabase

# Opción A — Desde la terminal (recomendado):

```bash
python -c "from app.db.session import create_db_and_tables; create_db_and_tables()"
```

# Opción B — Desde el SQL Editor de Supabase:

Abrí [Supabase](https://supabase.com) → SQL Editor y pegá este SQL:

```sql
-- ============================================================
-- Tabla: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR NOT NULL UNIQUE,
    hashed_password VARCHAR NOT NULL,
    full_name       VARCHAR NOT NULL,
    birth_date      DATE    NOT NULL,
    gender          VARCHAR NOT NULL,
    education_level VARCHAR NOT NULL,

    -- Datos geográficos (código ISO + nombre)
    continent_code  VARCHAR(2) NOT NULL,
    continent_name  VARCHAR    NOT NULL,
    country_code    VARCHAR(2) NOT NULL,
    country_name    VARCHAR    NOT NULL,
    state_code      VARCHAR    NOT NULL,
    state_name      VARCHAR    NOT NULL,
    city_name       VARCHAR    NOT NULL,

    whatsapp_e164   VARCHAR    NOT NULL,
    language_code   VARCHAR(2) NOT NULL DEFAULT 'es',

    -- Datos profesionales
    current_situation VARCHAR NOT NULL,
    work_sector       VARCHAR,
    seniority         VARCHAR,
    interest_areas    JSON     NOT NULL DEFAULT '[]',
    current_search    VARCHAR,
    known_technologies JSON   NOT NULL DEFAULT '[]',
    bio               VARCHAR(500),

    -- Legacy (nullable)
    professional_level VARCHAR,
    tech_area          VARCHAR,
    career_objective   VARCHAR,

    -- Auditoría
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_users_email        ON users (email);
CREATE INDEX IF NOT EXISTS ix_users_country_code ON users (country_code);
CREATE INDEX IF NOT EXISTS ix_users_city_name    ON users (city_name);

-- ============================================================
-- Tabla: mental_health_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS mental_health_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood            VARCHAR     NOT NULL,
    weekly_score    INTEGER     NOT NULL CHECK (weekly_score >= 1 AND weekly_score <= 10),
    context         TEXT,
    response_message TEXT       NOT NULL,
    suggested_action TEXT       NOT NULL,
    derivate_cvv    BOOLEAN     NOT NULL DEFAULT FALSE,
    alert_triggered BOOLEAN    NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_mental_health_logs_user_id ON mental_health_logs (user_id);

-- ============================================================
-- Tabla: events (eventos comunitarios)
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR NOT NULL,
    description     TEXT,
    tipo            VARCHAR NOT NULL DEFAULT 'online',
    categoria       VARCHAR NOT NULL DEFAULT 'crecimiento',
    event_date      TIMESTAMPTZ,
    created_by      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jitsi_room      VARCHAR NOT NULL,
    is_live         BOOLEAN NOT NULL DEFAULT FALSE,
    cluster         VARCHAR,
    location        VARCHAR,
    max_participants INTEGER DEFAULT 100,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_events_created_by ON events (created_by);
CREATE INDEX IF NOT EXISTS ix_events_cluster    ON events (cluster);
```

> **Nota:** El dataset Vísent CDRView se carga automáticamente desde `backend/data/`. Copiá los CSVs de `EXPERIENCIAS_ESTRUCTURANTES/` a `backend/data/` manualmente (están en `.gitignore`).

#### 2.5. Iniciar el servidor

Con el venv activado:

```bash
uvicorn app.main:app --reload
```

El backend corre en: **http://localhost:8000**

Documentación interactiva (Swagger): **http://localhost:8000/docs**

---

### 3. Frontend (React + Vite)

Abrí **otra terminal** y ejecutá:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

El frontend corre en: **http://localhost:5173**

> El frontend usa un proxy de Vite: `/api` se redirige automáticamente a `http://localhost:8000`.

---

### 4. Verificar que funciona

```bash
# Health check del backend (desde otra terminal)
curl http://localhost:8000/health
```

Respuesta esperada:
```json
{"status": "ok", "service": "App BiT — Backend API", "version": "0.1.0"}
```

Luego abrir **http://localhost:5173** en el navegador y registrarse.

---

### 5. Solución de problemas comunes

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| `ModuleNotFoundError: No module named pydantic` | El venv no está activado | Windows: `venv\Scripts\activate` — Linux: `source venv/bin/activate` |
| Error al instalar pydantic-core | Python 3.14 no compatible. PyO3 usa bindings nativos de Rust y solo soporta hasta Python 3.13 | Usar `py -3.12 -m venv venv` (o la versión que tengas disponible < 3.14). Alternativa rápida: `$env:PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1` y reintentar `pip install` |
| `psycopg2` no encuentra PostgreSQL | Falta el driver nativo de PostgreSQL | Instalar [PostgreSQL](https://www.postgresql.org/download/) o usar Supabase Pooler (recomendado en .env.example) |
| El frontend no carga datos del backend | El backend no está corriendo | Iniciar `uvicorn app.main:app --reload` en el directorio `backend/` con el venv activado |
| Error 401 al hacer login | No hay token o expiró | Registrarse primero o volver a iniciar sesión |
| Error `relation "users" does not exist` | No se crearon las tablas en Supabase | Ejecutar `python -c "from app.db.session import create_db_and_tables; create_db_and_tables()"` o pegar el SQL en Supabase SQL Editor |


## Documentación

La documentación técnica se encuentra en la carpeta [`/docs`](Docs/):

| Archivo | Descripción |
|---------|-------------|
| [Descripción General](Docs/Descripción%20General.md) | Visión completa del proyecto |
| [Arquitectura](Docs/Arquitctura%20General.md) | Arquitectura de alto nivel |
| [API](Docs/API/Leeme.md) | Documentación de endpoints |
| [Tecnologías](Docs/Tecnologias.md) | Stack tecnológico |
| [Conventional Commits](Docs/Conventional%20Commits.md) | Guía de commits |

---

## Deploy

### Frontend — Vercel

1. Conectá el repo a [Vercel](https://vercel.com)
2. **Root Directory:** `frontend/`
3. **Build Command:** `tsc && vite build` (auto-detected)
4. **Output:** `dist`
5. En **Environment Variables** agregá:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://<tu-backend>.onrender.com/api` |

El archivo `frontend/vercel.json` ya maneja las rewrites SPA.

### Backend — Render

1. Conectá el repo a [Render](https://render.com)
2. Creá un **Web Service** apuntando al repo
3. **Root Directory:** `backend/`
4. **Runtime:** `Python`
5. **Build Command:** `pip install -r requirements.txt`
6. **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. En **Environment Variables** agregá:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Supabase Session Pooler |
| `SECRET_KEY` | mínimo 32 caracteres |
| `CORS_ORIGINS` | `https://<tu-frontend>.vercel.app` |

> También podés usar el archivo `render.yaml` en la raíz del repo si habilitás **Render Blueprint**.

> **Nota sobre CSVs:** El dataset Vísent CDRView (`backend/data/*`) está en `.gitignore`. En producción los CSVs no estarán disponibles y el backend responderá sin datos de cobertura/destinos, mostrando solo los eventos comunitarios. Si querés incluirlos, eliminá `backend/data/*` del `.gitignore` y commitear los CSVs.

---

<div align="center">
  <p><strong>App BiT</strong> — Hackathon / No Country</p>
  <p>Proyecto desarrollado con fines educativos y de innovación tecnológica.</p>
</div>