from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.user import User
from app.schemas.orientar import OrientarResponse, VacancyResponse


class OrientarService:
    """Servicio de orientación profesional.

    Analiza el perfil del usuario y calcula:
    - gap_porcentual: qué tanto le falta según su nivel profesional
    - gap_items: habilidades o conocimientos faltantes
    - trayectoria_sugerida: cursos o programas recomendados (ONE, GEAR)
    - vacantes_compatibles: posiciones laborales con % de match
    - confianza: qué tan preciso es el análisis
    """

    def __init__(self, session: Session):
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
        """Analiza el perfil del usuario y devuelve recomendaciones.

        Usa professional_level del modelo User (enum) como fuente de verdad.
        El parámetro 'nivel' del request es la autopercepción del usuario.
        Este dato puede no ser definido por el usuario al momento de registrarse,
        por lo tanto se define un valor por defecto 'junior'.
        """
        nivel_real = (
            user.professional_level.value
            if user.professional_level is not None
            else "junior"
            )
        
        area = ""
        if user.interest_areas and len(user.interest_areas) > 0:
            area = user.interest_areas[0].lower()
        elif user.tech_area:
            area = user.tech_area.lower()

        gap = self._calcular_gap(nivel_real)

        return OrientarResponse(
            gap_porcentual=gap["porcentaje"],
            gap_items=gap["items"],
            trayectoria_sugerida=self._trayectoria_por_area(area),
            vacantes_compatibles=self._vacantes_por_area(area),
            confianza=self._calcular_confianza(nivel_real),
        )

    def _calcular_gap(self, nivel: str) -> dict:
        gaps = {
            "beginner": {
                "porcentaje": 72.5,
                "items": [
                    "Fundamentos de lógica de programación",
                    "Control de versiones con Git y GitHub",
                    "Estructuras de datos básicas",
                    "Metodologías ágiles (Scrum, Kanban)",
                    "Habilidades de comunicación técnica",
                ],
            },
            "junior": {
                "porcentaje": 45.3,
                "items": [
                    "Principios SOLID y patrones de diseño",
                    "Testing automatizado (unitarios + integración)",
                    "CI/CD básico (GitHub Actions)",
                    "Arquitectura de microservicios (nociones)",
                ],
            },
            "semi_senior": {
                "porcentaje": 25.0,
                "items": [
                    "Arquitectura de sistemas distribuidos",
                    "Mentoring de equipos junior",
                    "Diseño de APIs a escala",
                ],
            },
            "senior": {
                "porcentaje": 10.0,
                "items": [
                    "Liderazgo técnico y visión estratégica",
                    "Diseño de sistemas a gran escala",
                ],
            },
        }
        return gaps.get(nivel, gaps["junior"])

    def _trayectoria_por_area(self, area: str) -> list[str]:
        trayectorias = {
            "frontend": [
                "Programa ONE de Oracle & Alura — Especialización Frontend",
                "Google Cloud GEAR — Cloud Computing Fundamentals",
            ],
            "backend": [
                "Google Cloud GEAR — Cloud & Backend Development",
                "Programa ONE de Oracle — Especialización Backend",
            ],
            "fullstack": [
                "Oracle ONE + Google GEAR — Full Stack Development",
                "Programa ONE de Oracle — React + Node.js",
            ],
            "data": [
                "Google Cloud GEAR — Data Engineering & Analytics",
                "Programa ONE de Oracle — Data Science",
            ],
            "mobile": [
                "Oracle ONE — Desarrollo Mobile (Android & iOS)",
            ],
            "devops": [
                "Google Cloud GEAR — DevOps & SRE Fundamentals",
                "Programa ONE de Oracle — Cloud Infrastructure",
            ],
            "ux": [
                "Programa ONE de Oracle — UX/UI Design",
                "Google Cloud GEAR — Digital Product Design",
            ],
        }
        return trayectorias.get(
            area,
            ["Programa ONE de Oracle — Desarrollo de Software"],
        )

    def _vacantes_por_area(self, area: str) -> list[VacancyResponse]:
        vacantes = {
            "frontend": [
                VacancyResponse(id="vac-001", title="Frontend Developer Jr", company="Nubank", match_percentage=78.5),
                VacancyResponse(id="vac-002", title="React Developer", company="Mercado Libre", match_percentage=72.0),
                VacancyResponse(id="vac-003", title="UI Engineer", company="Globant", match_percentage=68.3),
            ],
            "backend": [
                VacancyResponse(id="vac-004", title="Backend Developer Jr", company="iFood", match_percentage=80.1),
                VacancyResponse(id="vac-005", title="Python Developer", company="AWS LATAM", match_percentage=74.5),
                VacancyResponse(id="vac-006", title="API Developer", company="PedidosYa", match_percentage=70.2),
            ],
            "fullstack": [
                VacancyResponse(id="vac-007", title="Full Stack Developer", company="Mercado Libre", match_percentage=76.8),
                VacancyResponse(id="vac-008", title="Web Developer", company="Despegar", match_percentage=71.4),
            ],
            "data": [
                VacancyResponse(id="vac-009", title="Data Analyst Jr", company="Nubank", match_percentage=73.2),
                VacancyResponse(id="vac-010", title="Data Engineer", company="iFood", match_percentage=69.8),
            ],
            "mobile": [
                VacancyResponse(id="vac-011", title="Mobile Developer Jr", company="Rappi", match_percentage=75.0),
                VacancyResponse(id="vac-012", title="React Native Developer", company="Mercado Libre", match_percentage=71.5),
            ],
            "devops": [
                VacancyResponse(id="vac-013", title="DevOps Engineer Jr", company="AWS LATAM", match_percentage=72.0),
                VacancyResponse(id="vac-014", title="Cloud Support Engineer", company="Google Cloud", match_percentage=68.5),
            ],
            "ux": [
                VacancyResponse(id="vac-015", title="UX Designer Jr", company="Mercado Libre", match_percentage=74.0),
                VacancyResponse(id="vac-016", title="Product Designer", company="Nubank", match_percentage=70.3),
            ],
        }
        return vacantes.get(area, [])

    def _calcular_confianza(self, nivel: str) -> float:
        confianza = {
            "beginner": 0.72,
            "junior": 0.80,
            "semi_senior": 0.88,
            "senior": 0.92,
        }
        return confianza.get(nivel, 0.75)
