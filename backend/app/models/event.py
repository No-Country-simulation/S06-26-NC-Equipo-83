from datetime import datetime, timezone
from uuid import UUID, uuid4
from typing import Optional

from sqlmodel import SQLModel, Field


class Event(SQLModel, table=True):
    __tablename__ = "events"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)

    title: str = Field(nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    tipo: str = Field(nullable=False)  # online | presencial | grabado
    categoria: str = Field(default="crecimiento", nullable=False)

    event_date: Optional[datetime] = Field(default=None)

    # Creator
    created_by: UUID = Field(foreign_key="users.id", nullable=False)

    # Jitsi room — auto-generado desde title (fallback si no hay meeting_url)
    jitsi_room: str = Field(nullable=False)

    # Link personalizado (Google Meet, Jitsi custom, Zoom, etc.)
    meeting_url: Optional[str] = Field(default=None, max_length=500)

    is_live: bool = Field(default=False)

    # Cluster de Florianópolis al que pertenece (opcional)
    cluster: Optional[str] = Field(default=None)

    # Ubicación (ciudad / zona — texto corto)
    location: Optional[str] = Field(default=None, max_length=300)

    # Dirección detallada (calle, número, etc. — para eventos presenciales)
    address: Optional[str] = Field(default=None, max_length=500)

    max_participants: Optional[int] = Field(default=None)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
