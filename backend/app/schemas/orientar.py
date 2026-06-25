from typing import List
from uuid import UUID

from sqlmodel import SQLModel


class OrientarRequest(SQLModel):
    usuario_id: UUID
    perfil: str
    nivel: str
    region: str
    idioma: str
    lat: float
    lng: float


class VacancyResponse(SQLModel):
    id: str
    title: str
    company: str
    match_percentage: float


class OrientarResponse(SQLModel):
    gap_porcentual: float
    gap_items: List[str]
    trayectoria_sugerida: List[str]
    vacantes_compatibles: List[VacancyResponse]
    confianza: float