from datetime import datetime
from uuid import UUID
from typing import Optional, List

from sqlmodel import SQLModel


class EventCreate(SQLModel):
    title: str
    description: Optional[str] = None
    tipo: str = "online"  # online | presencial | grabado
    categoria: str = "crecimiento"
    event_date: Optional[datetime] = None
    cluster: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    meeting_url: Optional[str] = None
    max_participants: Optional[int] = None


class EventResponse(SQLModel):
    id: UUID
    title: str
    description: Optional[str]
    tipo: str
    categoria: str
    event_date: Optional[datetime]
    created_by: UUID
    jitsi_room: str
    meeting_url: Optional[str]
    is_live: bool
    cluster: Optional[str]
    location: Optional[str]
    address: Optional[str]
    max_participants: Optional[int]
    created_at: datetime


class EventListResponse(SQLModel):
    eventos: List[EventResponse]
    total: int
