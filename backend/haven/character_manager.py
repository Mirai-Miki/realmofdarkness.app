"""
Character Manager Service for centralized character operations.

This module provides a unified interface for all character-related operations,
including retrieval, creation, updates, and deletion. It handles proper type
casting, serialization, and event dispatching.

All methods raise appropriate exceptions with HTTP status codes instead of
returning result codes. This allows for proper transaction rollbacks and
cleaner error handling throughout the application.
"""

import logging

from typing import Optional, Union, List, Dict, Any, Iterable, cast
from django.db.models import QuerySet
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.contrib.auth import get_user_model
from rest_framework.utils.serializer_helpers import ReturnDict, ReturnList
from rest_framework.serializers import ModelSerializer
from rest_framework import status

from backend.chronicle.models import Member

from .models import Character
from chronicle.models import Chronicle
from discordauth.models import User as UserModel
from discordauth.supporter import Supporter
from .types import (
    Splats,
    SerializerType,
    TrackerLimit,
    CharacterSheetLimit,
)
from .errors import (
    CharacterNotFoundError,
    ChronicleNotFoundError,
    PermissionDeniedError,
    ValidationError,
    CharacterLimitExceededError,
    CharacterManagerException,
)
from .serializers.serializer_registry import SerializerRegistry
from .image_manager import ImageManager

User = cast(UserModel, get_user_model())
logger = logging.getLogger("DEBUG")


class CharacterEventDispatcher:
    """
    Placeholder class for character event dispatching.

    This will be replaced with the actual event system implementation
    when the channel event system is developed.
    """

    @staticmethod
    def dispatch_character_created(
        character_id: str,
        sheet: Union[ReturnDict, ReturnList, Dict[str, Any], Any],
        tracker: Union[ReturnDict, ReturnList, Dict[str, Any], Any],
    ) -> None:
        """
        Dispatch character created event.

        Args:
            character_data: Serialized character data
        """
        # TODO: Implement actual event dispatching
        pass

    @staticmethod
    def dispatch_character_updated(
        character_id: str,
        sheet: Union[ReturnDict, ReturnList, Dict[str, Any], Any],
        tracker: Union[ReturnDict, ReturnList, Dict[str, Any], Any],
    ) -> None:
        """
        Dispatch character updated event.

        Args:
            character_id: ID of the updated character
            character_data: Serialized character data
        """
        # TODO: Implement actual event dispatching
        pass

    @staticmethod
    def dispatch_character_deleted(character_id: str) -> None:
        """
        Dispatch character deleted event.

        Args:
            character_id: ID of the deleted character
        """
        # TODO: Implement actual event dispatching
        pass


