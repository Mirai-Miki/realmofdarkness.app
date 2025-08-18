import logging

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .permissions import BotAPIKeyPermission
from haven.errors import CharacterManagerException

logger = logging.getLogger(__name__)


class BotBaseAPIView(APIView):
    """Base APIView that applies BotAPIKeyPermission and centralized logging."""

    permission_classes = [BotAPIKeyPermission]

    def handle_exception(self, exc: Exception) -> Response:
        """Centralized error logging for user view exceptions."""
        body = getattr(getattr(self, "request", None), "body", "No body available")

        if isinstance(exc, CharacterManagerException):
            logger.exception(
                f"[CharacterManagerException] {self.__class__.__name__} encountered an error",
                exc_info=exc,
                extra={"body": body},
            )
            return Response(
                {"error": exc.message, "details": exc.details}, status=exc.status_code
            )
        logger.exception(
            f"[{self.__class__.__name__}] Unhandled exception",
            exc_info=exc,
            extra={"body": body},
        )
        return Response(
            {"error": "An unexpected error occurred"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
