"""
User internal endpoints (localhost-only).

Authentication: BotAPIKeyPermission (local IP + API key)

Notes:
- Events are abstracted via EventsPublisher placeholder.
- Endpoints are refactored to DRF APIViews with explicit request formats.
- User creation and updates handle user data only. Member management is handled in chronicle_views.
- User creation returns 201, updates return 200 for easy bot-side logic.
"""

from __future__ import annotations

import hashlib
import logging
from typing import Any, Dict, Mapping, cast, TYPE_CHECKING

from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response

from .bot_base_api_view import BotBaseAPIView
from discordauth.serializers import UserSerializer

from .events import EventsPublisher

if TYPE_CHECKING:
    from discordauth.models import User as CustomUser

logger = logging.getLogger(__name__)
User = cast("CustomUser", get_user_model())
_events = EventsPublisher()


class UserView(BotBaseAPIView):
    """User operations: get and create/update."""

    def get(self, request: Request, user_id: str) -> Response:
        """Get a specific user by ID.

        Path params:
        - user_id: Discord user ID to retrieve

        Returns:
        - 200: Serialized user data
        - 400: Invalid user ID
        - 404: User not found
        """
        if not user_id:
            logger.error(
                "[UserView.get] user_id is required",
                extra={"path_params": {"user_id": user_id}},
            )
            return Response(
                {"detail": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            logger.info(f"[UserView.get] User {user_id} not found")
            return Response(
                {"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        """Create or update a user (user data only).

        Body format:
        {
            "id": "<discord_user_id>",
            "username": "<username>",
            "avatar_url": "<url>",
            "supporter": <int>,
            "admin": <bool>,
            "email": "<email>",
            "verified": <bool>
        }

        Returns:
        - 201: User created successfully
        - 200: User updated successfully
        - 400: Invalid data
        """
        # Handle request data properly
        user_data: Dict[str, Any] = (
            dict(request.data)
            if isinstance(request.data, Mapping)
            else cast(Dict[str, Any], request.data)
        )

        if not user_data or not user_data.get("id"):
            logger.error(
                "[UserView.post] user.id is required",
                extra={"body": getattr(request, "body", "")},
            )
            return Response(
                {"detail": "user.id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Race condition prevention for updates
        update_hash = hashlib.md5(str(user_data).encode("utf-8")).hexdigest()
        cache_key = f"user_update_{update_hash}"
        if not cache.add(cache_key, True, 3):
            # Update already processed, skip
            return Response(status=status.HTTP_204_NO_CONTENT)

        user_id = str(user_data["id"])

        # Check if user exists
        try:
            user = User.objects.get(pk=user_id)
            # Update existing user
            serializer = UserSerializer(user, data=user_data, partial=True)
            is_new_user = False
            expected_status = status.HTTP_200_OK
        except User.DoesNotExist:
            # Create new user
            serializer = UserSerializer(data=user_data)
            is_new_user = True
            expected_status = status.HTTP_201_CREATED

        if not serializer.is_valid():
            logger.error(
                f"[UserView.post] User serializer validation failed: {serializer.errors}",
                extra={"body": getattr(request, "body", "")},
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = cast("CustomUser", serializer.save())

        # Emit user update event
        try:
            _events.user_updated(int(user.id), is_new_user)
        except Exception:  # pragma: no cover - defensive
            logger.exception("Failed to emit user_updated for user=%s", user.id)

        return Response(serializer.data, status=expected_status)
