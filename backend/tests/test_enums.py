import pytest

from app.enums.career_objective import CareerObjective
from app.enums.mood import Mood
from app.enums.professional_level import ProfessionalLevel


def test_career_objective_values():
    assert CareerObjective.STUDY.value == "study"
    assert CareerObjective.DEFINE_PATH.value == "define_path"
    assert CareerObjective.FIND_JOB.value == "find_job"
    assert CareerObjective.CHANGE_JOB.value == "change_job"


def test_career_objective_members():
    values = [e.value for e in CareerObjective]
    assert "study" in values
    assert "define_path" in values
    assert "find_job" in values
    assert "change_job" in values
    assert len(values) == 4


def test_career_objective_is_str_enum():
    assert issubclass(CareerObjective, str)
    assert isinstance(CareerObjective.STUDY, str)


def test_mood_values():
    assert Mood.HAPPY.value == "happy"
    assert Mood.TIRED.value == "tired"
    assert Mood.SAD.value == "sad"
    assert Mood.ANXIOUS.value == "anxious"
    assert Mood.OVERWHELMED.value == "overwhelmed"


def test_mood_members():
    values = [e.value for e in Mood]
    assert "happy" in values
    assert "tired" in values
    assert "sad" in values
    assert "anxious" in values
    assert "overwhelmed" in values
    assert "stressed" in values
    assert "angry" in values
    assert "depressed" in values
    assert len(values) == 8


def test_mood_is_str_enum():
    assert issubclass(Mood, str)
    assert isinstance(Mood.HAPPY, str)


def test_professional_level_values():
    assert ProfessionalLevel.BEGINNER.value == "beginner"
    assert ProfessionalLevel.JUNIOR.value == "junior"
    assert ProfessionalLevel.SEMI_SENIOR.value == "semi_senior"
    assert ProfessionalLevel.SENIOR.value == "senior"


def test_professional_level_members():
    values = [e.value for e in ProfessionalLevel]
    assert "beginner" in values
    assert "junior" in values
    assert "semi_senior" in values
    assert "senior" in values
    assert len(values) == 4


def test_professional_level_is_str_enum():
    assert issubclass(ProfessionalLevel, str)
    assert isinstance(ProfessionalLevel.SENIOR, str)
