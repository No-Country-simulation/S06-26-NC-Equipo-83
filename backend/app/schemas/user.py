from datetime import date, datetime
import re
from uuid import UUID

from pydantic import EmailStr, Field, field_validator
from sqlmodel import SQLModel

from app.enums.career_objective import CareerObjective
from app.enums.professional_level import ProfessionalLevel
from typing import Optional, List


class UserCreate(SQLModel):
    email: EmailStr
    password: str = Field(
        ..., 
        min_length=8, 
        description="La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo."
    )
    full_name: str = Field(
        ...,
        min_length=3,
        description= "Debe ingresar un nombre de al menos 3 caracteres"
    )
    birth_date: date
 
    gender: str
    education_level: str = Field(
        ...,
        min_length=4,
        description="Debe ingresar un nivel de educacion valido"
    )
# Lo referido a ubicacion geografica se esta validando en el model
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
    current_situation: str = Field(
        ...,
        min_length=4,
        description="Debe ingresar su situacion actual"
    )
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

    # Validacion password
    @field_validator("password")
    @classmethod
    def validar_complejidad_password(cls, v: str) -> str:
        # 1. Quitar espacios en blanco al inicio y al final
        password_limpia = v.strip()
        
        if len(password_limpia) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres (sin contar espacios vacíos).")
            
        # 2. Expresiones regulares para cada criterio solicitado
        if not re.search(r"[A-Z]", password_limpia):
            raise ValueError("La contraseña debe contener al menos una letra mayúscula.")
            
        if not re.search(r"[a-z]", password_limpia):
            raise ValueError("La contraseña debe contener al menos una letra minúscula.")
            
        if not re.search(r"[0-9]", password_limpia):
            raise ValueError("La contraseña debe contener al menos un número.")
            
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_+\-\[\]\\\/~`=;]", password_limpia):
            raise ValueError("La contraseña debe contener al menos un carácter especial (símbolo).")
            
        return password_limpia
    
    @field_validator("full_name")
    @classmethod
    def validate_name(cls, name : str) -> str:
        if cls.is_empty_string_validator(name):
            raise ValueError("El nombre no puede estar vacio")
        return name

    #Validacion edad

    @field_validator("birth_date")
    @classmethod
    def validate_age(cls, value: date) -> date:
        today = date.today()

        age = today.year - value.year
        if (today.month, today.day) < (value.month, value.day):
            #Se resta uno porque todavia no cumplio el año corriente
            age -= 1

        if age < 16:
            raise ValueError("Debe ser mayor de 16 años")

        if age > 120:
            raise ValueError("La edad máxima permitida es 120 años")

        return value
    
    @field_validator("education_level")
    @classmethod
    def validate_level(cls, elevel : str) -> str:
        if cls.is_empty_string_validator(elevel):
            raise ValueError("El campo no puede estar vacio")
        return elevel
    

    
    def is_empty_string_validator(string : str) -> bool:
        value = string.strip()
        return not value

    @field_validator("gender")
    @classmethod
    def gender_validator(cls, value:str) -> str:
        if value != "female" and value != "male":
            raise ValueError("Genero incorrecto")
        
        if cls.is_empty_string_validator(value):
            raise ValueError("Genero no puede estar vacio") 

        return value
    
    @field_validator("language_code")
    @classmethod
    def validate_lang(cls, lang : str) -> str:
        if cls.is_empty_string_validator(lang):
            raise ValueError("Debe ingresar un codigo de lenguaje")
        return lang

    @field_validator("current_situation")
    @classmethod
    def validate_situation(cls, situation : str) -> str:
        if cls.is_empty_string_validator(situation):
            raise ValueError("La situacion actual no debe estar vacia")
        return situation


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

class UserUpdate(SQLModel):
    """Schema para actualización parcial del perfil.

    Todos los campos son opcionales. Solo se actualizan los campos
    que vienen en el request (exclude_unset=True en el service).
    """
    full_name: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    education_level: Optional[str] = None

    continent_code: Optional[str] = None
    continent_name: Optional[str] = None
    country_code: Optional[str] = None
    country_name: Optional[str] = None
    state_code: Optional[str] = None
    state_name: Optional[str] = None
    city_name: Optional[str] = None
    whatsapp_e164: Optional[str] = None

    language_code: Optional[str] = None

    # ── Campos profesionales v3 ──────────────────────────────────────
    current_situation: Optional[str] = None
    work_sector: Optional[str] = None
    seniority: Optional[str] = None
    interest_areas: Optional[list[str]] = None
    current_search: Optional[str] = None
    known_technologies: Optional[list[dict]] = None
    bio: Optional[str] = None 


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
