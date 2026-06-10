# BE-08 Implementar derivación automática al CVV en crisis

## Descripción
Implementar la lógica de seguridad que detecta situaciones de crisis de salud mental y deriva automáticamente al CVV (Centro de Valorización de la Vida).

## Reglas de negocio
- `nota_semanal < 4` activa derivación automática
- El endpoint /salud debe devolver `derivar_cvv: true`
- La interfaz debe mostrar información de contacto del CVV
- Registrar la derivación en el historial del usuario

## Criterios de aceptación
- [ ] Detección de crisis basada en nota_semanal < 4
- [ ] Flag `derivar_cvv: true` en respuesta del endpoint
- [ ] Registro de eventos de crisis en BD
- [ ] Notificación al usuario con datos de contacto del CVV

## Prioridad
Alta

## Etiquetas
`backend` `salud-mental` `seguridad`
