# BE-02 Implementar endpoint POST /orientar

## Descripción
Crear el endpoint de orientación profesional que analiza el perfil del usuario y devuelve el gap porcentual, trayectoria sugerida y vacantes compatibles.

## Request
```json
{
  "usuario_id": 1,
  "perfil": "Frontend Developer",
  "nivel": "Junior",
  "region": "LATAM",
  "idioma": "es",
  "lat": -23.5505,
  "lng": -46.6333
}
```

## Response
```json
{
  "gap_porcentual": 30,
  "gap_items": [],
  "trayectoria_sugerida": [],
  "vacantes_compatibles": [],
  "confianza": 0.85
}
```

## Criterios de aceptación
- [ ] Endpoint funcional con datos mockeados inicialmente
- [ ] Cálculo de gap porcentual entre perfil y vacantes
- [ ] Recomendación de trayectoria formativa
- [ ] Integración con datos de vacantes disponibles
- [ ] Tests unitarios del endpoint

## Prioridad
Alta

## Etiquetas
`backend` `api` `orientacion`
