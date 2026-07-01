from datetime import date, datetime
from uuid import UUID

from pydantic import EmailStr
from sqlmodel import SQLModel

from app.enums.career_objective import CareerObjective
from app.enums.professional_level import ProfessionalLevel
from typing import Optional, List


class UserCreate(SQLModel):
    email: EmailStr
    password: str
    full_name: str
    birth_date: date
    gender: str
    education_level: str

    continent_code: str
    continent_name: str
    country_code: str
    country_name: str
    state_code: str
    state_name: str
    city_name: str
    whatsapp_e164: str

    language_code: str = "es"

    # ── Nuevos campos profesionales ────────────────────────────────────
    current_situation: str
    work_sector: Optional[str] = None
    seniority: Optional[str] = None
    interest_areas: list[str] = []
    current_search: Optional[str] = None
    known_technologies: list[dict] = []
    bio: Optional[str] = None

    # ── Campos legacy (nullable — ya no se usan en registro) ───────────
    professional_level: Optional[ProfessionalLevel] = None
    tech_area: Optional[str] = None
    career_objective: Optional[CareerObjective] = None


class UserResponse(SQLModel):
    id: UUID

    email: EmailStr
    full_name: str
    birth_date: date
    gender: str
    education_level: str

    continent_code: str
    continent_name: str
    country_code: str
    country_name: str
    state_code: str
    state_name: str
    city_name: str
    whatsapp_e164: str

    language_code: str

    # ── Step 3 v3 — nuevos campos ─────────────────────────────────────
    current_situation: str
    work_sector: Optional[str] = None
    seniority: Optional[str] = None
    interest_areas: list[str] = []
    current_search: Optional[str] = None
    known_technologies: list[dict] = []
    bio: Optional[str] = None

    # ── Legacy (nullable para usuarios nuevos) ────────────────────────
    professional_level: Optional[ProfessionalLevel] = None
    tech_area: Optional[str] = None
    career_objective: Optional[CareerObjective] = None

    created_at: datetime


class UserLogin(SQLModel):
    email: EmailStr
    password: str


class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"


class RegisterResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
