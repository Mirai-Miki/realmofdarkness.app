"""
DRF API Views for Character operations.

This module provides simple APIView-based endpoints for character management.
All operations are authenticated and utilize the CharacterManager for business
logic and permission handling.

Endpoints:
- GET /api/character/{id}/ - Get specific character by ID (sheet data)
- POST /api/character/ - Create a new character
- PUT /api/character/{id}/ - Update existing character
- DELETE /api/character/{id}/ - Delete character
"""

import logging
from typing import Any, Dict, Optional, cast

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .character_manager import CharacterManager
from .errors import CharacterManagerException

from discordauth.models import User as UserModel

User = cast(UserModel, get_user_model())
logger = logging.getLogger("DEBUG")


class CharacterView(APIView):
    """
    APIView for Character operations.

    Handles CRUD operations for characters with proper authentication,
    error handling, and logging. Uses CharacterManager for all business logic.
    """

    permission_classes = [IsAuthenticated]

    def handle_exception(self, exc: Exception) -> Response:
        """
        Handle any exception that occurs during request processing.

        Overrides DRF's default exception handling to provide custom
        handling for CharacterManagerException while still allowing
        DRF to handle its standard exceptions.

        Args:
            exc: Exception that was raised

        Returns:
            Response with appropriate status code and error message
        """
        if isinstance(exc, CharacterManagerException):
            if exc.log:
                logger.error(f"Character operation failed: {exc.message}")
                if exc.details:
                    logger.error(f"Error details: {exc.details}")

            return Response(
                {"error": exc.message, "details": exc.details}, status=exc.status_code
            )
        else:
            logger.error(f"Unhandled exception in CharacterView: {exc}")
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _extract_request_data(self, request: Request) -> Dict[str, Any]:
        """
        Safely extract data from DRF request.

        Args:
            request: DRF request object

        Returns:
            Dictionary of request data
        """
        data: Dict[str, Any] = {}
        if hasattr(request, "data") and request.data:
            rdata = cast(Dict[Any, Any], request.data)
            for key, value in rdata.items():
                data[str(key)] = value
        return data

    def get(self, request: Request, character_id: Optional[str] = None) -> Response:
        """
        Get a specific character by ID.

        Character ID is required - this endpoint only returns single characters.

        Args:
            request: DRF request object
            character_id: Character ID for character retrieval (required)

        Returns:
            Single character object (sheet data)
        """
        if not character_id:
            return Response(
                {"error": "Character ID is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Single character retrieval - always return sheet data
        characters = CharacterManager.get_character_by_id(
            character_id=character_id,
            requester_id=str(request.user.id),
            serializer_type="sheet",
        )

        if not characters:
            return Response(
                {"error": "Character not found"}, status=status.HTTP_404_NOT_FOUND
            )

        return Response(characters[0], status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        """
        Create a new character.

        All validation is handled by CharacterManager.

        Args:
            request: DRF request object

        Request Body:
            - name: Character name (required - validated by CharacterManager)
            - splat: Character splat/type (required - validated by CharacterManager)
            - Additional character-specific data fields

        Returns:
            Created character data
        """
        character_data = self._extract_request_data(request)

        # CharacterManager.create_character has @transaction.atomic decorator
        character = CharacterManager.create_character(
            requester=cast(UserModel, request.user), character_data=character_data
        )

        return Response(character, status=status.HTTP_201_CREATED)

    def put(self, request: Request, character_id: Optional[str] = None) -> Response:
        """
        Update an existing character.

        Args:
            request: DRF request object
            character_id: Character ID to update (required)

        Request Body:
            Character data to update

        Returns:
            Updated character data
        """
        if not character_id:
            return Response(
                {"error": "Character ID is required for update"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        update_data = self._extract_request_data(request)

        # CharacterManager.update_character has @transaction.atomic decorator
        character = CharacterManager.update_character(
            character_id=character_id,
            update_data=update_data,
            requester=cast(UserModel, request.user),
        )

        return Response(character, status=status.HTTP_200_OK)

    def delete(self, request: Request, character_id: Optional[str] = None) -> Response:
        """
        Delete a character.

        Args:
            request: DRF request object
            character_id: Character ID to delete (required)

        Returns:
            Success message with 200 status (content was deleted)
        """
        if not character_id:
            return Response(
                {"error": "Character ID is required for deletion"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # CharacterManager.delete_character has @transaction.atomic decorator
        CharacterManager.delete_character(
            character_id=character_id, requester_id=str(request.user.id)
        )

        return Response(
            {"message": "Character deleted successfully"}, status=status.HTTP_200_OK
        )
