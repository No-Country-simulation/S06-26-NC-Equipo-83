from sqlalchemy import event
import pytest
from sqlmodel import SQLModel, Session, create_engine
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import get_session
from sqlalchemy.pool import StaticPool

@pytest.fixture
def engine():
    engine = create_engine(
    "sqlite://",
    echo=False,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys = ON")
        cursor.close()

    SQLModel.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture
def db_session(engine):
    with Session(engine) as session:
        yield session

#def override_get_session(db_session):
#   yield db_session


@pytest.fixture
def client(db_session):
    app.dependency_overrides[get_session] = lambda: db_session

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()
