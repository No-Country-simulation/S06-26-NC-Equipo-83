# ADR-001: Elección del stack y arquitectura del backend

- **Estado:** Accepted
- **Fecha:** 2026-06-10
- **Decisores:** Equipo backend App BiT
- **Reemplaza:** Ninguno

---

## Contexto

App BiT es una plataforma de orientación personal 360° con inteligencia artificial. El MVP incluye 2 endpoints principales (`POST /orientar` y `POST /salud`) más autenticación y gestión de perfiles de usuario. El equipo backend está compuesto por múltiples desarrolladores trabajando en simultáneo durante aproximadamente 5 semanas.

Necesitamos un stack que permita:

- Desarrollo rápido para el MVP sin sacrificar mantenibilidad
- Trabajo en paralelo de varios desarrolladores sin generar conflictos arquitectónicos
- Integración sencilla con servicios externos de IA (llamadas HTTP asincrónicas)
- Documentación de API automática para que el frontend pueda consumir sin fricción
- Base sólida para escalar más allá del MVP

---

## Decisión

Elegimos el siguiente stack y arquitectura:

| Capa | Decisión |
|------|----------|
| Framework web | **FastAPI** (Python 3.12) |
| ORM | **SQLModel** (SQLAlchemy + Pydantic) |
| Base de datos | **PostgreSQL** |
| Validación de datos | **Pydantic v2** |
| Autenticación | **JWT** (python-jose + passlib/bcrypt) |
| Arquitectura | **Por capas** (routers → services → repositories → models) |

---

## Alternativas consideradas

### Framework web

| Alternativa | A favor | En contra | ¿Por qué no? |
|-------------|---------|-----------|--------------|
| **FastAPI** ✅ | Async nativo, Swagger automático, validación Pydantic integrada, tipado estricto, alta performance | Curva de aprendizaje para async/await | — |
| Flask | Simple, gran ecosistema, muchos devs lo conocen | Sin async nativo, Swagger requiere extensiones, validación manual, menos opinado | Más boilerplate para lograr lo mismo que FastAPI da nativo |
| Django + DRF | Admin automático, ORM maduro, ecosistema enorme | Pesado para un MVP con 2 endpoints, curva alta, opinado sobre estructura | Overkill. La mitad de Django no se usaría |
| Express (Node.js) | Ecosistema enorme, async nativo, mismo lenguaje que frontend | Sin tipado (salvo con TypeScript), Swagger requiere swagger-jsdoc, validación manual | El equipo definió Python como lenguaje backend |

### ORM

| Alternativa | A favor | En contra | ¿Por qué no? |
|-------------|---------|-----------|--------------|
| **SQLModel** ✅ | Unifica modelo DB y schema Pydantic, compatible con SQLAlchemy y Alembic, sintaxis declarativa con `Field()`, creado por el mismo autor de FastAPI | Relativamente nuevo, comunidad más chica que SQLAlchemy puro | — |
| SQLAlchemy puro | ORM más maduro de Python, documentación extensa, comunidad enorme | Define modelos separados de schemas Pydantic, más verbose, requiere más código para lo mismo | SQLModel es un wrapper de SQLAlchemy. No perdemos compatibilidad |
| Django ORM | Más simple que SQLAlchemy, migrations integradas | Acoplado a Django, no funciona standalone sin hacks | No usamos Django |
| Tortoise ORM | Async-first, similar a Django ORM | Comunidad chica, menos maduro, sintaxis diferente a SQLAlchemy | Riesgo de abandono o breaking changes en versión temprana |

### Base de datos

| Alternativa | A favor | En contra | ¿Por qué no? |
|-------------|---------|-----------|--------------|
| **PostgreSQL** ✅ | UUID nativo, JSONB para datos flexibles, integridad referencial fuerte, escalabilidad, gratuito y open source | Requiere instalación, más pesado que SQLite | — |
| SQLite | Cero configuración, ideal para desarrollo y tests | Sin soporte real para UUID, sin JSONB, no escala a múltiples usuarios concurrentes, no apto para producción con varios workers | Lo usamos solo para tests. No para producción |
| MySQL | Popular, buen soporte cloud | UUID requiere CHAR(36) o BINARY(16), menos features que PostgreSQL (sin JSONB, sin índices parciales avanzados) | PostgreSQL es superior en features sin costo adicional |
| MongoDB | Schemaless, JSON nativo, bueno para prototipado | Sin integridad referencial real, sin joins, sin transacciones multi-colección robustas | Los datos del dominio (usuarios, check-ins) son relacionales por naturaleza |

