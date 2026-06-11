## INCIDENCIA 01 — Fundación: Config, DB, Tablas, Stub de IA

## Resumen

Esta incidencia establece los cimientos del backend: conecta la aplicación a una base de datos PostgreSQL, implementa la lectura de variables de entorno desde un archivo de configuración, crea automáticamente las tablas necesarias al iniciar, y proporciona un agente de inteligencia artificial temporal con respuestas predefinidas para cada estado emocional. Sin este trabajo, ningún otro módulo puede guardar datos ni probar la funcionalidad de salud mental.

**Rama:** `incidencia/01-fundacion`  
**Duración estimada:** 1 día (8 horas).  
**Depende de:** 00 completada.  
**Asignada a:** 1 solo dev.  
**Por qué esta incidencia existe:** Sin conexión a PostgreSQL y sin tablas, NADIE puede guardar datos. Sin el `.env`, NADIE puede configurar su entorno. Sin el stub de `IAAgent`, el dev de salud no puede arrancar.

### ¿Qué vas a aprender de Python en esta incidencia?

| Concepto | ¿Qué es? |
|----------|---------|
| `__init__.py` | Archivo vacío que convierte una carpeta en un "paquete" importable desde Python |
| `class Settings(BaseSettings)` | Una clase que lee variables de entorno automáticamente y las valida |
| Type hints para atributos de clase | `DATABASE_URL: str` define que ese atributo ES un string |
| `create_engine()` | Configura la conexión a PostgreSQL — no conecta, solo configura |
| `yield` | Permite "pausar" una función y reanudarla después. FastAPI lo usa para abrir/cerrar sesiones de DB |
| `SQLModel.metadata.create_all()` | Lee TODAS las clases con `table=True` y las materializa como tablas reales en PostgreSQL |

### Pre-lectura (30 min)

| Archivo | Pregunta que responde |
|---------|----------------------|
| `docs/backend-architecture.md` — sección "Propósito de cada capa" | ¿Qué va en `core/` y `db/`? |
| `docs/backend-target-structure.md` — sección "Propósito de cada carpeta" | ¿Qué archivos voy a crear hoy? |
| `docker-compose.yml` | ¿Qué credenciales tiene PostgreSQL? (usuario, password, db) |
| `app/models/user.py` | ¿Qué columnas va a tener la tabla `users`? |
| `app/models/mental_health.py` | ¿Qué columnas va a tener la tabla `mental_health_logs`? |

### Antes de codear: flujo git

```bash
git checkout main
git pull origin main
git checkout -b incidencia/01-fundacion
```

### Paso a paso — ORDEN ESTRICTO

#### Archivo 1: `backend/app/__init__.py`

Creá el archivo. **Dejalo completamente vacío.** Ni una línea, ni un comentario.

**¿Por qué?** Sin este archivo, Python no reconoce la carpeta `app/` como un paquete. Es la raíz de todos los imports del proyecto (`from app.core.config import Settings`). Python 3.3+ funciona sin él (namespace packages), pero es buena práctica incluirlo para consistencia con el resto de carpetas que también tienen su `__init__.py`.

#### Archivo 2: `backend/app/core/__init__.py`

Creá el archivo. **Dejalo completamente vacío.** Ni una línea, ni un comentario.

**¿Por qué?** Sin este archivo, Python no reconoce la carpeta `core/` como un paquete. Si intentás hacer `from app.core.config import Settings` sin él, obtendrás `ModuleNotFoundError`. Es un requisito de Python, no de FastAPI.

#### Archivo 3: `backend/.env.example`

```env
DATABASE_URL=postgresql://appbit_user:appbit_password@localhost:5432/appbit_database
SECRET_KEY=cambiar-por-una-clave-segura-de-al-menos-32-caracteres
ACCESS_TOKEN_EXPIRE_MINUTES=30
IA_API_KEY=tu-api-key-de-google-ai-studio
IA_MODEL=gemini-2.0-flash
```

**DETALLE CRÍTICO DE SEGURIDAD:** Este archivo contiene PLACEHOLDERS, no valores reales. Se commitea al repo. Cada dev se copia este archivo a `.env` (sin el `.example`) y pone sus valores reales. `.env` está en `.gitignore` y NUNCA se commitea.

**Para probar localmente AHORA MISMO**, creá también tu `.env` real:

```bash
cp .env.example .env
# Editá .env y poné tu API key real de Google AI Studio
```

#### Archivo 4: `backend/app/core/config.py`

```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración central de la aplicación.

    Lee variables de entorno desde el archivo .env automáticamente.
    Si una variable no existe, usa el valor por defecto definido acá.
    """

    # Base de datos — las credenciales vienen de docker-compose.yml
    DATABASE_URL: str = (
        "postgresql://appbit_user:appbit_password@localhost:5432/appbit_database"
    )

    # Seguridad JWT — importado desde app.core.security
    SECRET_KEY: str = "cambiar-por-una-clave-segura-de-al-menos-32-caracteres"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Google Gemini — importado desde app.services.ia_agent
    IA_API_KEY: str = ""
    IA_MODEL: str = "gemini-2.0-flash"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


# Instancia ÚNICA para todo el proyecto.
# Todos los demás archivos harán: from app.core.config import settings
settings = Settings()
```

