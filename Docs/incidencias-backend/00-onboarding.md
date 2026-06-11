# INCIDENCIA 00 — Onboarding y Nivelación (los 4 devs juntos)

## Resumen

Esta incidencia prepara todo lo necesario para empezar a desarrollar: clonar el repositorio, instalar Python con un entorno virtual aislado, instalar todas las dependencias del proyecto, configurar PostgreSQL como base de datos (ya sea instalándolo directamente en tu máquina o usando Docker si ya lo tenés), levantar el servidor de desarrollo, y familiarizarse con Swagger — la herramienta interactiva que permite probar los endpoints sin necesidad de Postman ni curl. También vas a leer la documentación de arquitectura para entender cómo está organizado el código y cuáles son las reglas del equipo para nombrar archivos y hacer commits. No se escribe código en esta incidencia.

---

**Rama:** Ninguna — es setup local.  
**Duración estimada:** 2-3 horas sincrónicas.  
**Depende de:** Nada.

### Paso 1: Clonar y preparar el entorno (30 min)

```bash
# 1. Clonar (si no lo hicieron ya)
git clone <repo-url>
cd "App bit/backend"

# 2. Crear entorno virtual
#    Esto crea una carpeta .venv con Python AISLADO del sistema.
#    Todo lo que instales con pip va a parar acá, no a tu Python global.
python -m venv .venv

# 3. Activar el entorno virtual
#    Windows PowerShell:
.venv\Scripts\Activate.ps1
#    Windows CMD:
.venv\Scripts\activate.bat
#    Linux/Mac:
source .venv/bin/activate

#    VERIFICAR: el prompt debe mostrar (.venv) al principio.
#    Si no lo ves, el entorno NO está activado.

# 4. Instalar dependencias
pip install -r requirements.txt

#    Si algo falla en Windows con psycopg2:
pip install psycopg2-binary --only-binary :all:

# 5. Verificar que FastAPI se instaló
python -c "import fastapi; print(fastapi.__version__)"
#    Debe mostrar: 0.115.6
```

### Paso 2: Instalar PostgreSQL (20 min)

#### Opción A: PostgreSQL local (recomendada)

**Windows:**

