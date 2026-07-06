# BE-11 Endpoint POST /experiencias con dataset Vísent CDRView

## Descripción
Endpoint que recibe la ubicación del usuario (lat, lng), hora actual y perfil, y devuelve eventos cercanos, contenido offline sugerido y recomendaciones personalizadas basadas en el dataset Vísent CDRView (antenas, concentración, flujo OD, perfiles de suscriptores).

## Request
```json
{
  "usuario_id": 1,
  "lat": -27.59,
  "lng": -48.55,
  "hora_actual": "TARDE",
  "perfil": {
    "edad": 24,
    "nivel": "junior",
    "area": "frontend",
    "objetivo": "find_job"
  }
}
```

## Response
```json
{
  "cluster_cercano": "CBD_BEIRAMAR",
  "cobertura": {
    "calidad": "buena",
    "drop_pct": 0.03,
    "congestion": 0.12
  },
  "eventos_cercanos": [
    {
      "titulo": "Charla: De Junior a SSR en 6 meses",
      "tipo": "presencial",
      "cluster": "CBD_BEIRAMAR",
      "lat": -27.59,
      "lon": -48.55,
      "asistentes_estimados": 3400
    }
  ],
  "destinos_populares": [
    { "cluster": "UFSC", "n_usuarios": 7609, "dist_km": 4.2 }
  ],
  "contenido_offline": [
    { "titulo": "Mi historia: cómo entré a tecnología", "tipo": "video" }
  ]
}
```

## Lógica interna

### 1. Geo-near antena más cercana
- Cargar `antenas_flp.csv` (133 antenas con lat, lon, cluster)
- Calcular distancia Haversine entre (lat, lng) del usuario y cada antena
- Devolver el `cluster` de la antena más cercana

### 2. Concentración y calidad de red
- Filtrar `tensor_concentracao.csv` por `cluster` + `periodo` (MADRUGADA/MANHA/TARDE/NOITE)
- Si `n_usuarios > 2000` y `drop_pct_medio < 0.07` → calidad "buena"
- Si `drop_pct_medio` entre 0.07 y 0.10 → calidad "regular"
- Si `drop_pct_medio > 0.10` → calidad "baja" → sugerir contenido offline

### 3. Destinos populares desde el cluster del usuario
- Filtrar `tensor_od.csv` por `cluster_origem`
- Ordenar por `n_viagens` DESC
- Devolver top destinos con `n_viagens` y `dist_media_km`

### 4. Segmentación por perfil demográfico
- Filtrar `assinantes.csv` por `home_cluster`
- Determinar `income_predominante` y `age_group_predominante`
- Si usuario joven (18-24) → priorizar eventos en clusters universitarios (UFSC, TRINDADE)
- Si usuario 35+ → priorizar CENTRO, CENTRO_HISTORICO

### 5. Fallback sin dataset
- Si el dataset no está cargado o hay error, devolver datos mockeados

## Archivos del dataset (en `EXPERIENCIAS_ESTRUCTURANTES/`)
| Archivo | Filas | Uso |
|---------|-------|-----|
| `antenas_flp.csv` | 133 | Geo-near cluster del usuario |
| `tensor_concentracao.csv` | ~7.900 | Calidad de red + concentración por período |
| `tensor_od.csv` | ~500 | Destinos populares desde el origen |
| `tensor_fluxo_vias.csv` | ~17.200 | Flujo fino entre antenas (ranking social) |
| `assinantes.csv` | 200.000 | Perfil demográfico por cluster |

## Criterios de aceptación
- [ ] Endpoint `POST /experiencias` funcional
- [ ] Cálculo Haversine para cluster más cercano
- [ ] Clasificación de calidad de cobertura (buena/regular/baja)
- [ ] Sugerencia de contenido offline si cobertura baja
- [ ] Top destinos populares desde el cluster del usuario
- [ ] Segmentación por perfil etario y socioeconómico
- [ ] Fallback con datos mock si el dataset no está disponible
- [ ] Tests unitarios

## Prioridad
Alta

## Etiquetas
`backend` `api` `experiencias` `geolocalizacion` `dataset` `conectividad`
