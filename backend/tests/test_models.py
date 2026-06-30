from datetime import date, datetime
from uuid import UUID

from app.models.user import User
from app.models.mental_health import MentalHealthLog


def test_user_tablename():
    assert User.__tablename__ == "users"


def test_mental_health_log_tablename():
    assert MentalHealthLog.__tablename__ == "mental_health_logs"


def test_user_has_required_attributes():
    assert hasattr(User, "id")
    assert hasattr(User, "email")
    assert hasattr(User, "hashed_password")
    assert hasattr(User, "full_name")
    assert hasattr(User, "birth_date")
    assert hasattr(User, "gender")
    assert hasattr(User, "education_level")
    assert hasattr(User, "continent_code")
    assert hasattr(User, "continent_name")
    assert hasattr(User, "country_code")
    assert hasattr(User, "country_name")
    assert hasattr(User, "state_code")
    assert hasattr(User, "state_name")
    assert hasattr(User, "city_name")
    assert hasattr(User, "whatsapp_e164")
    assert hasattr(User, "professional_level")
    assert hasattr(User, "tech_area")
    assert hasattr(User, "career_objective")
    assert hasattr(User, "created_at")
    assert hasattr(User, "updated_at")
    assert hasattr(User, "mental_health_logs")


def test_mental_health_log_has_required_attributes():
    assert hasattr(MentalHealthLog, "id")
    assert hasattr(MentalHealthLog, "user_id")
    assert hasattr(MentalHealthLog, "mood")
    assert hasattr(MentalHealthLog, "weekly_score")
    assert hasattr(MentalHealthLog, "context")
    assert hasattr(MentalHealthLog, "response_message")
    assert hasattr(MentalHealthLog, "suggested_action")
    assert hasattr(MentalHealthLog, "derivate_cvv")
    assert hasattr(MentalHealthLog, "alert_triggered")
    assert hasattr(MentalHealthLog, "created_at")
    assert hasattr(MentalHealthLog, "user")


def test_user_relation_back_populates():
    assert User.mental_health_logs.property.back_populates == "user"


def test_mental_health_log_relation_back_populates():
    assert MentalHealthLog.user.property.back_populates == "mental_health_logs"


def test_user_instantiates_with_minimal_fields():
    user = User(
        email="test@example.com",
        hashed_password="hashed",
        full_name="Test User",
        birth_date=date(2000, 1, 1),
        gender="male",
        education_level="university",
        continent="South America",
        country="Argentina",
        state="Buenos Aires",
        city="San Justo",
        whatsapp="+549111111111",
        current_situation="student",
        interest_areas=["frontend"],
        professional_level="junior",
        tech_area="backend",
        career_objective="find_job",
    )
    assert isinstance(user.id, UUID)
    assert user.email == "test@example.com"
    assert user.full_name == "Test User"
    assert isinstance(user.created_at, datetime)
