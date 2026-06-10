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

![discord](https://www.readmecodegen.com/api/social-icon?name=discord&size=96)
![github](https://www.readmecodegen.com/api/social-icon?name=github&size=96)
![javascript](https://www.readmecodegen.com/api/social-icon?name=javascript&size=96)
![typescript](https://www.readmecodegen.com/api/social-icon?name=typescript&size=96)
![python](https://www.readmecodegen.com/api/social-icon?name=python&size=96)
![css3](https://www.readmecodegen.com/api/social-icon?name=css3&size=96)
![nodejs](https://www.readmecodegen.com/api/social-icon?name=nodejs&size=96)
![react](https://www.readmecodegen.com/api/social-icon?name=react&size=96)
![nextjs](https://www.readmecodegen.com/api/social-icon?name=nextjs&size=96)
![tailwindcss](https://www.readmecodegen.com/api/social-icon?name=tailwindcss&size=96)
![postgresql](https://www.readmecodegen.com/api/social-icon?name=postgresql&size=96)
---

## Estrategia Git

### Ramas principales

**main**
* Rama estable de produccion.

**develop**
* Rama de integracion. Las funcionalidades completadas se fusionan aqui antes de pasar a main.

### Flujo de trabajo

Las ramas de incidencia se crean desde develop para cada issue del GitHub Project.

`
incidencia/[id]-[descripcion-corta]
`

**Ejemplos:**
`
incidencia/01-onboarding
incidencia/02-orientar-endpoint
incidencia/03-salud-checkin
`

### Proceso

1. Crear rama desde develop.
2. Implementar la funcionalidad o correccion.
3. Abrir Pull Request hacia develop.
4. Code Review por al menos un integrante.
5. Merge a develop.
6. Al completar un hito, hacer merge de develop hacia main.
7. Eliminar la rama de incidencia.

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
| <img src="https://via.placeholder.com/48x48/1a73e8/ffffff?text=PM" width="48" style="border-radius:50%"> | **Project Manager** | Orlando Cardenas Villegas | [LinkedIn](https://www.linkedin.com/in/orlandocardenasvillegas/) |
| <img src="https://via.placeholder.com/48x48/ea4335/ffffff?text=BD" width="48" style="border-radius:50%"> | **Backend Developer** | Dante Escalona Bustos | [LinkedIn](https://www.linkedin.com/in/DanteJac) |
| <img src="https://via.placeholder.com/48x48/ea4335/ffffff?text=BD" width="48" style="border-radius:50%"> | **Backend Developer** | Matias Solanes | [LinkedIn](https://www.linkedin.com/in/matias-solanes/) |
| <img src="https://via.placeholder.com/48x48/fbbc04/ffffff?text=FS" width="48" style="border-radius:50%"> | **Full Stack Developer** | Luis Feliz | [LinkedIn](https://www.linkedin.com/in/luis-antonio-feliz/) |
| <img src="https://via.placeholder.com/48x48/fbbc04/ffffff?text=FS" width="48" style="border-radius:50%"> | **Full Stack Developer** | Hugo Ariel Seijo | [LinkedIn](https://www.linkedin.com/in/arielseijo/) |

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/No-Country-simulation/S06-26-NC-Equipo-83

# Ingresar al proyecto
cd 

# Instalar dependencias


# Ejecutar entorno local

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
