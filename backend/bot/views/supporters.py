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

import logging
from typing import Dict, List, cast, TYPE_CHECKING

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response

from .bot_base_api_view import BotBaseAPIView

if TYPE_CHECKING:
    from discordauth.models import User as CustomUser

logger = logging.getLogger(__name__)
User = cast("CustomUser", get_user_model())


class SupportersView(BotBaseAPIView):
    """Get all supporter users and their levels."""

    def get(self, request: Request) -> Response:
        """Get all supporter users and their levels.

        Returns:
        [
            {"user_id": "<id>", "level": <int>},
            ...
        ]
        """
        # Filter users with supporter level > 0 and cast to "CustomUser" for type safety
        supporters = User.objects.filter(supporter__gt=0)
        data: List[Dict[str, str | int]] = []

        for user in supporters:
            # Cast to "CustomUser" to access supporter attribute
            if hasattr(user, "supporter"):
                data.append(
                    {"user_id": str(user.pk), "level": getattr(user, "supporter", 0)}
                )

        return Response(data, status=status.HTTP_200_OK)
