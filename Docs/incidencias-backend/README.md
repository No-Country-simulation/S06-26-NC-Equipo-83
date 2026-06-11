# Incidencias Backend — Guía Completa para Juniors sin Experiencia en Python

> **LEÉ ESTO ANTES DE TOCAR UNA SOLA LÍNEA DE CÓDIGO.**
>
> Python no es como JavaScript, Java o C#. Tres diferencias que te van a salvar horas de frustración:
>
> 1. **La indentación ES sintaxis.** En JS las llaves `{}` definen bloques. En Python son los espacios. Si ponés 3 espacios en vez de 4, el programa no corre. **Usá siempre 4 espacios, nunca tabs.**
> 2. **No hay `console.log`.** Es `print()`. Ejemplo: `print(f"DEBUG: {variable}")`. La `f` antes de las comillas permite meter variables dentro del string.
> 3. **Los imports son rutas de archivos.** `from app.models.user import User` significa: "del archivo `backend/app/models/user.py`, traeme la clase `User`". El punto es separador de carpetas, como `/` en una URL.
>
> **Tu kit de supervivencia para debuggear:**
> ```python
> print(f"DEBUG: x = {x}")           # console.log
> print(type(objeto))                 # qué tipo de dato es
> print(dir(objeto))                  # qué atributos y métodos tiene
> ```
>
> **Cómo leer un traceback (pantalla roja de error):**
> ```
> Traceback (most recent call last):
>   File "app/routers/auth.py", line 15, in register   ← ARCHIVO y LÍNEA del error
>     return service.register(user_data)
>   File "app/services/auth.py", line 22, in register
>     raise HTTPException(status_code=409, detail="...")
> fastapi.exceptions.HTTPException                      ← TIPO DE ERROR
> ```
> Leelo de **abajo hacia arriba**: la última línea es el tipo de error, la anterior es dónde ocurrió exactamente.

---

## Índice de Incidencias

| # | Archivo | ¿Qué se construye? |
|---|---------|-------------------|
| 00 | [00-onboarding.md](./00-onboarding.md) | Setup del entorno: clonar, venv, PostgreSQL, Swagger |
| 01 | [01-fundacion.md](./01-fundacion.md) | Conexión a DB, variables de entorno, stub de IA |
| 02a | [02a-security-user-repo.md](./02a-security-user-repo.md) | JWT + bcrypt + queries de usuarios |
| 02b | [02b-auth-endpoints.md](./02b-auth-endpoints.md) | Endpoints de registro y login |
| 03 | [03-ia-agent.md](./03-ia-agent.md) | Agente de IA real con Google Gemini |
| 04 | [04-salud-checkin.md](./04-salud-checkin.md) | Endpoint de check-in emocional con crisis |
| 05 | [05-orientar-endpoint.md](./05-orientar-endpoint.md) | Endpoint de orientación profesional |

---

## Mapa Final de Dependencias

```
Día 1          │  01-fundacion (Dev A)
               │  Los otros 3 hacen Incidencia 00 (onboarding)
               │
Día 2-4        │  02a-security-repo (Dev A) ═══  03-ia-agent (Dev B) ═══  04-salud (Dev C)
               │  Depende de 01               │  Depende de 01        │  Depende de 01 (stub)
               │                              │  Paralelo con 02a     │  Paralelo con todos
               │                              │                       │
Día 3-5        │  02b-auth-endpoints (Dev A)  │  04-salud (Dev C)     │  05-orientar (Dev D)
               │  Depende de 01 + 02a         │  continúa             │  Depende de 01 + 02a
               │                              │                       │
Día 5          │  INTEGRACIÓN: Dev C reemplaza stub de IA por agente real de 03
               │  Todos corren `python -m pytest tests/ -v`
               │  Verificación completa de todos los endpoints en Swagger
```

**Ningún dev queda bloqueado más que lo que tarda el dev de 01 en terminar (1 día).** Después de eso, los 4 trabajan en paralelo.

**El archivo `repositories/user.py` de 02a es el único punto de sincronización** entre features. Lo crea el dev de 02a en sus primeras 2-3 horas. Apenas existe, los devs de 04 (salud) y 05 (orientar) pueden importarlo.
