# Arquitectura Backend — App BiT

Este documento describe la arquitectura del backend de App BiT, diferenciando claramente entre el **estado actual**, la **arquitectura objetivo** y las **recomendaciones** de transición.

---

## Estado actual

### Diagrama de archivos

```
backend/
├── requirements.txt          ← Dependencias pineadas
├── app/
│   ├── main.py               ← Entry point FastAPI (único archivo con lógica de app)
│   ├── enums/
│   │   ├── init.py           ← Re-exporta CareerObjective, ProfessionalLevel, Mood
│   │   ├── career_objective.py
│   │   ├── mood.py
│   │   └── professional_level.py
│   ├── models/
│   │   ├── user.py           ← Tabla SQLModel "users"
│   │   └── mental_health.py  ← Tabla SQLModel "mental_health_logs"
│   └── schemas/
│       ├── init.py           ← Re-exporta todos los schemas
│       ├── user.py           ← UserCreate, UserResponse, UserLogin, TokenResponse
│       └── orientar.py       ← OrientarRequest, OrientarResponse, VacancyResponse
└── tests/
    ├── test_db.py            ← Crea tablas en SQLite en memoria
    ├── test_enums.py         ← Instancia enums
    ├── test_models.py        ← Valida imports de modelos
    ├── test_relations.py     ← Crea User + MentalHealthLog en SQLite
    └── test_user_created.py  ← Instancia UserCreate
```

### Responsabilidad real de cada carpeta

| Carpeta | Contiene | NO contiene |
|---------|----------|------------|
| `app/main.py` | Instancia de FastAPI, CORS middleware, endpoint `GET /health` | Routers, configuración de DB, lifespan |
| `app/models/` | Clases SQLModel con `table=True`. Definen estructura de tablas. | Lógica de negocio, queries |
| `app/schemas/` | Clases SQLModel sin `table=True`. Definen contratos de API (request/response). | Validación de negocio, lógica |
| `app/enums/` | Enums `(str, Enum)` de dominio. | Strings sueltos, constantes |
| `tests/` | Scripts de validación de imports y estructura. | Tests con assertions, fixtures |

### Lo que NO existe hoy

Las siguientes carpetas y archivos **no existen** en el repositorio:

| Elemento | Descripción |
|----------|-------------|
| `app/core/` | Configuración, variables de entorno, security |
| `app/db/` | Engine de SQLModel, sesión de base de datos |
| `app/routers/` | Endpoints REST agrupados por dominio |
| `app/services/` | Lógica de negocio pura |
| `app/repositories/` | Acceso a datos (queries SQL/ORM) |
| `app/__init__.py` | Archivo de inicialización del paquete `app` |
| `.env` / `.env.example` | Variables de entorno |
| `alembic.ini` / `migrations/` | Migraciones de base de datos |
| `conftest.py` | Fixtures compartidos de pytest |

### Endpoints actuales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check del servicio |

**No hay routers montados.** Los schemas `UserCreate`, `UserLogin`, `OrientarRequest` y `SaludRequest` están definidos pero ningún endpoint los consume todavía.

---

## Arquitectura objetivo

### Diagrama de capas

```
┌─────────────────────────────────────────────────────────────┐
│                      HTTP Request                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  routers/            Capa de Presentación                    │
│  ─────────────────                                          │
│  - Recibe HTTP requests                                     │
│  - Valida schemas de entrada (Pydantic → automático)         │
│  - Llama a services                                         │
│  - Devuelve HTTP responses                                  │
│  - NUNCA contiene lógica de negocio                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  services/           Capa de Negocio                         │
│  ─────────────────                                          │
│  - TODA la lógica de negocio vive acá                       │
│  - Orquesta repositories y servicios externos               │
│  - No conoce HTTP (no recibe Request ni devuelve Response)  │
│  - No escribe queries SQL/ORM directamente                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  repositories/       Capa de Acceso a Datos                  │
│  ─────────────────                                          │
│  - Queries SQLModel / SQLAlchemy                            │
│  - Operaciones CRUD                                         │
│  - No contiene lógica de negocio                            │
│  - Solo un repository habla con la base de datos            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  models/             Capa de Dominio                         │
│  ─────────────────                                          │
│  - Definición de tablas (SQLModel, table=True)              │
│  - Tipos y enums del dominio                                │
│  - NO contiene lógica                                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                     PostgreSQL
```

### Propósito de cada capa

| Capa | Carpeta | Responsabilidad | Ejemplo |
|------|---------|----------------|---------|
| **Presentación** | `routers/` | HTTP: recibir, validar, responder | `POST /auth/register` → llama a `AuthService.register()` |
| **Negocio** | `services/` | Reglas de dominio, orquestación | `AuthService.register()` → hashea password, crea user, devuelve token |
| **Datos** | `repositories/` | Queries y persistencia | `UserRepository.create(user_data)` |
| **Dominio** | `models/` + `enums/` | Definición de entidades y tipos | `class User(SQLModel, table=True)` |
| **Schemas** | `schemas/` | Contrato de API (entrada/salida) | `class UserCreate(SQLModel)` |
| **Configuración** | `core/` + `db/` | Settings, seguridad, sesión DB | `Settings()`, `get_session()`, `create_access_token()` |

### Reglas de dependencia

Las dependencias van **hacia adentro**. Las capas externas conocen a las internas, nunca al revés.

