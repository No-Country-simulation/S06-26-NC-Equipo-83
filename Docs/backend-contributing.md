# Guía de Contribución — Backend App BiT

Convenciones y flujo de trabajo para mantener consistencia en el equipo backend.

---

## Naming conventions

### Archivos y carpetas

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Archivos Python | `snake_case` | `mental_health.py`, `career_objective.py` |
| Carpetas de dominio | `snake_case` (plural si contiene varios) | `models/`, `services/`, `routers/` |
| Archivos de test | `test_` + nombre del módulo | `test_user.py` |

### Código

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Clases (modelos, schemas, enums) | `PascalCase` | `class MentalHealthLog`, `class CareerObjective` |
| Funciones y métodos | `snake_case` | `def get_user_by_email()`, `def create_access_token()` |
| Variables | `snake_case` | `user_id`, `access_token` |
| Constantes | `UPPER_SNAKE_CASE` | `ALGORITHM = "HS256"` |
| Módulos (imports) | `snake_case` | `from app.models.user import User` |

### Base de datos

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Tablas | `snake_case`, plural en inglés | `users`, `mental_health_logs` |
| Columnas | `snake_case` en inglés | `full_name`, `created_at`, `hashed_password` |
| Llaves foráneas | `{tabla_singular}_id` | `user_id` |
| Índices | Se declaran con `Field(index=True)` | `country: str = Field(index=True)` |

### API

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Rutas | `snake_case` o `kebab-case` en inglés | `/mental-health`, `/auth/login` |
| Schemas request | `{Dominio}Create`, `{Dominio}Update`, `{Dominio}Request` | `UserCreate`, `OrientarRequest` |
| Schemas response | `{Dominio}Response` | `UserResponse`, `TokenResponse` |

---

## Convenciones de commits

El proyecto usa [Conventional Commits](https://www.conventionalcommits.org/). La guía detallada está en [`Docs/Conventional Commits.md`](Conventional%20Commits.md).

### Formato

```
<tipo>[ámbito opcional]: <descripción en español>

[cuerpo opcional en español]
```

### Tipos

| Tipo | Cuándo usarlo |
|------|--------------|
| `feat` | Nueva funcionalidad (endpoint, modelo, schema) |
| `fix` | Corrección de bug |
| `docs` | Cambios en documentación |
| `refactor` | Mejora de código sin cambiar comportamiento |
| `test` | Agregar o modificar tests |
| `chore` | Tareas de mantenimiento (deps, config) |
| `style` | Formato, linting (sin cambios de lógica) |

### Ejemplos

```bash
feat(auth): agregar endpoint POST /auth/register
feat(models): crear tabla users con campos personales y profesionales
fix(schemas): corregir import de SaludRequest que no existía
docs(backend): crear guía de contribución
refactor(security): extraer lógica de hash a servicio dedicado
test(user): agregar tests de creación de usuario
chore(deps): actualizar fastapi a 0.115.6
```

---

## Convenciones de branches

Definidas en el [`README.md` raíz](../README.md#estrategia-git).

### Formato

```
incidencia/<id>-<descripcion-corta>
```

### Ejemplos

```
incidencia/01-configuracion-db
incidencia/02-auth-endpoints
incidencia/03-orientar-service
incidencia/04-salud-checkin
```

### Reglas

- Se crean desde `main`.
- Se mergean a `main` vía Pull Request.
- Se eliminan después del merge.
- Una rama por feature o fix. No mezclar features no relacionadas.

---

## Cómo crear una feature nueva

### 1. Empezá desde `main` actualizado

```bash
git checkout main
git pull origin main
```

### 2. Creá la rama

```bash
git checkout -b incidencia/XX-descripcion-corta
```

### 3. Implementá siguiendo la arquitectura

Según lo que necesites:

- **Nuevo endpoint** → `routers/<dominio>.py`
- **Lógica de negocio** → `services/<dominio>.py`
- **Acceso a datos** → `repositories/<dominio>.py`
- **Nueva tabla** → `models/<tabla>.py`
- **Schema de API** → `schemas/<dominio>.py`

> **Regla de oro:** lógica de negocio siempre en `services/`. Nunca en routers.

### 4. Registrá el router en `main.py`

```python
from app.routers import auth
app.include_router(auth.router, prefix="/auth", tags=["auth"])
```

### 5. Escribí tests

Tests con assertions reales en `tests/`. Si creás fixtures reutilizables, van en `conftest.py`.

### 6. Commiteá con Conventional Commits

```bash
git add .
git commit -m "feat(auth): implementar registro de usuario con JWT"
```

### 7. Pusheá

```bash
git push origin incidencia/XX-descripcion-corta
```

---

## Cómo abrir un Pull Request

1. Pusheá tu rama a GitHub.
2. Abrí un PR desde tu rama hacia `main`.
3. **Título del PR:** formato Conventional Commits (`feat(auth): registrar usuario con JWT`).
4. **Descripción del PR:**
   - Qué hace este cambio
   - Qué endpoints, modelos o archivos nuevos agrega
   - Cómo probarlo (comandos, requests de ejemplo)
   - Screenshots de Swagger si aplica
5. Asigná al menos un reviewer.
6. Esperá aprobación antes de mergear.

---

## Checklist mínimo antes de mergear

Antes de pedir review o mergear, verificá:

- [ ] **Tests pasan:** `python -m pytest tests/ -v` sin errores
- [ ] **Imports limpios:** `python -c "from app.main import app"` no tira `ImportError`
- [ ] **Swagger carga:** `http://localhost:8000/docs` muestra el endpoint nuevo
- [ ] **Health check:** `GET /health` sigue respondiendo `200`
- [ ] **Commits limpios:** cada commit tiene un propósito claro, sin WIP
- [ ] **Sin código comentado:** no dejaste `# TODO` ni código muerto
- [ ] **Sin secretos:** no hay contraseñas, tokens ni URLs internas en el código
- [ ] **Docstrings:** las funciones públicas y endpoints tienen docstring
- [ ] **Tipado:** todos los parámetros y retornos tienen type hints
- [ ] **Convenciones:** nombres de archivos, clases y funciones siguen esta guía

---

## Code review

### Lo que se revisa

- ¿La lógica de negocio está en `services/` y no en `routers/`?
- ¿Las queries están en `repositories/` y no en `services/`?
- ¿Los schemas de request/response están separados de los modelos de DB?
- ¿Hay tests que cubren el caso feliz y al menos un edge case?
- ¿Los nombres de variables y funciones son claros?

### Lo que no se revisa

- Estilo de formato (debería estar automatizado con un linter en el futuro)
- Preferencias personales de sintaxis

---

## Herramientas recomendadas

> **[ACTUAL]** El proyecto no tiene configurado linter ni formateador automático.

> **[RECOMENDACIÓN FUTURA]** Agregar al proyecto:
> - **Ruff** — linter + formateador rápido para Python
> - **MyPy** — type checker
> - **Pre-commit hooks** — para validar antes de cada commit
