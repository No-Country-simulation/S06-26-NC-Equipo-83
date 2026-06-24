from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.repositories.user import get_user_by_email, create_user
from app.core.security import hash_password, verify_password, create_access_token


class AuthService:
    """Lógica de negocio para autenticación de usuarios.

    Recibe una session de SQLModel por inyección de dependencias.
    Orquesta repositories y security — no escribe queries directamente.
    """

    def __init__(self, session: Session):
        """Guarda la sesión para usarla en los métodos.

        En Python, __init__ es el constructor. Se ejecuta cuando hacés
        AuthService(session). El parámetro 'self' se pasa automáticamente
        y representa la instancia creada.
        """
        self.session = session

    def register(self, user_data: UserCreate) -> dict:
        """Registra un nuevo usuario y devuelve token + datos.

        Flujo:
        1. Verifica que el email no exista → 409 si ya está registrado.
        2. Hashea la contraseña — NUNCA se guarda en texto plano.
        3. Crea el usuario en la base de datos.
        4. Genera JWT para que la sesión quede iniciada automáticamente.

        IMPORTANTE: UserCreate (schema) tiene 'password'.
        User (modelo de DB) tiene 'hashed_password'.
        Son campos distintos. No los confundas.
        """
        existing_user = get_user_by_email(self.session, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El email ya está registrado.",
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

    def login(self, email: str, password: str) -> dict[str, str]:
        """Autentica a un usuario y devuelve un token JWT.

        Flujo:
        1. Busca el usuario por email.
        2. Verifica que exista y que la contraseña coincida.
        3. Si algo falla → 401 (mismo error para no dar pistas).
        4. Si todo OK → genera JWT con el user_id como subject.
        """
        user = get_user_by_email(self.session, email)

        # Verificación en UNA sola línea — falla si user es None
        # o si la contraseña no coincide
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas.",
            )

        # El campo "sub" (subject) del JWT es el user_id como string.
        # Es estándar JWT usar "sub" para identificar al usuario.
        token = create_access_token(data={"sub": str(user.id)})
        return {"access_token": token, "token_type": "bearer"}