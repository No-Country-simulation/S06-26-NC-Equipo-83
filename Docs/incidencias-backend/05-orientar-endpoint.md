## INCIDENCIA 05 — `/orientar` — Gap, Trayectoria y Vacantes

## Resumen

Esta incidencia implementa el endpoint de orientación profesional que, a partir del perfil de una persona, analiza su nivel actual y calcula qué porcentaje del camino le falta recorrer, qué habilidades específicas necesita desarrollar, qué programas de formación como Oracle ONE o Google GEAR le conviene tomar según su especialidad, y qué vacantes laborales reales tienen mayor compatibilidad con su perfil. Todo el análisis es determinista y se basa en datos predefinidos, sin depender de inteligencia artificial.

**Rama:** `incidencia/05-orientar-endpoint`  
**Duración estimada:** 1 día (6-8 horas).  
**Depende de:** 01 terminada (DB) + 02a terminada (`repositories/user.py`). NO depende de 02b, 03 ni 04.  
**Asignada a:** 1 dev.  
**Por qué última:** Es el feature más simple de los 3. Sin IA, sin reglas de crisis. Solo busca al usuario y devuelve datos de diccionarios. Para cuando llegues acá ya viste los patrones en incidencias anteriores.

### ¿Qué vas a aprender?

| Concepto | ¿Qué es? |
|----------|---------|
| Diccionarios anidados | Estructuras `{clave: {subclave: valor}}` para datos de configuración |
| `.get(key, default)` | Buscar en diccionario con valor por defecto si la clave no existe |
| `str.lower()` | Normalizar strings para comparaciones (ej: `"Frontend".lower()` → `"frontend"`) |

### Pre-lectura (15 min)

| Archivo | Pregunta que responde |
|---------|----------------------|
| `app/schemas/orientar.py` | `OrientarRequest`, `OrientarResponse`, `VacancyResponse` — los schemas exactos |
| `app/repositories/user.py` | `get_user_by_id` — la función que creó el dev de 02a |
| `docs/Descripción General.md` — sección EMPLEABILIDAD | Lógica de negocio del gap |

**Atención con el schema:** `VacancyResponse` tiene `id: str` (no int), `title: str` (no titulo), `match_percentage: float` (no match). `OrientarResponse` tiene `trayectoria_sugerida: List[str]` (lista de strings, no un solo string), `gap_items: List[str]`, `vacantes_compatibles: List[VacancyResponse]`.

### Antes de codear: flujo git

```bash
git checkout main
git pull origin main
git checkout -b incidencia/05-orientar-endpoint
```

### Paso a paso

#### Archivo 1: `backend/app/services/orientar.py`

Lógica 100% determinista con diccionarios. Sin IA para el MVP.

```python
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
```

**Puntos clave:**

- `VacancyResponse(id="1", ...)` — `id` es `str`, no `int`. El schema dice `id: str`.
- `trayectoria_sugerida` retorna `list[str]`, no `str`. Cada programa es un elemento de la lista.
- `gaps.get(nivel, gaps["junior"])` — si el nivel no existe en el diccionario, usa "junior" como default.
- Las claves de los diccionarios usan los valores del enum `ProfessionalLevel`: `"beginner"`, `"junior"`, `"semi_senior"`, `"senior"`.

#### Archivo 2: `backend/app/routers/orientar.py`

```python
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.orientar import OrientarRequest, OrientarResponse
from app.services.orientar import OrientarService

router = APIRouter(prefix="/orientar", tags=["orientar"])


@router.post("", response_model=OrientarResponse)
def orientar(request: OrientarRequest, session: Session = Depends(get_session)):
    """Analiza el perfil profesional y sugiere trayectoria de formación
    y vacantes compatibles, mostrando el gap porcentual."""
    service = OrientarService(session)
    return service.analizar_perfil(
        usuario_id=request.usuario_id,
        perfil=request.perfil,
        nivel=request.nivel,
        region=request.region,
        idioma=request.idioma,
        lat=request.lat,
        lng=request.lng,
    )
```

#### Archivo 3: Modificar `backend/app/main.py`

```python
from app.routers import orientar
app.include_router(orientar.router)
```

### Verificación

```bash
# App carga
python -c "from app.main import app; print('App OK')"

# Tests existentes
python -m pytest tests/ -v

# Levantá y probá en Swagger
uvicorn app.main:app --reload
```

En Swagger, primero creá un usuario con `/auth/register`, copiá su `id`, y luego:

```json
POST /orientar
{
  "usuario_id": "uuid-del-usuario",
  "perfil": "Frontend Developer",
  "nivel": "junior",
  "region": "LATAM",
  "idioma": "es",
  "lat": -34.6037,
  "lng": -58.3816
}
```

Esperado: gap de 45.3%, 4 gap_items, 2 trayectorias, 3 vacantes, confianza 0.80.

Probá con `usuario_id` inválido → debe devolver 404.

### Errores frecuentes

| Error | Causa | Solución |
|-------|-------|----------|
| `TypeError: 'float' object is not iterable` para `trayectoria_sugerida` | Devolviste un string, pero el schema espera `List[str]` | Poné la trayectoria dentro de una lista: `["Programa ONE"]` no `"Programa ONE"` |
| `ValidationError: id is not a valid string` en `VacancyResponse` | Pusiste `id=1` (int) pero el schema espera `id: str` | `id="1"` con comillas |
| `KeyError: 'beginner'` en el diccionario de gaps | El enum usa "beginner" pero tu diccionario usa "principiante" | Usá los valores del enum: "beginner", "junior", "semi_senior", "senior" |
| `404 Not Found` con un UUID válido | El usuario no existe en la DB | Creá el usuario con `/auth/register` primero |

### Criterios de aceptación Incidencia 05

- [ ] `POST /orientar` con usuario real devuelve `gap_porcentual`, `gap_items`, `trayectoria_sugerida`, `vacantes_compatibles`, `confianza`
- [ ] `gap_porcentual` es `float`, varía según nivel del usuario
- [ ] `trayectoria_sugerida` es una lista de strings, menciona GEAR u ONE
- [ ] `vacantes_compatibles` es una lista de objetos con `id: str`, `title`, `company`, `match_percentage`
- [ ] Usuario inexistente devuelve 404
- [ ] Swagger muestra el endpoint documentado
- [ ] Tests existentes (30) siguen pasando
- [ ] Commit con: `feat(orientar): implementar análisis de perfil con gap y trayectoria`

---
