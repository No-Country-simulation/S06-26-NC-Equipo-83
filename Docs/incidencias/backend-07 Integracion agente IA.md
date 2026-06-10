# BE-07 Integrar agente de IA para recomendaciones

## Descripción
Integrar un proveedor de IA (OpenAI / Azure OpenAI / otro) para potenciar las recomendaciones personalizadas de orientación profesional y salud mental.

## Funcionalidades
- Agente de IA para recomendar trayectorias formativas
- Agente de IA para analizar estado emocional y sugerir acciones
- Prompts optimizados para cada servicio
- Manejo de errores y fallbacks sin IA

## Consideraciones
- Nunca subir credenciales o claves de API al repositorio
- Usar variables de entorno para configuración
- El agente de salud mental es sensible — testear exhaustivamente

## Criterios de aceptación
- [ ] Integración con proveedor de IA configurada
- [ ] Prompts de orientación profesional funcionales
- [ ] Prompts de salud mental funcionales
- [ ] Fallback sin IA cuando el servicio no esté disponible
- [ ] Tests de integración

## Prioridad
Media

## Etiquetas
`backend` `ia` `integracion`
