from datetime import date

from app.enums.career_objective import CareerObjective
from app.enums.professional_level import ProfessionalLevel
from app.schemas.user import UserCreate


def test_user_create_instantiates_with_all_fields():
    instance = UserCreate(
        email="test@example.com",
        password="123456",
        full_name="Ariel Seijo",
        birth_date=date(2002, 1, 1),
        gender="male",
        education_level="university",

        continent_code="AM",
        continent_name="América",

        country_code="AR",
        country_name="Argentina",

        state_code="B",
        state_name="Buenos Aires",

        city_name="San Justo",
        whatsapp_e164="+549111111111",

        language_code="es",
        current_situation="looking_for_job",

        professional_level=ProfessionalLevel.JUNIOR,
        tech_area="backend",
        career_objective=CareerObjective.FIND_JOB,
    )

    assert instance.email == "test@example.com"
    assert instance.full_name == "Ariel Seijo"
    assert instance.birth_date == date(2002, 1, 1)
    assert instance.gender == "male"
    assert instance.education_level == "university"

    assert instance.continent_code == "AM"
    assert instance.continent_name == "América"

    assert instance.country_code == "AR"
    assert instance.country_name == "Argentina"

    assert instance.state_code == "B"
    assert instance.state_name == "Buenos Aires"

    assert instance.city_name == "San Justo"
    assert instance.whatsapp_e164 == "+549111111111"

    assert instance.current_situation == "looking_for_job"

    assert instance.professional_level == ProfessionalLevel.JUNIOR
    assert instance.tech_area == "backend"
    assert instance.career_objective == CareerObjective.FIND_JOB


def test_user_create_accepts_string_enums():
    instance = UserCreate(
        email="string@test.com",
        password="123456",
        full_name="String Enums",
        birth_date=date(1999, 12, 31),
        gender="female",
        education_level="highschool",

        continent_code="AM",
        continent_name="América",

        country_code="MX",
        country_name="México",

        state_code="CMX",
        state_name="Ciudad de México",

        city_name="Mexico City",
        whatsapp_e164="+521111111111",

        language_code="es",
        current_situation="looking_for_job",

        professional_level="senior",
        tech_area="qa",
        career_objective="study",
    )

    assert instance.professional_level == ProfessionalLevel.SENIOR
    assert instance.career_objective == CareerObjective.STUDY


def test_user_create_password_not_in_model_dump():
    instance = UserCreate(
        email="modeldump@test.com",
        password="secret123",
        full_name="Model Dump",
        birth_date=date(1995, 6, 15),
        gender="male",
        education_level="university",

        continent_code="EU",
        continent_name="Europa",

        country_code="ES",
        country_name="España",

        state_code="MD",
        state_name="Madrid",

        city_name="Madrid",
        whatsapp_e164="+34111111111",

        language_code="es",
        current_situation="looking_for_job",

        professional_level=ProfessionalLevel.SEMI_SENIOR,
        tech_area="devops",
        career_objective=CareerObjective.CHANGE_JOB,
    )

    dumped = instance.model_dump()
    assert dumped["email"] == "modeldump@test.com"
    assert dumped["password"] == "secret123"
    assert dumped["professional_level"] == "semi_senior"


def test_user_login_instantiates():
    from app.schemas.user import UserLogin

    instance = UserLogin(email="login@test.com", password="pass")
    assert instance.email == "login@test.com"
    assert instance.password == "pass"


def test_token_response_defaults():
    from app.schemas.user import TokenResponse

    instance = TokenResponse(access_token="abc.def.ghi")
    assert instance.access_token == "abc.def.ghi"
    assert instance.token_type == "bearer"