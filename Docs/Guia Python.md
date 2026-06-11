# Python — Guía rápida para el equipo

## Descargar Python

| Sistema | Descarga |
|---------|----------|
| Windows | [python.org/downloads](https://www.python.org/downloads/) — marcar ✅ "Add Python to PATH" |
| macOS | `brew install python` o desde [python.org](https://www.python.org/downloads/) |
| Linux | `sudo apt install python3 python3-pip python3-venv` |

### Versión recomendada

**Python 3.12** (3.11+ funciona igual)

Verificar instalación:
```bash
python --version
pip --version
```

---

## pip — gestor de paquetes

pip viene instalado con Python desde la 3.4.

### Comandos esenciales

```bash
pip install <paquete>        # Instalar un paquete
pip install -r requirements.txt  # Instalar todas las dependencias
pip list                     # Ver paquetes instalados
pip freeze > requirements.txt  # Guardar dependencias actuales
pip uninstall <paquete>      # Desinstalar
```

---

## Entorno virtual (venv)

Aislar dependencias por proyecto. **Siempre usar venv.**

```bash
# Crear entorno virtual
python -m venv venv

# Activar (Windows)
venv\Scripts\activate

# Activar (macOS / Linux)
source venv/bin/activate

# Desactivar
deactivate
```

Una vez activado, `pip install` instala solo dentro del proyecto.

---

## FastAPI — framework backend

Elegido por el equipo para el backend.

```bash
pip install fastapi uvicorn
```

### Ejemplo mínimo

`main.py`:
```python
from fastapi import FastAPI

app = FastAPI(title="App BiT API")

@app.get("/health")
def health():
    return {"status": "ok"}
```

### Ejecutar

```bash
uvicorn main:app --reload
# http://localhost:8000
# http://localhost:8000/docs  (Swagger automático)
```

---

## Dependencias del proyecto

Agregar a `requirements.txt`:

```
fastapi==0.115.0
uvicorn==0.30.0
sqlalchemy==2.0.35
alembic==1.13.0
pydantic==2.9.0
python-jose[cryptography]==3.3.0
httpx==0.27.0
python-dotenv==1.0.0
```

Instalar todo de una vez:
```bash
pip install -r requirements.txt
```

---

## Resumen rápido

```bash
# 1. Crear carpeta del proyecto
mkdir backend && cd backend

# 2. Crear y activar entorno virtual
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate  # Mac/Linux

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Correr servidor
uvicorn app.main:app --reload
```

---

## Recursos

- [Python oficial](https://python.org)
- [FastAPI docs](https://fastapi.tiangolo.com)
- [SQLAlchemy docs](https://docs.sqlalchemy.org)
- [Alembic docs](https://alembic.sqlalchemy.org)
