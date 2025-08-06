"""
Mage20th serializers for World of Darkness 20th Anniversary Edition Mage characters.

This module provides type-safe, well-documented serializers for Mage20th model
operations, extending the Character20th serializers with Mage-specific fields
and validation logic.
"""

from typing import Dict, Any
from rest_framework import serializers

from .Character20th import (
    Character20thSerializer,
    Character20thDeserializer,
    Tracker20thSerializer,
)
from .types import QuintTracker
from haven.types import Splats
from haven.models import Mage20th


class Mage20thTrackerSerializer(Tracker20thSerializer):
    """
    Lightweight tracker serializer for Mage20th characters.

    Extends Tracker20thSerializer with Mage-specific tracking fields:
        - mage: MageTrackers with arete/paradox/quintessence
    """

    class Meta(Tracker20thSerializer.Meta):
        model = Mage20th
        fields = Tracker20thSerializer.Meta.fields + ("arete",)

    def to_representation(self, instance: Mage20th) -> Dict[str, Any]:
        """
        Convert Mage20th instance to tracker representation.

        Args:
            instance: Mage20th model instance

        Returns:
            Dictionary containing tracker data with Mage-specific fields
        """
        data = super().to_representation(instance)
        data = _expand_common(instance, data)
        return data


class Mage20thSerializer(Character20thSerializer):
    """
    Full serializer for Mage20th character data.

    Extends Character20thSerializer with Mage-specific fields:
        - mage: MageTrackers with arete/paradox/quintessence
    """

    class Meta(Character20thSerializer.Meta):
        model = Mage20th
        fields = Character20thSerializer.Meta.fields + ("arete",)

    def to_representation(self, instance: Mage20th) -> Dict[str, Any]:
        """
        Convert Mage20th instance to full representation.

        Args:
            instance: Mage20th model instance

        Returns:
            Dictionary containing complete character data with Mage-specific fields
        """
        data = super().to_representation(instance)
        data = _expand_common(instance, data)
        return data


class Mage20thDeserializer(Character20thDeserializer):
    """
    Deserializer for creating and updating Mage20th instances.

    Extends Character20thDeserializer with Mage-specific validation for
    Arete, Paradox, and Quintessence tracking.

    Validates:
        - Arete rating (0-10)
        - Paradox points (0-20)
        - Quintessence points (0-20)
        - Combined Paradox + Quintessence ≤ 20
    """

    class Meta(Character20thDeserializer.Meta):
        model = Mage20th

    def create(self, validated_data: Dict[str, Any]) -> Mage20th:
        """
        Create a new Mage20th instance, setting the splat field appropriately.

        Args:
            validated_data: Validated character data

        Returns:
            Created Mage20th instance
        """
        from typing import cast

        validated_data["splat"] = Splats.MAGE_20TH.value
        instance = super().create(validated_data)
        return cast(Mage20th, instance)

    def validate_arete(self, value: Any) -> int:
        """
        Validate Arete rating for Mage20th.

        Args:
            value: Arete rating

        Returns:
            Validated Arete rating

        Raises:
            ValidationError: If Arete is not an integer or out of range
        """
        if not isinstance(value, int):
            raise serializers.ValidationError("Arete must be an integer")
        if value < 1 or value > 10:
            raise serializers.ValidationError("Arete must be between 1 and 10")
        return value

    def validate_quint_tracker(self, value: Any) -> QuintTracker:
        """
        Validate quintessence tracker structure for Mage20th.

        Args:
            value: Quintessence tracker data

        Returns:
            Validated QuintTracker instance

        Raises:
            ValidationError: If structure is invalid
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("Quintessence must be a dictionary")

        if "paradox" not in value or "quintessence" not in value:
            raise serializers.ValidationError(
                "Quintessence must contain paradox and quintessence fields"
            )

        paradox = value.get("paradox", 0)
        quintessence = value.get("quintessence", 0)

        if not isinstance(paradox, int) or not isinstance(quintessence, int):
            raise serializers.ValidationError("Quintessence fields must be integers")

        if paradox < 0 or paradox > 20:
            raise serializers.ValidationError("Paradox must be between 0 and 20")
        if quintessence < 0 or quintessence > 20:
            raise serializers.ValidationError("Quintessence must be between 0 and 20")
        if (paradox + quintessence) > 20:
            raise serializers.ValidationError(
                "Combined Paradox and Quintessence cannot exceed 20"
            )

        return {
            "paradox": paradox,
            "quintessence": quintessence,
        }

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform cross-field validation for Mage20th characters.

        Args:
            data: Complete validated data dictionary

        Returns:
            Final validated data dictionary

        Raises:
            ValidationError: If cross-field validation fails
        """
        data = super().validate(data)
        data = self._flatten_data(data)

        return data

    def _flatten_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Flatten the data dictionary to match the Mage20th model fields.

        Args:
            data: Nested data dictionary

        Returns:
            Flattened dictionary with keys matching Mage20th model fields
        """
        # Flatten mage data
        quint_tracker: QuintTracker | None = data.pop("quint_tracker", None)
        if quint_tracker and quint_tracker.get("paradox", None) is not None:
            data["paradox"] = quint_tracker["paradox"]
        if quint_tracker and quint_tracker.get("quintessence", None) is not None:
            data["quintessence"] = quint_tracker["quintessence"]

        return data


def _expand_common(instance: Mage20th, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Expand Mage-specific tracker fields for serialization.

    Args:
        instance: Mage20th model instance
        data: Existing serialized data dictionary

    Returns:
        Updated data dictionary with expanded Mage tracker fields
    """
    # Mage trackers (arete/paradox/quintessence)
    quint_tracker: QuintTracker = {
        "paradox": instance.paradox,
        "quintessence": instance.quintessence,
    }
    data["quint_tracker"] = quint_tracker

    return data
