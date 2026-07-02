"""Servicio de orientación profesional — usa el motor de matching determinístico.

Filtra vacantes por las áreas de interés del usuario, muestra las 3 con mayor gap
(los trabajos aspiracionales donde más puede crecer) y calcula roadmap por vacante.
"""

from app.models.user import User
from app.schemas.orientar import (
    OrientarResponse,
    JobMatchDetail,
    CourseRecommendation,
)
from app.services.matching import (
    MOCK_JOBS,
    MOCK_COURSES,
    COURSE_BY_ID,
    SKILL_LABELS,
    SKILLS as S,
    get_user_skills,
    calculate_job_match,
    generate_roadmap,
)

MAX_VACANCIES = 3

# Map interest_area values (from registration form) → primary matching skill
# Only the primary skill must be present in the job for it to be relevant.
INTEREST_PRIMARY_SKILL: dict[str, str] = {
    "frontend": S["FRONTEND"],
    "backend": S["BACKEND"],
    "fullstack": S["FRONTEND"],  # filtered specially: needs frontend + backend
    "mobile": S["MOBILE"],
    "ai_ml": S["AI"],
    "data_science": S["DATA_SCIENCE"],
    "devops": S["DEVOPS"],
    "cloud": S["CLOUD"],
    "cybersecurity": S["SECURITY"],
    "qa_testing": S["TESTING"],
    "ux_ui": S["UIUX"],
    "product_management": S["PRODUCT_MANAGEMENT"],
    "blockchain": S["BLOCKCHAIN"],
    "iot": S["IOT"],
    "game_development": S["GAME_DEV"],
}


class OrientarService:
    """Servicio de orientación profesional determinístico."""

    def __init__(self, session):
        self.session = session

    def analizar_perfil(
        self,
        user: User,
        perfil: str,
        nivel: str,
        region: str,
        idioma: str,
        lat: float,
        lng: float,
    ) -> OrientarResponse:
        """Analiza el perfil del usuario contra vacantes de sus áreas de interés."""
        profile = get_user_skills(user.known_technologies or [])
        user_skill_set = set(profile.skills)
        interest_areas = user.interest_areas or []

        relevant_jobs = self._filter_jobs_by_interests(interest_areas)

        results = []
        for job in relevant_jobs:
            result = calculate_job_match(user_skill_set, job)
            gap = round(100.0 - result.score, 1)
            if gap >= 10:  # only jobs with meaningful gaps
                results.append((job, result, gap))

        results.sort(key=lambda x: x[2])  # smallest gap first → closest to qualifying
        top = results[:MAX_VACANCIES]

        gap_porcentual = self._avg_gap(top) if top else 0.0
        gap_items = self._collect_gap_items(top)
        trayectoria = self._build_trayectoria(top)
        vacantes = self._build_vacancy_details(top)
        confianza = self._compute_confianza(user, profile)

        return OrientarResponse(
            gap_porcentual=gap_porcentual,
            gap_items=gap_items,
            trayectoria_sugerida=trayectoria,
            vacantes_compatibles=vacantes,
            confianza=confianza,
        )

    # ── Filtering ─────────────────────────────────────────────────────────

    def _filter_jobs_by_interests(self, interest_areas: list[str]) -> list:
        """Return jobs matching the user's interest areas by primary skill overlap.

        Special case: 'fullstack' matches jobs requiring BOTH frontend AND backend.
        Falls back to all jobs if no interests declared."""
        if not interest_areas:
            return MOCK_JOBS

        primary_skills: set[str] = set()
        has_fullstack = "fullstack" in interest_areas

        for area in interest_areas:
            skill = INTEREST_PRIMARY_SKILL.get(area)
            if skill:
                primary_skills.add(skill)

        if not primary_skills:
            return MOCK_JOBS

        def matches(job) -> bool:
            job_skills = set(job.required_skills) | set(job.optional_skills)
            if primary_skills & job_skills:
                return True
            if has_fullstack and (
                S["FRONTEND"] in job_skills and S["BACKEND"] in job_skills
            ):
                return True
            return False

        return [job for job in MOCK_JOBS if matches(job)]

    # ── Aggregation helpers ───────────────────────────────────────────────

    def _avg_gap(self, top: list) -> float:
        return round(sum(r[2] for r in top) / len(top), 1)

    def _collect_gap_items(self, top: list) -> list[str]:
        from collections import Counter

        counter: Counter = Counter()
        for _job, result, _gap in top:
            for skill in result.missing_required:
                counter[SKILL_LABELS.get(skill, skill)] += 1
        return [label for label, _ in counter.most_common(6)]

    def _build_trayectoria(self, top: list) -> list[str]:
        all_missing: set[str] = set()
        for _job, result, _gap in top:
            all_missing.update(result.missing_required)

        course_ids = generate_roadmap(list(all_missing), MOCK_COURSES)
        return [
            COURSE_BY_ID[cid].title for cid in course_ids if cid in COURSE_BY_ID
        ][:3] or ["Programa ONE de Oracle — Desarrollo de Software"]

    # ── Vacancy details ───────────────────────────────────────────────────

    def _build_vacancy_details(self, top: list) -> list[JobMatchDetail]:
        return [
            self._build_single_vacancy(job, result, gap)
            for job, result, gap in top
        ]

    def _build_single_vacancy(
        self, job, result, gap: float
    ) -> JobMatchDetail:
        per_skill_courses = generate_roadmap(result.missing_required, MOCK_COURSES)
        recommendations = [
            CourseRecommendation(
                title=COURSE_BY_ID[cid].title,
                provider=COURSE_BY_ID[cid].provider,
                duration=COURSE_BY_ID[cid].duration,
                url=COURSE_BY_ID[cid].url,
            )
            for cid in per_skill_courses
            if cid in COURSE_BY_ID
        ]

        return JobMatchDetail(
            id=job.id,
            title=job.title,
            company=job.company,
            location=job.location,
            description=job.description,
            area=job.area,
            seniority=job.seniority,
            salary=job.salary,
            gap_porcentual=gap,
            matched_skills=[SKILL_LABELS.get(s, s) for s in result.matched_required],
            missing_skills=[SKILL_LABELS.get(s, s) for s in result.missing_required],
            required_skills=[SKILL_LABELS.get(s, s) for s in job.required_skills],
            optional_skills=[SKILL_LABELS.get(s, s) for s in job.optional_skills],
            recommended_courses=recommendations,
        )

    # ── Confidence ─────────────────────────────────────────────────────────

    def _compute_confianza(self, user: User, profile) -> float:
        techs = user.known_technologies or []
        if not techs:
            return 0.5
        mapped = len(profile.skills) + len(profile.custom_technologies)
        total = len(techs)
        ratio = mapped / total if total > 0 else 1.0
        if len(profile.skills) >= 5:
            return round(min(ratio + 0.1, 0.95), 2)
        return round(ratio, 2)
