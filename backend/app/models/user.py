from datetime import datetime, timezone, date
from uuid import UUID, uuid4
from typing import List, Optional
import phonenumbers

from pydantic import field_validator
from sqlmodel import SQLModel, Field, Relationship

from app.enums.professional_level import ProfessionalLevel
from app.enums.career_objective import CareerObjective
from sqlalchemy import Column, String, JSON as SAJSON


# ---------------------------------------------------------------------------
# Constantes de continente — mapeo código → nombre
# ---------------------------------------------------------------------------
CONTINENT_BY_CODE: dict[str, str] = {
    "AM": "América",
    "EU": "Europa",
    "AF": "África",
    "AS": "Asia",
    "OC": "Oceanía",
}


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
    )

    # ── Datos Personales ──────────────────────────────────────────────────

    email: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    full_name: str = Field(nullable=False)
    birth_date: date = Field(nullable=False)
    gender: str = Field(nullable=False)
    education_level: str = Field(nullable=False)

    # ── Datos Geográficos (código ISO + nombre legible) ───────────────────

    continent_code: str = Field(max_length=2, nullable=False)
    continent_name: str = Field(nullable=False)
    country_code: str = Field(max_length=2, nullable=False, index=True)
    country_name: str = Field(nullable=False)
    state_code: str = Field(nullable=False)
    state_name: str = Field(nullable=False)
    city_name: str = Field(nullable=False, index=True)

    # ── WhatsApp validado en E.164 ───────────────────────────────────────

    whatsapp_e164: str = Field(nullable=False)

    # ── Idioma (es para español, pt para portugués) ──────────────────────

    language_code: str = Field(default="es", max_length=2, nullable=False)

        # ── Datos Profesionales ──────────────────────────────────────────────

    current_situation: str = Field(nullable=False)

    work_sector: Optional[str] = Field(default=None)
    seniority: Optional[str] = Field(default=None)

    interest_areas: list[str] = Field(
        default=[],
        sa_column=Column(SAJSON),
    )
    current_search: Optional[str] = Field(default=None)

    known_technologies: list[dict] = Field(
        default=[],
        sa_column=Column(SAJSON),
    )

    bio: Optional[str] = Field(default=None, max_length=500)

    # ── Campos legacy (nullable — ya no se usan en registro) ─────────────

    professional_level: Optional[ProfessionalLevel] = Field(
        default=None,
        index=True,
    )
    tech_area: Optional[str] = Field(default=None, index=True)
    career_objective: Optional[CareerObjective] = Field(default=None)

    # ── Auditoría ────────────────────────────────────────────────────────

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relaciones ───────────────────────────────────────────────────────

    mental_health_logs: List["MentalHealthLog"] = Relationship(
        back_populates="user",
    )

    # ── Validadores Pydantic ─────────────────────────────────────────────

    @field_validator("whatsapp_e164")
    @classmethod
    def validate_e164(cls, v: str) -> str:
        """Valida E.164 estricto usando Google libphonenumber (pypi: phonenumbers).

        Corre durante la construcción del modelo (antes de tocar la DB).
        Si falla, FastAPI devuelve automáticamente 422.
        """
        try:
            parsed = phonenumbers.parse(v, None)
        except phonenumbers.NumberParseException:
            raise ValueError(
                f"No se pudo interpretar '{v}' como número telefónico internacional."
            )

        if not phonenumbers.is_valid_number(parsed):
            raise ValueError(
                f"El número '{v}' no es válido según el plan de numeración internacional."
            )

        # Reformatear a E.164 canónico (ej: +5491161234567)
        e164 = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        return e164