```
routers → services → repositories → models
   │         │            │
   └─────────┴────────────┴──→ schemas (usados en routers y services)
   │
   └──→ core (config y security usado en routers y services)
```

**Prohibido:**
- Un `repository` importando un `service` o `router`
- Un `model` importando un `schema`
- Un `service` importando `fastapi.Request` o `fastapi.Response`
- Un `router` conteniendo lógica de negocio (más de 3 líneas)

---

## Diferencia conceptual: models vs schemas vs enums

| Concepto | Archivo | Extiende | `table` | Propósito |
|----------|---------|----------|---------|-----------|
| **Model** | `models/*.py` | `SQLModel` | `table=True` | Define una tabla de base de datos. Mapea directamente a PostgreSQL. |
| **Schema** | `schemas/*.py` | `SQLModel` | No tiene | Define la forma de los datos que entran/salen por la API. Es el contrato HTTP. |
| **Enum** | `enums/*.py` | `(str, Enum)` | N/A | Define valores permitidos para campos del dominio. Compartido entre models y schemas. |

### Ejemplo concreto

```python
# enums/mood.py — valores válidos del dominio
class Mood(str, Enum):
    HAPPY = "happy"
    ANXIOUS = "anxious"

# models/mental_health.py — cómo se guarda en la DB
class MentalHealthLog(SQLModel, table=True):
    id: UUID = Field(primary_key=True)
    mood: Mood                          # usa el enum

# schemas/salud.py — lo que recibe la API (no existe hoy)
class SaludRequest(SQLModel):
    mood: Mood                          # mismo enum
    weekly_score: int = Field(ge=1, le=10)
```

---

## Dónde agregar código nuevo

| Necesito... | Lo pongo en... | Porque... |
|-------------|---------------|-----------|
| Un endpoint nuevo | `routers/<dominio>.py` | Separación por dominio |
| Lógica de negocio | `services/<dominio>.py` | Toda lógica en services, desde el día 1 |
| Una query a la DB | `repositories/<dominio>.py` | Nunca queries en services |
| Una tabla nueva | `models/<dominio>.py` | Una tabla = un archivo |
| Un schema de API | `schemas/<dominio>.py` | Contrato de request/response |
| Un enum nuevo | `enums/<dominio>.py` | Valores del dominio |
| Configuración | `core/config.py` | Centralizado, desde variables de entorno |

---

## Issues conocidos

Estos problemas existen en el código actual y **deben resolverse antes de implementar endpoints reales**.

### 1. `schemas/init.py` debería ser `__init__.py`

**Archivo:** `backend/app/schemas/init.py`

El archivo de inicialización del paquete `schemas` se llama `init.py` en vez de `__init__.py`. Aunque Python 3.3+ permite namespace packages sin `__init__.py`, usar `init.py` (sin doble underscore) es un nombre no estándar. La importación actual funciona porque los schemas se importan desde `app/schemas/user` directamente, pero el módulo `app.schemas` como paquete no se comporta igual que los demás (`enums`, `models`).

**Impacto:** Bajo. Los imports directos funcionan.

**Solución recomendada:** Renombrar `init.py` a `__init__.py`.

### 2. `schemas/salud.py` no existe pero está importado

**Archivo:** `backend/app/schemas/init.py` (líneas 14-17)

```python
from .salud import (
    SaludRequest,
    SaludResponse,
)
```

El módulo `salud.py` **no existe** en `schemas/`. Esto provoca `ImportError` si algún código intenta hacer `from app.schemas import SaludRequest` o `from app.schemas.init import SaludRequest`.

**Impacto:** Alto. Rompe cualquier código que importe schemas a través del `__all__` del paquete.

**Solución recomendada:** Crear `schemas/salud.py` con `SaludRequest` y `SaludResponse` basados en el contrato documentado en el `README.md` raíz:

```python
# schemas/salud.py (esquema)
from uuid import UUID
from sqlmodel import SQLModel
from app.enums.mood import Mood

class SaludRequest(SQLModel):
    usuario_id: UUID
    humor: Mood
    nota_semanal: int

class SaludResponse(SQLModel):
    mensaje: str
    accion_sugerida: str
```

### 3. `app/__init__.py` no existe

**Archivo:** `backend/app/__init__.py`

El paquete `app` no tiene `__init__.py`. Esto no impide que FastAPI lo importe (Python 3.3+ usa namespace packages), pero es buena práctica incluirlo para:
- Documentar el propósito del paquete
- Inicializar configuraciones globales
- Consistencia con el resto del proyecto

**Impacto:** Bajo.

**Solución recomendada:** Crear `app/__init__.py` vacío o con un docstring.

---

## Buenas prácticas para mantener la arquitectura

1. **Nunca pongas lógica de negocio en un router.** Si un router tiene más de 3 líneas de código que no sean "validar input → llamar service → devolver response", movelo a un service.
2. **Nunca escribas queries SQL/ORM en un service.** Usá un repository.
3. **Un archivo por tabla en models/.** No agrupes modelos no relacionados.
4. **Un archivo por dominio en routers/ y services/.** Agrupá endpoints relacionados (ej: `routers/auth.py` con register + login).
5. **Schemas separados de modelos.** Aunque SQLModel permite usar el mismo objeto para DB y API, mantenelos separados. El schema de API y la tabla de DB evolucionan a distinto ritmo.
6. **Imports absolutos.** Usá `from app.models.user import User`, no imports relativos entre paquetes distintos.
7. **Tipado estricto.** Todo parámetro y retorno debe tener type hint.
