## INCIDENCIA INT-02 — `POST /orientar` — Gap, Trayectoria y Vacantes

## Resumen

Esta incidencia crea el endpoint de orientación profesional que el frontend necesita para reemplazar sus mocks. A partir del perfil del usuario autenticado, calcula qué porcentaje del camino le falta recorrer, qué habilidades específicas necesita desarrollar, qué programas de formación le convienen según su especialidad, y qué vacantes laborales tienen mayor compatibilidad. El endpoint está protegido con JWT — el `user_id` se obtiene del token, no del body.

**Rama:** `incidencia/int-02-orientar-endpoint`  
**Duración estimada:** 5-6 horas.  
**Depende de:** INT-00 completada (`get_current_user`).  
**Asignada a:** 1 dev backend.

### ¿Qué vas a aprender?

| Concepto | ¿Qué es? |
|----------|---------|
| Diccionarios como "base de datos en memoria" | Estructuras `{clave: {subclave: valor}}` para datos de configuración sin DB |
| `.get(key, default)` | Buscar en diccionario con valor por defecto si la clave no existe |
| `str.lower()` | Normalizar strings para comparaciones (ej: `"Frontend".lower()` → `"frontend"`) |
| `VacancyResponse` como modelo Pydantic | Crear instancias de schemas dentro de una lista |
| `response_model` con listas anidadas | FastAPI serializa `List[VacancyResponse]` automáticamente |
| Usar datos del usuario autenticado | `current_user.professional_level.value`, `current_user.tech_area` |

### Pre-lectura (15 min)

| Archivo | Pregunta que responde |
|---------|----------------------|
| `app/schemas/orientar.py` | `OrientarRequest`, `OrientarResponse`, `VacancyResponse` — los schemas exactos |
| `app/models/user.py` | ¿Qué campos tiene `User`? `professional_level`, `tech_area`, `career_objective` |
| `app/enums/professional_level.py` | Valores: `beginner`, `junior`, `semi_senior`, `senior` |
| `app/core/security.py` | `get_current_user` — ya la creaste en INT-00 |

**Atención con el schema:** `VacancyResponse` tiene `id: str` (no int), `match_percentage: float` (no int). `OrientarResponse` tiene `trayectoria_sugerida: List[str]` (lista de strings, no un solo string).

### Antes de codear: flujo git

```bash
git checkout incidencia/int-00-auth-middleware
git pull origin incidencia/int-00-auth-middleware
git checkout -b incidencia/int-02-orientar-endpoint
```

### Paso a paso

#### Archivo 1: Refactorizar `OrientarRequest` en `backend/app/schemas/orientar.py`

**Antes:**
```python
class OrientarRequest(SQLModel):
    usuario_id: UUID
    perfil: str
    nivel: str
    region: str
    idioma: str
    lat: float
    lng: float
```

**Después:**
```python
class OrientarRequest(SQLModel):
    # usuario_id YA NO VA — se obtiene del JWT
    perfil: str
    nivel: str
    region: str
    idioma: str
    lat: float
    lng: float
```

**¿Por qué `perfil`, `nivel`, `region`, `idioma`, `lat`, `lng` se mantienen?** Porque el frontend los envía como contexto adicional para el análisis. `perfil` podría ser "Frontend Developer", `nivel` la autopercepción del usuario ("junior"), `region` su ubicación ("LATAM"). El backend puede usar estos datos para afinar las recomendaciones, complementando los datos del perfil guardado en la DB.

#### Archivo 2: Crear `backend/app/services/orientar.py`

