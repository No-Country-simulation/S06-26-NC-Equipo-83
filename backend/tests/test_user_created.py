from app.schemas.user import UserCreate

user = UserCreate(
    email="test@test.com",
    password="123456",
    full_name="Ariel Seijo",
    birth_date="2002-01-01",
    gender="male",
    education_level="university",
    continent="South America",
    country="Argentina",
    state="Buenos Aires",
    city="San Justo",
    whatsapp="+549111111111",
    professional_level="junior",
    tech_area="backend",
    career_objective="find_job"
)

print(user)