class CharacterManager:
    """
    Centralized manager for all character operations, type-safe access, and event integration.

    All database/model operations must go through this class—never directly on haven models.
    Accepts API/data objects for all operations, not raw model instances.

    All methods raise appropriate exceptions instead of returning result codes,
    allowing for proper transaction rollbacks and cleaner error handling.
    """

    @classmethod
    def get_character_by_id(
        cls,
        character_id: Union[str, List[str]],
        requester_id: str,
        splat_filter: Optional[List[Splats]] = None,
        is_sheet: Optional[bool] = None,
        chronicle_id: Optional[str] = None,
        serializer_type: SerializerType = "sheet",
    ) -> List[Dict[str, Any]]:
        """
        Retrieve character(s) by ID with optional filters.

        Args:
            character_id: Single character ID or list of IDs
            requester_id: ID of the user making the request
            splat_filter: Optional list of splats to filter by
            is_sheet: Optional filter for sheet status
            chronicle_id: Optional chronicle ID filter
            serializer_type: Type of serializer to use ('tracker', 'sheet', 'deserializer')

        Returns:
            List of serialized character data dictionaries

        Raises:
            CharacterNotFoundError: If no characters are found with the given IDs
        """
        # Handle both single ID and list of IDs
        if isinstance(character_id, str):
            character_ids = [character_id]
        else:
            character_ids = character_id

        # Build query
        queryset = Character.objects.filter(id__in=character_ids)

        # Apply filters
        if splat_filter:
            splat_values = [splat.value for splat in splat_filter]
            queryset = queryset.filter(splat__in=splat_values)

        if is_sheet is not None:
            queryset = queryset.filter(is_sheet=is_sheet)

        if chronicle_id:
            queryset = queryset.filter(chronicle_id=chronicle_id)

        # Check if any characters were found
        if not queryset.exists():
            raise CharacterNotFoundError(
                character_id=(
                    str(character_ids)
                    if isinstance(character_ids, list)
                    else character_ids[0]
                )
            )

        # Get characters and serialize
        return cls._serialize_characters(requester_id, queryset, serializer_type)

    @classmethod
    def get_character_by_name_and_user(
        cls,
        name: str,
        user_id: str,
        requester_id: str,
        splat_filter: Optional[List[Splats]] = None,
        is_sheet: Optional[bool] = None,
        chronicle_id: Optional[str] = None,
        serializer_type: SerializerType = "sheet",
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve a character by name and user ID with optional filters.

        Args:
            name: Character name
            user_id: User ID
            requester_id: ID of the user making the request
            splat_filter: Optional list of splats to filter by
            is_sheet: Optional filter for sheet status
            chronicle_id: Optional chronicle ID filter
            serializer_type: Type of serializer to use

        Returns:
            Serialized character data or None if not found
        """
        # Build query
        queryset = Character.objects.filter(name=name, user_id=user_id)

        # Apply filters
        if splat_filter:
            splat_values = [splat.value for splat in splat_filter]
            queryset = queryset.filter(splat__in=splat_values)

        if is_sheet is not None:
            queryset = queryset.filter(is_sheet=is_sheet)

        if chronicle_id:
            queryset = queryset.filter(chronicle_id=chronicle_id)

        character = queryset.first()

        # Check if any characters were found
        if not queryset.exists():
            raise CharacterNotFoundError()

        if character:
            # Convert single character to list for serialization, then extract first result
            serialized_list = cls._serialize_characters(
                requester_id, [character], serializer_type
            )
            return serialized_list[0] if serialized_list else None
        return None

    @classmethod
    def get_characters_by_user(
        cls,
        user_id: str,
        requester_id: str,
        splat_filter: Optional[List[Splats]] = None,
        is_sheet: Optional[bool] = None,
        chronicle_id: Optional[str] = None,
        serializer_type: SerializerType = "sheet",
    ) -> List[Dict[str, Any]]:
        """
        Retrieve all characters for a user with optional filters.

        Args:
            user_id: User ID
            requester_id: ID of the user making the request
            splat_filter: Optional list of splats to filter by
            is_sheet: Optional filter for sheet status
            chronicle_id: Optional chronicle ID filter
            serializer_type: Type of serializer to use

        Returns:
            List of serialized character data dictionaries
        """
        # Build query
        queryset = Character.objects.filter(user_id=user_id)

        # Apply filters
        if splat_filter:
            splat_values = [splat.value for splat in splat_filter]
            queryset = queryset.filter(splat__in=splat_values)

        if is_sheet is not None:
            queryset = queryset.filter(is_sheet=is_sheet)

        if chronicle_id:
            queryset = queryset.filter(chronicle_id=chronicle_id)

        # Check if any characters were found
        if not queryset.exists():
            raise CharacterNotFoundError()

        return cls._serialize_characters(requester_id, queryset, serializer_type)

    @classmethod
    def get_characters_by_user_and_chronicle(
        cls,
        user_id: str,
        chronicle_id: str,
        requester_id: str,
        splat_filter: Optional[List[Splats]] = None,
        is_sheet: Optional[bool] = None,
        serializer_type: SerializerType = "sheet",
    ) -> List[Dict[str, Any]]:
        """
        Retrieve all characters for a user in a specific chronicle with optional filters.

        Args:
            user_id: User ID
            chronicle_id: Chronicle ID
            requester_id: ID of the user making the request
            splat_filter: Optional list of splats to filter by
            is_sheet: Optional filter for sheet status
            serializer_type: Type of serializer to use

        Returns:
            List of serialized character data dictionaries
        """
        # Build query
        queryset = Character.objects.filter(user_id=user_id, chronicle_id=chronicle_id)

        # Apply filters
        if splat_filter:
            splat_values = [splat.value for splat in splat_filter]
            queryset = queryset.filter(splat__in=splat_values)

        if is_sheet is not None:
            queryset = queryset.filter(is_sheet=is_sheet)

        # Check if any characters were found
        if not queryset.exists():
            raise CharacterNotFoundError()

        return cls._serialize_characters(requester_id, queryset, serializer_type)

    @classmethod
    @transaction.atomic
    def create_character(
        cls,
        requester: UserModel,
        character_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Create a new character from API/data object.

        Includes validation for character limits, duplicate names, and image processing.

        Args:
            requester: User instance making the request
            character_data: Dictionary containing character data including optional avatar

        Returns:
            Dictionary containing created character data

        Raises:
            ValidationError: If required fields are missing or data is invalid
            ChronicleNotFoundError: If specified chronicle doesn't exist
            PermissionDeniedError: If user is not a member of the specified chronicle
            CharacterLimitExceededError: If user has reached their character limit
            DuplicateCharacterError: If character name already exists for the user
            Various image-related exceptions from ImageManager
        """
        # Validate required fields
        if not requester or "splat" not in character_data:
            raise ValidationError(
                "Missing required fields: user and splat are required"
            )

        chronicle: Chronicle | None = None
        member: Member | None = None
        if character_data.get("chronicle_id", None):
            try:
                chronicle = Chronicle.objects.get(id=character_data["chronicle_id"])
            except Chronicle.DoesNotExist:
                raise ChronicleNotFoundError(character_data["chronicle_id"])

            member = Member.objects.filter(chronicle=chronicle, user=requester).first()
            if not member:
                raise PermissionDeniedError(
                    f"User {requester.pk} is not a member of chronicle {chronicle.pk}"
                )
            character_data.pop("chronicle_id", None)

        # Check character limit
        if not cls._is_at_character_limit(requester):
            raise CharacterLimitExceededError("Character creation limit reached")

        # Process image if present
        image_file = ImageManager.download_and_validate_image(
            character_data.get("avatar")
        )

        splat_str = character_data["splat"]
        try:
            splat = Splats(splat_str)
        except ValueError as ve:
            raise ValidationError(f"Invalid splat: {splat_str}")

        # Get appropriate deserializer
        try:
            deserializer_class = SerializerRegistry.get_serializer(
                splat, "deserializer"
            )
        except KeyError as e:
            raise ValidationError(f"Deserializer not found for splat: {splat_str}")

        # Create and validate character
        deserializer = cast(
            ModelSerializer,
            deserializer_class(
                data=character_data,
                context={
                    "user": requester,
                    "chronicle": chronicle,
                    "member": member,
                    "is_owner": True,
                },
            ),
        )
        if not deserializer.is_valid():
            raise ValidationError(
                "Character validation failed", details=deserializer.errors
            )

        # Save character
        character: Character = deserializer.save()

        # Save image if we have one
        if image_file:
            ImageManager.save_character_avatar(character, image_file)

        # Serialize for event and return data
        try:
            tracker_serializer_class = SerializerRegistry.get_serializer(
                splat, "tracker"
            )
            sheet_serializer_class = SerializerRegistry.get_serializer(splat, "sheet")
            tracker_serializer = tracker_serializer_class(character)
            sheet_serializer = sheet_serializer_class(character)
            sheet_data = sheet_serializer.data
            tracker_data = tracker_serializer.data

            # Dispatch event
            CharacterEventDispatcher.dispatch_character_created(
                str(character.pk), sheet_data, tracker_data
            )

            return dict(sheet_data)
        except Exception as e:
            # Character was created but event/serialization failed
            logger.error(
                f"create_character event/serialization error: {e}", exc_info=True
            )
            # Still return basic character data
            return {"id": str(character.pk), "name": character.name}

    @classmethod
    @transaction.atomic
    def update_character(
        cls,
        character_id: str,
        update_data: Dict[str, Any],
        requester: UserModel,
    ) -> Dict[str, Any]:
        """
        Update an existing character by ID with new data.

        Includes image processing and validation.

        Args:
            character_id: ID of the character to update
            update_data: Dictionary containing updated character data including optional avatar
            requester: User instance making the update

        Returns:
            Dictionary containing updated character data

        Raises:
            CharacterNotFoundError: If the character doesn't exist
            PermissionDeniedError: If user lacks permission to update the character
            ChronicleNotFoundError: If specified chronicle doesn't exist
            CharacterLimitExceededError: If user has reached their character limit
            ValidationError: If data validation fails
            Various image-related exceptions from ImageManager
        """
        # Get existing character
        try:
            character = Character.objects.select_related(
                "user", "chronicle", "member"
            ).get(id=character_id)
        except ObjectDoesNotExist:
            raise CharacterNotFoundError(character_id)

        # Permission Checks
        user = cast(UserModel, character.user)
        is_owner = user == requester
        current_chronicle = cast(Chronicle | None, character.chronicle)
        current_member = cast(Member | None, character.member)
        new_chronicle: Chronicle | None = None
        new_member: Member | None = None
        chronicle_changed = False

        if current_chronicle and update_data.get("chronicle_id") != str(
            current_chronicle.pk
        ):
            chronicle_changed = True
        elif not current_chronicle and update_data.get("chronicle_id"):
            chronicle_changed = True
        elif update_data.get("chronicle_id"):
            update_data.pop("chronicle_id", None)

        # Chronicle change validation
        if chronicle_changed:
            # Only an owner can change chronicle
            if not is_owner:
                raise PermissionDeniedError("Only character owner can change chronicle")
            try:
                new_chronicle = Chronicle.objects.get(
                    id=update_data.get("chronicle_id")
                )
            except Chronicle.DoesNotExist:
                raise ChronicleNotFoundError(update_data.get("chronicle_id", ""))

            new_member = Member.objects.filter(
                chronicle=new_chronicle, user=requester
            ).first()
            if not new_member:
                raise PermissionDeniedError(
                    f"User {requester.pk} is not a member of chronicle {new_chronicle.id}"
                )

            update_data.pop("chronicle_id", None)
            update_data.pop("member_id", None)
            current_chronicle = new_chronicle
            current_member = new_member

        # Chronicle self heal check
        if (not current_chronicle and current_member) or (
            not current_member and current_chronicle
        ):
            update_data["chronicle"] = None
            update_data["member"] = None
            current_chronicle = None
            current_member = None

        # Owner or staff Checks
        if not is_owner and not cls._is_staff(
            str(requester.pk), str(getattr(character, "chronicle_id", None))
        ):
            raise PermissionDeniedError(
                f"User {requester.pk} does not have permission to update character {character_id}"
            )

        # Check character limit
        if not cls._is_at_character_limit(user):
            raise CharacterLimitExceededError("Character limit exceeded")

        # Process image if present
        image_file = ImageManager.download_and_validate_image(update_data.get("avatar"))

        # Get splat for serializer selection
        try:
            splat = Splats(character.splat)
        except ValueError:
            raise ValidationError(f"Invalid splat: {character.splat}")

        # Get appropriate deserializer
        try:
            deserializer_class = SerializerRegistry.get_serializer(
                splat, "deserializer"
            )
        except KeyError:
            raise ValidationError(
                f"Deserializer not found for splat: {character.splat}"
            )

        # Update and validate character
        deserializer = cast(
            ModelSerializer,
            deserializer_class(
                character,
                data=update_data,
                partial=True,
                context={
                    "chronicle": current_chronicle,
                    "member": current_member,
                    "is_owner": is_owner,
                },
            ),
        )
        if not deserializer.is_valid():
            raise ValidationError(
                f"Character {character_id} update failed validation",
                details=deserializer.errors,
            )

        # Save updated character
        updated_character = deserializer.save()

        # Save image if we have one
        if image_file:
            ImageManager.save_character_avatar(updated_character, image_file)

        # Serialize for event and return
        try:
            tracker_class = SerializerRegistry.get_serializer(splat, "tracker")
            sheet_class = SerializerRegistry.get_serializer(splat, "sheet")
            tracker_serializer = tracker_class(updated_character)
            sheet_serializer = sheet_class(updated_character)
            tracker_data = tracker_serializer.data
            sheet_data = sheet_serializer.data

            # Dispatch event
            CharacterEventDispatcher.dispatch_character_updated(
                str(character.pk), tracker_data, sheet_data
            )

            if chronicle_changed and current_chronicle:
                # If chronicle changed we need to push a new character event
                CharacterEventDispatcher.dispatch_character_created(
                    str(character.pk), sheet_data, tracker_data
                )

            return dict(sheet_data)
        except Exception as e:
            # Character was updated but event/serialization failed
            logger.error(
                f"update_character event/serialization error: {e}", exc_info=True
            )
            # Still return basic character data
            return {"id": str(updated_character.pk), "name": updated_character.name}

    @classmethod
    @transaction.atomic
    def delete_character(
        cls,
        character_id: Union[str, List[str]],
        requester_id: str,
    ) -> Union[int, List[str]]:
        """
        Delete character(s) by ID or disconnect from chronicle.

        Handles avatar cleanup and default character references.

        Args:
            character_id: Single character ID or list of IDs to delete
            requester_id: ID of the user making the request

        Returns:
            For single character: HTTP status code (200 for success)
            For multiple characters: list of processed character names

        Raises:
            CharacterNotFoundError: If character doesn't exist
            PermissionDeniedError: If user lacks permission to delete the character
        """
        ids = character_id if isinstance(character_id, list) else [character_id]
        processed_names: List[str] = []

        for char_id in ids:
            character = (
                Character.objects.select_related("member", "user", "chronicle")
                .filter(id=char_id)
                .first()
            )
            if not character:
                if isinstance(character_id, str):
                    # Single character delete - should raise if not found
                    raise CharacterNotFoundError(char_id)
                # Multiple character delete - skip missing characters
                continue

            # Permission check
            is_owner = getattr(character, "user_id", None) == requester_id
            chronicle_id = getattr(character, "chronicle_id", None)
            is_staff = cls._is_staff(requester_id, chronicle_id)
            if not (is_owner or is_staff):
                raise PermissionDeniedError(
                    f"User {requester_id} does not have permission to delete character {char_id}"
                )

            # Staff: disconnect character
            if is_staff:
                if character.chronicle:
                    Member.objects.filter(
                        chronicle=character.chronicle, default_character=character
                    ).update(default_character=None)
                character.chronicle = None
                character.member = None
                if hasattr(character, "st_lock"):
                    character.st_lock = False
                character.save()
                try:
                    splat = Splats(character.splat)
                    tracker_class = SerializerRegistry.get_serializer(splat, "tracker")
                    sheet_class = SerializerRegistry.get_serializer(splat, "sheet")
                    tracker_serializer = tracker_class(character)
                    sheet_serializer = sheet_class(character)
                    sheet_data = sheet_serializer.data
                    tracker_data = tracker_serializer.data
                    CharacterEventDispatcher.dispatch_character_updated(
                        str(character.pk), tracker_data, sheet_data
                    )
                except Exception as e:
                    logger.error(
                        f"delete_character event dispatch error (staff disconnect): {e}",
                        exc_info=True,
                    )
                processed_names.append(character.name)
                continue

            # Owner: delete character and images
            if is_owner:
                if character.chronicle:
                    Member.objects.filter(
                        chronicle=character.chronicle, default_character=character
                    ).update(default_character=None)
                ImageManager.delete_character_avatar(character)
                character.delete()
                try:
                    CharacterEventDispatcher.dispatch_character_deleted(char_id)
                except Exception as e:
                    logger.error(
                        f"delete_character event dispatch error (owner delete): {e}",
                        exc_info=True,
                    )
                processed_names.append(character.name)
                continue

        if isinstance(character_id, list):
            return processed_names
        return status.HTTP_200_OK

    @classmethod
    def list_characters(
        cls,
        user_id: Optional[str] = None,
        chronicle_id: Optional[str] = None,
        splat_filter: Optional[List[Splats]] = None,
        is_sheet: Optional[bool] = None,
    ) -> List[Dict[str, Any]]:
        """
        List characters filtered by user, chronicle, splat, and is_sheet.

        Returns a list of dicts with:
            name: str
            user_id: str
            chronicle_id: Optional[str]
            chronicle_name: Optional[str]
            member_nickname: Optional[str]
        """
        queryset = Character.objects.all()

        if user_id:
            queryset = queryset.filter(user_id=user_id)

        if chronicle_id:
            queryset = queryset.filter(chronicle_id=chronicle_id)

        if splat_filter:
            splat_values = [splat.value for splat in splat_filter]
            queryset = queryset.filter(splat__in=splat_values)

        if is_sheet is not None:
            queryset = queryset.filter(is_sheet=is_sheet)

        characters = queryset.select_related("user", "chronicle", "member")
        result: List[Dict[str, Any]] = []

        for character in characters:
            entry: Dict[str, Any] = {
                "name": character.name,
                "user_id": str(getattr(character, "user_id")),
            }
            # Chronicle info
            if character.chronicle:
                entry["chronicle_id"] = str(character.chronicle.id)
                entry["chronicle_name"] = character.chronicle.name
            # Member info
            if character.member:
                entry["member_nickname"] = character.member.nickname
            result.append(entry)
        return result

    @classmethod
    def get_disciplines_names(
        cls, user_id: str, chronicle_id: Optional[str] = None
    ) -> List[str]:
        """
        Get all unique discipline names from a user's vampire characters.

        Args:
            user_id: User ID to get disciplines for
            chronicle_id: Optional chronicle ID to filter by

        Returns:
            List of unique discipline names
        """
        # Import here to avoid circular imports
        from .models import Vampire5th

        filter_args: Dict[str, Any] = {"user_id": user_id}
        if chronicle_id:
            filter_args["chronicle_id"] = chronicle_id

        disciplines_sets = Vampire5th.objects.filter(**filter_args).values(
            "disciplines"
        )
        names = set()
        for discipline_set in disciplines_sets:
            for discipline in discipline_set:
                names.add(discipline)

        return sorted(list(names))

    @classmethod
    def get_character_count(
        cls, user_id: str, chronicle_id: Optional[str] = None
    ) -> Dict[str, Dict[str, int]]:
        """
        Get character counts for a user globally and optionally by chronicle.

        Args:
            user_id: User ID to get counts for
            chronicle_id: Optional chronicle ID for chronicle-specific counts

        Returns:
            Dictionary with global counts and optionally chronicle counts
        """
        from django.db import models

        # Get global character counts
        global_counts = Character.objects.filter(user_id=user_id)
        global_grouped = global_counts.values("is_sheet").annotate(
            count=models.Count("id")
        )

        global_map = {g["is_sheet"]: g["count"] for g in global_grouped}
        global_sheets = global_map.get(True, 0)
        global_trackers = global_map.get(False, 0)

        result = {
            "global": {
                "sheets": global_sheets,
                "trackers": global_trackers,
                "total": global_sheets + global_trackers,
            }
        }

        # Add chronicle-specific counts if requested
        if chronicle_id:
            chronicle_counts = Character.objects.filter(
                user_id=user_id, chronicle_id=chronicle_id
            )
            chronicle_grouped = chronicle_counts.values("is_sheet").annotate(
                count=models.Count("id")
            )

            chronicle_map = {g["is_sheet"]: g["count"] for g in chronicle_grouped}
            chronicle_sheets = chronicle_map.get(True, 0)
            chronicle_trackers = chronicle_map.get(False, 0)

            result["chronicle"] = {
                "sheets": chronicle_sheets,
                "trackers": chronicle_trackers,
                "total": chronicle_sheets + chronicle_trackers,
            }

        return result

    @classmethod
    def _serialize_characters(
        cls,
        user_id: str,
        characters: Union[QuerySet, Iterable[Character]],
        serializer_type: SerializerType,
    ) -> List[Dict[str, Any]]:
        """
        Private method to serialize a queryset or iterable of characters.
        Will only serialize characters the user has permission to view.

        Args:
            user_id: ID of the user making the request
            characters: QuerySet or iterable of Character objects
            serializer_type: Type of serializer to use

        Returns:
            List of serialized character data dictionaries
        """
        serialized_characters = []

        for character in characters:
            # Get splat and appropriate serializer
            splat = Splats(character.splat)
            serializer_class = SerializerRegistry.get_serializer(splat, serializer_type)

            # Get the actual character instance (with proper inheritance)
            actual_character = cls._get_actual_character_instance(character)

            # Permission check
            is_owner = getattr(character, "user_id", None) == user_id
            chronicle_id = getattr(character, "chronicle_id", None)
            is_staff = cls._is_staff(user_id, chronicle_id)
            if is_owner or is_staff:
                # Serialize character
                serializer = serializer_class(actual_character)
                serialized_characters.append(dict(serializer.data))

        return serialized_characters

    @classmethod
    def _get_actual_character_instance(cls, character: Character) -> Character:
        """
        Get the actual character instance with proper inheritance.

        Django's model inheritance requires casting to the correct subclass
        to access splat-specific fields.

        Args:
            character: Base Character instance

        Returns:
            Character instance cast to the appropriate subclass

        Raises:
            ValidationError: If character has invalid splat or inheritance issues
        """
        splat = Splats(character.splat)

        # Map splats to their model attributes (lowercase without numbers)
        splat_to_attr = {
            Splats.VAMPIRE_5TH: "vampire5th",
            Splats.WEREWOLF_5TH: "werewolf5th",
            Splats.HUMAN_5TH: "human5th",
            Splats.GHOUL_5TH: "ghoul5th",
            Splats.HUNTER_5TH: "hunter5th",
            Splats.VAMPIRE_20TH: "vampire20th",
            Splats.WEREWOLF_20TH: "werewolf20th",
            Splats.HUMAN_20TH: "human20th",
            Splats.GHOUL_20TH: "ghoul20th",
            Splats.CHANGELING_20TH: "changeling20th",
            Splats.MAGE_20TH: "mage20th",
            Splats.WRAITH_20TH: "wraith20th",
            Splats.DEMON_20TH: "demontf",  # Note: DemonTF uses different naming
        }

        attr_name = splat_to_attr.get(splat)
        if attr_name and hasattr(character, attr_name):
            return getattr(character, attr_name)

        # Fallback to base character if no specific subclass found
        return character

    @classmethod
    def _is_staff(cls, user_id: str | None, chronicle_id: str | None) -> bool:
        """
        Check if a member is staff (admin or storyteller).

        Args:
            member: Member object or User Id identifier

        Returns:
            True if the member is staff, False otherwise
        """
        if user_id and chronicle_id:
            # Assume member is a user ID
            m = Member.objects.filter(
                user_id=user_id, chronicle_id=chronicle_id
            ).first()
            if m is None:
                return False
            return bool(getattr(m, "admin", False) or getattr(m, "storyteller", False))
        else:
            # If user_id or chronicle_id is None or not a valid type, assume not staff
            return False

    @classmethod
    def _is_member_staff(cls, member: Member) -> bool:
        """
        Check if a member is staff (admin or storyteller).

        Args:
            member: Member object or User Id identifier

        Returns:
            True if the member is staff, False otherwise
        """
        return bool(
            getattr(member, "admin", False) or getattr(member, "storyteller", False)
        )

    @classmethod
    def _is_at_character_limit(
        cls, user: UserModel | str, is_sheet: bool = False
    ) -> bool:
        """
        Check if a user has reached their character creation limit.

        Args:
            user: The user instance or user_id to check
            is_sheet: Whether to check sheet limit (True) or tracker limit (False)

        Returns:
            True if user can create more characters, False if at limit

        Raises:
            CharacterManagerException: If user lookup fails
        """
        if isinstance(user, str):
            try:
                user = User.objects.get(pk=user)
            except User.DoesNotExist:
                raise CharacterManagerException(
                    f"User not found: {user}", status.HTTP_404_NOT_FOUND
                )

        supporter_level = getattr(user, "supporter", Supporter.NONE)
        max_trackers = TrackerLimit.get_amount(supporter_level)
        max_sheets = CharacterSheetLimit.get_amount(supporter_level)
        current_count = Character.objects.filter(
            user=user.id, is_sheet=is_sheet
        ).count()

        if is_sheet:
            return current_count < max_sheets
        else:
            return current_count < max_trackers

    @classmethod
    def _check_character_name_exists(cls, name: str, user_id: str) -> bool:
        """
        Check if a character with the given name already exists for the user.

        Args:
            name: Character name to check
            user_id: User ID who owns the character

        Returns:
            True if character name exists, False otherwise
        """
        return Character.objects.filter(name__iexact=name, user_id=user_id).exists()
