## INCIDENCIA 01b — Migración a Supabase

## Resumen

Esta incidencia migra la conexión a base de datos de PostgreSQL local a Supabase en la nube. Actualiza los archivos de configuración para que el proyecto use la connection string de Supabase, elimina el default `localhost` que ya no tiene sentido cuando la base está en la nube, y configura la conexión para usar el pooler de Supabase (puerto 6543) que maneja SSL del lado del servidor. Al terminar, todos los devs podrán conectarse a la misma base compartida en la nube sin necesidad de instalar ni levantar PostgreSQL en sus máquinas.

**Rama:** `incidencia/01b-supabase-migration`  
**Duración estimada:** 2 horas.  
**Depende de:** 01 completada.  
**Asignada a:** 1 dev.  
**Por qué esta incidencia existe:** El proyecto original usaba PostgreSQL local vía Docker, pero la decisión arquitectónica final fue usar Supabase como base de datos en la nube. Si no se migra la configuración, un dev nuevo que clone el repo y haga `cp .env.example .env` va a intentar conectarse a `localhost:5432`, donde no hay nada corriendo. Además, el default `localhost` en `config.py` es un antipatrón de seguridad cuando la base es un servicio cloud con credenciales reales.

### ¿Qué vas a aprender de Python y bases de datos en esta incidencia?

| Concepto | ¿Qué es? |
|----------|---------|
| Connection string de Supabase | URI con formato `postgresql://postgres.[REF]:[PASSWORD]@[HOST]:[PUERTO]/postgres` — distinta a la URI de PostgreSQL local |
| Transaction Pooler (PgBouncer) | Supabase expone dos puertos: 5432 (conexión directa) y 6543 (pooler). El pooler administra un pool de conexiones y maneja SSL del lado del servidor — ideal para FastAPI |
| SSL/TLS en PostgreSQL | Las conexiones a Supabase son encriptadas. Con el pooler (6543), SSL es implícito. Con conexión directa (5432), necesitás `?sslmode=require` |
| `create_engine(connect_args={...})` | SQLAlchemy/SQLModel permite pasar argumentos extra al driver de PostgreSQL, como `sslmode` |
| Defaults vs secretos en `BaseSettings` | Una variable que contiene una URI cloud real NO debe tener un default `localhost`. Debe ser `str = ""` para que falle fuerte si el `.env` no existe, en vez de conectar silenciosamente a una base inexistente |
| `.env` vs `.env.example` | El `.env` contiene secretos reales (NUNCA se commitea). El `.env.example` es un template con placeholders que SÍ se commitea para que el próximo dev sepa qué variables necesita |

### Pre-lectura (15 min)

| Archivo | Pregunta que responde |
|---------|----------------------|
| `app/core/config.py` | ¿Qué default tiene `DATABASE_URL` hoy? (vas a modificarlo) |
| `app/db/session.py` | ¿El `create_engine()` actual usa `connect_args`? (vas a evaluar si necesita SSL) |
| `.env.example` | ¿Qué formato tiene la URI de conexión actual? (vas a cambiarlo al formato Supabase) |
| Supabase Dashboard → Project Settings → Database | ¿Cuál es tu connection string real? La necesitás para tu `.env` local |

### Concepto clave: Pooler vs Conexión Directa (leelo dos veces)

Supabase te da DOS connection strings en el dashboard. No son intercambiables:

| Tipo | Puerto | SSL | Ventaja | Cuándo usarlo |
|------|--------|-----|---------|---------------|
| **Transaction Pooler** | 6543 | SSL implícito (servidor) | Maneja pool de conexiones, no saturás el límite del plan gratuito | ✅ FastAPI, aplicaciones web |
| **Direct** | 5432 | Requiere `?sslmode=require` en la URI | Conexión sin intermediario, compatible con todas las queries | pgAdmin, migraciones con Alembic, `psql` |

**Para este proyecto usamos el POOLER (6543).** ¿Por qué? FastAPI abre y cierra una conexión por cada request. Sin pooler, con 10 requests simultáneos abrís 10 conexiones directas a Supabase. El plan gratuito tiene límite de conexiones simultáneas. El pooler las administra por vos — las recicla, no las acumula.

**¿Qué pasa con SSL?** En el pooler, Supabase ya encripta la comunicación del lado del servidor. No necesitás agregar `?sslmode=require` a la URI ni `connect_args={"sslmode": "require"}` en `create_engine()`. La connection string del pooler NO incluye `sslmode` — y está bien que así sea.

### Antes de codear: flujo git

```bash
git checkout incidencia/01-fundacion
git pull origin incidencia/01-fundacion
git checkout -b incidencia/01b-supabase-migration
```

