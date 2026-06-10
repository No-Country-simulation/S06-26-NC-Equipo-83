from datetime import datetime, timezone, date
from uuid import UUID, uuid4
from typing import List

from sqlmodel import SQLModel, Field, Relationship

from app.enums.professional_level import ProfessionalLevel
from app.enums.career_objective import CareerObjective


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True
    )

    # Datos Personales
    email: str = Field(
        unique=True,
        index=True,
        nullable=False
    )

    hashed_password: str = Field(nullable=False)

    full_name: str = Field(nullable=False)

    birth_date: date = Field(nullable=False)

    gender: str = Field(nullable=False)

    education_level: str = Field(nullable=False)

    continent: str = Field(nullable=False)

    country: str = Field(
        nullable=False,
        index=True
    )

    state: str = Field(nullable=False)

    city: str = Field(
        nullable=False,
        index=True
    )

    whatsapp: str = Field(nullable=False)

    # Datos Profesionales
    professional_level: ProfessionalLevel = Field(
        nullable=False,
        index=True
    )

    tech_area: str = Field(
        nullable=False,
        index=True
    )

    career_objective: CareerObjective = Field(
        nullable=False
    )

    # Auditoría
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relaciones
    mental_health_logs: List["MentalHealthLog"] = Relationship(
        back_populates="user"
    )