## INCIDENCIA 07 — Schema de Perfil Profesional v3

## Resumen

Esta incidencia reemplaza los 3 campos profesionales heredados del modelo `User` (`professional_level`, `tech_area`, `career_objective`) por 7 nuevos campos que capturan información más rica: situación laboral, sector, seniority, áreas de interés múltiples, objetivo de búsqueda, tecnologías conocidas y biografía. Crea una nueva migración SQL, actualiza el modelo de datos y los schemas de request/response. Las columnas viejas se vuelven nullable — no se dropean todavía.

**Rama:** `incidencia/07-schema-perfil-v3`  
**Duración estimada:** 4-5 horas.  
**Depende de:** Ninguna (solo main actualizado).  
**Asignada a:** 1 dev backend.  
**Por qué existe separada de 08:** El modelo y los schemas son la base. Hasta que esto no esté mergeado, el dev de 08 no puede tocar los servicios.

### ¿Qué vas a aprender de Python en esta incidencia?

| Concepto | ¿Qué es? |
|----------|---------|
| `Column(JSON)` de SQLAlchemy | Cómo guardar listas y diccionarios en PostgreSQL usando JSON nativo |
| `Optional[Type]` | Declarar campos que pueden ser `None` (NULL en la DB) |
| `sa_column=Column(...)` | Sobrescribir el tipo de columna por defecto de SQLModel con uno específico de SQLAlchemy |
| Migraciones manuales con SQL | Cómo agregar columnas a una tabla existente con `ALTER TABLE` |
| `model_dump()` en schemas que heredan de `SQLModel` | Cómo Pydantic serializa un schema a diccionario |

### Pre-lectura (20 min)

| Archivo | ¿Por qué? |
|---------|----------|
| `app/models/user.py` | Vas a modificar este modelo — entendé los campos actuales primero |
| `app/schemas/user.py` | Vas a modificar `UserCreate` y `UserResponse` |
| `app/enums/professional_level.py` | Enum que se vuelve opcional — vas a ver qué valores tiene |
| `app/enums/career_objective.py` | Enum que se vuelve opcional — idem |
| `backend/migrations/001-user-schema-v2.sql` | Ejemplo de cómo se escriben las migraciones en este proyecto |

### Antes de codear: flujo git

```bash
git checkout main
git pull origin main
git checkout -b incidencia/07-schema-perfil-v3
```

### Paso a paso

#### Archivo 1: `backend/migrations/002-step3-v3.sql`

Creá el archivo. Solo AGREGA columnas — NUNCA dropees las viejas en esta incidencia.

```sql
-- ============================================================================
-- Migración 002: Step 3 v3 — nuevos campos profesionales + bio + tecnologías
-- ============================================================================

BEGIN;

-- 1. Agregar columnas nuevas
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS current_situation  VARCHAR     NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS work_sector        VARCHAR,
  ADD COLUMN IF NOT EXISTS seniority          VARCHAR,
  ADD COLUMN IF NOT EXISTS interest_areas     JSON        NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS current_search     VARCHAR,
  ADD COLUMN IF NOT EXISTS known_technologies JSON        NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS bio                VARCHAR(500);

-- 2. Vuelve nullable las columnas que el nuevo registro ya no envía
ALTER TABLE users ALTER COLUMN professional_level DROP NOT NULL;
ALTER TABLE users ALTER COLUMN tech_area          DROP NOT NULL;
ALTER TABLE users ALTER COLUMN career_objective   DROP NOT NULL;

COMMIT;
```

**¿Por qué JSON y no TEXT[]?** SQLite (que usan los tests) no soporta arrays nativos de PostgreSQL. `JSON` funciona en ambos motores y PostgreSQL lo maneja nativamente con operadores como `->` y `@>`.

**¿Por qué `ADD COLUMN IF NOT EXISTS`?** Por si la migración se corre dos veces por error, no rompe.

#### Archivo 2: `backend/app/models/user.py`

**IMPORTANTE: No borres nada. Marcá los campos viejos como `Optional` y agregá los nuevos.**

Cambios necesarios — hacelos en este orden:

**2a. Agregar imports nuevos al principio del archivo:**

```python
from sqlalchemy import Column, String, JSON as SAJSON
```

`SAJSON` es un alias para no confundirlo con `json` de la stdlib.

**2b. Reemplazar la sección "Datos Profesionales" completa:**

Antes:
```python
    # ── Datos Profesionales ──────────────────────────────────────────────
    professional_level: ProfessionalLevel = Field(
        nullable=False,
        index=True,
    )
    tech_area: str = Field(nullable=False, index=True)
    career_objective: CareerObjective = Field(nullable=False)
```

