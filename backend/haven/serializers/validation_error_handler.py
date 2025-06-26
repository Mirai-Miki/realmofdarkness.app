from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def validation_error_handler(errors):
    error = errors.get("name", None)
    if error is None:
        error = errors.get("non_field_errors", None)

    if error is not None and len(error):
        error = error[0]
    else:
        logger.error(f"Validation errors: {errors}")
        Response(status=status.HTTP_400_BAD_REQUEST)

    if getattr(error, "code", "invalid") != "invalid":
        return Response(error, status=error.code)

    return Response(error, status=status.HTTP_400_BAD_REQUEST)
