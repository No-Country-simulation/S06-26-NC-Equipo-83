"""Experiencias Estructurantes — schemas de request/response.

Sin dependencia de base de datos: todo se resuelve con el dataset Vísent CDRView
cargado en memoria desde los CSVs en EXPERIENCIAS_ESTRUCTURANTES/.
"""

from typing import List, Optional
from sqlmodel import SQLModel


class ExperienciasRequest(SQLModel):
    lat: float
    lng: float
    hora_actual: str = "TARDE"  # MADRUGADA | MANHA | TARDE | NOITE
    edad: Optional[int] = None
    area: Optional[str] = None
    objetivo: Optional[str] = None


class CoberturaInfo(SQLModel):
    calidad: str  # buena | regular | baja
    drop_pct: float
    congestion: float
    n_usuarios: int
    periodo: str


class EventoCercano(SQLModel):
    titulo: str
    tipo: str  # presencial | online | grabado
    cluster: str
    lat: float
    lon: float
    asistentes_estimados: int
    categoria: str
    edad_recomendada: str
    url: Optional[str] = None  # link a Jitsi / video grabado
    meeting_url: Optional[str] = None  # link personalizado (Google Meet, etc.)


class DestinoPopular(SQLModel):
    cluster: str
    municipio: str
    n_usuarios: int
    dist_km: float
    periodo_predominante: str


class ContenidoOffline(SQLModel):
    titulo: str
    tipo: str  # video | lectura | ejercicio
    duracion: str
    descripcion: str


class ExperienciasResponse(SQLModel):
    cluster_cercano: str
    cobertura: CoberturaInfo
    eventos_cercanos: List[EventoCercano]
    destinos_populares: List[DestinoPopular]
    contenido_offline: List[ContenidoOffline]
