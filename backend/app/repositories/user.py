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
