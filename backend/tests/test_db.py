from sqlmodel import SQLModel, create_engine

from app.models.user import User
from app.models.mental_health import MentalHealthLog

engine = create_engine("sqlite:///test.db")

SQLModel.metadata.create_all(engine)

print("✅ Tables created successfully")