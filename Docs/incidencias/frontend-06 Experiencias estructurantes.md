# FE-06 Crear sección de experiencias estructurantes

## Descripción
Pantalla de experiencias estructurantes con testimonios en video/escrito + eventos en vivo y grabados + recomendación inteligente basada en ubicación y conectividad del usuario usando el dataset Vísent CDRView (antenas, concentración, flujo OD, perfil de suscriptores).

## Funcionalidades
- Lista de experiencias / testimonios con foto, nombre e historia
- Reproductor de video embebido (eventos grabados)
- Eventos en vivo próximos con geolocalización
- Mapa con clusters y eventos sugeridos según ubicación del usuario
- Indicador de cobertura de red (5G/4G/3G) por zona
- Sugerencia de contenido offline si la cobertura es baja (`drop_pct_medio` alto)
- Contador social: "X personas asisten a eventos en esta zona" (de `n_usuarios`)
- Categorías por área / tema / rango etario
- Filtros por perfil demográfico (edad, nivel socioeconómico)

## Comportamiento según conectividad
- **Cobertura buena** (`drop_pct_medio < 0.07` y `n_usuarios > 2000`): sugerir eventos presenciales en la zona
- **Cobertura regular** (`drop_pct_medio 0.07–0.10`): sugerir eventos en zonas de destino popular cercanas (usando tensor_od.csv)
- **Cobertura baja** (`drop_pct_medio > 0.10` o `n_usuarios bajo`): mostrar aviso y ofrecer contenido offline (testimonios grabados, lecturas, ejercicios)

## Criterios de aceptación
- [ ] Lista de experiencias con testimonios visibles
- [ ] Reproductor de video funcional
- [ ] Mapa con clusters y eventos sugeridos según lat/lng del usuario
- [ ] Indicador de calidad de cobertura de red por zona
- [ ] Contenido offline sugerido cuando la cobertura es baja
- [ ] Contador social de personas en la zona
- [ ] Filtros por categoría / área / perfil
- [ ] Diseño responsivo + mobile-first

## Prioridad
Alta

## Etiquetas
`frontend` `experiencias` `testimonios` `mapa` `conectividad` `offline`
