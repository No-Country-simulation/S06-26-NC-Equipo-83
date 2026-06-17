from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración central de la aplicación.

    Lee variables de entorno desde el archivo .env automáticamente.
    Si una variable no existe, usa el valor por defecto definido acá.
    """
    # Base de datos — las credenciales vienen de docker-compose.yml
    DATABASE_URL: str= ""

    # Seguridad JWT — importado desde app.core.security
    SECRET_KEY: str = "cambiar-por-una-clave-segura-de-al-menos-32-caracteres"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Google Gemini — importado desde app.services.ia_agent
    IA_API_KEY: str = ""
    IA_MODEL: str = "gemini-2.0-flash"

    # Groq — alternativa a Gemini con más cuota gratuita
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


# Instancia ÚNICA para todo el proyecto.
# Todos los demás archivos harán: from app.core.config import settings
settings = Settings()