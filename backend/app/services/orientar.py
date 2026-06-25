from uuid import UUID
from fastapi import HTTPException, status
from sqlmodel import Session

from app.repositories.user import get_user_by_id
from app.schemas.orientar import OrientarResponse, VacancyResponse


class OrientarService:
    """Servicio de orientación profesional.

    Analiza el perfil del usuario y calcula:
    - gap_porcentual: qué tanto le falta según su nivel
    - gap_items: skills o conocimientos faltantes
    - trayectoria_sugerida: cursos o programas recomendados
    - vacantes_compatibles: posiciones con % de match
    - confianza: qué tan preciso es el análisis
    """

    def __init__(self, session: Session):
        self.session = session

    def analizar_perfil(
        self,
        usuario_id: UUID,
        perfil: str,
        nivel: str,
        region: str,
        idioma: str,
        lat: float,
        lng: float,
    ) -> OrientarResponse:
        """Analiza el perfil del usuario y devuelve recomendaciones."""
        # 1. Validar que el usuario existe
        usuario = get_user_by_id(self.session, usuario_id)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado.",
            )

        # 2. Obtener nivel y área desde el modelo User
        #    professional_level es un enum, necesitamos su .value (string)
        nivel_str = usuario.professional_level.value
        area = usuario.tech_area.lower() if usuario.tech_area else ""

        # 3. Calcular gap según nivel profesional
        gap = self._calcular_gap(nivel_str)

        # 4. Armar respuesta completa
        return OrientarResponse(
            gap_porcentual=gap["porcentaje"],
            gap_items=gap["items"],
            trayectoria_sugerida=self._trayectoria_por_area(area),
            vacantes_compatibles=self._vacantes_por_area(area),
            confianza=self._calcular_confianza(nivel_str),
        )

    # ------------------------------------------------------------------
    # Métodos privados con los datos de la lógica
    # ------------------------------------------------------------------

    def _calcular_gap(self, nivel: str) -> dict:
        """Devuelve gap porcentual y skills faltantes según nivel."""
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
        """Sugiere programas de formación según área tech.

        IMPORTANTE: Retorna List[str], no un solo string.
        El schema OrientarResponse.trayectoria_sugerida es List[str].
        """
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
            "qa": [
                "Oracle ONE — Quality Assurance & Testing",
                "Google Cloud GEAR — DevOps Fundamentals",
            ],
        }
        return trayectorias.get(
            area,
            ["Programa ONE de Oracle — Desarrollo de Software"],
        )

    def _vacantes_por_area(self, area: str) -> list[VacancyResponse]:
        """Devuelve vacantes compatibles para el área tech."""
        vacantes = {
            "frontend": [
                VacancyResponse(id="1", title="Frontend Developer Jr", company="Nubank", match_percentage=78.5),
                VacancyResponse(id="2", title="React Developer", company="Mercado Libre", match_percentage=72.0),
                VacancyResponse(id="3", title="UI Engineer", company="Globant", match_percentage=68.3),
            ],
            "backend": [
                VacancyResponse(id="4", title="Backend Developer Jr", company="iFood", match_percentage=80.1),
                VacancyResponse(id="5", title="Python Developer", company="AWS LATAM", match_percentage=74.5),
                VacancyResponse(id="6", title="API Developer", company="PedidosYa", match_percentage=70.2),
            ],
            "fullstack": [
                VacancyResponse(id="7", title="Full Stack Developer", company="Mercado Libre", match_percentage=76.8),
                VacancyResponse(id="8", title="Web Developer", company="Despegar", match_percentage=71.4),
            ],
            "data": [
                VacancyResponse(id="9", title="Data Analyst Jr", company="Nubank", match_percentage=73.2),
                VacancyResponse(id="10", title="Data Engineer", company="iFood", match_percentage=69.8),
            ],
            "mobile": [
                VacancyResponse(id="11", title="Mobile Developer Jr", company="Rappi", match_percentage=75.0),
                VacancyResponse(id="12", title="React Native Developer", company="Mercado Libre", match_percentage=71.5),
            ],
            "qa": [
                VacancyResponse(id="13", title="QA Analyst Jr", company="Globant", match_percentage=79.3),
                VacancyResponse(id="14", title="Test Automation Engineer", company="PedidosYa", match_percentage=72.1),
            ],
        }
        return vacantes.get(
            area,
            [],  # Si el área no existe, devolvemos lista vacía
        )

    def _calcular_confianza(self, nivel: str) -> float:
        """Confianza del análisis: a mayor seniority, más datos disponibles."""
        confianza = {
            "beginner": 0.72,
            "junior": 0.80,
            "semi_senior": 0.88,
            "senior": 0.92,
        }
        return confianza.get(nivel, 0.75)