### Validación de datos

| Alternativa | A favor | En contra | ¿Por qué no? |
|-------------|---------|-----------|--------------|
| **Pydantic v2** ✅ | Viene integrado con FastAPI, validación automática en endpoints, serialización/deserialización, type hints nativos, mucho más rápido que v1 | — | — |
| Marshmallow | Maduro, popular en Flask | Requiere definir esquemas como clases separadas de los type hints, más verbose, no integrado con FastAPI | FastAPI + Pydantic es la integración más natural |
| Dataclasses | Nativo de Python, simple | Sin validación, sin serialización automática, requiere extensiones | No compite con Pydantic en features |

### Arquitectura

| Alternativa | A favor | En contra | ¿Por qué no? |
|-------------|---------|-----------|--------------|
| **Por capas** ✅ | Separación clara, testable, varios devs en paralelo, reemplazo de capas sin afectar otras | Más archivos, más abstracción inicial | La inversión inicial en estructura se paga con creces cuando el equipo crece |
| Fat controllers | Simple, pocos archivos | Lógica y queries mezcladas con HTTP, difícil testear, conflictos de merge constantes con múltiples devs | No escala a más de 2 devs |
| Arquitectura hexagonal | Máxima testabilidad, puertos y adaptadores explícitos | Demasiada abstracción para un MVP, curva de aprendizaje alta para devs nuevos | Overengineering para el estadío actual del proyecto |

---

## Consecuencias

### Positivas

- **Swagger automático:** cualquier endpoint nuevo aparece en `/docs` sin configuración extra. El frontend puede empezar a consumir apenas el backend expone la ruta.
- **Validación integrada:** FastAPI + Pydantic validan automáticamente requests y responses. Si un campo no coincide con el schema, el request se rechaza con un error claro antes de llegar a la lógica de negocio.
- **SQLModel unificado:** el mismo `Field()` define la columna en DB y la validación en API. Menos código duplicado que SQLAlchemy puro + Pydantic separados.
- **Arquitectura por capas:** un dev puede trabajar en `routers/auth.py` mientras otro trabaja en `services/orientar.py` sin conflictos de merge. Cada capa se puede testear aislada.
- **Migraciones con Alembic:** SQLModel es compatible con Alembic. Cuando necesitemos migraciones, se integra sin cambiar de ORM.
- **PostgreSQL:** UUID nativo (no strings), JSONB para datos flexibles de vacantes, índices para búsquedas por país/ciudad/nivel profesional.

### Negativas

- **Complejidad inicial:** más archivos que un monolito plano. Un dev nuevo necesita entender la separación en capas antes de escribir su primer endpoint.
- **Async/await:** los devs que vienen de Flask o Django sincrónico necesitan aprender el modelo de concurrencia de FastAPI.
- **Sin admin automático:** a diferencia de Django, no hay panel de administración. Si se necesita, hay que implementarlo o usar una herramienta externa.
- **Instalación de PostgreSQL:** cada dev necesita PostgreSQL local (hasta que se agregue `docker-compose.yml`).

### Neutrales

- **Dependencia de httpx:** para llamadas a IA externa. Es el cliente HTTP asincrónico estándar en el ecosistema FastAPI. Reemplazable si cambia el proveedor de IA.
- **JWT con python-jose:** estándar para APIs REST. Si en el futuro se necesita OAuth2 con proveedores externos (Google, GitHub), se agrega como capa adicional sin cambiar la estructura.
- **Sin pyproject.toml:** usamos `requirements.txt` con versiones pineadas. La migración a Poetry/uv queda fuera del MVP para no abrir otro frente de decisión.

---

## Referencias

- [FastAPI documentation](https://fastapi.tiangolo.com/)
- [SQLModel documentation](https://sqlmodel.tiangolo.com/)
- [Pydantic v2 documentation](https://docs.pydantic.dev/latest/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [ADR format — Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
