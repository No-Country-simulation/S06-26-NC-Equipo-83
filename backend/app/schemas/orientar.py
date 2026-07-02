from typing import List, Optional

from sqlmodel import SQLModel


class OrientarRequest(SQLModel):
    perfil: str
    nivel: str
    region: str
    idioma: str
    lat: float
    lng: float


class CourseRecommendation(SQLModel):
    """Resumen de un curso recomendado para la UI."""
    title: str
    provider: str
    duration: str
    url: Optional[str] = None


class JobMatchDetail(SQLModel):
    """Detalle completo de una vacante con gap y cursos por skill."""
    id: str
    title: str
    company: str
    location: str
    description: str
    area: str
    seniority: str
    salary: Optional[str] = None
    gap_porcentual: float
    matched_skills: List[str]
    missing_skills: List[str]
    required_skills: List[str]
    optional_skills: List[str]
    recommended_courses: List[CourseRecommendation]


class OrientarResponse(SQLModel):
    gap_porcentual: float
    gap_items: List[str]
    trayectoria_sugerida: List[str]
    vacantes_compatibles: List[JobMatchDetail]
    confianza: float
