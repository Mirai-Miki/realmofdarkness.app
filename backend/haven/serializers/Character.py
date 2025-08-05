"""
Character serializers for the Realm of Darkness application.

This module provides type-safe, well-documented serializers for Character model
operations. Includes tracker, full sheet, and deserializer classes with
comprehensive validation and proper separation of concerns.

The CharacterManager handles all permission checks, so these serializers
focus purely on data serialization/deserialization and validation.
"""

import re
from typing import Dict, Any, cast
from rest_framework import serializers
from rest_framework import status

from haven.models import Character, SheetStatus
from haven.serializers.types import ExperienceData, ExperienceSpendList, ExperienceSpend
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

        # Add computed fields
        data["created_at"] = instance.created_at.timestamp()
        data["last_updated"] = instance.last_updated.timestamp()
        data["avatar"] = instance.avatar.url if instance.avatar else None

        # Experience data as structured object
        exp_data: ExperienceData = {
            "current": instance.exp_current,
            "total": instance.exp_total,
        }
        data["exp"] = exp_data

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

        # Add computed fields
        data["created_at"] = instance.created_at.timestamp()
        data["last_updated"] = instance.last_updated.timestamp()
        data["avatar"] = instance.avatar.url if instance.avatar else None

        # Experience data as structured object
        exp_data: ExperienceData = {
            "current": instance.exp_current,
            "total": instance.exp_total,
        }
        data["exp"] = exp_data

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
        data.pop("member", None)
        data.pop("created_at", None)
        data.pop("last_updated", None)
        data.pop("avatar", None)  # Handled by ImageManager
        data.pop("splat", None)  # Handled by CharacterManager

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

    def validate_name(self, value: str) -> str:
        """
        Validate character name.

        Args:
            value: Character name to validate

        Returns:
            Validated character name

        Raises:
            ValidationError: If name is invalid or duplicate
        """
        user_id = None
        if self.instance:
            # Update operation - get user from instance
            user_id = str(self.instance.user.pk)
        elif "user" in self.context:
            # Create operation - get user from context
            user_id = str(self.context["user"].pk)

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

    def validate_user(self, value: User | None) -> User | None:
        """
        Validate user assignment.

        User can only be set during creation and cannot be changed afterward.

        Args:
            value: User instance

        Returns:
            Validated User instance

        Raises:
            ValidationError: If user is missing on creation or being changed
        """
        if not self.instance and not value:
            raise serializers.ValidationError(
                "User must be included with a new character"
            )
        elif self.instance and self.instance.user != value:
            raise serializers.ValidationError("You cannot change a user after creation")

        return value

    def validate_status(self, value: int) -> int:
        """
        Validate character sheet status.

        Args:
            value: Status value to validate

        Returns:
            Validated status value
        """
        if self.context.get("is_owner", False):
            raise serializers.ValidationError(
                "You cannot change the status of a character.",
                code=status.HTTP_403_FORBIDDEN,
            )

        if value < SheetStatus.DRAFT or value > SheetStatus.ARCHIVE:
            raise serializers.ValidationError("Invalid Sheet Status.")

        return value

    def validate_theme(self, value: str) -> str:
        """
        Validate theme color (hex color format).

        Args:
            value: Theme color to validate

        Returns:
            Validated theme color
        """
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

        if not isinstance(value, str) or not hex_color_pattern.match(value):
            raise serializers.ValidationError(
                "Invalid hex color value.", code=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        return value

    def validate_exp_current(self, value: int) -> int:
        """
        Validate current experience points.

        Args:
            value: Current experience value

        Returns:
            Validated current experience value
        """
        exp_total = None
        if (
            hasattr(self, "initial_data")
            and self.initial_data
            and isinstance(self.initial_data, dict)
        ):
            exp_total = self.initial_data.get("exp_total")
        elif self.instance:
            exp_total = self.instance.exp_total

        if value < 0:
            raise serializers.ValidationError(
                "Current experience cannot be less than 0"
            )

        if exp_total is not None and value > exp_total:
            raise serializers.ValidationError(
                "Current experience cannot be more than total experience"
            )

        return value

    def validate_exp_total(self, value: int) -> int:
        """
        Validate total experience points.

        Args:
            value: Total experience value

        Returns:
            Validated total experience value
        """
        exp_current = None
        if (
            hasattr(self, "initial_data")
            and self.initial_data
            and isinstance(self.initial_data, dict)
        ):
            exp_current = self.initial_data.get("exp_current")
        elif self.instance:
            exp_current = self.instance.exp_current

        if value < 0:
            raise serializers.ValidationError("Total experience cannot be less than 0")

        if exp_current is not None and value < exp_current:
            raise serializers.ValidationError(
                "Total experience cannot be less than current experience"
            )

        return value

    def validate_exp_spends(self, data: Any) -> ExperienceSpendList:
        """
        Validate experience point expenditure list.

        Args:
            data: Experience spends data

        Returns:
            Validated experience spends list
        """
        if not isinstance(data, list):
            raise serializers.ValidationError("Experience spends must be a list")

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
                    "Experience spend missing 'cost' field"
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

            if len(item["description"]) > 80:
                raise serializers.ValidationError(
                    "Experience spend description too long (max 80 characters)"
                )

            # Validate cost
            if not isinstance(item["cost"], int):
                raise serializers.ValidationError(
                    "Experience spend cost must be an integer"
                )

            # Create typed spend entry
            spend: ExperienceSpend = {
                "description": item["description"],
                "cost": item["cost"],
            }
            validated_spends.append(spend)

        return validated_spends

    def validate_st_lock(self, value: bool) -> bool:
        """
        Validate storyteller lock status.

        Args:
            value: ST lock boolean value

        Returns:
            Validated ST lock value

        Raises:
            ValidationError: If value is not a boolean
        """
        character = cast(Character | None, self.instance)
        if (
            character
            and character.st_lock != value
            and self.context.get("is_owner", False)
        ):
            # Only allow changing ST lock if the user is the owner
            raise serializers.ValidationError(
                "You cannot change the ST lock status of this character.",
                code=status.HTTP_403_FORBIDDEN,
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

        return data
