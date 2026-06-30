from datetime import date
from uuid import UUID

import pytest

from app.models.user import User
from app.models.mental_health import MentalHealthLog


def test_create_user(session):
    user = User(
    email="relations@test.com",
    hashed_password="hashed",
    full_name="Relations Test",
    birth_date=date(1995, 6, 15),
    gender="female",
    education_level="university",

    continent_code="AM",
    continent_name="América",

    country_code="AR",
    country_name="Argentina",

    state_code="B",
    state_name="Buenos Aires",

    city_name="San Justo",

    whatsapp_e164="+549111111112",

    language_code="es",

    current_situation="looking_for_job",

    professional_level="junior",
    tech_area="backend",
    career_objective="find_job",
)
    session.add(user)
    session.commit()
    session.refresh(user)

    assert isinstance(user.id, UUID)
    assert user.email == "relations@test.com"
    assert user.full_name == "Relations Test"


def test_create_mental_health_log_linked_to_user(session):
    user = User(
    email="log@test.com",
    hashed_password="hashed",
    full_name="Relations Test",
    birth_date=date(1995, 6, 15),
    gender="female",
    education_level="university",

    continent_code="AM",
    continent_name="América",

    country_code="AR",
    country_name="Argentina",

    state_code="B",
    state_name="Buenos Aires",

    city_name="San Justo",

    whatsapp_e164="+549111111112",

    language_code="es",

    current_situation="looking_for_job",

    professional_level="junior",
    tech_area="backend",
    career_objective="find_job",
)
    session.add(user)
    session.commit()
    session.refresh(user)

    log = MentalHealthLog(
        user_id=user.id,
        mood="happy",
        weekly_score=8,
        response_message="Excelente estado de ánimo",
        suggested_action="Mantener la rutina actual",
    )
    session.add(log)
    session.commit()
    session.refresh(log)

    assert isinstance(log.id, UUID)
    assert log.user_id == user.id
    assert log.mood == "happy"
    assert log.weekly_score == 8
    assert log.derivate_cvv is False
    assert log.alert_triggered is False


def test_user_mental_health_logs_relationship(session):
    user = User(
    email="rel@test.com",
    hashed_password="hashed",
    full_name="Relations Test",
    birth_date=date(1995, 6, 15),
    gender="female",
    education_level="university",

    continent_code="AM",
    continent_name="América",

    country_code="AR",
    country_name="Argentina",

    state_code="B",
    state_name="Buenos Aires",

    city_name="San Justo",

    whatsapp_e164="+549111111112",

    language_code="es",

    current_situation="looking_for_job",

    professional_level="junior",
    tech_area="backend",
    career_objective="find_job",
)
    session.add(user)
    session.commit()
    session.refresh(user)

    log1 = MentalHealthLog(
        user_id=user.id,
        mood="tired",
        weekly_score=5,
        response_message="Descansá un poco",
        suggested_action="Tomar una pausa",
    )
    log2 = MentalHealthLog(
        user_id=user.id,
        mood="happy",
        weekly_score=9,
        response_message="Gran semana",
        suggested_action="Seguí así",
    )
    session.add_all([log1, log2])
    session.commit()
    session.refresh(user)

    logs = session.exec(
        MentalHealthLog.__table__.select().where(
            MentalHealthLog.user_id == user.id
        )
    ).all()

    assert len(logs) == 2
    assert logs[0].mood in ("tired", "happy")
    assert logs[1].mood in ("tired", "happy")


def test_foreign_key_enforces_user_exists(session):
    orphan_log = MentalHealthLog(
        user_id="00000000-0000-0000-0000-000000000000",
        mood="happy",
        weekly_score=8,
        response_message="N/A",
        suggested_action="N/A",
    )
    session.add(orphan_log)
    with pytest.raises(Exception):
        session.flush()
    session.rollback()


def test_derivar_cvv_triggered(session):
    user = User(
    email="cvv@test.com",
    hashed_password="hashed",
    full_name="Relations Test",
    birth_date=date(1995, 6, 15),
    gender="female",
    education_level="university",

    continent_code="AM",
    continent_name="América",

    country_code="AR",
    country_name="Argentina",

    state_code="B",
    state_name="Buenos Aires",

    city_name="San Justo",

    whatsapp_e164="+549111111112",

    language_code="es",

    current_situation="looking_for_job",

    professional_level="junior",
    tech_area="backend",
    career_objective="find_job",
)
    session.add(user)
    session.commit()
    session.refresh(user)

    log = MentalHealthLog(
        user_id=user.id,
        mood="sad",
        weekly_score=3,
        response_message="Acá estoy para vos",
        suggested_action="Derivar a CVV",
        derivate_cvv=True,
        alert_triggered=True,
    )
    session.add(log)
    session.commit()
    session.refresh(log)

    assert log.derivate_cvv is True
    assert log.alert_triggered is True
    assert log.weekly_score == 3
    assert log.mood == "sad"
