"""
App BiT — Backend API
Personal Guidance Ecosystem for Shark Tank BiT

FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    allow_origins=["*"],  # TODO: restringir en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
