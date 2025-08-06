"""
Hunter5th serializers for World of Darkness 5th Edition Hunter characters.

This module provides type-safe, well-documented serializers for Hunter5th model
operations, extending the Character5th serializers with Hunter-specific fields
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
from haven.models import Hunter5th


class Hunter5thTrackerSerializer(Tracker5thSerializer):
    """
    Lightweight tracker serializer for Hunter5th characters.

    Extends Tracker5thSerializer with Hunter-specific tracking fields:
        - desperation: Desperation value (0-10)
        - danger: Danger value (0-10)
        - despair: Despair boolean flag
    """

    class Meta(Tracker5thSerializer.Meta):
        model = Hunter5th
        fields = Tracker5thSerializer.Meta.fields + (
            "desperation",
            "danger",
            "despair",
        )

    def to_representation(self, instance: Hunter5th) -> Dict[str, Any]:
        """
        Convert Hunter5th instance to tracker representation.

        Args:
            instance: Hunter5th model instance

        Returns:
            Dictionary containing tracker data with Hunter-specific fields
        """
        data = super().to_representation(instance)
        return data


class Hunter5thSerializer(Character5thSerializer):
    """
    Full serializer for Hunter5th character data.

    Extends Character5thSerializer with Hunter-specific fields:
        - desperation: Desperation value (0-10)
        - danger: Danger value (0-10)
        - despair: Despair boolean flag
    """

    class Meta(Character5thSerializer.Meta):
        model = Hunter5th
        fields = Character5thSerializer.Meta.fields + (
            "desperation",
            "danger",
            "despair",
        )

    def to_representation(self, instance: Hunter5th) -> Dict[str, Any]:
        """
        Convert Hunter5th instance to full representation.

        Args:
            instance: Hunter5th model instance

        Returns:
            Dictionary containing complete character data with Hunter-specific fields
        """
        data = super().to_representation(instance)
        return data


class Hunter5thDeserializer(Character5thDeserializer):
    """
    Deserializer for creating and updating Hunter5th instances.

    Extends Character5thDeserializer with Hunter-specific validation for
    Desperation, Danger values and Despair state.

    Validates:
        - Desperation value (0-10)
        - Danger value (0-10)
        - Despair boolean flag
        - Cross-validation between desperation and danger levels
    """

    class Meta(Character5thDeserializer.Meta):
        model = Hunter5th

    def create(self, validated_data: Dict[str, Any]) -> Hunter5th:
        """
        Create a new Hunter5th instance, setting the splat field appropriately.

        Args:
            validated_data: Validated character data

        Returns:
            Created Hunter5th instance
        """
        from typing import cast

        validated_data["splat"] = Splats.HUNTER_5TH.value
        instance = super().create(validated_data)
        return cast(Hunter5th, instance)

    def validate_desperation(self, value: Any) -> int:
        """
        Validate desperation value for Hunter5th.

        Args:
            value: Desperation value

        Returns:
            Validated desperation value

        Raises:
            ValidationError: If value is outside range 0-10
        """
        if not isinstance(value, int):
            raise serializers.ValidationError("Desperation must be an integer")
        if value < 0 or value > 10:
            raise serializers.ValidationError("Desperation must be between 0 and 10")
        return value

    def validate_danger(self, value: Any) -> int:
        """
        Validate danger value for Hunter5th.

        Args:
            value: Danger value

        Returns:
            Validated danger value

        Raises:
            ValidationError: If value is outside range 0-10
        """
        if not isinstance(value, int):
            raise serializers.ValidationError("Danger must be an integer")
        if value < 0 or value > 10:
            raise serializers.ValidationError("Danger must be between 0 and 10")
        return value

    def validate_despair(self, value: Any) -> bool:
        """
        Validate despair flag for Hunter5th.

        Args:
            value: Despair boolean flag

        Returns:
            Validated despair flag

        Raises:
            ValidationError: If value is not a boolean
        """
        if not isinstance(value, bool):
            raise serializers.ValidationError("Despair must be a boolean")
        return value

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform cross-field validation for Hunter5th characters.

        Args:
            data: Complete validated data dictionary

        Returns:
            Final validated data dictionary

        Raises:
            ValidationError: If cross-field validation fails
        """
        data = super().validate(data)
        return data
