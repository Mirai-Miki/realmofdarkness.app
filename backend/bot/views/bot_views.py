"""
Bot endpoints for managing bot metadata via the internal API.
"""

from __future__ import annotations

from typing import Any, Dict, Mapping, cast

import logging
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status

from .bot_base_api_view import BotBaseAPIView
from bot.serializers import BotSerializer

logger = logging.getLogger(__name__)


class BotView(BotBaseAPIView):
    """Manage bot registrations."""

    def post(self, request: Request) -> Response:
        """Create or update a bot registration.

        Body format:
        {
            "id": "<discord_bot_id>",
            "username": "<bot_username>",
            "token": "<bot_token>"
        }

        Returns:
        - 200: Bot created or updated successfully
        - 400: Invalid data
        """
        data_obj: Any = request.data
        if isinstance(data_obj, Mapping):
            payload: Dict[str, Any] = dict(data_obj)
        else:
            # Fallback: attempt to cast, DRF should provide a Mapping for JSON
            payload = cast(Dict[str, Any], data_obj)

        serializer = BotSerializer(data=payload)

        if not serializer.is_valid():
            body = getattr(request, "body", "No body available")
            logger.error(
                f"Bot upsert failed validation: {serializer.error_messages}",
                extra={"body": body},
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        saved = serializer.save()
        return Response(BotSerializer(saved).data, status=status.HTTP_200_OK)
