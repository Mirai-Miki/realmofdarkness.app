"""
Ghoul5th serializers for World of Darkness 5th Edition Ghoul characters.

This module provides type-safe, well-documented serializers for Ghoul5th model
operations, extending the Character5th serializers with Ghoul-specific fields
and validation logic.
"""

from typing import Dict, Any
from rest_framework import serializers

from .Character5th import (
    Character5thSerializer,
    Character5thDeserializer,
    Tracker5thSerializer,
)
from .types import HumanityTracker5th
from haven.types import Splats
from haven.models import Ghoul5th
from .validators import validate_humanity_5th


class Ghoul5thTrackerSerializer(Tracker5thSerializer):
    """
    Lightweight tracker serializer for Ghoul5th characters.

    Extends Tracker5thSerializer with Ghoul-specific tracking fields:
        - humanity: HumanityTracker5th with current humanity and stains
    """

    class Meta(Tracker5thSerializer.Meta):
        model = Ghoul5th

    def to_representation(self, instance: Ghoul5th) -> Dict[str, Any]:
        """
        Convert Ghoul5th instance to tracker representation.

        Args:
            instance: Ghoul5th model instance

        Returns:
            Dictionary containing tracker data with Ghoul-specific fields
        """
        data = super().to_representation(instance)
        data = _expand_ghoul_trackers(instance, data)
        return data


class Ghoul5thSerializer(Character5thSerializer):
    """
    Full serializer for Ghoul5th character data.

    Extends Character5thSerializer with Ghoul-specific fields:
        - humanity: HumanityTracker5th with current humanity and stains
    """

    class Meta(Character5thSerializer.Meta):
        model = Ghoul5th

    def to_representation(self, instance: Ghoul5th) -> Dict[str, Any]:
        """
        Convert Ghoul5th instance to full representation.

        Args:
            instance: Ghoul5th model instance

        Returns:
            Dictionary containing complete character data with Ghoul-specific fields
        """
        data = super().to_representation(instance)
        data = _expand_ghoul_trackers(instance, data)
        return data


class Ghoul5thDeserializer(Character5thDeserializer):
    """
    Deserializer for creating and updating Ghoul5th instances.

    Extends Character5thDeserializer with Ghoul-specific validation for
    Humanity tracking and Stains management.

    Validates:
        - Humanity value (0-10)
        - Stains value (0-10)
        - Cross-validation: stains cannot exceed (10 - humanity)
    """

    class Meta(Character5thDeserializer.Meta):
        model = Ghoul5th

    def create(self, validated_data: Dict[str, Any]) -> Ghoul5th:
        """
        Create a new Ghoul5th instance, setting the splat field appropriately.

        Args:
            validated_data: Validated character data

        Returns:
            Created Ghoul5th instance
        """
        from typing import cast

        validated_data["splat"] = Splats.GHOUL_5TH.value
        instance = super().create(validated_data)
        return cast(Ghoul5th, instance)

    def validate_humanity(self, value: Any) -> HumanityTracker5th:
        """
        Validate humanity tracker structure for Ghoul5th.

        Args:
            value: Humanity tracker data

        Returns:
            Validated HumanityTracker5th instance

        Raises:
            ValidationError: If structure is invalid
        """
        return validate_humanity_5th(value)

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform cross-field validation for Ghoul5th characters.

        Args:
            data: Complete validated data dictionary

        Returns:
            Final validated data dictionary

        Raises:
            ValidationError: If cross-field validation fails
        """
        data = super().validate(data)

        # Additional stains validation for updates
        if self.instance:
            humanity = data.get("humanity", None)
            stains = data.get("stains", None)

            if humanity is None:
                humanity = self.instance.humanity
            elif isinstance(humanity, dict):
                humanity = humanity.get("current", self.instance.humanity)

            if stains is None:
                stains = self.instance.stains
            elif isinstance(data.get("humanity"), dict):
                stains = data["humanity"].get("stains", self.instance.stains)

            if (10 - humanity) < stains:
                raise serializers.ValidationError(
                    "Too many stains for current humanity level"
                )

        data = self._flatten_data(data)
        return data

    def _flatten_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Flatten the data dictionary to match the Ghoul5th model fields.

        Args:
            data: Nested data dictionary

        Returns:
            Flattened dictionary with keys matching Ghoul5th model fields
        """
        # Flatten humanity data
        humanity: HumanityTracker5th | None = data.pop("humanity", None)
        if humanity and humanity.get("current", None) is not None:
            data["humanity"] = humanity["current"]
        if humanity and humanity.get("stains", None) is not None:
            data["stains"] = humanity["stains"]

        return data


def _expand_ghoul_trackers(instance: Ghoul5th, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Expand Ghoul-specific tracker fields for serialization.

    Args:
        instance: Ghoul5th model instance
        data: Existing serialized data dictionary

    Returns:
        Updated data dictionary with expanded Ghoul tracker fields
    """
    # Humanity tracking (current/stains)
    humanity: HumanityTracker5th = {
        "current": getattr(instance, "humanity", 7),
        "stains": getattr(instance, "stains", 0),
    }
    data["humanity"] = humanity

    return data