**¿Por qué desde `incidencia/01-fundacion` y no desde `main`?** Porque esta incidencia modifica archivos que existen gracias a la 01. Si la rama de la 01 todavía no mergeó a main (y probablemente no, porque es parte de la misma tanda), necesitás basarte en ella para no perder los cambios.

### Paso a paso — ORDEN ESTRICTO

---

#### Paso 0: Obtené tu connection string de Supabase

Andá a [Supabase Dashboard](https://supabase.com/dashboard) → seleccioná tu proyecto → **Project Settings** (ícono de engranaje abajo a la izquierda) → **Database** → Scroll hasta **Connection string**.

Copiá la que dice **Transaction Pooler** (no la Direct). Va a tener este formato:

```
postgresql://postgres.[REF]:[TU-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**IMPORTANTE:** En el string, `[TU-PASSWORD]` va a ser la password que configuraste al crear el proyecto. Si la olvidaste, en esa misma pantalla tenés **Reset database password**.

#### Archivo 1: `backend/.env` — tu URI real (NO se commitea)

Abrí tu archivo `.env` (el que creaste con `cp .env.example .env` durante la incidencia 01). Reemplazá la línea de `DATABASE_URL`:

```env
# Antes (localhost):
DATABASE_URL=postgresql://appbit_user:appbit_password@localhost:5432/appbit_database

# Después (Supabase pooler):
DATABASE_URL=postgresql://postgres.[REF]:[TU-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**¿Por qué el usuario es `postgres.[REF]` y la base es `postgres`?** Es la convención de Supabase. El `[REF]` es un identificador único de tu proyecto (ej: `abcdefghijklmnop`). La base por defecto se llama `postgres`. No la renombres a `appbit_database` — en Supabase usamos la default.

**El resto de variables (`SECRET_KEY`, `IA_API_KEY`, etc.) no se tocan.** Esta incidencia solo cambia la conexión a base de datos.

#### Archivo 2: `backend/.env.example` — template para otros devs

Abrí `.env.example`. Cambiá la línea de `DATABASE_URL` por el formato de Supabase con placeholders genéricos:

```env
DATABASE_URL=postgresql://postgres.[REF]:[TU-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
SECRET_KEY=cambiar-por-una-clave-segura-de-al-menos-32-caracteres
ACCESS_TOKEN_EXPIRE_MINUTES=30
IA_API_KEY=tu-api-key-de-google-ai-studio
IA_MODEL=gemini-2.0-flash
```

**DETALLE CRÍTICO:** `[REF]`, `[TU-PASSWORD]`, `[REGION]` son PLACEHOLDERS, no tus valores reales. Cuando un dev nuevo haga `cp .env.example .env`, va a ver estos placeholders y va a saber exactamente qué reemplazar con la connection string de su proyecto Supabase.

**¿Por qué no dejamos las credenciales de un proyecto compartido?** Porque si tu password de Supabase se commitea al repo, cualquiera con acceso al repo puede conectarse a tu base y leer/escribir/borrar datos. `.env` está en `.gitignore` por esta razón exacta.

#### Archivo 3: `backend/app/core/config.py` — quitar default de localhost

Actualmente `DATABASE_URL` tiene este default:

```python
DATABASE_URL: str = (
    "postgresql://appbit_user:appbit_password@localhost:5432/appbit_database"
)
```

Cambialo por:

```python
DATABASE_URL: str = ""
```

**¿Por qué un string vacío y no directamente sin default?** Si ponés `DATABASE_URL: str` sin default, `pydantic_settings` va a exigir que la variable exista en `.env` o en el entorno. Si no existe, `Settings()` lanza `ValidationError` con un mensaje críptico tipo _"field required"_. Con `= ""`, el error va a ser un `OperationalError: could not translate host name` de SQLAlchemy, que es más fácil de debuggear porque te dice exactamente _"no sé a qué conectarme, ¿está tu .env?"_.

**¿Qué pasa con el resto de defaults (`SECRET_KEY`, `IA_API_KEY`)?** Esos NO se tocan. Siguen teniendo defaults de desarrollo. La única variable que necesita este tratamiento es `DATABASE_URL` porque pasó de ser un recurso local a un servicio cloud con URI secreta.

#### Archivo 4: `backend/app/db/session.py` — verificar SSL

Abrí `session.py`. Buscá la línea:

```python
engine = create_engine(settings.DATABASE_URL, echo=False)
```

**Si usaste el pooler (puerto 6543):** NO toques nada. El pooler maneja SSL del lado del servidor. No necesitás `connect_args`.

**Si usaste conexión directa (puerto 5432):** Necesitás agregar SSL explícito:

```python
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={"sslmode": "require"},
)
```

**¿Cómo sé cuál tengo?** Mirá tu URI. Si dice `pooler.supabase.com` y el puerto es `6543` → pooler, no toques nada. Si dice `db.[REF].supabase.co` y el puerto es `5432` → directa, agregá `connect_args`.

**Recomendación:** Usá el pooler. Vas a ver la diferencia el día que tu app reciba 20 requests simultáneos.

### Verificá todo antes de seguir

```bash
# 1. ¿Config carga la URI de Supabase?
python -c "from app.core.config import settings; print(settings.DATABASE_URL)"
# Debe imprimir tu URI completa con pooler.supabase.com, NO localhost

# 2. ¿Engine puede conectarse?
python -c "from app.db.session import engine; print('Engine OK')"

# 3. ¿El stub de IA sigue siendo importable? (no debería romperse, pero verificá)
python -c "from app.services.ia_agent import IAAgent; print('Stub OK')"

# 4. ¿La app carga sin errores?
python -c "from app.main import app; print('App OK')"

# 5. CREAR LAS TABLAS EN SUPABASE:
python -c "from app.db.session import create_db_and_tables; create_db_and_tables(); print('Tablas creadas')"

# 6. VERIFICAR que las tablas existen en Supabase:
# Desde el Dashboard de Supabase: SQL Editor > New Query > ejecutá:
# SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
# Debés ver: users, mental_health_logs

# 7. VERIFICAR columnas de users:
# En el SQL Editor de Supabase:
# SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';
# Debés ver: id, email, hashed_password, full_name, birth_date, gender, ...

# 8. Tests existentes:
python -m pytest tests/ -v
# Los tests que NO dependen de base de datos deben seguir pasando
```

### Errores que te vas a encontrar y cómo resolverlos

| Error | Causa más probable | Solución |
|-------|-------------------|----------|
| `ModuleNotFoundError: No module named 'app'` | Estás ejecutando Python desde una carpeta que no es `backend/` | `cd backend` y volvé a intentar |
| `sqlalchemy.exc.OperationalError: could not translate host name` | La URI está mal copiada, o `.env` no existe, o el default `""` está activo | Revisá que `.env` tenga `DATABASE_URL` con tu URI real, sin espacios ni saltos de línea |
| `psycopg2.OperationalError: FATAL: password authentication failed` | La password en la URI no coincide con la de Supabase | En Supabase Dashboard → Project Settings → Database → Reset database password. Copiá la nueva URI completa. |
| `SSL connection has been closed unexpectedly` o `SSL SYSCALL error` | Usaste conexión directa (5432) sin `?sslmode=require` | Agregá `connect_args={"sslmode": "require"}` en `create_engine()`, o mejor: usá la URI del pooler (6543) |
| `psycopg2.OperationalError: remaining connection slots are reserved` | Superaste el límite de conexiones del plan gratuito de Supabase | Cambiá a la URI del pooler (puerto 6543). El pooler recicla conexiones en vez de abrir nuevas. |
| `psycopg2.OperationalError: no pg_hba.conf entry` | Supabase está rechazando tu IP (solo si usás conexión directa) | En Dashboard → Project Settings → Database, desmarcá "Use connection pooler" temporalmente o agregá tu IP en las restricciones de red |
| `ValidationError: field required` | Quitaste el default pero el `.env` no tiene la variable | Volvé a poner `DATABASE_URL: str = ""` (string vacío como default) y asegurate de que `.env` tenga la variable |
| `IndentationError: unexpected indent` | Mezclaste tabs y espacios | Python usa SOLO espacios. 4 espacios por nivel de indentación. |

### Criterios de aceptación Incidencia 01b

- [ ] `.env` contiene la URI real de Supabase con pooler (puerto 6543), NO localhost
- [ ] `.env.example` muestra el formato de Supabase con placeholders `[REF]`, `[TU-PASSWORD]`, `[REGION]`
- [ ] `config.py` tiene `DATABASE_URL: str = ""` (sin default hardcodeado a localhost)
- [ ] `python -c "from app.core.config import settings; print(settings.DATABASE_URL)"` imprime la URI de Supabase desde el `.env`
- [ ] `python -c "from app.db.session import engine, get_session, create_db_and_tables"` funciona
- [ ] `create_db_and_tables()` ejecuta contra Supabase sin errores
- [ ] Las tablas `users` y `mental_health_logs` existen en Supabase (verificado desde Dashboard → SQL Editor)
- [ ] Los tests existentes que no dependen de base de datos local siguen pasando
- [ ] Commit con mensaje: `feat(core): migrar conexion de base de datos a Supabase`

---
