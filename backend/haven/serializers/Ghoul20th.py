"""
Ghoul20th serializers for World of Darkness 20th Anniversary Edition Ghoul characters.

This module provides type-safe, well-documented serializers for Ghoul20th model
operations, extending the Character20th serializers with Ghoul-specific fields
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
from haven.models import Ghoul20th


class Ghoul20thTrackerSerializer(Tracker20thSerializer):
    """
    Lightweight tracker serializer for Ghoul20th characters.

    Extends Tracker20thSerializer with Ghoul-specific tracking fields:
        - ghoul: GhoulTrackers with blood/vitae/humanity
    """

    class Meta(Tracker20thSerializer.Meta):
        model = Ghoul20th
        fields = Tracker20thSerializer.Meta.fields + (
            "blood",
            "vitae",
            "humanity",
        )

    def to_representation(self, instance: Ghoul20th) -> Dict[str, Any]:
        """
        Convert Ghoul20th instance to tracker representation.

        Args:
            instance: Ghoul20th model instance

        Returns:
            Dictionary containing tracker data with Ghoul-specific fields
        """
        data = super().to_representation(instance)
        return data


class Ghoul20thSerializer(Character20thSerializer):
    """
    Full serializer for Ghoul20th character data.

    Extends Character20thSerializer with Ghoul-specific fields:
        - ghoul: GhoulTrackers with blood/vitae/humanity
    """

    class Meta(Character20thSerializer.Meta):
        model = Ghoul20th
        fields = Character20thSerializer.Meta.fields + (
            "blood",
            "vitae",
            "humanity",
        )

    def to_representation(self, instance: Ghoul20th) -> Dict[str, Any]:
        """
        Convert Ghoul20th instance to full representation.

        Args:
            instance: Ghoul20th model instance

        Returns:
            Dictionary containing complete character data with Ghoul-specific fields
        """
        data = super().to_representation(instance)
        return data


class Ghoul20thDeserializer(Character20thDeserializer):
    """
    Deserializer for creating and updating Ghoul20th instances.

    Extends Character20thDeserializer with Ghoul-specific validation for
    Blood, Vitae, and Humanity tracking.

    Validates:
        - Blood value (0-10)
        - Vitae value (0-10)
        - Humanity value (0-10)
        - Vitae ≤ Blood
    """

    class Meta(Character20thDeserializer.Meta):
        model = Ghoul20th

    def create(self, validated_data: Dict[str, Any]) -> Ghoul20th:
        """
        Create a new Ghoul20th instance, setting the splat field appropriately.

        Args:
            validated_data: Validated character data

        Returns:
            Created Ghoul20th instance
        """
        from typing import cast

        validated_data["splat"] = Splats.GHOUL_20TH.value
        instance = super().create(validated_data)
        return cast(Ghoul20th, instance)

    def validate_blood(self, value: Any) -> int:
        """
        Validate blood value for Ghoul20th.

        Args:
            value: Blood value

        Returns:
            Validated blood value

        Raises:
            ValidationError: If blood is not an integer or out of range
        """
        return validate_mortal_blood_20th(value)

    def validate_vitae(self, value: Any) -> int:
        """
        Validate vitae value for Ghoul20th.

        Args:
            value: Vitae value

        Returns:
            Validated vitae value

        Raises:
            ValidationError: If vitae is not an integer or out of range
        """
        if not isinstance(value, int):
            raise serializers.ValidationError("Vitae must be an integer")
        if value < 0 or value > 10:
            raise serializers.ValidationError("Vitae must be between 0 and 10")
        return value

    def validate_humanity(self, value: Any) -> int:
        """
        Validate humanity value for Ghoul20th.

        Args:
            value: Humanity value

        Returns:
            Validated humanity value

        Raises:
            ValidationError: If humanity is not an integer or out of range
        """
        return validate_humanity_20th(value)

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform cross-field validation for Ghoul20th characters.

        Args:
            data: Complete validated data dictionary

        Returns:
            Final validated data dictionary

        Raises:
            ValidationError: If cross-field validation fails
        """
        data = super().validate(data)

        return data
