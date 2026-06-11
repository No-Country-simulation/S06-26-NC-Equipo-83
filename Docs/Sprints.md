# Planificación de Sprints — App BiT

> Duración sugerida por sprint: **1 semana**

---

## Sprint 1

<div style="background: linear-gradient(90deg, #1a73e8, #4a9af5); padding: 12px 20px; border-radius: 8px; color: white; margin-bottom: 16px;">
  <strong>Objetivo:</strong> Inicializar ambos proyectos, base de datos, autenticación y armado del esqueleto base.
</div>

| Área         | Actividad                                                        | Responsable          | Estado                                                                        |
| ------------ | ---------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------- |
| **Backend**  | Inicializar proyecto Python con FastAPI + estructura de carpetas | Backend lead - Ariel | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Backend**  | Configurar base de datos (SQLAlchemy + Alembic + migraciones)    | Backend              | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Backend**  | Crear modelos de Usuario (datos personales + profesionales)      | Backend              | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Backend**  | Endpoint POST /auth/register — registro de usuario               | Backend              | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Backend**  | Endpoint POST /auth/login — login con JWT                        | Backend              | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Backend**  | Middleware de autenticación y protección de rutas                | Backend              | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Backend**  | Configurar manejador de errores y códigos de status HTTP         | Backend              | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Backend**  | Endpoint GET /usuarios/me — perfil del usuario logueado          | Backend              | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Frontend** | Inicializar proyecto (React / Vue / el que elijan)               | Frontend             | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Frontend** | Crear prototipo navegable (mockups sin diseño final)             | Frontend             | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Frontend** | Pantalla de login y registro (sin conectar aún)                  | Frontend             | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Frontend** | Configurar manejo de estado global y router                      | Frontend             | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Frontend** | Configurar cliente HTTP para consumir API                        | Frontend             | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Equipo**   | Definir contrato de integración (request/response)               | Todo el equipo       | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |

### ✅ Criterio de éxito
- Usuario se registra → inicia sesión → ve su perfil
- Backend y frontend comunicándose
- Prototipo navegable funcional

---

## Sprint 2 — Servicios

<div style="background: linear-gradient(90deg, #e67e22, #f39c12); padding: 12px 20px; border-radius: 8px; color: white; margin-bottom: 16px;">
  <strong>Objetivo:</strong> Implementar los endpoints principales de orientación y salud mental, y conectarlos con el frontend.
</div>

| Área         | Actividad                                          | Estado                                                                        |
| ------------ | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Backend**  | Endpoint POST /orientar con datos mockeados        | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Backend**  | Endpoint POST /salud con check-in emocional        | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Backend**  | Lógica de gap porcentual y match de vacantes       | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Backend**  | Lógica de derivación al CVV (nota < 4)             | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Frontend** | Dashboard principal del usuario                    | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Frontend** | Check-in emocional con emojis (conectado a /salud) | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Frontend** | Visualización de vacantes con gap porcentual       | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Equipo**   | Integración frontend-backend de ambos endpoints    | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |

### ✅ Criterio de éxito
- Usuario hace onboarding completo
- Usuario hace check-in emocional y recibe acción sugerida
- Usuario ve su gap porcentual y vacantes compatibles

---

## Sprint 3

<div style="background: linear-gradient(90deg, #27ae60, #2ecc71); padding: 12px 20px; border-radius: 8px; color: white; margin-bottom: 16px;">
  <strong>Objetivo:</strong> Agregar mentorías, experiencias estructurantes, y mejorar la UX.
</div>

| Área | Actividad | Estado |
|------|-----------|--------|
| **Backend** | CRUD de mentorías y agendamiento | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Backend** | CRUD de experiencias / eventos | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Backend** | Integración con IA (OpenAI) para recomendaciones | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Frontend** | Sección de mentorías (lista + agendar) | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Frontend** | Sección de experiencias estructurantes (videos + testimonios) | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Frontend** | Diseño responsivo completo (PWA) | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Frontend** | Refinar prototipo con identidad visual | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |

### ✅ Criterio de éxito
- Usuario agenda mentoría
- Usuario ve experiencias y testimonios
- App funciona bien en celular y escritorio

---

## Sprint 4 — Pulido y Deploy

<div style="background: linear-gradient(90deg, #8e44ad, #9b59b6); padding: 12px 20px; border-radius: 8px; color: white; margin-bottom: 16px;">
  <strong>Objetivo:</strong> Preparar para producción, tests, documentación y deploy.
</div>

| Área | Actividad | Estado |
|------|-----------|--------|
| **Backend** | Tests unitarios y de integración | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Backend** | Documentación técnica de endpoints | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Backend** | Configurar deploy en Railway / Render | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Frontend** | Tests de componentes | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Frontend** | Notificaciones push de bienestar | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Frontend** | Soporte multilingüe PT + ES | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Frontend** | Deploy del frontend | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |
| **Equipo** | README final con instrucciones y ejemplos | ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) |

### ✅ Criterio de éxito
- App desplegada y accesible públicamente
- Tests pasando
- Documentación completa

---

## Sugerencias adicionales

- **Si sobra tiempo en algún sprint:** arrancar tareas del siguiente
- **Si falta tiempo:** priorizar funcionalidades obligatorias MVP sobre opcionales
- **Daily:** 5-10 min cada día para sincronizar
- **Code Review obligatorio** antes de mergear a develop

---

## Leyenda de estados

| Badge | Significado | Código para copiar |
|-------|-------------|--------------------|
| ![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square) | No iniciado | ``![Pendiente](https://img.shields.io/badge/Pendiente-FF4444?style=flat-square)`` |
| ![En Proceso](https://img.shields.io/badge/En%20Proceso-FFA500?style=flat-square) | En desarrollo | ``![En Proceso](https://img.shields.io/badge/En%20Proceso-FFA500?style=flat-square)`` |
| ![Completada](https://img.shields.io/badge/Completada-00AA00?style=flat-square) | Terminado y revisado | ``![Completada](https://img.shields.io/badge/Completada-00AA00?style=flat-square)`` |

### Cómo cambiar el estado

Opción 1 — **Copiar y pegar** el código de la tabla de arriba en la celda correspondiente.

Opción 2 — **Usar find & replace:** buscar `Pendiente-FF4444` y reemplazar por `En%20Proceso-FFA500` o `Completada-00AA00` según corresponda.

> 💡 **Tip:** Podés seleccionar varias celdas a la vez en tu editor con Ctrl+D o Cmd+D y reemplazar todas juntas.
