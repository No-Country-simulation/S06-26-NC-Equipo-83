<div align="center">
  <img src="https://img.shields.io/badge/status-MVP%20en%20desarrollo-yellow?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/licencia-MIT-blue?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/version-1.0.0--alpha-brightgreen?style=for-the-badge" alt="Version">
</div>

<br>

<div align="center">
  <h1>App BiT</h1>
  <p><strong>Orientación Personal 360°</strong></p>
  <p>Plataforma web con IA para acompañar a grupos subrepresentados en su desarrollo profesional y personal.</p>
</div>

---

## Tabla de Contenidos

- [Descripción](#descripcion)
- [Problema](#problema)
- [Servicios MVP](#servicios-mvp)
- [Flujos de la Aplicación](#flujos-de-la-aplicacion)
- [Arquitectura](#arquitectura)
- [Stack Tecnológico](#stack-tecnologico)
- [Estrategia Git](#estrategia-git)
- [API](#api)
- [Equipo](#equipo)
- [Instalación](#instalacion)
- [Documentación](#documentacion)

---

## Descripción

App BiT integra **formación, empleabilidad, mentorías, experiencias y salud mental** en una única experiencia digital impulsada por inteligencia artificial. Un ecosistema 360° con empatía, acompañamiento y relevancia cultural.

---

## Problema

Personas de grupos subrepresentados enfrentan barreras simultáneas de empleo, formación y salud mental **sin un soporte integrado, humanizado y culturalmente relevante**.

Estas barreras generan ciclos de exclusión que dificultan el acceso a oportunidades dentro del mercado tecnológico. App BiT busca romper ese ciclo.

---

## Servicios MVP

### 1. Formaciones
Cursos gratuitos (Programa GEAR de Google Cloud, Programa ONE de Oracle & Alura) y trayectorias personalizadas según el gap del perfil del usuario.

### 2. Empleabilidad
Match automático entre perfil y vacantes. Muestra el gap de forma clara: *"Cumples el 70% — ve qué falta y cómo resolverlo"*.

### 3. Experiencias Estructurantes
Eventos en vivo y grabados con testimonios de CEOs, líderes y profesionales que superaron las mismas barreras.

### 4. Mentorías
Networking humanizado — mentores que invitan a una práctica, no solo a una entrevista formal.

### 5. Salud Mental
Check-in diario vía emojis. El agente de IA detecta el estado emocional y sugiere acciones concretas. En crisis, deriva automáticamente al CVV.

---

## Flujos de la Aplicación

### Flujo del Usuario

![Flujo Usuario](Docs/Flujo%20User.png)

### Flujo del Administrador

![Flujo Admin](Docs/Flujo%20Admin.png)

---

## Arquitectura

```
Usuario
   |
   v
Frontend
   |
   v
Backend API
   |
   ├── Gestión de Usuarios
   ├── Orientación Profesional
   ├── Salud Mental
   ├── Vacantes
   ├── Mentorías
   ├── Eventos
   └── IA Externa
           |
           v
        Proveedor IA
```

### Módulos MVP

| Módulo | Estado |
|--------|--------|
| Autenticación | Pendiente |
| Perfil de Usuario | Pendiente |
| Orientación Profesional | Pendiente |
| Salud Mental | Pendiente |

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | *Por definir* |
| **Backend** | *Por definir* |
| **Base de Datos** | *Por definir* |
| **IA** | *Por definir* |
| **Deploy** | Railway / Render |

---

## Estrategia Git

### Rama principal

**main** — única rama estable. Todo el código funcional converge aquí.

### Flujo de trabajo

Las ramas se crean directamente desde `main` para cada incidencia/issue.

```
incidencia/[id]-[descripcion-corta]
```

**Ejemplos:**
```
incidencia/01-onboarding
incidencia/02-orientar-endpoint
incidencia/03-salud-checkin
```

### Proceso

1. Crear rama desde `main`
2. Implementar la funcionalidad o corrección
3. Abrir Pull Request hacia `main`
4. Code Review por al menos un integrante
5. Merge a `main`
6. Eliminar la rama de incidencia

### Conventional Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para mantener un historial claro y legible:

```
feat: nueva funcionalidad
fix: corrección de error
docs: cambios en documentación
refactor: mejora de código sin cambiar funcionalidad
chore: tareas rutinarias
```

---

## API

### POST /orientar

Endpoint de orientación profesional. Analiza el perfil y recomienda trayectorias.

```json
// Request
{
  "usuario_id": 1,
  "perfil": "Frontend Developer",
  "nivel": "Junior",
  "region": "LATAM"
}

// Response
{
  "gap_porcentual": 30,
  "trayectoria_sugerida": [],
  "vacantes_compatibles": []
}
```

### POST /salud

Endpoint de salud mental. Procesa el check-in emocional y sugiere acciones.

```json
// Request
{
  "usuario_id": 1,
  "humor": "ansioso",
  "nota_semanal": 5
}

// Response
{
  "mensaje": "Sugerencia personalizada",
  "accion_sugerida": "Realizar una caminata"
}
```

> **Nota:** `nota_semanal < 4` activa `derivar_cvv: true` (situación de crisis)

---

## Equipo

| | Rol | Nombre | Contacto |
|---|------|--------|----------|
| <img src="https://via.placeholder.com/48x48/1a73e8/ffffff?text=PM" width="48" style="border-radius:50%"> | **Project Manager** | *Tu nombre* | [LinkedIn](#) |
| <img src="https://via.placeholder.com/48x48/34a853/ffffff?text=FD" width="48" style="border-radius:50%"> | **Frontend Developer** | *Nombre* | [LinkedIn](#) |
| <img src="https://via.placeholder.com/48x48/ea4335/ffffff?text=BD" width="48" style="border-radius:50%"> | **Backend Developer** | *Nombre* | [LinkedIn](#) |
| <img src="https://via.placeholder.com/48x48/fbbc04/ffffff?text=FS" width="48" style="border-radius:50%"> | **Full Stack Developer** | *Nombre* | [LinkedIn](#) |
| <img src="https://via.placeholder.com/48x48/8e24aa/ffffff?text=QA" width="48" style="border-radius:50%"> | **QA** | *Nombre* | [LinkedIn](#) |

---

## Instalación

```bash
# Clonar el repositorio
git clone <repository-url>

# Ingresar al proyecto
cd app-bit

# Instalar dependencias
npm install

# Ejecutar entorno local
npm run dev
```

---

## Documentación

La documentación técnica se encuentra en la carpeta [`/docs`](Docs/):

| Archivo | Descripción |
|---------|-------------|
| [Descripción General](Docs/Descripción%20General.md) | Visión completa del proyecto |
| [Arquitectura](Docs/Arquitctura%20General.md) | Arquitectura de alto nivel |
| [API](Docs/API/Leeme.md) | Documentación de endpoints |
| [Tecnologías](Docs/Tecnologias.md) | Stack tecnológico |
| [Conventional Commits](Docs/Conventional%20Commits.md) | Guía de commits |

---

<div align="center">
  <p><strong>App BiT</strong> — Hackathon / No Country</p>
  <p>Proyecto desarrollado con fines educativos y de innovación tecnológica.</p>
</div>

ejemplo
ejemplo 2