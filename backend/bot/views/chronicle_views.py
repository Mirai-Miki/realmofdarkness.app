"""
Chronicle internal endpoints (localhost-only).

Authentication: BotAPIKeyPermission (local IP + API key)

Notes:
- Channels events are abstracted via EventsPublisher placeholder.
- Endpoints are refactored to DRF APIViews with explicit request formats.
"""

from __future__ import annotations

from typing import Any, Dict, Mapping, cast
import logging

from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status

from .bot_base_api_view import BotBaseAPIView
from chronicle.models import Chronicle, StorytellerRole, Member
from chronicle.serializers import (
    ChronicleSerializer,
    StorytellerRoleSerializer,
)
from .events import EventsPublisher

logger = logging.getLogger(__name__)
_events = EventsPublisher()


class ChronicleView(BotBaseAPIView):
    """Chronicle operations: create/update and delete."""

    def post(self, request: Request) -> Response:
        """Create or update a chronicle using the serializer for validation.

        Body format:
        {
            "chronicle_id": "<chronicle_id>",
            "name": "<string, optional>",
            "icon_url": "<url, optional>",
            "owner_id": "<user_id, optional>"
        }

        Returns:
        - 200: Chronicle created or updated successfully
        - 400: Invalid data
        """
        payload: Dict[str, Any] = (
            dict(request.data)
            if isinstance(request.data, Mapping)
            else cast(Dict[str, Any], request.data)
        )
        chronicle_id = payload.get("chronicle_id")
        if not chronicle_id:
            logger.error(
                "[ChronicleView.post] chronicle_id is required",
                extra={"body": getattr(request, "body", "")},
            )
            return Response(
                {"detail": "chronicle_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Map incoming payload to serializer fields
        serializer_input: Dict[str, Any] = {
            "id": str(chronicle_id),
            "name": payload.get("name", str(chronicle_id)),
            "icon_url": payload.get("icon_url", ""),
            "owner_id": str(payload.get("owner_id", 0) or 0),
        }

        serializer = ChronicleSerializer(data=serializer_input)

        if not serializer.is_valid():
            logger.error(
                f"[ChronicleView.post] Chronicle serializer validation failed: {serializer.errors}",
                extra={"body": getattr(request, "body", "")},
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        chronicle = cast(Chronicle, serializer.save())

        try:
            _events.chronicle_updated(chronicle.id)
        except Exception:  # pragma: no cover - defensive
            logger.exception(
                "Failed to emit chronicle_updated for chronicle=%s", chronicle.id
            )

        return Response(status=status.HTTP_200_OK)

    def delete(self, request: Request) -> Response:
        """Delete a chronicle and emit member delete events for its members.

        Body format:
        {
            "chronicle_id": "<chronicle_id>"
        }

        Returns:
        - 200: Chronicle deleted successfully
        - 204: Chronicle not found
        - 400: Invalid data
        """
        payload = (
            dict(request.data)
            if isinstance(request.data, Mapping)
            else cast(Dict[str, Any], request.data)
        )
        chronicle_id = payload.get("chronicle_id")
        if not chronicle_id:
            logger.error(
                "[ChronicleView.delete] chronicle_id is required",
                extra={"body": getattr(request, "body", "")},
            )
            return Response(
                {"detail": "chronicle_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            chronicle = Chronicle.objects.get(pk=chronicle_id)
        except Chronicle.DoesNotExist:
            return Response(status=status.HTTP_204_NO_CONTENT)

        members = Member.objects.filter(chronicle=chronicle)
        for member in members:
            try:
                _events.member_deleted(member.user.id, member.chronicle.id)
            except Exception:  # pragma: no cover - defensive
                logger.exception(
                    "Failed to emit member delete for user=%s chronicle=%s",
                    member.user.id,
                    member.chronicle.id,
                )
        chronicle.delete()
        return Response(status=status.HTTP_200_OK)


class TrackerChannelView(BotBaseAPIView):
    """Manage tracker channel for chronicles."""

    def post(self, request: Request) -> Response:
        """Set the tracker channel for a chronicle.

        Body format:
        {
            "chronicle_id": "<chronicle_id>",
            "channel_id": "<channel_id>"
        }

        Returns:
        - 200: Tracker channel set successfully
        - 400: Invalid data
        - 404: Chronicle not found
        """
        payload: Dict[str, Any] = (
            dict(request.data)
            if isinstance(request.data, Mapping)
            else cast(Dict[str, Any], request.data)
        )
        chronicle_id = payload.get("chronicle_id")
        channel_id = payload.get("channel_id")
        if not chronicle_id or not channel_id:
            logger.error(
                "[TrackerChannelView.post] chronicle_id and channel_id are required"
            )
            return Response(
                {"detail": "chronicle_id and channel_id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            chronicle = Chronicle.objects.get(id=chronicle_id)
        except Chronicle.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Validate and persist via serializer
        ser = ChronicleSerializer(
            chronicle, data={"tracker_channel": str(channel_id)}, partial=True
        )
        if not ser.is_valid():
            logger.error(
                f"[TrackerChannelView.post] Chronicle serializer validation failed: {ser.errors}",
                extra={"body": getattr(request, "body", "")},
            )
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        ser.save()
        try:
            _events.chronicle_updated(chronicle.id)
        except Exception:
            logger.exception(
                "Failed to emit chronicle_updated for chronicle=%s", chronicle.id
            )
        return Response(status=status.HTTP_200_OK)

    def get(self, request: Request) -> Response:
        """Get the tracker channel for a chronicle.

        Query params:
        - chronicle_id: Chronicle ID

        Returns:
        - 200: {"channel_id": "<channel_id>"}
        - 204: No tracker channel set
        - 400: Invalid data
        - 404: Chronicle not found
        """
        chronicle_id = request.query_params.get("chronicle_id")
        if not chronicle_id:
            logger.error("[TrackerChannelView.get] chronicle_id is required")
            return Response(
                {"detail": "chronicle_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            chronicle = Chronicle.objects.get(id=chronicle_id)
        except Chronicle.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if not chronicle.tracker_channel:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(
            {"channel_id": chronicle.tracker_channel}, status=status.HTTP_200_OK
        )


class StorytellerRoleView(BotBaseAPIView):
    """Manage storyteller roles for a chronicle."""

    def get(self, request: Request) -> Response:
        """Get all storyteller roles for a chronicle.

        Query params:
        - chronicle_id: Chronicle ID

        Returns:
        - 200: List of serialized storyteller roles
        - 400: Invalid data
        - 404: Chronicle not found
        """
        chronicle_id = request.query_params.get("chronicle_id")
        if not chronicle_id:
            logger.error("[StorytellerRoleView.get] chronicle_id is required")
            return Response(
                {"detail": "chronicle_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            chronicle = Chronicle.objects.get(id=chronicle_id)
        except Chronicle.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        roles = StorytellerRole.objects.filter(chronicle=chronicle)
        serializer = StorytellerRoleSerializer(roles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        """Add a storyteller role to a chronicle. Or removes it if it exists.

        Body format:
        {
            "chronicle_id": str,
            "role_id": str,
            "delete": Optional[bool]
        }

        Returns:
        - 201: Role added successfully
        - 200: Role removed successfully
        - 400: Invalid data
        - 404: Chronicle not found
        """
        payload: Dict[str, Any] = (
            dict(request.data)
            if isinstance(request.data, Mapping)
            else cast(Dict[str, Any], request.data)
        )
        chronicle_id = payload.get("chronicle_id")
        role_id = payload.get("role_id")
        if not chronicle_id or not role_id:
            logger.error(
                "[StorytellerRoleView.post] chronicle_id and role_id are required"
            )
            return Response(
                {"detail": "chronicle_id and role_id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Validate and upsert via serializer
        try:
            chronicle = Chronicle.objects.get(id=chronicle_id)
        except Chronicle.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        try:
            role = StorytellerRole.objects.get(pk=int(role_id))
            if payload.get("delete", True):
                role.delete()
                return Response(status=status.HTTP_200_OK)
        except StorytellerRole.DoesNotExist:
            serializer = StorytellerRoleSerializer(
                data={"id": str(role_id), "chronicle": chronicle.pk}
            )

        if not serializer.is_valid():
            logger.error(
                f"[StorytellerRoleView.post] StorytellerRole serializer validation failed: {serializer.errors}",
                extra={"body": getattr(request, "body", "")},
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        try:
            _events.chronicle_updated(chronicle.id)
        except Exception:
            logger.exception(
                "Failed to emit chronicle_updated for chronicle=%s", chronicle.id
            )
        return Response(status=status.HTTP_201_CREATED)

    def delete(self, request: Request) -> Response:
        """Remove a storyteller role from a chronicle.

        Body format:
        {
            "chronicle_id": str,
            "role_id": str
        }

        Returns:
        - 200: Role removed successfully
        - 400: Invalid data
        - 404: Chronicle or role not found
        """
        payload: Dict[str, Any] = (
            dict(request.data)
            if isinstance(request.data, Mapping)
            else cast(Dict[str, Any], request.data)
        )
        chronicle_id = payload.get("chronicle_id")
        role_id = payload.get("role_id")
        if not chronicle_id or not role_id:
            logger.error(
                "[StorytellerRoleView.delete] chronicle_id and role_id are required"
            )
            return Response(
                {"detail": "chronicle_id and role_id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            chronicle = Chronicle.objects.get(id=chronicle_id)
        except Chronicle.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        try:
            role = StorytellerRole.objects.get(pk=int(role_id), chronicle=chronicle)
        except StorytellerRole.DoesNotExist:
            return Response(status=status.HTTP_204_NO_CONTENT)
        role.delete()
        try:
            _events.chronicle_updated(chronicle.id)
        except Exception:
            logger.exception(
                "Failed to emit chronicle_updated for chronicle=%s", chronicle.id
            )
        return Response(status=status.HTTP_200_OK)