Después:
```python
    # ── Datos Profesionales ──────────────────────────────────────────────

    current_situation: str = Field(nullable=False)

    work_sector: Optional[str] = Field(default=None)
    seniority: Optional[str] = Field(default=None)

    interest_areas: list[str] = Field(
        default=[],
        sa_column=Column(SAJSON),
    )
    current_search: Optional[str] = Field(default=None)

    known_technologies: list[dict] = Field(
        default=[],
        sa_column=Column(SAJSON),
    )

    bio: Optional[str] = Field(default=None, max_length=500)

    # ── Campos legacy (nullable — ya no se usan en registro) ─────────────

    professional_level: Optional[ProfessionalLevel] = Field(
        default=None,
        index=True,
    )
    tech_area: Optional[str] = Field(default=None, index=True)
    career_objective: Optional[CareerObjective] = Field(default=None)
```

**Concepto clave — `sa_column=Column(SAJSON)`:**
SQLModel por defecto infiere el tipo de columna según el type hint de Python. Pero `list[str]` no tiene un equivalente directo en SQL estándar. Con `sa_column=Column(SAJSON)` le decimos EXPLÍCITAMENTE que use JSON. Sin esto, SQLModel intentaría adivinar y probablemente falle.

#### Archivo 3: `backend/app/schemas/user.py`

Modificá `UserCreate` y `UserResponse`. Misma lógica: campos nuevos requeridos, campos viejos `Optional`.

**UserCreate:**

```python
class UserCreate(SQLModel):
    email: EmailStr
    password: str
    full_name: str
    birth_date: date
    gender: str
    education_level: str

    continent_code: str
    continent_name: str
    country_code: str
    country_name: str
    state_code: str
    state_name: str
    city_name: str
    whatsapp_e164: str

    language_code: str = "es"

    # ── Nuevos campos profesionales ────────────────────────────────────
    current_situation: str
    work_sector: Optional[str] = None
    seniority: Optional[str] = None
    interest_areas: list[str] = []
    current_search: Optional[str] = None
    known_technologies: list[dict] = []
    bio: Optional[str] = None

    # ── Campos legacy (nullable — ya no se usan en registro) ───────────
    professional_level: Optional[ProfessionalLevel] = None
    tech_area: Optional[str] = None
    career_objective: Optional[CareerObjective] = None
```

Agregá `from typing import Optional, List` al inicio del archivo (si no están ya).

**UserResponse:** Mismos campos que el modelo — copiá la estructura de `UserCreate` pero con `id: UUID` y `created_at: datetime` en vez de `password`.

#### Archivo 4: Actualizar tests

Los tests que crean instancias de `User` o `UserCreate` van a fallar porque ahora hay campos requeridos nuevos (`current_situation`, `interest_areas`). Actualizalos en estos 4 archivos:

- `backend/tests/test_models.py`
- `backend/tests/test_user_created.py`
- `backend/tests/test_relations.py`
- `backend/tests/test_db.py`

**Regla para cada test:** Donde se instancie `User(...)` o `UserCreate(...)`, agregá `current_situation="student"` e `interest_areas=["frontend"]` como mínimo. No toques la lógica de los tests, solo agregá los campos faltantes.

**Ejemplo — `test_models.py`:**
```python
# Antes
user = User(
    email="test@example.com",
    ...
    professional_level="junior",
    tech_area="backend",
    career_objective="find_job",
)

# Después
user = User(
    email="test@example.com",
    ...
    current_situation="student",
    interest_areas=["frontend"],
    professional_level="junior",
    tech_area="backend",
    career_objective="find_job",
)
```

### Verificación completa

```bash
# 1. Aplicar migración en PostgreSQL de desarrollo
python -c "from app.db.session import create_db_and_tables; create_db_and_tables(drop_all=True)"

# 2. Python compila sin errores de sintaxis
python -m py_compile app/models/user.py && echo "OK model"
python -m py_compile app/schemas/user.py && echo "OK schemas"

# 3. Tests pasan
python -m pytest tests/ -v
# Esperado: 30 passed
```

**Si un test falla con `missing required field 'current_situation'`:** Ese test crea un `User` o `UserCreate` sin los campos nuevos. Agregá `current_situation="student"` e `interest_areas=["frontend"]`.

**Si un test falla con `UnsupportedCompilationError: can't render element of type ARRAY`:** Pusiste `ARRAY(String)` en vez de `SAJSON` en el modelo. Cambialo.

### Criterios de aceptación Incidencia 07

- [ ] `002-step3-v3.sql` existe en `backend/migrations/` y solo AGREGA columnas (no droppea)
- [ ] Modelo `User` tiene los 7 campos nuevos + los 3 legacy como `Optional`
- [ ] `UserCreate` acepta los 7 campos nuevos y NO requiere los 3 legacy
- [ ] `UserResponse` incluye los 7 campos nuevos (los legacy salen como `null` para usuarios nuevos)
- [ ] `create_db_and_tables(drop_all=True)` crea las tablas sin errores
- [ ] Tests existentes (30) siguen pasando
- [ ] Commit con: `feat(db): agregar schema de perfil profesional v3`

---
