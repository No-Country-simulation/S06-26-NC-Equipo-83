from enum import Enum


class ProfessionalLevel(str, Enum):
    BEGINNER = "beginner"
    JUNIOR = "junior"
    SEMI_SENIOR = "semi_senior"
    SENIOR = "senior"