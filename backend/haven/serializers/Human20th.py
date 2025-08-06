"""
Human20th serializers for World of Darkness 20th Anniversary Edition Human characters.

This module provides type-safe, well-documented serializers for Human20th model
operations, extending the Character20th serializers with Human-specific fields
and validation logic.
"""

from typing import Dict, Any
from rest_framework import serializers

from .Character20th import (
    Character20thSerializer,
    Character20thDeserializer,
    Tracker20thSerializer,
)
from .validators import (
    validate_humanity_20th,
    validate_mortal_blood_20th,
)
from haven.types import Splats
from haven.models import Human20th


class Human20thTrackerSerializer(Tracker20thSerializer):
    """
    Lightweight tracker serializer for Human20th characters.

    Extends Tracker20thSerializer with Human-specific tracking fields:
        - human: HumanTrackers with blood/humanity
    """

    class Meta(Tracker20thSerializer.Meta):
        model = Human20th
        fields = Character20thSerializer.Meta.fields + (
            "blood",
            "humanity",
        )

    def to_representation(self, instance: Human20th) -> Dict[str, Any]:
        """
        Convert Human20th instance to tracker representation.

        Args:
            instance: Human20th model instance

        Returns:
            Dictionary containing tracker data with Human-specific fields
        """
        data = super().to_representation(instance)
        return data


class Human20thSerializer(Character20thSerializer):
    """
    Full serializer for Human20th character data.

    Extends Character20thSerializer with Human-specific fields:
        - human: HumanTrackers with blood/humanity
    """

    class Meta(Character20thSerializer.Meta):
        model = Human20th
        fields = Character20thSerializer.Meta.fields + (
            "blood",
            "humanity",
        )

    def to_representation(self, instance: Human20th) -> Dict[str, Any]:
        """
        Convert Human20th instance to full representation.

        Args:
            instance: Human20th model instance

        Returns:
            Dictionary containing complete character data with Human-specific fields
        """
        data = super().to_representation(instance)
        return data


class Human20thDeserializer(Character20thDeserializer):
    """
    Deserializer for creating and updating Human20th instances.

    Extends Character20thDeserializer with Human-specific validation for
    Blood and Humanity tracking.

    Validates:
        - Blood value (0-10)
        - Humanity value (0-10)
    """

    class Meta(Character20thDeserializer.Meta):
        model = Human20th

    def create(self, validated_data: Dict[str, Any]) -> Human20th:
        """
        Create a new Human20th instance, setting the splat field appropriately.

        Args:
            validated_data: Validated character data

        Returns:
            Created Human20th instance
        """
        from typing import cast

        validated_data["splat"] = Splats.HUMAN_20TH.value
        instance = super().create(validated_data)
        return cast(Human20th, instance)

    def validate_humanity(self, value: Any) -> int:
        """
        Validate humanity value for Human20th.

        Args:
            value: Humanity value

        Returns:
            Validated humanity value

        Raises:
            ValidationError: If humanity is not an integer or out of range
        """
        return validate_humanity_20th(value)

    def validate_blood(self, value: Any) -> int:
        """
        Validate blood value for Human20th.

        Args:
            value: Blood value

        Returns:
            Validated blood value

        Raises:
            ValidationError: If blood is not an integer or out of range
        """
        return validate_mortal_blood_20th(value)

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform cross-field validation for Human20th characters.

        Args:
            data: Complete validated data dictionary

        Returns:
            Final validated data dictionary

        Raises:
            ValidationError: If cross-field validation fails
        """
        data = super().validate(data)

        return data
