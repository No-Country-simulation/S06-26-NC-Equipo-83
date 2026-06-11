# backend-01 Inicializar proyecto Python (FastAPI)

## Descripción
Inicializar la estructura del proyecto backend en Python con FastAPI, configurar el entorno virtual, dependencias y preparar la base de datos.

## Tareas

### 1. Inicializar proyecto
- Crear carpeta `backend/` en la raíz del repo
- Inicializar entorno virtual (`venv` o `poetry`)
- Crear `requirements.txt` o `pyproject.toml` con dependencias iniciales:
  - `fastapi`
  - `uvicorn`
  - `sqlalchemy` / `sqlmodel`
  - `alembic` (migraciones)
  - `pydantic`
  - `python-jose` (JWT)
  - `httpx` (tests)
  - `python-dotenv`
- Crear `.env.example` con variables necesarias
- Agregar `backend/.env` al `.gitignore`

### 2. Estructura de carpetas

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Punto de entrada FastAPI
│   ├── config.py            # Configuración (env vars)
│   ├── database.py          # Conexión a BD
│   ├── models/              # Modelos SQLAlchemy
│   │   ├── __init__.py
│   │   └── usuario.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   └── usuario.py
│   ├── routers/             # Endpoints
│   │   ├── __init__.py
│   │   └── health.py
│   └── services/            # Lógica de negocio
│       ├── __init__.py
│       └── __init__.py
├── tests/
│   ├── __init__.py
│   └── test_health.py
├── alembic/                 # Migraciones
├── alembic.ini
├── requirements.txt
└── .env.example
```

### 3. Base de datos
- Configurar motor de BD (SQLite para desarrollo / PostgreSQL para producción)
- Crear modelo base con SQLAlchemy
- Configurar Alembic para migraciones
- Crear primera migración

### 4. Verificación
- Servidor FastAPI corriendo en `localhost:8000`
- Endpoint de health check: `GET /health` → `{"status": "ok"}`
- Tests básicos pasando

## Criterios de aceptación
- [ ] Proyecto backend creado con estructura de carpetas
- [ ] FastAPI corriendo con endpoint `/health` funcional
- [ ] Base de datos configurada con SQLAlchemy
- [ ] Alembic configurado y primera migración creada
- [ ] `.env.example` con variables documentadas
- [ ] Tests básicos funcionando
- [ ] README rápido en `backend/` con instrucciones

## Prioridad
Alta

## Etiquetas
`backend` `setup` `python` `fastapi`
