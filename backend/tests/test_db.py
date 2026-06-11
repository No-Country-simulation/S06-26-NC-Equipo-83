from sqlmodel import SQLModel


def test_tables_created(engine):
    table_names = SQLModel.metadata.tables.keys()

    assert "users" in table_names
    assert "mental_health_logs" in table_names


def test_users_table_columns(engine):
    columns = SQLModel.metadata.tables["users"].columns.keys()

    assert "id" in columns
    assert "email" in columns
    assert "hashed_password" in columns
    assert "full_name" in columns
    assert "birth_date" in columns
    assert "gender" in columns
    assert "education_level" in columns
    assert "continent" in columns
    assert "country" in columns
    assert "state" in columns
    assert "city" in columns
    assert "whatsapp" in columns
    assert "professional_level" in columns
    assert "tech_area" in columns
    assert "career_objective" in columns
    assert "created_at" in columns
    assert "updated_at" in columns


def test_mental_health_logs_table_columns(engine):
    columns = SQLModel.metadata.tables["mental_health_logs"].columns.keys()

    assert "id" in columns
    assert "user_id" in columns
    assert "mood" in columns
    assert "weekly_score" in columns
    assert "context" in columns
    assert "response_message" in columns
    assert "suggested_action" in columns
    assert "derivate_cvv" in columns
    assert "alert_triggered" in columns
    assert "created_at" in columns


def test_foreign_key_mental_health_to_users(engine):
    fk_column = SQLModel.metadata.tables["mental_health_logs"].columns["user_id"]
    foreign_keys = list(fk_column.foreign_keys)
    assert len(foreign_keys) == 1
    assert str(foreign_keys[0].column) == "users.id"
