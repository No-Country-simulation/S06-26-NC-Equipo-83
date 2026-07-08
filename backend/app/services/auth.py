from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.repositories.user import get_user_by_email, create_user
from app.core.security import hash_password, verify_password, create_access_token
from app.services.geo_validator import (
    validate_geographic_consistency,
    GeographicValidationError,
)
from app.repositories.user import get_user_by_email, create_user, update_user


class AuthService:
    """Lógica de negocio para autenticación de usuarios.

    Recibe una session de SQLModel por inyección de dependencias.
    Orquesta repositories, validación geográfica y security.
    """

    def __init__(self, session: Session):
        self.session = session

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

        # La construcción de User() ejecuta el field_validator de E.164
        db_user = User(**user_dict)
        created_user = create_user(self.session, db_user)

        token = create_access_token(data={"sub": str(created_user.id)})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": created_user,
        }

    def login(self, email: str, password: str) -> dict[str, str]:
        """Autentica a un usuario y devuelve un token JWT.

        Flujo:
        1. Busca el usuario por email.
        2. Verifica que exista y que la contraseña coincida.
        3. Si algo falla → 401 (mismo error para no dar pistas).
        4. Si todo OK → genera JWT con el user_id como subject.
        """
        user = get_user_by_email(self.session, email)

        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas.",
            )

        token = create_access_token(data={"sub": str(user.id)})
        return {"access_token": token, "token_type": "bearer"}

    def update_profile(self, user: User, data) -> User:
        """Actualiza el perfil del usuario autenticado.

        Usa exclude_unset=True para que solo los campos que el frontend
        ENVIÓ EXPLÍCITAMENTE se actualicen. Si el frontend manda
        {"full_name": "Nuevo Nombre"}, los demás campos quedan intactos.
        """
        update_data = data.model_dump(exclude_unset=True)
        return update_user(self.session, user, update_data)
