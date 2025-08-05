from typing import Any
from rest_framework import status


class CharacterManagerException(Exception):
    """
    Base exception class for Character Manager operations.

    All exceptions raised by CharacterManager and ImageManager should inherit from this class.
    Provides HTTP status codes and structured error messages for consistent API responses.
    """

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Any = None,
        log: bool = True,
    ):
        """
        Initialize CharacterManagerException.

        Args:
            message: Human-readable error message
            status_code: HTTP status code for API responses
            details: Optional additional error details
        """
        self.message = message
        self.status_code = status_code
        self.details = details
        self.log = log  # Flag to indicate if this error should be logged
        super().__init__(self.message)


class CharacterNotFoundError(CharacterManagerException):
    """Raised when a requested character cannot be found."""

    def __init__(
        self,
        character_id: str = "",
        message: str = "Character not found",
        log: bool = False,
    ):
        super().__init__(
            f"{message}: {character_id}" if character_id else message,
            status.HTTP_404_NOT_FOUND,
            log=log,
        )


class ChronicleNotFoundError(CharacterManagerException):
    """Raised when a requested chronicle cannot be found."""

    def __init__(
        self,
        chronicle_id: str = "",
        message: str = "Chronicle not found",
        log: bool = True,
    ):
        super().__init__(
            f"{message}: {chronicle_id}" if chronicle_id else message,
            status.HTTP_404_NOT_FOUND,
            log=log,
        )


class PermissionDeniedError(CharacterManagerException):
    """Raised when user lacks permission for requested operation."""

    def __init__(
        self,
        message: str = "Permission denied",
        log: bool = True,
    ):
        super().__init__(message, status.HTTP_403_FORBIDDEN, log=log)


class ValidationError(CharacterManagerException):
    """Raised when data validation fails."""

    def __init__(
        self, message: str = "Validation failed", details: Any = None, log: bool = True
    ):
        super().__init__(message, status.HTTP_400_BAD_REQUEST, details, log=log)


class DuplicateCharacterError(CharacterManagerException):
    """Raised when attempting to create a character with a name that already exists."""

    def __init__(
        self,
        character_name: str = "",
        message: str = "Character name already exists",
        log: bool = False,
    ):
        super().__init__(
            f"{message}: {character_name}" if character_name else message,
            status.HTTP_409_CONFLICT,
            log=log,
        )


class CharacterLimitExceededError(CharacterManagerException):
    """Raised when user has reached their character creation limit."""

    def __init__(self, message: str = "Character limit exceeded", log: bool = False):
        super().__init__(message, status.HTTP_429_TOO_MANY_REQUESTS, log=log)


class ImageValidationError(CharacterManagerException):
    """Raised when image validation fails."""

    def __init__(
        self,
        message: str = "Image validation failed",
        details: Any = None,
        log: bool = False,
    ):
        super().__init__(message, status.HTTP_400_BAD_REQUEST, details, log=log)


class ImageDownloadError(CharacterManagerException):
    """Raised when image download fails."""

    def __init__(
        self,
        message: str = "Image download failed",
        details: Any = None,
        log: bool = True,
    ):
        super().__init__(message, status.HTTP_502_BAD_GATEWAY, details, log=log)


class ImageTooLargeError(CharacterManagerException):
    """Raised when image exceeds size limits."""

    def __init__(
        self, message: str = "Image too large", size_mb: float = 0, log: bool = False
    ):
        details = {"size_mb": size_mb} if size_mb > 0 else None
        super().__init__(
            message, status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, details, log=log
        )


class ImageFormatUnsupported(CharacterManagerException):
    """Raised when image format is unsupported."""

    def __init__(self, message: str = "Image format unsupported", log: bool = False):
        super().__init__(message, status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, log=log)
