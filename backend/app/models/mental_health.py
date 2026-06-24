from datetime import datetime, timezone
from uuid import UUID, uuid4
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship

from app.enums.mood import Mood


class MentalHealthLog(SQLModel, table=True):
    __tablename__ = "mental_health_logs"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True
    )

    user_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        ondelete="CASCADE"
    )

    # Datos enviados por el usuario
    # Almacena el valor del enum (ej: "depressed"), no el nombre (DEPRESSED)
    mood: Mood = Field(nullable=False)

    weekly_score: int = Field(
        nullable=False,
        ge=1,
        le=10
    )

    context: Optional[str] = Field(default=None)

    # Respuesta generada por IA
    response_message: str = Field(nullable=False)

    suggested_action: str = Field(nullable=False)

    derivate_cvv: bool = Field(default=False)

    alert_triggered: bool = Field(default=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user: "User" = Relationship(
        back_populates="mental_health_logs"
    )