1. Descargá PostgreSQL 15 del [sitio oficial](https://www.postgresql.org/download/windows/)
2. Ejecutá el instalador. Recordá la contraseña del superusuario `postgres` que elegiste durante la instalación.
3. Abrí **SQL Shell (psql)** desde el menú Inicio y conectate:
   ```
   Server [localhost]: Enter
   Database [postgres]: Enter
   Port [5432]: Enter
   Username [postgres]: Enter
   Password for user postgres: [la contraseña que pusiste en la instalación]
   ```
4. Creá el usuario y la base de datos:
   ```sql
   CREATE USER appbit_user WITH PASSWORD 'appbit_password';
   CREATE DATABASE appbit_database OWNER appbit_user;
   \q
   ```

**macOS:**

```bash
# Instalar PostgreSQL 15
brew install postgresql@15

# Iniciar el servicio
brew services start postgresql@15

# Crear usuario y base de datos
psql -U postgres -c "CREATE USER appbit_user WITH PASSWORD 'appbit_password';"
psql -U postgres -c "CREATE DATABASE appbit_database OWNER appbit_user;"
```

**Linux (Ubuntu/Debian):**

```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Iniciar el servicio
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Crear usuario y base de datos
sudo -u postgres psql -c "CREATE USER appbit_user WITH PASSWORD 'appbit_password';"
sudo -u postgres psql -c "CREATE DATABASE appbit_database OWNER appbit_user;"
```

**Verificar conexión (todas las plataformas):**

```bash
psql -U appbit_user -d appbit_database -c "SELECT 1;"
# Debe devolver: ?column? / 1
```

Si `psql` no se encuentra en el PATH de Windows, usá la ruta completa:
```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U appbit_user -d appbit_database -c "SELECT 1;"
```

#### Opción B: PostgreSQL con Docker (alternativa si ya tenés Docker instalado)

```bash
# Desde backend/
docker compose up -d

# Verificar que está corriendo:
docker ps
# Debés ver un contenedor llamado "appbit_postgres" con status "Up"

# Verificar que la DB responde:
docker exec appbit_postgres psql -U appbit_user -d appbit_database -c "SELECT 1;"
# Debe devolver: ?column? / 1
```

### Paso 3: Ejecutar la API y entender Swagger (20 min)

```bash
# Levantar el servidor (modo recarga automática)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Abrí en el navegador:

| URL | ¿Qué es? |
|-----|---------|
| `http://localhost:8000/health` | Health check — devuelve JSON |
| `http://localhost:8000/docs` | **Swagger UI** — tu herramienta más importante |
| `http://localhost:8000/redoc` | Documentación OpenAPI |

**Mini-guía de Swagger (5 minutos, hacelo AHORA):**

1. Andá a `http://localhost:8000/docs`
2. Vas a ver el endpoint `GET /health` con un tag verde
3. Hacé click en la fila → se despliega
4. Hacé click en **"Try it out"** → después en **"Execute"**
5. Vas a ver la respuesta real del servidor: `{"status":"ok","service":"...","version":"0.1.0"}`
6. Eso es un **cliente HTTP interactivo**. Cada vez que crees un endpoint nuevo, aparece acá automáticamente y podés probarlo sin Postman ni curl.

**Dato importante:** Cuando veas un error `422 Unprocessable Entity` en Swagger, no es un bug de tu código. Significa que el JSON que enviaste no coincide con el schema que definiste. FastAPI lo valida automáticamente. Leé el mensaje de error — te dice EXACTAMENTE qué campo está mal.

### Paso 4: Ejecutar los tests existentes (10 min)

```bash
# Desde backend/
python -m pytest tests/ -v
```

Deben pasar 30 tests verdes. Si alguno falla, algo está mal en el entorno. No sigas hasta que los 30 pasen.

### Paso 5: Leer la arquitectura (45 min)

Leé en este orden exacto:

| # | Archivo | ¿Qué vas a entender? |
|---|---------|---------------------|
| 1 | `docs/backend-architecture.md` | Qué hace cada carpeta. La diferencia entre model, schema, enum. |
| 2 | `docs/backend-target-structure.md` | Qué carpetas vamos a crear y en qué orden. Reglas de acoplamiento. |
| 3 | `docs/backend-contributing.md` | Naming conventions. Cómo se nombra TODO. Formato de commits. |
| 4 | `docs/adr/001-backend-foundation.md` | Por qué elegimos FastAPI, SQLModel y PostgreSQL. |

Abrí estos archivos en el editor y mirá el código real:

| Archivo | Abrílo y fijate |
|---------|----------------|
| `app/main.py` | Cómo se crea una app FastAPI (4 líneas) y se define un endpoint (`@app.get`) |
| `app/models/user.py` | Cómo se define una tabla de base de datos con `table=True` |
| `app/schemas/user.py` | Cómo se define el contrato de API — NUNCA tiene `table=True` |
| `app/enums/mood.py` | Cómo se define un enum con `(str, Enum)` |

### Paso 6: Entender el flujo de git del equipo (15 min)

**TODAS las incidencias arrancan con esto. No lo saltees nunca.**

```bash
# 1. Volver a main y actualizar
git checkout main
git pull origin main

# 2. Crear rama con el formato del equipo
git checkout -b incidencia/XX-descripcion-corta

# 3. A MEDIDA QUE TRABAJÁS, commiteá seguido con conventional commits:
git add .
git commit -m "feat(config): agregar Settings con pydantic-settings"

# Tipos de commit válidos:
#   feat:    funcionalidad nueva
#   fix:     corrección de bug
#   docs:    cambios en documentación
#   refactor: mejora de código sin cambiar comportamiento
#   test:    agregar o modificar tests
#   chore:   tareas de mantenimiento
```

### Criterios de aceptación Incidencia 00

- [ ] Entorno virtual creado y activado (ves `(.venv)` en el prompt)
- [ ] `pip install -r requirements.txt` completó sin errores
- [ ] PostgreSQL corriendo (local o Docker) — `psql -U appbit_user -d appbit_database -c "SELECT 1"` funciona
- [ ] `GET /health` responde 200 en Swagger
- [ ] 30 tests pasan en verde
- [ ] Leíste los 4 docs de arquitectura
- [ ] Entendiste que Swagger en `/docs` es tu herramienta principal para probar endpoints
