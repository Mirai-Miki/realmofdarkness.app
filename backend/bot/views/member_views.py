from __future__ import annotations
import logging

from typing import Any, Dict, Mapping, Optional, Sequence, List, cast
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status

from .bot_base_api_view import BotBaseAPIView
from haven.character_manager import CharacterManager
from haven.types import Splats
from chronicle.models import Member
from chronicle.serializers import (
    MemberSerializer,
)
from .events import EventsPublisher

logger = logging.getLogger(__name__)
_events = EventsPublisher()


class MemberView(BotBaseAPIView):
    """Member operations for chronicles: get, create/update, and delete."""

    def get(self, request: Request) -> Response:
        """Fetch a chronicle member by chronicle and user id.

        Query params:
        - chronicle_id: Chronicle ID
        - user_id: User ID
        """
        chronicle_id = request.query_params.get("chronicle_id")
        user_id = request.query_params.get("user_id")

        if not chronicle_id or not user_id:
            logger.error("[MemberView.get] chronicle_id and user_id are required")
            return Response(
                {"detail": "chronicle_id and user_id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            member = Member.objects.select_related("user", "chronicle").get(
                chronicle=chronicle_id, user=user_id
            )
        except Member.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = MemberSerializer(member)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        """Create or update a member for a chronicle.

        Body format:
        {
            "chronicle_id": "<chronicle_id>",
            "user_id": "<user_id>",
            "admin": <bool>,
            "storyteller": <bool>,
            "nickname": "<string>",
            "avatar_url": "<url>"
        }

        Returns:
        - 201: Member created successfully
        - 200: Member updated successfully
        - 400: Invalid data
        """
        payload: Dict[str, Any] = (
            dict(request.data)
            if isinstance(request.data, Mapping)
            else cast(Dict[str, Any], request.data)
        )

        chronicle_id = payload.get("chronicle_id")
        user_id = payload.get("user_id")

        if not chronicle_id or not user_id:
            logger.error("[MemberView.post] chronicle_id and user_id are required")
            return Response(
                {"detail": "chronicle_id and user_id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if member exists and track staff status changes
        staff_status_changed = False
        try:
            member = Member.objects.get(chronicle=chronicle_id, user=user_id)
            old_is_staff = member.admin or member.storyteller
            new_admin = payload.get("admin", member.admin)
            new_storyteller = payload.get("storyteller", member.storyteller)
            new_is_staff = new_admin or new_storyteller
            staff_status_changed = old_is_staff != new_is_staff

            # Update existing member
            serializer = MemberSerializer(member, data=payload, partial=True)
            is_new_member = False
            expected_status = status.HTTP_200_OK
        except Member.DoesNotExist:
            # Create new member
            serializer = MemberSerializer(data=payload)
            is_new_member = True
            expected_status = status.HTTP_201_CREATED

        if not serializer.is_valid():
            logger.error(
                f"[MemberView.post] Member serializer validation failed: {serializer.errors}",
                extra={"payload": payload},
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        member = serializer.save()

        # Emit member events
        try:
            member_id = getattr(member, "pk", getattr(member, "id", None))
            if member_id:
                if is_new_member:
                    _events.member_created(member_id, user_id, chronicle_id)
                else:
                    _events.member_updated(member_id, staff_status_changed)
        except Exception:  # pragma: no cover - defensive
            logger.exception("Failed to emit member events")

        return Response(serializer.data, status=expected_status)

    def delete(self, request: Request) -> Response:
        """Remove a member from a chronicle and disconnect their characters.

        Query params:
        - chronicle_id: Chronicle ID
        - user_id: User ID
        """
        chronicle_id = request.query_params.get("chronicle_id")
        user_id = request.query_params.get("user_id")

        if not chronicle_id or not user_id:
            logger.error("[MemberView.delete] chronicle_id and user_id are required")
            return Response(
                {"detail": "chronicle_id and user_id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            member = Member.objects.get(chronicle=chronicle_id, user=user_id)
        except Member.DoesNotExist:
            return Response(status=status.HTTP_204_NO_CONTENT)

        # Disconnect all characters for this member via CharacterManager
        CharacterManager.disconnect_member_characters(
            str(getattr(member, "user_id", member.user.pk)),
            str(getattr(member, "chronicle_id", member.chronicle.pk)),
        )

        try:
            _events.member_deleted(member.user.id, member.chronicle.id)
        except Exception:  # pragma: no cover - defensive
            logger.exception(
                "Failed to emit member delete event for member=%s",
                getattr(member, "id", "?"),
            )

        member.delete()
        return Response(status=status.HTTP_200_OK)


class DefaultCharacterView(BotBaseAPIView):
    """Manage default character and auto-hunger settings for a member."""

    def get(self, request: Request) -> Response:
        """Get current default character or infer a single character for the member.

        Query params:
        - chronicle_id: Chronicle ID
        - user_id: User ID
        - splats: List of splat filters (optional, can be repeated)

        Returns:
        - 200: {"character": <serialized>, "auto_hunger": bool}
        - 204: No default character found or multiple characters exist
        - 404: Member not found
        """
        chronicle_id = request.query_params.get("chronicle_id")
        user_id = request.query_params.get("user_id")
        splats: Sequence[str] = request.query_params.getlist("splats")

        if not chronicle_id or not user_id:
            logger.error(
                "[DefaultCharacterView.get] chronicle_id and user_id are required"
            )
            return Response(
                {"detail": "chronicle_id and user_id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            member = Member.objects.get(user_id=user_id, chronicle_id=chronicle_id)
        except Member.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Convert splats to enum values for CharacterManager
        splat_enum_list: List[Splats] = []
        for s in splats:
            try:
                splat_enum_list.append(Splats(s))
            except Exception:
                return Response(
                    {"detail": f"Invalid splat: {s}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Case 1: Use default character if valid for this chronicle
        default_char_id: Optional[int] = getattr(member, "default_character_id", None)
        if default_char_id:
            try:
                serialized = CharacterManager.get_character_by_id(
                    str(default_char_id),
                    requester_id=str(user_id),
                    splat_filter=splat_enum_list or None,
                    sheet_only=None,
                    chronicle_id=str(chronicle_id),
                    serializer_type="tracker",
                )
                if serialized:
                    return Response(
                        {
                            "character": serialized[0],
                        },
                        status=status.HTTP_200_OK,
                    )
            except Exception:
                # Ignore and fall back to inference
                pass

        # Case 2: Infer a single character in this chronicle for the user
        try:
            serialized_list = CharacterManager.get_characters_by_user_and_chronicle(
                user_id=str(user_id),
                chronicle_id=str(chronicle_id),
                requester_id=str(user_id),
                splat_filter=splat_enum_list or None,
                sheet_only=None,
                serializer_type="tracker",
            )
        except Exception:
            return Response(status=status.HTTP_204_NO_CONTENT)

        if len(serialized_list) == 1:
            return Response(
                {
                    "character": serialized_list[0],
                },
                status=status.HTTP_200_OK,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)

    def post(self, request: Request) -> Response:
        """Set or clear default character settings for a member.

        Body format:
        {
            "chronicle_id": "<chronicle_id>",
            "user_id": "<user_id>",
            "character_id": str | None,
        }

        returns:
        - 200: Default character settings updated successfully
        - 400: Invalid data
        """
        payload: Dict[str, Any] = (
            dict(request.data)
            if isinstance(request.data, Mapping)
            else cast(Dict[str, Any], request.data)
        )
        chronicle_id = payload.get("chronicle_id")
        user_id = payload.get("user_id")
        character_id = payload.get("character_id")
        if not chronicle_id or not user_id or not character_id:
            logger.error(
                "[DefaultCharacterView.post] chronicle_id and user_id and character_id are required"
            )
            return Response(
                {"detail": "chronicle_id and user_id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        CharacterManager.set_member_defaults(
            user_id=str(user_id),
            chronicle_id=str(chronicle_id),
            character_id=str(character_id),
        )
        return Response(status=status.HTTP_200_OK)
