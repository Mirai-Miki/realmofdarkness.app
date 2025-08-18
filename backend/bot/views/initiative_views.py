"""
Initiative Tracker (20th) internal endpoints.

Authentication: BotAPIKeyPermission (local IP + API key)

Consolidated APIView:
- POST   /bot/initiative/set        Body: {"channel_id": "<id>", "chronicle_id": "<id>", "tracker": { ... }}
- GET    /bot/initiative/get?channel_id=<id>
- DELETE /bot/initiative/delete     Body: {"channel_id": "<id>"}

Deprecated individual views are provided for backward compatibility and
internally delegate to the consolidated view.
"""

from __future__ import annotations

from typing import Any, Dict, Mapping, Optional, cast

import logging
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status

from .bot_base_api_view import BotBaseAPIView
from bot.models import InitiativeTracker20th
from bot.serializers import InitiativeTracker20thSerializer

logger = logging.getLogger(__name__)


class InitiativeView(BotBaseAPIView):
    """Manage initiative trackers for Discord channels."""

    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Create or update a tracker for a channel.

        Body format:
        {
            "channel_id": "<discord_channel_id>",
            "chronicle_id": "<chronicle_id>",
            "tracker": <tracker_data>
        }

        Returns:
        - 200: Tracker created or updated successfully
        - 400: Invalid data
        """
        payload: Dict[str, Any]
        data_obj: Any = request.data
        if isinstance(data_obj, Mapping):
            payload = dict(data_obj)  # type: ignore[arg-type]
        else:
            payload = cast(Dict[str, Any], data_obj)

        serializer_data: Dict[str, Any] = {
            "id": payload.get("channel_id"),
            "chronicle_id": payload.get("chronicle_id"),
            "data": payload.get("tracker"),
        }

        tracker_id = serializer_data.get("id")
        if tracker_id is None:
            logger.error(
                "[InitiativeView.post] channel_id is required",
                extra={"body": getattr(request, "body", "")},
            )
            return Response(
                {"detail": "channel_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            tracker = InitiativeTracker20th.objects.get(pk=tracker_id)
            serializer = InitiativeTracker20thSerializer(
                tracker, data=serializer_data, partial=True
            )
        except InitiativeTracker20th.DoesNotExist:
            serializer = InitiativeTracker20thSerializer(data=serializer_data)

        if not serializer.is_valid():
            logger.error(
                f"[InitiativeView.post] Initiative serializer validation failed: {serializer.errors}",
                extra={"body": getattr(request, "body", "")},
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        saved = serializer.save()
        return Response(
            InitiativeTracker20thSerializer(saved).data, status=status.HTTP_200_OK
        )

    def get(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Fetch a tracker by channel ID.

        Query params:
        - channel_id: Discord channel ID

        Returns:
        - 200: {"tracker": <tracker_data>}
        - 204: Tracker not found
        - 400: Invalid parameters
        """
        channel_id: Optional[str] = request.query_params.get("channel_id")
        if not channel_id:
            logger.error("[InitiativeView.get] channel_id is required")
            return Response(
                {"detail": "channel_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            tracker = InitiativeTracker20th.objects.get(pk=channel_id)
        except InitiativeTracker20th.DoesNotExist:
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response({"tracker": tracker.data}, status=status.HTTP_200_OK)

    def delete(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Delete a tracker by channel ID.

        Body format:
        {
            "channel_id": "<discord_channel_id>"
        }

        Returns:
        - 200: Tracker deleted successfully
        - 204: Tracker not found
        - 400: Invalid data
        """
        payload: Dict[str, Any]
        data_obj: Any = request.data
        if isinstance(data_obj, Mapping):
            payload = dict(data_obj)  # type: ignore[arg-type]
        else:
            payload = cast(Dict[str, Any], data_obj)

        channel_id = payload.get("channel_id")
        if not channel_id:
            logger.error("[InitiativeView.delete] channel_id is required")
            return Response(
                {"detail": "channel_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            tracker = InitiativeTracker20th.objects.get(pk=channel_id)
        except InitiativeTracker20th.DoesNotExist:
            return Response(status=status.HTTP_204_NO_CONTENT)

        tracker.delete()
        return Response(status=status.HTTP_200_OK)
