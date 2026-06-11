# App BiT — Backend API

API REST del ecosistema App BiT. Procesa orientación profesional, check-ins de salud mental, autenticación y gestión de perfiles de usuario, con integración de inteligencia artificial.

---

## Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Lenguaje | Python | 3.12 |
| Framework | FastAPI | 0.115.6 |
| ORM | SQLModel | 0.0.22 |
| Base de datos | PostgreSQL | 15+ |
| Validación | Pydantic | 2.10.4 |
| Auth | python-jose (JWT) + passlib (bcrypt) | 3.3.0 / 1.7.4 |
| Servidor | Uvicorn | 0.34.0 |
| HTTP Client | httpx | 0.28.1 |

---

## Requisitos previos

- **Python 3.12** o superior
- **PostgreSQL 15** o superior instalado y corriendo
- **Git**

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd app-bit/backend

# 2. Crear entorno virtual
python -m venv .venv

# 3. Activar entorno virtual
# Windows:
.venv\Scripts\activate
# Linux / macOS:
source .venv/bin/activate

# 4. Instalar dependencias
pip install -r requirements.txt
```

> **Nota sobre gestor de paquetes:** el proyecto usa `requirements.txt`. La migración a `pyproject.toml` (Poetry, uv) queda fuera del alcance del MVP. Para reproducibilidad exacta, las dependencias están pineadas con versión fija.

---

## Configuración de base de datos

### Opción A: PostgreSQL local

```sql
-- Conectarse como superusuario
psql -U postgres

-- Crear usuario y base de datos con las credenciales del proyecto
CREATE USER appbit_user WITH PASSWORD 'appbit_password';
CREATE DATABASE appbit_database OWNER appbit_user;
\q
```

Verificar:

```bash
psql -U appbit_user -d appbit_database -c "SELECT 1;"
# Debe devolver 1
```

### Opción B: Docker Compose

Alternativa para quien prefiera no instalar PostgreSQL localmente.

```bash
# Desde backend/, levanta PostgreSQL 15 en un contenedor
docker compose up -d
```

Esto levanta PostgreSQL 15 Alpine con las mismas credenciales:
- Usuario: `appbit_user`
- Contraseña: `appbit_password`
- Base de datos: `appbit_database` (creada automáticamente)
- Puerto: `5432`

Para detenerlo: `docker compose down`
Para resetear los datos: `docker compose down -v && docker compose up -d`

---

## Variables de entorno

> **[ACTUAL]** El proyecto no lee variables de entorno todavía. No existe archivo `.env`.

> **[RECOMENDACIÓN]** Crear `.env.example` con las siguientes variables antes de implementar conexión a base de datos:

```env
DATABASE_URL=postgresql://appbit_user:appbit_password@localhost:5432/appbit_database
SECRET_KEY=changeme-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## Ejecución local

```bash
# Desde la carpeta backend/, con el entorno virtual activado:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

| Flag | Propósito |
|------|-----------|
| `--reload` | Recarga automática al guardar cambios (solo desarrollo) |
| `--host 0.0.0.0` | Acepta conexiones de cualquier interfaz |
| `--port 8000` | Puerto de escucha |

---

## Swagger / OpenAPI

FastAPI genera documentación interactiva automáticamente:

| Ruta | Descripción |
|------|-------------|
| `http://localhost:8000/docs` | Swagger UI — probar endpoints desde el navegador |
| `http://localhost:8000/redoc` | ReDoc — documentación OpenAPI en formato alternativo |
| `http://localhost:8000/openapi.json` | Esquema OpenAPI en JSON |

---

## Endpoints

### Actuales

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| `GET` | `/health` | Health check — devuelve `{"status":"ok"}` | Implementado |

### Planificados (según schemas existentes)

| Método | Ruta | Schema request | Schema response |
|--------|------|---------------|-----------------|
| `POST` | `/auth/register` | `UserCreate` | `UserResponse` |
| `POST` | `/auth/login` | `UserLogin` | `TokenResponse` |
| `POST` | `/orientar` | `OrientarRequest` | `OrientarResponse` |
| `POST` | `/salud` | `SaludRequest` | `SaludResponse` |

---

## Estructura del proyecto

### Estructura actual

