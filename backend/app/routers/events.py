from fastapi import APIRouter, Depends, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.event import Event
from app.schemas.event import EventCreate, EventResponse, EventListResponse

router = APIRouter(prefix="/events", tags=["events"])


def _slugificar(titulo: str) -> str:
    return titulo.lower().replace(":", "").replace("ñ", "n").replace(" ", "-")[:40]


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    data: EventCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    jitsi_room = f"AppBiT-{_slugificar(data.title)}-{current_user.id.hex[:6]}"
    event = Event(
        title=data.title,
        description=data.description,
        tipo=data.tipo,
        categoria=data.categoria,
        event_date=data.event_date,
        created_by=current_user.id,
        jitsi_room=jitsi_room,
        meeting_url=data.meeting_url,
        cluster=data.cluster,
        location=data.location,
        address=data.address,
        max_participants=data.max_participants,
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


@router.get("", response_model=EventListResponse)
def list_events(
    cluster: str | None = None,
    upcoming: bool = True,
    limit: int = 20,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    query = select(Event).order_by(Event.created_at.desc())
    if cluster:
        query = query.where(Event.cluster == cluster)
    if upcoming:
        from datetime import datetime, timezone
        query = query.where(
            (Event.event_date >= datetime.now(timezone.utc)) | (Event.event_date.is_(None))
        )
    query = query.limit(limit)
    results = session.exec(query).all()
    return EventListResponse(eventos=results, total=len(results))


@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from uuid import UUID
    event = session.get(Event, UUID(event_id))
    if not event:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return event