```python
from uuid import UUID
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
    - confianza: qué tan preciso es el análisis (a mayor nivel, más datos)
    """

    def __init__(self, session: Session):
        self.session = session

    def analizar_perfil(
        self,
        user: User,         # ← usuario autenticado desde get_current_user
        perfil: str,
        nivel: str,
        region: str,
        idioma: str,
        lat: float,
        lng: float,
    ) -> OrientarResponse:
        """Analiza el perfil del usuario y devuelve recomendaciones.

        Usa professional_level del modelo User (enum) como fuente de verdad.
        El parámetro 'nivel' del request es la autopercepción del usuario,
        que puede diferir del nivel registrado.
        """
        # Obtener nivel real desde el modelo User
        nivel_real = user.professional_level.value  # "beginner", "junior", etc.
        area = user.tech_area.lower() if user.tech_area else ""

        # Calcular gap según nivel profesional REAL
        gap = self._calcular_gap(nivel_real)

        # Armar respuesta completa
        return OrientarResponse(
            gap_porcentual=gap["porcentaje"],
            gap_items=gap["items"],
            trayectoria_sugerida=self._trayectoria_por_area(area),
            vacantes_compatibles=self._vacantes_por_area(area),
            confianza=self._calcular_confianza(nivel_real),
        )

    # ------------------------------------------------------------------
    # Métodos privados con los datos de la lógica
    # ------------------------------------------------------------------

    def _calcular_gap(self, nivel: str) -> dict:
        """Devuelve gap porcentual y skills faltantes según nivel.

        beginner: recién empieza → 72.5% del camino por recorrer
        junior: ya trabaja → 45.3% faltante
        semi_senior: experiencia sólida → 25.0% faltante
        senior: lidera equipos → 10.0% faltante
        """
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
        """Devuelve vacantes compatibles para el área tech.

        id debe ser str (el schema dice id: str, no int).
        match_percentage debe ser float.
        """
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
        """Confianza del análisis: a mayor seniority, más datos disponibles.

        beginner → 0.72 (menos historial, estimación más incierta)
        senior → 0.92 (más trayectoria, análisis más preciso)
        """
        confianza = {
            "beginner": 0.72,
            "junior": 0.80,
            "semi_senior": 0.88,
            "senior": 0.92,
        }
        return confianza.get(nivel, 0.75)
```

**Puntos clave:**
- `VacancyResponse(id="vac-001", ...)` — `id` es `str`, no `int`. Si ponés `id=1` sin comillas, Pydantic tira `ValidationError`.
- `trayectoria_sugerida` retorna `list[str]`, no `str`. Cada programa es un elemento de la lista.
- `gaps.get(nivel, gaps["junior"])` — si el nivel no existe, usa `junior` como default.
- Las claves de los diccionarios usan los valores del enum `ProfessionalLevel`: `"beginner"`, `"junior"`, `"semi_senior"`, `"senior"`.

#### Archivo 3: Crear `backend/app/routers/orientar.py`

```python
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.orientar import OrientarRequest, OrientarResponse
from app.services.orientar import OrientarService

router = APIRouter(prefix="/orientar", tags=["orientar"])


@router.post("", response_model=OrientarResponse)
def orientar(
    request: OrientarRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Analiza el perfil profesional del usuario autenticado.

    Calcula el gap porcentual, sugiere trayectoria de formación
    (Programa ONE, Google GEAR) y muestra vacantes compatibles.

    El perfil profesional se toma del usuario en la base de datos,
    no del cuerpo del request.
    """
    service = OrientarService(session)
    return service.analizar_perfil(
        user=current_user,
        perfil=request.perfil,
        nivel=request.nivel,
        region=request.region,
        idioma=request.idioma,
        lat=request.lat,
        lng=request.lng,
    )
```

**Concepto:** El endpoint NO es async porque no hace llamadas externas (sin IA, sin HTTP a otra API). Todo es determinista con diccionarios. Si más adelante integrás IA para afinar las recomendaciones, ahí sí lo cambiás a `async def` y agregás `await`.

#### Archivo 4: Modificar `backend/app/main.py`

```python
from app.routers import orientar
app.include_router(orientar.router)
```

### Verificación

```bash
# 1. App carga sin errores
python -c "from app.main import app; print('App OK')"

# 2. Tests existentes
python -m pytest tests/ -v

# 3. Levantá el servidor
uvicorn app.main:app --reload
```