```
backend/
├── requirements.txt
├── docker-compose.yml       ← PostgreSQL 15 para desarrollo
├── .venv/                  (gitignored)
├── app/
│   ├── main.py             ← Entry point FastAPI
│   ├── enums/
│   │   ├── __init__.py
│   │   ├── career_objective.py
│   │   ├── mood.py
│   │   └── professional_level.py
│   ├── models/
│   │   ├── user.py
│   │   └── mental_health.py
│   └── schemas/
│       ├── __init__.py
│       ├── user.py
│       ├── orientar.py
│       └── salud.py
└── tests/
    ├── __init__.py
    ├── conftest.py          ← Fixture de engine + session SQLite
    ├── test_db.py
    ├── test_enums.py
    ├── test_models.py
    ├── test_relations.py
    └── test_user_created.py
```

### Estructura objetivo

```
backend/
├── requirements.txt
├── .env.example            ← [PENDIENTE] Variables de entorno de ejemplo
├── docker-compose.yml      ← PostgreSQL local
├── app/
│   ├── main.py
│   ├── core/               ← [PENDIENTE] Configuración, seguridad, dependencias
│   │   ├── config.py
│   │   └── security.py
│   ├── db/                 ← [PENDIENTE] Engine y sesión de SQLModel
│   │   └── session.py
│   ├── enums/
│   ├── models/
│   ├── schemas/
│   ├── routers/            ← [PENDIENTE] Endpoints REST por dominio
│   ├── services/           ← [PENDIENTE] Lógica de negocio pura
│   └── repositories/       ← [PENDIENTE] Acceso a datos (queries)
└── tests/
    ├── conftest.py          ← Fixtures reutilizables
    └── ...
```

> El documento completo de estructura objetivo está en [`docs/backend-target-structure.md`](../docs/backend-target-structure.md).

---

## Dependencias

| Paquete | Propósito |
|---------|-----------|
| `fastapi` | Framework web asincrónico |
| `uvicorn[standard]` | Servidor ASGI |
| `sqlmodel` | ORM (SQLAlchemy + Pydantic) |
| `psycopg2-binary` | Driver PostgreSQL |
| `pydantic` | Validación de datos |
| `pydantic-settings` | Configuración desde variables de entorno |
| `email-validator` | Validación de emails |
| `python-jose[cryptography]` | JWT (creación y verificación de tokens) |
| `passlib[bcrypt]` | Hashing de contraseñas |
| `python-multipart` | Soporte para form data (necesario para OAuth2) |
| `httpx` | Cliente HTTP asincrónico para llamadas a IA externa |
| `pytest` | Framework de testing |

---

## Tests

```bash
# Desde backend/, con el entorno virtual activado:
python -m pytest tests/ -v
```

Actualmente **30 tests** con assertions reales que validan:

| Archivo | Qué valida |
|---------|------------|
| `test_db.py` | Tablas y columnas existen en metadata, FK definida |
| `test_enums.py` | Valores, membresía e instancias de los 3 enums |
| `test_models.py` | Tablenames, atributos, back_populates, instanciación |
| `test_relations.py` | CRUD, relación 1→N, FK constraint, flags de CVV |
| `test_user_created.py` | Schemas UserCreate, UserLogin, TokenResponse, coerción de strings a enums |

Los tests usan SQLite en memoria con fixtures compartidos desde `conftest.py`. No requieren PostgreSQL.

---

## Convenciones de desarrollo

- **Idioma del código**: inglés (variables, funciones, clases, comentarios)
- **Idioma de documentación**: español
- **Naming**: `snake_case` para archivos, funciones y variables. `PascalCase` para clases y modelos.
- **Schemas**: extienden `SQLModel` (no `BaseModel` de Pydantic) para mantener consistencia con el ORM.
- **Tipado**: todo el código debe tener type hints.
- **Docstrings**: formato Google-style. Obligatorios en funciones públicas y endpoints.

Guía completa en [`docs/backend-contributing.md`](../docs/backend-contributing.md).

---

## Flujo Git

Definido en el [`README.md` raíz](../README.md):

- **Rama principal**: `main`
- **Ramas de feature**: `incidencia/XX-descripcion-corta`
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/)
- **Workflow**: feature branch → PR → code review → merge a `main` → eliminar rama

---

## Troubleshooting

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| `ModuleNotFoundError: No module named 'app'` | No estás en la carpeta `backend/` o el entorno virtual no está activado | `cd backend` y activar `.venv` |
| `uvicorn` no encontrado | Entorno virtual no activado o dependencias no instaladas | Activar `.venv` y ejecutar `pip install -r requirements.txt` |
| Puerto 8000 ocupado | Otro proceso usa el puerto | Usar `--port 8001` o matar el proceso |
| Error de conexión a PostgreSQL | PostgreSQL no está corriendo | Verificar con `pg_isready` o iniciar el servicio |
