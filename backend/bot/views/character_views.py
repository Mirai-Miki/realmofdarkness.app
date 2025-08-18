"""
Bot API Character Views (internal, localhost-only).

These DRF views expose character operations for the Discord bots and other
internal clients. Authentication is enforced via API key and local IP check
through `BotAPIKeyPermission`.

Key differences vs public API (`haven/views.py`):
- Auth: API key instead of user session. No login required.
- GET: Only supports single-character by ID and always returns sheet data.
- DELETE: Supports bulk IDs in a single request.
- Additional endpoints: names listing, counts, and disciplines, all backed by
  CharacterManager for consistency.

All business logic, permission checks, and type safety for domain concerns
are delegated to `CharacterManager`.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, cast, TYPE_CHECKING

import logging
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response

from .bot_base_api_view import BotBaseAPIView
from haven.character_manager import CharacterManager
from haven.errors import CharacterManagerException
from haven.types import Splats

if TYPE_CHECKING:
    from discordauth.models import User as UserModel

User = cast("UserModel", get_user_model())
logger = logging.getLogger(__name__)


class BotCharacterView(BotBaseAPIView):
    """Character CRUD operations for bots."""

    def _extract_request_data(self, request: Request) -> Dict[str, Any]:
        data: Dict[str, Any] = {}
        if hasattr(request, "data") and request.data:
            payload = cast(Dict[Any, Any], request.data)
            for k, v in payload.items():
                data[str(k)] = v
        return data

    def get(self, request: Request, character_id: Optional[str] = None) -> Response:
        """Get a single character by ID.

        Path params:
        - character_id: Character ID

        Query params:
        - requester_id: User ID making the request

        Returns:
        - 200: Serialized character sheet data
        - 400: Invalid parameters
        - 404: Character not found
        """
        if not character_id:
            logger.error(
                "[Bot Character Get] Character ID is required for GET /bot/character/{id}/"
            )
            return Response(
                {"error": "Character ID is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Optional requester for CharacterManager permission logic
        requester_id = (
            cast(Optional[str], request.query_params.get("requester_id"))
            if hasattr(request, "query_params")
            else None
        )

        if not requester_id:
            logger.error("[Bot Character Get] No requester_id provided")
            return Response(
                {"error": "requester_id is required for this operation"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        characters = CharacterManager.get_character_by_id(
            character_id=character_id,
            requester_id=requester_id,
            serializer_type="sheet",
        )
        if not characters:
            return Response(
                {"error": "Character not found"}, status=status.HTTP_404_NOT_FOUND
            )
        return Response(characters[0], status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        """Create a new character.

        Body format:
        {
            "requester_id": "<user_id>",
            "character": <character_data>
        }

        Returns:
        - 201: Character created successfully
        - 400: Invalid data
        """
        data = self._extract_request_data(request)

        if data.get("requester_id") is None:
            logger.error("[Bot Character Create] requester_id is required")
            return Response(
                {"error": "requester_id is required for this operation"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        elif data.get("character") is None:
            logger.error("[Bot Character Create] character data is required")
            return Response(
                {"error": "character data is required for creation"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        requester = self._resolve_requester(data["requester_id"])
        created = CharacterManager.create_character(
            requester=requester, character_data=data["character"]
        )
        return Response(created, status=status.HTTP_201_CREATED)

    def put(self, request: Request, character_id: Optional[str] = None) -> Response:
        """Update an existing character by ID.

        Path params:
        - character_id: Character ID

        Body format:
        {
            "requester_id": "<user_id>",
            "character": <character_data>
        }

        Returns:
        - 200: Character updated successfully
        - 400: Invalid data
        - 404: Character not found
        """
        if not character_id:
            logger.error(
                "[Bot Character Update] Character ID is required for PUT /bot/character/{id}/"
            )
            return Response(
                {"error": "Character ID is required for update"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        update_data = self._extract_request_data(request)
        if not update_data.get("requester_id"):
            logger.error("[Bot Character Update] requester_id is required")
            return Response(
                {"error": "requester_id is required for this operation"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not update_data.get("character"):
            logger.error("[Bot Character Update] character data is required")
            return Response(
                {"error": "character data is required for update"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        requester = self._resolve_requester(update_data["requester_id"])
        updated = CharacterManager.update_character(
            character_id=character_id,
            update_data=update_data["character"],
            requester=requester,
        )
        return Response(updated, status=status.HTTP_200_OK)

    def delete(self, request: Request) -> Response:
        """Bulk delete characters.

        Body format:
        {
            "ids": ["<character_id>", ...],
            "requester_id": "<user_id, optional>"
        }

        Returns:
        - 200: Characters deleted successfully
        - 400: Invalid data
        """
        data = self._extract_request_data(request)
        ids = cast(Optional[List[str]], data.get("ids"))
        if not ids or not isinstance(ids, list):
            logger.error(
                "[Bot Character Delete] ids list is required for DELETE Character"
            )
            return Response(
                {"error": "ids list is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        requester_id = data.get("requester_id", None)
        if not requester_id:
            logger.error("[Bot Character Delete] requester_id is required")
            return Response(
                {"error": "requester_id is required for this operation"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        CharacterManager.delete_character(character_id=ids, requester_id=requester_id)
        return Response(
            {"message": "Characters deleted successfully"}, status=status.HTTP_200_OK
        )

    def _resolve_requester(self, requester_id: str) -> "UserModel":
        """Resolve a Django user to attribute ownership in CharacterManager.

        Expects a "user" or "user_id" field in the payload. Raises 400 if missing.
        """
        if not requester_id:
            raise CharacterManagerException(
                "Missing requester_id for bot operation",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            return cast("UserModel", User.objects.get(pk=requester_id))
        except User.DoesNotExist:
            raise CharacterManagerException(
                "[Bot CharacterView] Requester user not found",
                status_code=status.HTTP_404_NOT_FOUND,
            )


class BotCharacterNamesView(BotBaseAPIView):
    """List character names for selection UIs."""

    def _parse_filters(self, source: Dict[str, Any]) -> Dict[str, Any]:
        user_id = cast(Optional[str], source.get("user_id"))
        chronicle_id = cast(Optional[str], source.get("chronicle_id"))
        sheet_only_val = source.get("sheet_only", source.get("is_sheet"))
        # Normalize boolean
        if isinstance(sheet_only_val, str):
            sheet_only = sheet_only_val.lower() in ("1", "true", "yes", "on")
        else:
            sheet_only = cast(Optional[bool], sheet_only_val)

        splats: Optional[List[Splats]] = None
        splat_field = source.get("splat")
        if isinstance(splat_field, list):
            tmp: List[Splats] = []
            for s in splat_field:
                sp = self._to_splat(str(s))
                if sp is not None:
                    tmp.append(sp)
            splats = tmp or None
        elif isinstance(splat_field, str):
            # support comma-separated
            parts = [p.strip() for p in splat_field.split(",") if p.strip()]
            tmp2: List[Splats] = []
            for p in parts or [splat_field]:
                sp = self._to_splat(p)
                if sp is not None:
                    tmp2.append(sp)
            splats = tmp2 or None

        return {
            "user_id": user_id,
            "chronicle_id": chronicle_id,
            "sheet_only": sheet_only,
            "splats": splats,
        }

    def get(self, request: Request) -> Response:
        """Get character names list.

        Query params:
        - user_id: User ID (required)
        - chronicle_id: Chronicle ID (optional)
        - splat: Splat filter (optional, can be repeated)
        - sheet_only: Boolean to filter sheet characters (optional)

        Returns:
        - 200: {"characters": [character_list]}
        """
        params = request.query_params if hasattr(request, "query_params") else {}
        filters = self._parse_filters(cast(Dict[str, Any], params))
        items = CharacterManager.list_characters(
            user_id=filters["user_id"],
            chronicle_id=filters["chronicle_id"],
            splat_filter=filters["splats"],
            sheet_only=filters["sheet_only"],
        )
        return Response({"characters": items}, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        """Get character names list via POST body.

        Body format:
        {
            "user_id": "<user_id>",
            "chronicle_id": "<chronicle_id, optional>",
            "splat": "<splat_filter, optional>",
            "sheet_only": <bool, optional>
        }

        Returns:
        - 200: {"characters": [character_list]}
        """
        data = cast(Dict[str, Any], request.data or {})
        filters = self._parse_filters(data)
        items = CharacterManager.list_characters(
            user_id=filters["user_id"],
            chronicle_id=filters["chronicle_id"],
            splat_filter=filters["splats"],
            sheet_only=filters["sheet_only"],
        )
        return Response({"characters": items}, status=status.HTTP_200_OK)

    def _to_splat(self, value: str) -> Optional[Splats]:
        try:
            return Splats(value)
        except Exception:
            return None


class BotCharacterCountView(BotBaseAPIView):
    """Get character counts for a user."""

    def get(self, request: Request) -> Response:
        """Get character count for a user.

        Query params:
        - user_id: User ID (required)
        - chronicle_id: Chronicle ID (optional)

        Returns:
        - 200: Character count data
        - 400: Invalid parameters
        """
        params = request.query_params if hasattr(request, "query_params") else {}
        user_id = cast(Optional[str], params.get("user_id"))
        chronicle_id = cast(Optional[str], params.get("chronicle_id"))
        if not user_id:
            logger.error("user_id is required for GET /character/count")
            return Response(
                {"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        counts = CharacterManager.get_character_count(
            user_id=user_id, chronicle_id=chronicle_id
        )
        return Response(counts, status=status.HTTP_200_OK)


class BotDisciplineNamesView(BotBaseAPIView):
    """Get discipline names for user's V5 characters."""

    def get(self, request: Request) -> Response:
        """Get discipline names for user's characters.

        Query params:
        - user_id: User ID (required)
        - chronicle_id: Chronicle ID (optional)

        Returns:
        - 200: {"names": [discipline_names]}
        - 400: Invalid parameters
        """
        params = request.query_params if hasattr(request, "query_params") else {}
        user_id = cast(Optional[str], params.get("user_id"))
        chronicle_id = cast(Optional[str], params.get("chronicle_id"))
        if not user_id:
            logger.error("User ID is required for GET /character/discipline/names")
            return Response(
                {"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        names = CharacterManager.get_disciplines_names(
            user_id=user_id, chronicle_id=chronicle_id
        )
        return Response({"names": names}, status=status.HTTP_200_OK)