**¿Por qué `settings` en minúscula?** Porque es una instancia (un objeto), no una clase. La clase es `Settings` (PascalCase). La instancia es `settings` (snake_case). Esta distinción ES importante en Python.

#### Archivo 5: `backend/app/db/__init__.py`

Vacío. Igual que `core/__init__.py`.

#### Archivo 6: `backend/app/db/session.py`

```python
from sqlmodel import create_engine, Session, SQLModel
from app.core.config import settings

# ---------------------------------------------------------------------------
# Importar modelos — NECESARIO para que SQLModel.metadata los registre.
# Si no se importan, create_db_and_tables() NO crea ninguna tabla
# porque SQLModel solo conoce las clases que fueron importadas.
# ---------------------------------------------------------------------------
import app.models.user  # noqa: F401 — registra User en SQLModel.metadata
import app.models.mental_health  # noqa: F401 — registra MentalHealthLog


# ---------------------------------------------------------------------------
# Engine — configura la conexión a PostgreSQL
# create_engine NO conecta todavía. Solo prepara la URL.
# La conexión real se abre cuando se ejecuta la primera query.
# ---------------------------------------------------------------------------
engine = create_engine(settings.DATABASE_URL, echo=False)
# echo=True muestra cada query SQL en la consola. Útil para debugear.
# echo=False lo oculta. Mejor para producción.


# ---------------------------------------------------------------------------
# get_session — dependency de FastAPI
# FastAPI llama a esta función por CADA request.
# El yield "pausa" la función y le entrega la session al endpoint.
# Cuando el endpoint termina, el with cierra la session automáticamente.
# ---------------------------------------------------------------------------
def get_session():
    """Provee una sesión de base de datos por cada request HTTP."""
    with Session(engine) as session:
        yield session


# ---------------------------------------------------------------------------
# create_db_and_tables — crea las tablas en PostgreSQL
# Busca TODAS las clases SQLModel con table=True (User, MentalHealthLog)
# y las materializa como tablas reales.
# Solo se ejecuta UNA vez al iniciar la app.
# NO borra datos existentes si las tablas ya fueron creadas.
# ---------------------------------------------------------------------------
def create_db_and_tables():
    """Crea todas las tablas definidas en app/models/ en PostgreSQL."""
    SQLModel.metadata.create_all(engine)
```

**Concepto de `yield` (leelo dos veces):**

Cuando FastAPI ve:
```python
def mi_endpoint(session: Session = Depends(get_session)):
```

Hace esto:
1. Llama a `get_session()`
2. Ejecuta todo hasta el `yield`
3. Toma el valor del `yield` (la `session`) y se lo pasa a `mi_endpoint`
4. Ejecuta `mi_endpoint`
5. Cuando `mi_endpoint` termina, vuelve a `get_session()` y ejecuta lo que está después del `yield` (el `with` cierra la sesión)

No necesitás hacer `session.close()` nunca. FastAPI lo maneja.

#### Archivo 7: `backend/app/services/__init__.py`

Vacío.

#### Archivo 8: `backend/app/services/ia_agent.py`

**ATENCIÓN: Este archivo es un STUB (implementación falsa temporal).** Existe para que el dev de `/salud` (incidencia 04) pueda empezar a trabajar INMEDIATAMENTE sin esperar a que el dev de IA termine Gemini. Cuando la incidencia 03 esté lista, este archivo se REESCRIBE con la versión real, pero la firma de la clase NO cambia.

