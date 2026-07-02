"""Deterministic skill-based matching engine for the /orientar endpoint.

Pure functions — no side effects, no DB access, no AI.
"""
import re
from typing import List, Set

from .data import (
    SKILL_VALUES,
    TECHNOLOGY_TO_SKILLS,
    COURSE_BY_ID,
    Job,
    Course,
    UserSkillProfile,
    MatchResult,
)


def get_user_skills(known_technologies: list) -> UserSkillProfile:
    """Extract normalized skills from a user's known technologies.

    Two paths:
    1. The tech name IS already a normalized skill → used directly.
    2. Otherwise, looks up TECHNOLOGY_TO_SKILLS for legacy mappings.

    known_technologies is a list of dicts like:
        {"name": "React", "is_custom": False}
    or
        {"name": "frontend", "is_custom": False}
    """
    skill_set: Set[str] = set()
    custom_techs: List[str] = []

    for tech in (known_technologies or []):
        name = tech.get("name", "") if isinstance(tech, dict) else str(tech)

        if name in SKILL_VALUES:
            skill_set.add(name)
            continue

        mapped = TECHNOLOGY_TO_SKILLS.get(name)
        if mapped:
            skill_set.update(mapped)
        else:
            is_custom = tech.get("is_custom", False) if isinstance(tech, dict) else False
            if is_custom:
                custom_techs.append(name)

    return UserSkillProfile(
        skills=list(skill_set),
        custom_technologies=custom_techs,
    )


def calculate_job_match(
    user_skills: Set[str],
    job: Job,
) -> MatchResult:
    """Calculate compatibility between a user and a job.

    Score = matched_required / total_required * 100.
    Optional skills are informational only — they do NOT affect the score.
    """
    required_set = set(job.required_skills)
    optional_set = set(job.optional_skills)

    matched_req = sorted(required_set & user_skills)
    matched_opt = sorted(optional_set & user_skills)
    missing_req = sorted(required_set - user_skills)
    missing_opt = sorted(optional_set - user_skills)

    score = 100.0 if len(required_set) == 0 else round(
        (len(matched_req) / len(required_set)) * 100, 1
    )

    return MatchResult(
        score=score,
        matched_required=matched_req,
        matched_optional=matched_opt,
        missing_required=missing_req,
        missing_optional=missing_opt,
    )


def generate_roadmap(
    missing_skills: List[str],
    all_courses: List[Course],
) -> List[str]:
    """Greedy course selection minimizing course count while maximizing coverage.

    1. Filter courses covering ≥1 missing skill.
    2. Sort by (most gaps covered DESC) → tie-break (shortest duration ASC).
    3. Pick courses sequentially until all gaps are covered.
    """
    if not missing_skills:
        return []

    uncovered = set(missing_skills)
    available = [c for c in all_courses if any(s in uncovered for s in c.skills)]
    result_ids: List[str] = []

    while uncovered:
        best = _select_best_course(available, uncovered)
        if best is None:
            break

        result_ids.append(best.id)
        uncovered.difference_update(best.skills)

    return result_ids


def _select_best_course(
    courses: List[Course],
    uncovered: Set[str],
) -> Course | None:
    """Pick the course covering the most uncovered skills. Tie-break by duration."""
    best: Course | None = None
    best_coverage = 0
    best_duration = float("inf")

    for course in courses:
        coverage = sum(1 for s in course.skills if s in uncovered)
        if coverage == 0:
            continue

        duration = _parse_duration_hours(course.duration)

        if coverage > best_coverage or (
            coverage == best_coverage and duration < best_duration
        ):
            best = course
            best_coverage = coverage
            best_duration = duration

    return best


def _parse_duration_hours(duration: str) -> float:
    """Extract numeric hour value from a duration string (e.g. '48 horas' → 48)."""
    match = re.search(r"(\d+)", duration)
    return float(match.group(1)) if match else float("inf")
