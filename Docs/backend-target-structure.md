# Estructura Objetivo — Backend App BiT

Estructura de carpetas recomendada para el backend cuando se implementen endpoints reales. Define qué va en cada carpeta y en qué momento crearla.

---

## Árbol objetivo

```
backend/
├── requirements.txt
├── .env.example                ← Variables de entorno de ejemplo
├── docker-compose.yml          ← PostgreSQL para desarrollo local
├── app/
│   ├── __init__.py
│   ├── main.py                 ← Entry point FastAPI
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           ← Settings desde .env (pydantic-settings)
│   │   └── security.py         ← JWT, hashing de passwords
│   ├── db/
│   │   ├── __init__.py
│   │   └── session.py          ← Engine y get_session() de SQLModel
│   ├── enums/
│   │   ├── __init__.py
│   │   ├── career_objective.py
│   │   ├── mood.py
│   │   └── professional_level.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── mental_health.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── orientar.py
│   │   └── salud.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py             ← POST /auth/register, /auth/login
│   │   ├── orientar.py         ← POST /orientar
│   │   └── salud.py            ← POST /salud
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py             ← Lógica de registro, login, tokens
│   │   ├── orientar.py         ← Análisis de perfil, match con vacantes
│   │   └── salud.py            ← Procesamiento de check-in emocional
│   └── repositories/
│       ├── __init__.py
│       ├── user.py             ← Queries CRUD de usuarios
│       └── mental_health.py    ← Queries de check-ins emocionales
└── tests/
    ├── __init__.py
    ├── conftest.py              ← Fixtures reutilizables
    ├── test_auth.py
    ├── test_orientar.py
    └── test_salud.py
```

---

## Propósito de cada carpeta

| Carpeta | ¿Existe hoy? | Propósito | Cuándo crearla |
|---------|:-----------:|-----------|---------------|
| `app/main.py` | ✅ Sí | Instancia de FastAPI, CORS, montaje de routers | Ya existe |
| `app/models/` | ✅ Sí | Tablas SQLModel (`table=True`). Una tabla = un archivo | Ya existe |
| `app/schemas/` | ✅ Sí | Schemas de API (`SQLModel` sin `table=True`). Contrato HTTP | Ya existe |
| `app/enums/` | ✅ Sí | Enums de dominio (`(str, Enum)`). Valores permitidos | Ya existe |
| `app/core/` | ❌ No | Configuración centralizada (`config.py`), seguridad (`security.py`), dependencias compartidas | **Antes del primer endpoint** que necesite auth o DB |
| `app/db/` | ❌ No | `engine` de SQLModel y `get_session()` para inyección de dependencias | **Antes del primer endpoint** que lea o escriba en DB |
| `app/routers/` | ❌ No | Endpoints REST agrupados por dominio. **Solo recibe HTTP, valida schemas, llama services, responde** | **Al crear el primer endpoint** (auth, orientar, salud) |
| `app/services/` | ❌ No | **Toda la lógica de negocio.** No conoce HTTP, no escribe queries. | **Desde el día 1.** No esperar a que el router crezca |
| `app/repositories/` | ❌ No | Queries SQLModel/SQLAlchemy. CRUD. **Nunca lógica de negocio** | **Cuando un service necesite queries.** No antes |
| `.env.example` | ❌ No | Template de variables de entorno. Sin valores reales | Al implementar `core/config.py` |
| `docker-compose.yml` | ✅ Sí | PostgreSQL 15 para desarrollo local | Ya existe |
| `tests/conftest.py` | ❌ No | Fixtures de pytest compartidos (cliente HTTP, DB de prueba) | Al migrar los smoke tests a tests con assertions |

---

## Reglas de acoplamiento

```
routers/
  → importa services/     ✅
  → importa schemas/      ✅
  → importa core/         ✅
  → importa repositories/ ❌ (pasa por services)
  → importa models/       ❌ (pasa por services)

services/
  → importa repositories/ ✅
  → importa schemas/      ✅
  → importa core/         ✅
  → importa routers/      ❌ (dependencia circular)
  → importa models/       ✅ (tipos del dominio)
  → importa fastapi       ❌ (no conoce HTTP)

repositories/
  → importa models/       ✅
  → importa services/     ❌ (dependencia circular)
  → importa routers/      ❌
  → importa schemas/      ❌ (usa modelos, no schemas)

models/
  → importa enums/        ✅
  → importa schemas/      ❌ (los schemas extienden modelos, no al revés)
```

---

## Ejemplo de flujo completo

Para el endpoint `POST /orientar`:

```
1. HTTP Request llega a main.py
2. main.py → router registrado con prefix="/orientar"
3. routers/orientar.py → orientar()
   - Recibe OrientarRequest (validación automática por FastAPI)
   - Llama a services/orientar.py → analizar_perfil()
   - Devuelve OrientarResponse
4. services/orientar.py → analizar_perfil()
   - Llama a repositories/user.py → get_user()
   - Procesa datos, llama a IA externa (httpx)
   - Aplica reglas de negocio (gap, trayectoria)
   - Devuelve resultado al router
5. repositories/user.py → get_user()
   - Ejecuta query SQLModel: select(User).where(User.id == id)
   - Devuelve instancia de User al service
```

---

## Orden de implementación sugerido

1. **`app/__init__.py`** — archivo vacío con docstring
2. **`core/config.py`** + `.env.example` — settings con pydantic-settings
3. **`db/session.py`** — engine y get_session
4. **`core/security.py`** — JWT + password hashing
5. ~~`schemas/salud.py`~~ ✅ Ya existe — creado con SaludRequest y SaludResponse
6. **`routers/auth.py`** + **`services/auth.py`** + **`repositories/user.py`** — registro y login
7. **`routers/orientar.py`** + **`services/orientar.py`** — orientación profesional
8. **`routers/salud.py`** + **`services/salud.py`** + **`repositories/mental_health.py`** — check-in emocional

Cada paso incluye sus tests correspondientes en `tests/`.
