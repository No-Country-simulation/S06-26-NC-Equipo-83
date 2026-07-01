## INCIDENCIA 08b — OrientarService + Fixes para Step 3 v3

## Resumen

Esta incidencia actualiza el `OrientarService` para que no reviente con los nuevos usuarios del schema v3. Se agrega una guarda para `professional_level is None` (usuarios nuevos no tendrán este campo seteado) y se migra la lectura de `tech_area` (single string) a `interest_areas` (array, tomando el primer elemento). También se aplican los fixes de frontend necesarios para que `dashboardPage` y `orientationPage` compilen tras el cambio de `professional_level` a nullable.

**Rama:** `incidencia/08b-orientar-service`  
**Duración estimada:** 2 horas.  
**Depende de:** 07 terminada y mergeada a main.  
**Asignada a:** 1 dev backend.  
**Paralelizable con:** 08a (AuthService). Ambas dependen de 07 pero no entre sí.

### ¿Qué vas a aprender en esta incidencia?

| Concepto | ¿Qué es? |
|----------|---------|
| Guard clause con `is None` | Validar que un valor opcional existe antes de usarlo |
| `valor if condicion else default` | Operador ternario en Python — misma idea que `? :` en JS |
| `len(lista) > 0` como guarda | Verificar que una lista no está vacía antes de indexarla |
| `||` en TypeScript | Operador de fallback — `valor || default` devuelve `default` si `valor` es falsy |

### Pre-lectura (15 min)

| Archivo | ¿Por qué? |
|---------|----------|
| `app/services/orientar.py` | Vas a modificar `analizar_perfil()` |
| `app/models/user.py` | `interest_areas` es `list[str]`, `professional_level` es `Optional` |
| `frontend/src/modules/dashboard/dashboardPage.tsx` | Vas a agregar `|| "junior"` |
| `frontend/src/modules/orientation/orientationPage.tsx` | Vas a agregar `|| "junior"` |

### Antes de codear: flujo git

```bash
git checkout main
git pull origin main            # 07 y 08a ya mergeados
git checkout -b incidencia/08b-orientar-service
```

### Paso a paso

#### Archivo 1: `backend/app/services/orientar.py`

Modificá el método `analizar_perfil()`. Dos cambios:

**1. Null guard para `professional_level`:**
Antes:
```python
nivel_real = user.professional_level.value
```
Después:
```python
nivel_real = (
    user.professional_level.value
    if user.professional_level is not None
    else "junior"
)
```

Si el usuario es nuevo (registro v3), `professional_level` es `None`. Sin esta guarda, `None.value` lanza `AttributeError` y el endpoint de orientación revienta. Usamos `"junior"` como fallback seguro.

**2. Migrar `tech_area` → `interest_areas`:**
Antes:
```python
area = user.tech_area.lower() if user.tech_area else ""
```
Después:
```python
area = ""
if user.interest_areas and len(user.interest_areas) > 0:
    area = user.interest_areas[0].lower()
elif user.tech_area:
    area = user.tech_area.lower()
```

`interest_areas` es una LISTA (el usuario puede elegir varias). Para el análisis de orientación tomamos la primera como área principal. Si `interest_areas` está vacía (usuario legacy), hacemos fallback a `tech_area` (campo viejo).

**Importante:** No cambies los métodos `_calcular_gap()`, `_trayectoria_por_area()`, `_vacantes_por_area()`, `_calcular_confianza()`. Esos siguen funcionando igual — solo cambió DE DÓNDE viene el área.

Actualizá el docstring del método para reflejar los cambios.

#### Archivo 2: `frontend/src/modules/dashboard/dashboardPage.tsx` y `frontend/src/modules/orientation/orientationPage.tsx`

**IMPORTANTE: Estos son archivos del frontend, pero su fix es consecuencia directa de hacer `professional_level` nullable en la incidencia 07. Hacelos ahora para que el proyecto compile.**

En ambos archivos, `user.professional_level` ahora puede ser `null`. Donde se lee sin fallback, TypeScript falla.

**dashboardPage.tsx — línea ~40:**
```typescript
// Antes
nivel: user.professional_level,
// Después
nivel: user.professional_level || "junior",
```

**orientationPage.tsx — línea ~17:**
```typescript
// Antes
nivel: user.professional_level,
// Después
nivel: user.professional_level || "junior",
```

### Verificación completa

```bash
# 1. Python compila sin errores
python -m py_compile app/services/orientar.py && echo "OK orientar"

# 2. App carga sin errores
python -c "from app.main import app; print('App OK')"

# 3. Frontend compila sin errores
cd ../frontend && npx tsc --noEmit && cd ../backend

# 4. Tests completos
python -m pytest tests/ -v
# Esperado: 30 passed
```

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `AttributeError: 'NoneType' object has no attribute 'value'` | Estás llamando a `user.professional_level.value` sin la guarda `is None` | Agregá la guarda como en el código de arriba |
| `TypeError: object of type 'NoneType' has no len()` | Estás haciendo `len(user.interest_areas)` sin verificar que no sea `None` | Agregá `if user.interest_areas and len(...)` |
| `Property 'professional_level' does not exist on type` en dashboard/orientation | El tipo `User` en frontend no se actualizó (incidencia 09) | Si 09 no está mergeada, el error es esperable. Si 09 ya está mergeada, verificá que `User.professional_level` sea `ProfessionalLevel \| null` |

### Criterios de aceptación Incidencia 08b

- [ ] `OrientarService.analizar_perfil()` no rompe si `professional_level` es `None`
- [ ] `OrientarService.analizar_perfil()` lee de `interest_areas[0]` con fallback a `tech_area`
- [ ] `dashboardPage.tsx` compila sin error en `user.professional_level` (usa `|| "junior"`)
- [ ] `orientationPage.tsx` compila sin error en `user.professional_level` (usa `|| "junior"`)
- [ ] Tests existentes (30) siguen pasando
- [ ] Commit con: `fix(orientar): null guard para professional_level + migrar a interest_areas`

---
