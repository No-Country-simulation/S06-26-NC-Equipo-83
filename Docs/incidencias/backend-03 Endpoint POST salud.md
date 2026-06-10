# BE-03 Implementar endpoint POST /salud

## Descripción
Crear el endpoint de salud mental que procesa el check-in emocional del usuario y devuelve acciones sugeridas, con derivación automática al CVV en casos de crisis.

## Request
```json
{
  "usuario_id": 1,
  "humor": "ansioso",
  "nota_semanal": 5,
  "contexto": "semana de exámenes"
}
```

## Response
```json
{
  "mensaje": "Sugerencia personalizada",
  "accion_sugerida": "Realizar una caminata",
  "derivar_cvv": false,
  "nota_actual": 5,
  "alerta": false
}
```

## Reglas de negocio
- `nota_semanal < 4` activa `derivar_cvv: true` (situación de crisis)
- El agente debe detectar patrones de riesgo basados en el historial

## Criterios de aceptación
- [ ] Endpoint funcional con datos mockeados inicialmente
- [ ] Lógica de derivación al CVV implementada
- [ ] Sugerencias de acciones según el estado emocional
- [ ] Historial de check-ins almacenado en BD
- [ ] Tests unitarios del endpoint

## Prioridad
Alta

## Etiquetas
`backend` `api` `salud-mental`
