from .user import (
    UserCreate,
    UserResponse,
    UserLogin,
    TokenResponse,
)

from .orientar import (
    OrientarRequest,
    OrientarResponse,
    JobMatchDetail,
    CourseRecommendation,
)

from .salud import (
    SaludRequest,
    SaludResponse,
)

__all__ = [
    "UserCreate",
    "UserResponse",
    "UserLogin",
    "TokenResponse",
    "OrientarRequest",
    "OrientarResponse",
    "JobMatchDetail",
    "CourseRecommendation",
    "SaludRequest",
    "SaludResponse",
]