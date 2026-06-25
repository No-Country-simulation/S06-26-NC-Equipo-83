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
#
# drop_all=True solo se usa para migraciones de esquema manuales (one-shot).
# NO dejar drop_all=True en producción. Ejecutar una vez y revertir:
#   python -c "from app.db.session import create_db_and_tables; create_db_and_tables(drop_all=True)"
# ---------------------------------------------------------------------------
def create_db_and_tables(drop_all: bool = False):
    """Crea todas las tablas definidas en app/models/ en PostgreSQL.

    Args:
        drop_all: Si True, elimina todas las tablas antes de recrearlas.
                  SOLO para migraciones de esquema one-shot. Default False.
    """
    if drop_all:
        SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
