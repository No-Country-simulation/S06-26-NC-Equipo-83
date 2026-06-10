from sqlmodel import SQLModel, Session, create_engine

from app.models.user import User
from app.models.mental_health import MentalHealthLog

engine = create_engine("sqlite:///test_relations.db")

SQLModel.metadata.create_all(engine)

with Session(engine) as session:
    from datetime import date

    user = User(
        email="test@test.com",
        hashed_password="123",
        full_name="Ariel",
        birth_date=date(2002, 1, 1),
        gender="male",
        education_level="university",
        continent="South America",
        country="Argentina",
        state="Buenos Aires",
        city="San Justo",
        whatsapp="123",
        professional_level="junior",
        tech_area="backend",
        career_objective="find_job"
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    log = MentalHealthLog(
        user_id=user.id,
        mood="happy",
        weekly_score=8,
        response_message="Buen trabajo",
        suggested_action="Seguí así"
    )

    session.add(log)
    session.commit()

    print("✅ User created:", user.id)
    print("✅ MentalHealthLog created:", log.id)