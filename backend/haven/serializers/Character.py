"""
Character serializers for the Realm of Darkness application.

This module provides type-safe, well-documented serializers for Character model
operations. Includes tracker, full sheet, and deserializer classes with
comprehensive validation and proper separation of concerns.

The CharacterManager handles all permission checks, so these serializers
focus purely on data serialization/deserialization and validation.
"""

from encodings import undefined
import re
from typing import Dict, Any, cast
from rest_framework import serializers
from rest_framework import status

from haven.models import Character, SheetStatus
from chronicle.models import Member
from haven.serializers.types import (
    ConsumableTracker,
    ExperienceSpendList,
    ExperienceSpend,
)
from discordauth.models import User


class CharacterTrackerSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for character tracker data.

    This serializer provides only the essential fields needed for displaying
    character cards and lists. It's optimized for performance when loading
    multiple characters.

    Read-only fields:
        - id: Character unique identifier
        - user_id: Owner's user ID
        - chronicle_id: Associated chronicle ID (if any)
        - member_id: Chronicle member ID (if any)
        - created_at: Creation timestamp
        - last_updated: Last modification timestamp
        - avatar: Character avatar URL
        - exp: Experience data (current/total)
    """

    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    chronicle_id = serializers.CharField(read_only=True)
    member_id = serializers.CharField(read_only=True)

    class Meta:
        model = Character
        fields = (
            "name",
            "id",
            "user_id",
            "chronicle_id",
            "member_id",
            "is_sheet",
            "status",
            "theme",
            "splat",
        )

    def to_representation(self, instance: Character) -> Dict[str, Any]:
        """
        Convert Character instance to dictionary representation.

        Args:
            instance: Character model instance

        Returns:
            Dictionary containing serialized character data
        """
        data = super().to_representation(instance)
        data = _expand_exp(instance, data)

        # Add computed fields
        data["created_at"] = instance.created_at.timestamp()
        data["last_updated"] = instance.last_updated.timestamp()
        data["avatar"] = instance.avatar.url if instance.avatar else None

        return data


class CharacterSerializer(serializers.ModelSerializer):
    """
    Full serializer for complete character data.

    This serializer provides all character fields needed for detailed character
    sheets and editing interfaces. It includes profile information, notes,
    experience tracking, and metadata.

    Read-only fields:
        - id: Character unique identifier
        - user_id: Owner's user ID
        - chronicle_id: Associated chronicle ID (if any)
        - member_id: Chronicle member ID (if any)
        - created_at: Creation timestamp
        - last_updated: Last modification timestamp
        - avatar: Character avatar URL
        - exp: Experience data (current/total)
    """

    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    chronicle_id = serializers.CharField(read_only=True)
    member_id = serializers.CharField(read_only=True)

    class Meta:
        model = Character
        fields = (
            "name",
            "id",
            "user_id",
            "chronicle_id",
            "member_id",
            "is_sheet",
            "status",
            "theme",
            "date_of_birth",
            "age",
            "appearance_description",
            "notes",
            "notes2",
            "exp_spends",
            "st_lock",
            "splat",
        )

    def to_representation(self, instance: Character) -> Dict[str, Any]:
        """
        Convert Character instance to dictionary representation.

        Args:
            instance: Character model instance

        Returns:
            Dictionary containing serialized character data
        """
        data = super().to_representation(instance)
        data = _expand_exp(instance, data)

        # Add computed fields
        data["created_at"] = instance.created_at.timestamp()
        data["last_updated"] = instance.last_updated.timestamp()
        data["avatar"] = instance.avatar.url if instance.avatar else None

        return data


class CharacterDeserializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating Character instances.

    This serializer handles validation and deserialization of character data
    for save operations. It includes comprehensive validation logic and
    proper handling of related objects (chronicle, member).

    The CharacterManager handles permission checks, so this serializer
    focuses on data validation and integrity.

    Context expected:
        - user: User instance for the character owner (creation only)
        - chronicle: Chronicle instance if character belongs to one
        - member: Member instance if character belongs to a chronicle
        - is_update: Boolean indicating if this is an update operation
    """

    class Meta:
        model = Character
        fields = "__all__"

    def to_internal_value(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform external data representation to internal values.

        Removes read-only and computed fields that shouldn't be directly set.

        Args:
            data: External data dictionary

        Returns:
            Internal data dictionary ready for validation
        """
        # Remove fields that are handled externally or are read-only
        data.pop("id", None)
        data.pop("user_id", None)
        data.pop("chronicle_id", None)
        data.pop("member_id", None)
        data.pop("created_at", None)
        data.pop("last_updated", None)
        data.pop("avatar", None)  # Handled by ImageManager
        data.pop("splat", None)  # Handled by Create logic

        return super().to_internal_value(data)

    def create(self, validated_data: Dict[str, Any]) -> Character:
        """
        Create a new Character instance.

        Args:
            validated_data: Validated character data

        Returns:
            Created Character instance
        """
        # Get related objects from context
        if "chronicle" in self.context:
            validated_data["chronicle"] = self.context["chronicle"]
        if "member" in self.context:
            validated_data["member"] = self.context["member"]

        return super().create(validated_data)

    def update(self, instance: Character, validated_data: Dict[str, Any]) -> Character:
        """
        Update an existing Character instance.

        Args:
            instance: Existing Character instance
            validated_data: Validated update data

        Returns:
            Updated Character instance
        """
        # Get related objects from context if they've changed
        if "chronicle" in self.context:
            validated_data["chronicle"] = self.context["chronicle"]
        if "member" in self.context:
            validated_data["member"] = self.context["member"]

        return super().update(instance, validated_data)

    def validate_name(self, value: Any) -> str:
        """
        Validate character name.

        Args:
            value: Character name to validate

        Returns:
            Validated character name

        Raises:
            ValidationError: If name is invalid or duplicate
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("Name must be a string.")

        user_id = None
        if self.instance:
            # Update operation - get user from instance
            user_id = str(self.instance.user_id)
        elif "user" in self.context:
            # Create operation - get user from context
            user_id = str(self.context["user"].pk)
        else:
            raise serializers.ValidationError(
                "User ID required for name validation", code=status.HTTP_400_BAD_REQUEST
            )

        if len(value) > 50:
            raise serializers.ValidationError(
                "Name cannot be longer than 50 characters.",
                code=status.HTTP_409_CONFLICT,
            )

        # Character names cannot start with ~ (reserved for system use)
        if value.startswith("~"):
            raise serializers.ValidationError(
                "Character name cannot start with '~'.",
                code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        # Check for duplicates only if this is a new character or name has changed
        if self.instance:
            if self.instance.name == value:
                return value
            check_user_id = str(self.instance.user.pk)
        else:
            if not user_id:
                raise serializers.ValidationError(
                    "User ID required for name validation"
                )
            check_user_id = user_id

        if Character.objects.filter(name=value, user_id=check_user_id).exists():
            raise serializers.ValidationError(
                "You already have a Character with this name.",
                code=status.HTTP_304_NOT_MODIFIED,
            )

        return value

    def validate_status(self, value: Any) -> int:
        """
        Validate character sheet status.

        Args:
            value: Status value to validate

        Returns:
            Validated status value
        """
        if not isinstance(value, int):
            raise serializers.ValidationError(
                "Status must be an integer.", code=status.HTTP_400_BAD_REQUEST
            )

        if self.context.get("is_owner", False):
            raise serializers.ValidationError(
                "You cannot change the sheet status of this character.",
                code=status.HTTP_403_FORBIDDEN,
            )

        if value < SheetStatus.DRAFT or value > SheetStatus.ARCHIVE:
            raise serializers.ValidationError(
                "Invalid Sheet Status value.", code=status.HTTP_400_BAD_REQUEST
            )

        return value

    def validate_theme(self, value: Any) -> str:
        """
        Validate theme color (hex color format).

        Args:
            value: Theme color to validate

        Returns:
            Validated theme color
        """
        if not isinstance(value, str):
            raise serializers.ValidationError(
                "Theme color must be a string.", code=status.HTTP_400_BAD_REQUEST
            )

        character = cast(Character | None, self.instance)

        if character:
            user = cast(User, character.user)
        else:
            user = cast(User | None, self.context.get("user", None))

        if not user or user.supporter:
            # Non-supporters cannot set theme color
            raise serializers.ValidationError(
                "You must be a supporter to set a theme color.",
                code=status.HTTP_403_FORBIDDEN,
            )

        hex_color_pattern = re.compile(r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")

        if not hex_color_pattern.match(value):
            raise serializers.ValidationError(
                "Invalid hex color value.", code=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        return value

    def validate_exp(self, data: Any) -> ConsumableTracker:
        """
        Validate experience points.

        Args:
            data: Complete validated data dictionary

        Returns:
            Final validated data dictionary

        Raises:
            ValidationError: If experience validation fails
        """
        if not isinstance(data, dict):
            raise serializers.ValidationError(
                "Experience must be a dictionary", code=status.HTTP_400_BAD_REQUEST
            )

        exp_current = data.get("current", 0)
        exp_total = data.get("total", 0)

        if not isinstance(exp_current, int) or not isinstance(exp_total, int):
            raise serializers.ValidationError(
                "Experience values must be integers", code=status.HTTP_400_BAD_REQUEST
            )

        if exp_current < 0 or exp_total < 0:
            raise serializers.ValidationError(
                "Experience cannot be less than 0", code=status.HTTP_400_BAD_REQUEST
            )
        if exp_total > 5000 or exp_current > 5000:
            raise serializers.ValidationError(
                "Experience cannot be greater than 5000",
            )
        if exp_current > exp_total:
            raise serializers.ValidationError(
                "Current experience cannot be greater than total experience",
            )

        return {"current": exp_current, "total": exp_total}

    def validate_exp_spends(self, data: Any) -> ExperienceSpendList:
        """
        Validate experience point expenditure list.

        Args:
            data: Experience spends data

        Returns:
            Validated experience spends list
        """
        if not isinstance(data, list):
            raise serializers.ValidationError(
                "Experience spends must be a list", code=status.HTTP_400_BAD_REQUEST
            )

        allowed_keys = {"description", "cost"}
        validated_spends: ExperienceSpendList = []

        for item in data:
            if not isinstance(item, dict):
                raise serializers.ValidationError(
                    "Each experience spend must be a dictionary"
                )

            if "description" not in item:
                raise serializers.ValidationError(
                    "Experience spend missing 'description' field"
                )

            if "cost" not in item:
                raise serializers.ValidationError(
                    "Experience spend missing 'cost' field",
                )

            # Check for unexpected keys
            unexpected_keys = set(item.keys()) - allowed_keys
            if unexpected_keys:
                raise serializers.ValidationError(
                    f"Unexpected keys found in experience spend: {', '.join(unexpected_keys)}"
                )

            # Validate description
            if not isinstance(item["description"], str):
                raise serializers.ValidationError(
                    "Experience spend description must be a string"
                )

            if len(item["description"]) > 100:
                raise serializers.ValidationError(
                    "Experience spend description too long (max 100 characters)"
                )

            # Validate cost
            if not isinstance(item["cost"], int):
                raise serializers.ValidationError(
                    "Experience spend cost must be an integer"
                )

            if item["cost"] < 0 or item["cost"] > 500:
                raise serializers.ValidationError(
                    "Experience spend cost must be between 0 and 500"
                )

            # Create typed spend entry
            spend: ExperienceSpend = {
                "description": item["description"],
                "cost": item["cost"],
            }
            validated_spends.append(spend)

        return validated_spends

    def validate_st_lock(self, value: Any) -> bool:
        """
        Validate storyteller lock status.

        Args:
            value: ST lock boolean value

        Returns:
            Validated ST lock value

        Raises:
            ValidationError: If value is not a boolean
        """
        if not isinstance(value, bool):
            raise serializers.ValidationError("ST lock must be a boolean value")

        character = cast(Character | None, self.instance)

        if not character:
            # cannot change ST lock on a new character
            raise serializers.ValidationError(
                "You cannot set ST lock on a new character.",
                code=status.HTTP_403_FORBIDDEN,
            )

        if character.st_lock != value and not self.context.get("is_owner", True):
            # Only allow changing ST lock if the user is not the owner
            raise serializers.ValidationError(
                "You cannot change the ST lock status of this character.",
                code=status.HTTP_403_FORBIDDEN,
            )
        return value

    def validate_date_of_birth(self, value: Any) -> str:
        """
        Validate character date of birth.

        Args:
            value: Date of birth to validate

        Returns:
            Validated date of birth

        Raises:
            ValidationError: If date format is invalid
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("Date of birth must be a string.")

        if len(value) > 20:
            raise serializers.ValidationError(
                "Date of birth too long (max 20 characters)"
            )

        return value

    def validate_age(self, value: Any) -> str:
        """
        Validate character age.

        Args:
            value: Age to validate

        Returns:
            Validated age

        Raises:
            ValidationError: If age format is invalid
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("Age must be a string.")

        if len(value) > 20:
            raise serializers.ValidationError("Age too long (max 20 characters)")

        return value

    def validate_appearance_description(self, value: Any) -> str:
        """
        Validate character appearance description.

        Args:
            value: Appearance description to validate

        Returns:
            Validated appearance description

        Raises:
            ValidationError: If description is invalid
        """
        if not isinstance(value, str):
            raise serializers.ValidationError(
                "Appearance description must be a string."
            )

        if len(value) > 1000:
            raise serializers.ValidationError(
                "Appearance description too long (max 1000 characters)"
            )

        return value

    def validate_history(self, value: Any) -> str:
        """
        Validate character history.

        Args:
            value: History to validate

        Returns:
            Validated history

        Raises:
            ValidationError: If history is invalid
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("History must be a string.")

        if len(value) > 10000:
            raise serializers.ValidationError("History too long (max 10000 characters)")

        return value

    def validate_notes(self, value: Any) -> str:
        """
        Validate character notes.

        Args:
            value: Notes to validate

        Returns:
            Validated notes

        Raises:
            ValidationError: If notes are invalid
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("Notes must be a string.")

        if len(value) > 6000:
            raise serializers.ValidationError("Notes too long (max 6000 characters)")

        return value

    def validate_notes2(self, value: Any) -> str:
        """
        Validate additional character notes.

        Args:
            value: Additional notes to validate

        Returns:
            Validated additional notes

        Raises:
            ValidationError: If additional notes are invalid
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("Additional notes must be a string.")

        if len(value) > 6000:
            raise serializers.ValidationError(
                "Additional notes too long (max 6000 characters)"
            )

        return value

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform cross-field validation.

        Args:
            data: Complete validated data dictionary

        Returns:
            Final validated data dictionary

        Raises:
            ValidationError: If cross-field validation fails
        """
        data = super().validate(data)

        # Validate archived character editing
        if self.instance:
            char_status = data.get("status")
            if char_status is None and self.instance.status > SheetStatus.ACTIVE:
                raise serializers.ValidationError(
                    "This sheet is Archived and cannot be edited. "
                    'To edit please set the Status to "Active" or "Draft"',
                    code=status.HTTP_304_NOT_MODIFIED,
                )
        else:
            if not data.get("user") or not isinstance(data["user"], User):
                raise serializers.ValidationError(
                    "User must be included with a new character"
                )

        # Validate chronicle and member relationship
        if data.get("chronicle") or data.get("member"):
            if not data.get("chronicle") or not data.get("member"):
                raise serializers.ValidationError(
                    "You must provide both a chronicle and member for this character"
                )
        elif self.instance and (self.instance.chronicle or self.instance.member):
            if not self.instance.chronicle:
                data["member"] = None
            elif not self.instance.member:
                # Attempt to heal
                member = Member.objects.filter(
                    chronicle=self.instance.chronicle,
                    user=self.instance.user,
                ).first()
                if not member:
                    data["chronicle"] = None
                else:
                    data["member"] = member

        # Flatten nested fields
        data = self._flatten_data(data)

        return data

    def _flatten_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Flatten nested fields in the data dictionary.

        Args:
            data: Data dictionary to flatten
        Returns:
            Flattened data dictionary
        """

        # Flatten Experience fields
        exp: ConsumableTracker = data.pop("exp", {})

        if "current" in exp:
            data["exp_current"] = exp["current"]
        if "total" in exp:
            data["exp_total"] = exp["total"]

        return data


def _expand_exp(instance: Character, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Expand experience fields into a structured object.

    Args:
        instance: Character instance
        data: Data dictionary to expand

    Returns:
        Expanded data dictionary with experience as a structured object
    """
    exp: ConsumableTracker = {
        "current": getattr(instance, "exp_current", 0),
        "total": getattr(instance, "exp_total", 0),
    }
    data["exp"] = exp

    return data