En Swagger, primero registrá un usuario y obtené un token con `/auth/login`. Ponelo en el candado 🔒.

**A) Usuario junior en frontend:**
```json
POST /orientar
{
  "perfil": "Frontend Developer",
  "nivel": "junior",
  "region": "LATAM",
  "idioma": "es",
  "lat": -34.6037,
  "lng": -58.3816
}
```
**Esperado:** 200 OK. `gap_porcentual` depende del `professional_level` del usuario en la DB, NO del `nivel` del request. Si el usuario se registró como `junior`, el gap es ~45.3%.

**B) Usuario beginner en frontend:**
Registrá otro usuario con `professional_level: "beginner"`, autenticate con él y repetí el POST.
**Esperado:** `gap_porcentual: 72.5`, 5 `gap_items`, trayectoria y vacantes para su `tech_area`.

**C) Sin token:**
Quitá el token del candado.
**Esperado:** 401 Unauthorized.

**D) Verificar tipos de datos en la respuesta:**
```json
{
  "gap_porcentual": 45.3,        // float, no int — el .3 es importante
  "gap_items": ["...", "..."],   // lista de strings
  "trayectoria_sugerida": [      // lista de strings
    "Google Cloud GEAR — Cloud & Backend Development",
    "Programa ONE de Oracle — Especialización Backend"
  ],
  "vacantes_compatibles": [      // lista de objetos
    {
      "id": "vac-004",            // string, no número
      "title": "Backend Developer Jr",
      "company": "iFood",
      "match_percentage": 80.1    // float
    }
  ],
  "confianza": 0.8               // float
}
```

### Errores frecuentes

| Error | Causa | Solución |
|-------|-------|----------|
| `TypeError: 'float' object is not iterable` para `trayectoria_sugerida` | Devolviste un string, pero el schema espera `List[str]` | Poné la trayectoria dentro de una lista: `["Programa ONE"]` no `"Programa ONE"` |
| `ValidationError: id is not a valid string` | Pusiste `id=1` (int) pero el schema espera `id: str` | `id="1"` con comillas |
| `KeyError: 'beginner'` en el diccionario de gaps | El enum usa `"beginner"` pero tu diccionario usa `"principiante"` | Usá los valores del enum: `"beginner"`, `"junior"`, `"semi_senior"`, `"senior"` |
| `ImportError: cannot import name 'get_current_user'` | No mergeaste INT-00 o estás en una rama que no la incluye | `git merge incidencia/int-00-auth-middleware` |
| `AttributeError: 'User' object has no attribute 'professional_level'` | Estás accediendo a `user.professional_level` sin `.value` | `user.professional_level.value` para obtener el string |
| 422 Validation Error | El request body no coincide con `OrientarRequest` | Swagger te dice exactamente qué campo falta. `lat` y `lng` son floats, no strings. |
| `ModuleNotFoundError: No module named 'app.routers.orientar'` | No creaste el archivo `routers/orientar.py` o está en la carpeta equivocada | Verificá: `backend/app/routers/orientar.py` |

### Criterios de aceptación INT-02

- [ ] `POST /orientar` con token válido devuelve `gap_porcentual`, `gap_items`, `trayectoria_sugerida`, `vacantes_compatibles`, `confianza`
- [ ] `gap_porcentual` es `float`, varía según `professional_level` del usuario en la DB
- [ ] `trayectoria_sugerida` es una lista de strings, menciona GEAR u ONE
- [ ] `vacantes_compatibles` es una lista de objetos con `id: str`, `title`, `company`, `match_percentage`
- [ ] Sin token → 401 Unauthorized
- [ ] `vacantes_compatibles` puede ser lista vacía `[]` si el `tech_area` no tiene vacantes definidas
- [ ] Swagger muestra el endpoint documentado con candado 🔒
- [ ] Tests existentes (30) siguen pasando
- [ ] Commit con: `feat(orientar): implementar analisis de perfil con gap y trayectoria`

---
