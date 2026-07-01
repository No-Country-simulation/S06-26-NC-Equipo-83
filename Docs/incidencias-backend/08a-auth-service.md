## INCIDENCIA 08a — AuthService para Step 3 v3

## Resumen

Esta incidencia actualiza el `AuthService` para que funcione correctamente con los nuevos campos del schema v3. Se elimina la derivación automática de `professional_level` (el registro ya no asigna este valor) y se verifica que la validación geográfica esté correctamente integrada. El método `login()` no se toca.

**Rama:** `incidencia/08a-auth-service`  
**Duración estimada:** 2 horas.  
**Depende de:** 07 terminada y mergeada a main.  
**Asignada a:** 1 dev backend.  
**Paralelizable con:** 08b (OrientarService). Ambas dependen de 07 pero no entre sí.

### ¿Qué vas a aprender de Python en esta incidencia?

| Concepto | ¿Qué es? |
|----------|---------|
| `HTTPException` con `status_code` | Cómo devolver errores HTTP específicos (409, 422) desde el servicio |
| `try/except` con excepciones custom | Capturar errores de validación geográfica y convertirlos en respuestas HTTP |
| `model_dump()` + `pop()` | Convertir schema a dict y extraer un campo en una sola línea |
| `**user_dict` (desempaquetado) | Pasar un diccionario como argumentos nombrados al constructor de `User` |

### Pre-lectura (15 min)

| Archivo | ¿Por qué? |
|---------|----------|
| `app/services/auth.py` | Vas a modificar el método `register()` |
| `app/services/geo_validator.py` | Validación geográfica que AuthService debe llamar — verificá que existe |
| `app/schemas/user.py` | `UserCreate` ya no requiere `professional_level` (cambio de 07) |
| `app/models/user.py` | `professional_level` ahora es `Optional` — el registro lo deja como `None` |

### Antes de codear: flujo git

```bash
git checkout main
git pull origin main            # Asegurate de que 07 ya esté mergeado
git checkout -b incidencia/08a-auth-service
```

### Paso a paso

#### Archivo 1: `backend/app/services/auth.py`

**IMPORTANTE: Solo modificá el método `register()`. El método `login()` no se toca.**

Tres cambios en `register()`:

**1. Remové la lógica que derivaba `professional_level`.**
Si ves algo como `user_dict["professional_level"] = ...`, borralo. El registro NO asigna `professional_level` — queda como `None`.

**2. Agregá validación geográfica.**
El servicio DEBE validar que los códigos ISO de continente, país y estado sean coherentes usando `geo_validator.py`. Esto estaba en una versión anterior pero se perdió — recuperalo.

**3. Actualizá el docstring.**
Agregá una nota explicando que `professional_level` no se deriva automáticamente.

El método `register()` completo debe quedar así:

```python
def register(self, user_data: UserCreate) -> dict:
    """Registra un nuevo usuario con validación geográfica y telefónica.

    Flujo:
    1. Verifica que el email no exista → 409 si ya está registrado.
    2. Valida coherencia geográfica (pycountry) → 422 si inconsistente.
    3. Hashea la contraseña.
    4. Crea el usuario en la base de datos (field_validator de E.164 corre acá).
    5. Genera JWT para login automático.

    NOTA: professional_level no se deriva automáticamente. El registro
    no asigna valor; queda como None hasta que el usuario lo configure
    explícitamente desde su perfil.
    """
    existing_user = get_user_by_email(self.session, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El email ya está registrado.",
        )

    # Validación geográfica cruzada (ISO 3166-1 / 3166-2)
    try:
        validate_geographic_consistency(
            continent_code=user_data.continent_code,
            country_code=user_data.country_code,
            state_code=user_data.state_code,
        )
    except GeographicValidationError as geo_error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(geo_error),
        )

    user_dict = user_data.model_dump()
    user_dict["hashed_password"] = hash_password(user_dict.pop("password"))

    db_user = User(**user_dict)
    created_user = create_user(self.session, db_user)

    token = create_access_token(data={"sub": str(created_user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": created_user,
    }
```

Verificá que los imports al inicio del archivo incluyan:
```python
from app.services.geo_validator import (
    validate_geographic_consistency,
    GeographicValidationError,
)
```

### Verificación completa

```bash
# 1. Python compila sin errores
python -m py_compile app/services/auth.py && echo "OK auth"

# 2. App carga sin errores
python -c "from app.main import app; print('App OK')"

# 3. Tests
python -m pytest tests/ -v
# Esperado: 30 passed
```

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `ImportError: cannot import name 'GeographicValidationError'` | El import en auth.py no existe o está mal escrito | Revisá `app/services/geo_validator.py` |
| `422 Unprocessable Entity` al registrar | La validación geográfica encontró un código de país/estado inválido | Revisá que los códigos ISO que envía el frontend existan en pycountry |

### Criterios de aceptación Incidencia 08a

- [ ] `AuthService.register()` NO deriva `professional_level` — lo deja como `None`
- [ ] `AuthService.register()` ejecuta validación geográfica antes de crear el usuario
- [ ] Tests existentes (30) siguen pasando
- [ ] Commit con: `fix(auth): eliminar derivación de professional_level en registro`

---
