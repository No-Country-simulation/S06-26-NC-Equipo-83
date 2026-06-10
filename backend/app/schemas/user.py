from datetime import date, datetime
from uuid import UUID

from pydantic import EmailStr
from sqlmodel import SQLModel

from app.enums.career_objective import CareerObjective
from app.enums.professional_level import ProfessionalLevel


class UserCreate(SQLModel):
    email: EmailStr
    password: str

    full_name: str
    birth_date: date
    gender: str
    education_level: str

    continent: str
    country: str
    state: str
    city: str
    whatsapp: str

    professional_level: ProfessionalLevel
    tech_area: str
    career_objective: CareerObjective


class UserResponse(SQLModel):
    id: UUID

    email: EmailStr

    full_name: str
    birth_date: date
    gender: str
    education_level: str

    continent: str
    country: str
    state: str
    city: str
    whatsapp: str

    professional_level: ProfessionalLevel
    tech_area: str
    career_objective: CareerObjective

    created_at: datetime


class UserLogin(SQLModel):
    email: EmailStr
    password: str


class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"