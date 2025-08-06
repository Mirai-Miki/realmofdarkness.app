"""
Werewolf5th serializers for World of Darkness 5th Edition Werewolf characters.

This module provides type-safe, well-documented serializers for Werewolf5th model
operations, extending the Character5th serializers with Werewolf-specific fields
and validation logic.
"""

from typing import Dict, Any
from rest_framework import serializers

from .Character5th import (
    Character5thSerializer,
    Character5thDeserializer,
    Tracker5thSerializer,
)
from haven.types import Splats
from haven.models import Werewolf5th


class Werewolf5thTrackerSerializer(Tracker5thSerializer):
    """
    Lightweight tracker serializer for Werewolf5th characters.

    Extends Tracker5thSerializer with Werewolf-specific tracking fields:
        - rage: Rage value (0-5)
        - harano: Harano value (0-5)
        - hauglosk: Hauglosk value (0-5)
        - form: Current werewolf form (Homid/Glabro/Crinos/Hispo/Lupus)
    """

    class Meta(Tracker5thSerializer.Meta):
        model = Werewolf5th
        fields = Tracker5thSerializer.Meta.fields + (
            "rage",
            "harano",
            "hauglosk",
            "form",
        )

    def to_representation(self, instance: Werewolf5th) -> Dict[str, Any]:
        """
        Convert Werewolf5th instance to tracker representation.

        Args:
            instance: Werewolf5th model instance

        Returns:
            Dictionary containing tracker data with Werewolf-specific fields
        """
        data = super().to_representation(instance)
        return data


class Werewolf5thSerializer(Character5thSerializer):
    """
    Full serializer for Werewolf5th character data.

    Extends Character5thSerializer with Werewolf-specific fields:
        - rage: Rage value (0-5)
        - harano: Harano value (0-5)
        - hauglosk: Hauglosk value (0-5)
        - form: Current werewolf form (Homid/Glabro/Crinos/Hispo/Lupus)
    """

    class Meta(Character5thSerializer.Meta):
        model = Werewolf5th
        fields = Character5thSerializer.Meta.fields + (
            "rage",
            "harano",
            "hauglosk",
            "form",
        )

    def to_representation(self, instance: Werewolf5th) -> Dict[str, Any]:
        """
        Convert Werewolf5th instance to full representation.

        Args:
            instance: Werewolf5th model instance

        Returns:
            Dictionary containing complete character data with Werewolf-specific fields
        """
        data = super().to_representation(instance)
        return data


class Werewolf5thDeserializer(Character5thDeserializer):
    """
    Deserializer for creating and updating Werewolf5th instances.

    Extends Character5thDeserializer with Werewolf-specific validation for
    Rage, Harano, Hauglosk values and Form selection.

    Validates:
        - Rage value (0-5)
        - Harano value (0-5)
        - Hauglosk value (0-5)
        - Form choice from valid options
    """

    class Meta(Character5thDeserializer.Meta):
        model = Werewolf5th

    def create(self, validated_data: Dict[str, Any]) -> Werewolf5th:
        """
        Create a new Werewolf5th instance, setting the splat field appropriately.

        Args:
            validated_data: Validated character data

        Returns:
            Created Werewolf5th instance
        """
        from typing import cast

        validated_data["splat"] = Splats.WEREWOLF_5TH.value
        instance = super().create(validated_data)
        return cast(Werewolf5th, instance)

    def validate_rage(self, value: Any) -> int:
        """
        Validate rage value for Werewolf5th.

        Args:
            value: Rage value

        Returns:
            Validated rage value

        Raises:
            ValidationError: If value is outside range 0-5
        """
        if not isinstance(value, int):
            raise serializers.ValidationError("Rage must be an integer")
        if value < 0 or value > 5:
            raise serializers.ValidationError("Rage must be between 0 and 5")
        return value

    def validate_harano(self, value: Any) -> int:
        """
        Validate harano value for Werewolf5th.

        Args:
            value: Harano value

        Returns:
            Validated harano value

        Raises:
            ValidationError: If value is outside range 0-5
        """
        if not isinstance(value, int):
            raise serializers.ValidationError("Harano must be an integer")
        if value < 0 or value > 5:
            raise serializers.ValidationError("Harano must be between 0 and 5")
        return value

    def validate_hauglosk(self, value: Any) -> int:
        """
        Validate hauglosk value for Werewolf5th.

        Args:
            value: Hauglosk value

        Returns:
            Validated hauglosk value

        Raises:
            ValidationError: If value is outside range 0-5
        """
        if not isinstance(value, int):
            raise serializers.ValidationError("Hauglosk must be an integer")
        if value < 0 or value > 5:
            raise serializers.ValidationError("Hauglosk must be between 0 and 5")
        return value

    def validate_form(self, value: Any) -> str:
        """
        Validate form choice for Werewolf5th.

        Args:
            value: Form choice

        Returns:
            Validated form choice

        Raises:
            ValidationError: If form is not a valid choice
        """
        from haven.models.Werewolf5th import Form

        if not isinstance(value, str):
            raise serializers.ValidationError("Form must be a string")

        valid_forms = [choice.value for choice in Form]
        if value not in valid_forms:
            raise serializers.ValidationError(
                f"Form must be one of: {', '.join(valid_forms)}"
            )
        return value

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform cross-field validation for Werewolf5th characters.

        Args:
            data: Complete validated data dictionary

        Returns:
            Final validated data dictionary

        Raises:
            ValidationError: If cross-field validation fails
        """
        data = super().validate(data)

        return data