```python
class IAAgent:
    """Agente de IA para bienestar emocional — IMPLEMENTACIÓN STUB.

    ATENCIÓN EQUIPO: Esta es una versión temporal con respuestas
    predefinidas. El dev de la incidencia 03 va a reemplazar la
    lógica interna por llamadas reales a Google Gemini.
    La firma de la clase NO DEBE CAMBIAR para que /salud funcione
    sin modificaciones cuando se actualice.

    IMPORTANTE: Esta clase NO evalúa crisis. No recibe ni procesa
    el campo nota_semanal. La decisión de derivar al CVV es 100%
    del backend tradicional en SaludService.
    """

    def __init__(self):
        # El stub no necesita API key
        pass

    async def generar_respuesta_emocional(
        self, humor: str, nota: int, contexto: str | None
    ) -> dict[str, str]:
        """Genera un mensaje empático y acción sugerida (STUB).

        Args:
            humor: Estado emocional (valores del enum Mood: "happy",
                   "tired", "sad", "anxious", "overwhelmed").
            nota: Nivel de bienestar 1-10.
            contexto: Información adicional opcional.

        Returns:
            dict con claves "mensaje" y "accion".
        """
        respuestas = {
            "happy": {
                "mensaje": "¡Qué bueno verte así! Disfrutá este momento y guardalo en la memoria.",
                "accion": "Compartí tu energía con alguien que la necesite hoy.",
            },
            "tired": {
                "mensaje": "El descanso también es avanzar. No subestimes una pausa.",
                "accion": "Salí a caminar 15 minutos sin el celular. Solo mirá los árboles.",
            },
            "sad": {
                "mensaje": "Te escucho. No todos los días pesan lo mismo.",
                "accion": "Escuchá 'El poder de la vulnerabilidad' de Brené Brown en YouTube.",
            },
            "anxious": {
                "mensaje": "Respirá hondo conmigo. Un paso a la vez.",
                "accion": "Probá la técnica 4-7-8: inhalá 4s, retené 7s, exhalá 8s. Tres veces.",
            },
            "overwhelmed": {
                "mensaje": "No cargues todo solo. Pedir ayuda también es valentía.",
                "accion": "Elegí UNA sola tarea, la más chica, y hacela. El resto puede esperar.",
            },
        }
        return respuestas.get(humor, respuestas["sad"])
```

**Detalle importante:** Las claves del diccionario (`"happy"`, `"tired"`, etc.) DEBEN coincidir exactamente con los valores del enum `Mood` en `app/enums/mood.py`. El método `generar_respuesta_emocional` recibe el `.value` del enum, que es el string en inglés. No uses "feliz" o "cansado" como clave — usá "happy", "tired", etc.

### Verificá todo antes de seguir

```bash
# 1. ¿Config carga bien?
python -c "from app.core.config import settings; print(settings.DATABASE_URL)"
# Debe imprimir: postgresql://appbit_user:appbit_password@localhost:5432/appbit_database

# 2. ¿Engine funciona?
python -c "from app.db.session import engine; print('Engine OK')"

# 3. ¿El stub de IA es importable?
python -c "from app.services.ia_agent import IAAgent; print('Stub OK')"

# 4. ¿La app carga sin errores?
python -c "from app.main import app; print('App OK')"

# 5. CREAR LAS TABLAS EN POSTGRESQL:
python -c "from app.db.session import create_db_and_tables; create_db_and_tables(); print('Tablas creadas')"

# 6. VERIFICAR que las tablas existen:
psql -U appbit_user -d appbit_database -c "\dt"
# Debés ver dos filas: users y mental_health_logs

# 7. VERIFICAR columnas de users:
psql -U appbit_user -d appbit_database -c "\d users"
# Debés ver: id, email, hashed_password, full_name, birth_date, gender, ...

# 8. Tests existentes:
python -m pytest tests/ -v
# 30 tests verdes
```

### Errores que te vas a encontrar y cómo resolverlos

| Error | Causa más probable | Solución |
|-------|-------------------|----------|
| `ModuleNotFoundError: No module named 'app'` | Estás ejecutando Python desde una carpeta que no es `backend/` | `cd backend` y volvé a intentar |
| `ModuleNotFoundError: No module named 'pydantic_settings'` | No instalaste las dependencias o el venv no está activado | Verificá que ves `(.venv)` en el prompt. Si no, activá el venv. |
| `sqlalchemy.exc.OperationalError: could not connect to server` | PostgreSQL no está corriendo | Verificá que PostgreSQL esté activo (local: `pg_isready`, Docker: `docker compose up -d`) |
| `psycopg2.OperationalError: FATAL: password authentication failed` | Las credenciales no coinciden con docker-compose.yml | Revisá que `DATABASE_URL` tenga `appbit_user:appbit_password` |
| `IndentationError: unexpected indent` | Mezclaste tabs y espacios o pusiste espacios de más en una línea | Python usa SOLO espacios. Configurá tu editor para que el Tab inserte 4 espacios. |
| `AttributeError: 'Settings' object has no attribute '...'` | Escribiste mal el nombre del atributo | Los atributos de `Settings` son los que definiste en la clase. Verificá el typo. |

### Criterios de aceptación Incidencia 01

- [ ] `python -c "from app.core.config import settings; print(settings.DATABASE_URL)"` funciona
- [ ] `python -c "from app.db.session import engine, get_session, create_db_and_tables"` funciona
- [ ] `python -c "from app.services.ia_agent import IAAgent; print(IAAgent())"` funciona
- [ ] `create_db_and_tables()` ejecuta sin errores
- [ ] Las tablas `users` y `mental_health_logs` existen en PostgreSQL (verificado con `\dt`)
- [ ] `.env.example` existe con los 5 placeholders, sin valores reales
- [ ] Los tests existentes (30) siguen pasando
- [ ] Commit con mensaje: `feat(core): agregar config, db session y stub de IA`

---
