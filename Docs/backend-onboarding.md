# Backend Onboarding — App BiT

Guía paso a paso para que un desarrollador backend nuevo levante el proyecto sin ayuda del equipo.

---

## Requisitos previos

| Herramienta | Versión mínima | Verificar con |
|-------------|---------------|---------------|
| Python | 3.12 | `python --version` |
| PostgreSQL | 15 | `psql --version` |
| Git | 2.40 | `git --version` |

---

## Paso 1: Clonar el repositorio

```bash
git clone <repository-url>
cd app-bit
```

---

## Paso 2: Entorno virtual

```bash
cd backend
python -m venv .venv
```

Activar:

| Sistema | Comando |
|---------|---------|
| **Windows** (cmd) | `.venv\Scripts\activate.bat` |
| **Windows** (PowerShell) | `.venv\Scripts\Activate.ps1` |
| **Linux / macOS** | `source .venv/bin/activate` |

Verificar que el entorno está activo: el prompt debe mostrar `(.venv)` al inicio.

---

## Paso 3: Instalar dependencias

```bash
pip install -r requirements.txt
```

> **Nota sobre Windows:** si `psycopg2-binary` falla al compilar, instalar el binario precompilado:
> ```bash
> pip install psycopg2-binary --only-binary :all:
> ```

Verificar que FastAPI se instaló:

```bash
python -c "import fastapi; print(fastapi.__version__)"
# Debe mostrar: 0.115.6
```

---

## Paso 4: Base de datos

### Opción A: PostgreSQL local

**Windows:**
1. Descargar de [postgresql.org](https://www.postgresql.org/download/windows/)
2. Instalar con el wizard. Anotar puerto (default `5432`) y contraseña del usuario `postgres`.

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-client
sudo systemctl start postgresql
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

Crear usuario y base de datos:

```bash
# Conectarse como superusuario
psql -U postgres

# Dentro de psql:
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

Alternativa para quien tenga Docker instalado y prefiera no instalar PostgreSQL localmente.

```bash
# Desde backend/
docker compose up -d
```

Esto levanta PostgreSQL 15 con las mismas credenciales que la opción local.

Para detener: `docker compose down`
Para resetear datos: `docker compose down -v && docker compose up -d`

> La primera ejecución descarga la imagen (~150 MB). Ejecuciones siguientes son instantáneas.

> Si elegiste PostgreSQL local, asegurate de crear la base de datos manualmente — Docker la crea automáticamente.

---

## Paso 5: Variables de entorno

> **[ACTUAL]** El proyecto no lee variables de entorno. No hace falta configurarlas para ejecutar la API ni los tests.

> **[FUTURO]** Cuando se implemente la conexión a base de datos, crear un archivo `.env` basado en `.env.example`:

```env
DATABASE_URL=postgresql://appbit_user:appbit_password@localhost:5432/appbit_database
SECRET_KEY=cambiar-en-produccion
```

---

## Paso 6: Ejecutar la API

```bash
# Desde backend/, con .venv activado:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Salida esperada:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

## Paso 7: Verificar que funciona

### 7.1 Health check

Abrir en el navegador o usar curl:

```
http://localhost:8000/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "App BiT — Backend API",
  "version": "0.1.0"
}
```

### 7.2 Swagger UI

Abrir en el navegador:

```
http://localhost:8000/docs
```

Debe mostrar la interfaz interactiva de Swagger con el endpoint `GET /health`.

### 7.3 ReDoc

```
http://localhost:8000/redoc
```

Documentación OpenAPI en formato alternativo.

---

## Paso 8: Ejecutar tests

```bash
# Desde backend/
python -m pytest tests/ -v
```

> **[ACTUAL]** Los tests validan que los imports, modelos, enums y schemas funcionan correctamente. Se ejecutan contra SQLite en memoria (no requieren PostgreSQL). Son **smoke tests** — validan estructura, no comportamiento.

---

## Paso 9: Entender la estructura

Leer en orden:

1. **[`backend/README.md`](../backend/README.md)** — referencia rápida del backend
2. **[`docs/backend-architecture.md`](backend-architecture.md)** — arquitectura: qué hace cada carpeta
3. **[`docs/backend-target-structure.md`](backend-target-structure.md)** — hacia dónde va la estructura

Abrir en el editor:

| Archivo | Para entender |
|---------|--------------|
| `app/main.py` | Cómo arranca FastAPI |
| `app/models/user.py` | Estructura de la tabla `users` |
| `app/models/mental_health.py` | Estructura de la tabla `mental_health_logs` |
| `app/schemas/user.py` | Schemas de request/response de usuario |
| `app/schemas/orientar.py` | Schemas del endpoint de orientación |
| `app/enums/` | Valores permitidos para campos enumerados |

---

## Próximos pasos sugeridos

1. Leer `docs/backend-architecture.md` para entender la separación en capas
2. Leer `docs/backend-contributing.md` para conocer las convenciones del equipo
3. Revisar `docs/adr/001-backend-foundation.md` para entender por qué se eligió cada tecnología
4. Agarrar la primera tarea del backlog

---

## Troubleshooting rápido

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| `(.venv)` no aparece en el prompt | Entorno virtual no activado | Volver a ejecutar el comando de activación de tu SO |
| `ModuleNotFoundError: No module named 'app'` | Estás ejecutando desde una carpeta incorrecta | Asegurate de estar en `backend/` |
| `uvicorn: command not found` | Dependencias no instaladas | `pip install -r requirements.txt` |
| `address already in use` | Puerto 8000 ocupado | `uvicorn app.main:app --port 8001` o cerrar el otro proceso |
| `psycopg2` no instala en Windows | Falta Visual C++ Build Tools | Usar `pip install psycopg2-binary --only-binary :all:` |
| `psql: command not found` | PostgreSQL no está en el PATH | Agregar `C:\Program Files\PostgreSQL\16\bin` al PATH (Windows) |
