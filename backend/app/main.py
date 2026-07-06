"""
App BiT — Backend API
Personal Guidance Ecosystem for Shark Tank BiT

FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth
from app.routers import salud
from app.routers import orientar
from app.routers import experiencias
from app.routers import events

# ---------------------------------------------------------------------------
# Application metadata
# ---------------------------------------------------------------------------
app = FastAPI(
    title="App BiT — Backend API",
    description="Personal Guidance Ecosystem for Shark Tank BiT",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — configurar origins apropiadamente en producción
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Montar routers
app.include_router(auth.router)
app.include_router(salud.router)
app.include_router(orientar.router)
app.include_router(experiencias.router)
app.include_router(events.router)


# ---------------------------------------------------------------------------
# Health-check endpoint
# ---------------------------------------------------------------------------
@app.get("/health", tags=["system"])
async def health_check() -> dict[str, str]:
    """
    Verify that the API is running and responsive.

    Returns a JSON object with the service status and version.
    """
    return {
        "status": "ok",
        "service": "App BiT — Backend API",
        "version": app.version,
    }
