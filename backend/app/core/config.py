from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración central de la aplicación.

    Lee variables de entorno desde el archivo .env automáticamente.
    Si una variable no existe, usa el valor por defecto definido acá.
    """
    # Base de datos — las credenciales vienen de docker-compose.yml
    DATABASE_URL: str

    # Seguridad JWT — importado desde app.core.security
    SECRET_KEY: str 
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # Google Gemini — importado desde app.services.ia_agent
    IA_API_KEY: str
    IA_MODEL: str 

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


# Instancia ÚNICA para todo el proyecto.
# Todos los demás archivos harán: from app.core.config import settings
settings = Settings()