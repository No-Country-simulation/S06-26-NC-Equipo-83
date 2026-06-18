from uuid import UUID
from sqlmodel import Session, select
from app.models.mental_health import MentalHealthLog


def create_mental_health_log(
    session: Session, log: MentalHealthLog
) -> MentalHealthLog:
    """Guarda un check-in emocional en la base de datos."""
    session.add(log)
    session.commit()
    session.refresh(log)
    return log


def get_logs_by_user(
    session: Session, user_id: UUID, limit: int = 10
) -> list[MentalHealthLog]:
    """Devuelve los últimos N check-ins de un usuario, ordenados del más
    reciente al más viejo (ORDER BY created_at DESC)."""
    statement = (
        select(MentalHealthLog)
        .where(MentalHealthLog.user_id == user_id)
        .order_by(MentalHealthLog.created_at.desc())  # .desc() = descendente
        .limit(limit)
    )
    return list(session.exec(statement).all())


def get_latest_log(
    session: Session, user_id: UUID
) -> MentalHealthLog | None:
    """Devuelve el check-in más reciente de un usuario, o None si nunca hizo uno."""
    statement = (
        select(MentalHealthLog)
        .where(MentalHealthLog.user_id == user_id)
        .order_by(MentalHealthLog.created_at.desc())
        .limit(1)
    )
    return session.exec(statement).first()