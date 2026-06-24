from datetime import datetime

from pydantic import Field
from sqlmodel import SQLModel

from app.enums.mood import Mood


class SaludRequest(SQLModel):
    humor: Mood
    nota_semanal: int = Field(ge=1, le=10)
    contexto: str | None = None


class SaludResponse(SQLModel):
    mensaje: str
    accion_sugerida: str
    derivar_cvv: bool
    nota_actual: int
    alerta: bool
    created_at: datetime
