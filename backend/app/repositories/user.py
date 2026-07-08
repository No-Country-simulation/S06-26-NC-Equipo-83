from uuid import UUID
from sqlmodel import Session, select
from app.models.user import User


def get_user_by_email(session: Session, email: str) -> User | None:
    """Busca un usuario por email. Retorna None si no existe.

    select(User)          → SELECT * FROM users
    .where(User.email == email) → WHERE email = '...'
    session.exec()        → ejecuta la query
    .first()              → primer resultado o None
    """
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def get_user_by_id(session: Session, user_id: UUID) -> User | None:
    """Busca un usuario por ID (primary key).

    session.get() es un atajo para buscar por PK.
    Es más rápido que select() + where() para este caso.
    """
    return session.get(User, user_id)


def create_user(session: Session, user: User) -> User:
    """Inserta un nuevo usuario en la base de datos.

    IMPORTANTE: Recibe una instancia de User YA CONSTRUIDA,
    con la contraseña YA HASHEADA. Este repositorio no hashea —
    eso es responsabilidad del service.

    session.add()     → marca el objeto para INSERT (no lo ejecuta aún)
    session.commit()  → ejecuta TODAS las operaciones pendientes en la DB
    session.refresh() → recarga el objeto con los datos que generó la DB
                         (id autogenerado, created_at, etc.)
    """
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
    
def update_user(session: Session, user: User, data: dict) -> User:
    """Actualiza los campos del usuario con los valores del diccionario.

    Solo los campos cuyos valores NO son None se sobreescriben.
    Se usa setattr() para no hardcodear nombres de campo — si el
    schema UserUpdate cambia, esta función no necesita modificarse.

    session.add()  → marca el objeto para UPDATE
    session.commit() → persiste los cambios en la DB
    session.refresh() → recarga los datos (updated_at, etc.)
    """
    for key, value in data.items():
        if value is not None and hasattr(user, key):
            setattr(user, key, value)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user