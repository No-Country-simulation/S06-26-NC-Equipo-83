
## Objetivo

App BiT es una plataforma de orientación personal que integra:

- Formación
    
- Empleabilidad
    
- Mentorías
    
- Experiencias
    
- Salud Mental
    
mediante una aplicación web con apoyo de Inteligencia Artificial.

---

# Arquitectura de Alto Nivel

```text
Usuario
   │
   ▼
Frontend
   │
   ▼
Backend API
   │
   ├── Gestión de Usuarios
   ├── Orientación Profesional
   ├── Salud Mental
   ├── Vacantes
   ├── Mentorías
   ├── Eventos
   └── Proveedor IA
```

---

# Componentes

## Frontend

Responsable de:

- Registro
    
- Onboarding
    
- Dashboard del usuario
    
- Check-in emocional
    
- Visualización de vacantes
    
- Visualización de mentorías
    
- Eventos y recursos
    

---

## Backend

Responsable de:

- Autenticación
    
- Gestión de perfiles
    
- Reglas de negocio
    
- Integración con IA
    
- Persistencia de datos
    

---

## Base de Datos

Almacenará:

- Usuarios
    
- Perfiles
    
- Check-ins emocionales
    
- Vacantes
    
- Mentorías
    
- Eventos
    
- Historial de recomendaciones
    

---

## Servicio de IA

Responsable de:

### Orientación

- Analizar perfil
    
- Detectar gaps
    
- Recomendar trayectorias
    

### Salud Mental

- Analizar emociones
    
- Sugerir acciones
    
- Detectar situaciones de riesgo
    

---

# Módulos del MVP

- Autenticación
    
- Perfil de Usuario
    
- Orientación Profesional
    
- Salud Mental
    

---

# Módulos Futuros

- Mentorías
    
- Eventos
    
- Experiencias
    
- Descarga Offline
    
- Notificaciones Push
    
- Analítica