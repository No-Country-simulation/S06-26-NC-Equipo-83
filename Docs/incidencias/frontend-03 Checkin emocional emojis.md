# FE-03 Implementar check-in emocional vía emojis

## Descripción
Crear el componente de check-in emocional diario donde el usuario selecciona un emoji que representa su estado de ánimo (feliz, cansado, triste, ansioso, sobrecargado) y recibe acciones sugeridas.

## Emojis / estados
- 😊 Feliz
- 😴 Cansado
- 😢 Triste
- 😰 Ansioso
- 😫 Sobrecargado

## Flujo
1. Usuario selecciona emoji al entrar a la app
2. App solicita nota semanal (1-10)
3. Envía al endpoint /salud
4. Muestra respuesta: mensaje + acción sugerida
5. Si derivar_cvv = true, mostrar alerta con contacto del CVV

## Criterios de aceptación
- [ ] Selección de emoji funcional
- [ ] Input de nota semanal (1-10)
- [ ] Integración con endpoint POST /salud
- [ ] Visualización de acción sugerida
- [ ] Alerta de crisis con datos del CVV cuando corresponda
- [ ] Diseño responsivo

## Prioridad
Alta

## Etiquetas
`frontend` `salud-mental` `checkin`
