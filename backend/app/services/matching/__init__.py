"""Matching engine — deterministic skill-based job matching."""
from .data import (
    SKILLS,
    SKILL_LABELS,
    SKILL_VALUES,
    TECHNOLOGY_TO_SKILLS,
    MOCK_JOBS,
    MOCK_COURSES,
    COURSE_BY_ID,
    Job,
    Course,
    UserSkillProfile,
    MatchResult,
)
from .engine import (
    get_user_skills,
    calculate_job_match,
    generate_roadmap,
)

__all__ = [
    "SKILLS",
    "SKILL_LABELS",
    "SKILL_VALUES",
    "TECHNOLOGY_TO_SKILLS",
    "MOCK_JOBS",
    "MOCK_COURSES",
    "COURSE_BY_ID",
    "Job",
    "Course",
    "UserSkillProfile",
    "MatchResult",
    "get_user_skills",
    "calculate_job_match",
    "generate_roadmap",
]
