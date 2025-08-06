"""
Werewolf20th serializers for World of Darkness 20th Anniversary Edition Werewolf characters.

This module provides type-safe, well-documented serializers for Werewolf20th model
operations, extending the Character20th serializers with Werewolf-specific fields
and validation logic.
"""

from typing import Dict, Any
from rest_framework import serializers

from .Character20th import (
    Character20thSerializer,
    Character20thDeserializer,
    Tracker20thSerializer,
)
from .types import ConsumableTracker
from haven.types import Splats
from haven.models import Werewolf20th


class Werewolf20thTrackerSerializer(Tracker20thSerializer):
    """
    Lightweight tracker serializer for Werewolf20th characters.

    Extends Tracker20thSerializer with Werewolf-specific tracking fields:
        - rage: ConsumableTracker with current/total Rage
        - gnosis: ConsumableTracker with current/total Gnosis
    """

    class Meta(Tracker20thSerializer.Meta):
        model = Werewolf20th

    def to_representation(self, instance: Werewolf20th) -> Dict[str, Any]:
        """
        Convert Werewolf20th instance to tracker representation.

        Args:
            instance: Werewolf20th model instance

        Returns:
            Dictionary containing tracker data with Werewolf-specific fields
        """
        data = super().to_representation(instance)
        data = _expand_common(instance, data)
        return data


class Werewolf20thSerializer(Character20thSerializer):
    """
    Full serializer for Werewolf20th character data.

    Extends Character20thSerializer with Werewolf-specific fields:
        - rage: ConsumableTracker with current/total Rage
        - gnosis: ConsumableTracker with current/total Gnosis
    """

    class Meta(Character20thSerializer.Meta):
        model = Werewolf20th

    def to_representation(self, instance: Werewolf20th) -> Dict[str, Any]:
        """
        Convert Werewolf20th instance to full representation.

        Args:
            instance: Werewolf20th model instance

        Returns:
            Dictionary containing complete character data with Werewolf-specific fields
        """
        data = super().to_representation(instance)
        data = _expand_common(instance, data)
        return data


class Werewolf20thDeserializer(Character20thDeserializer):
    """
    Deserializer for creating and updating Werewolf20th instances.

    Extends Character20thDeserializer with Werewolf-specific validation for
    Rage and Gnosis tracking.

    Validates:
        - Rage current/total tracking
        - Gnosis current/total tracking
    """

    class Meta(Character20thDeserializer.Meta):
        model = Werewolf20th

    def create(self, validated_data: Dict[str, Any]) -> Werewolf20th:
        """
        Create a new Werewolf20th instance, setting the splat field appropriately.

        Args:
            validated_data: Validated character data

        Returns:
            Created Werewolf20th instance
        """
        from typing import cast

        validated_data["splat"] = Splats.WEREWOLF_20TH.value
        instance = super().create(validated_data)
        return cast(Werewolf20th, instance)

    def validate_rage(self, value: Any) -> ConsumableTracker:
        """
        Validate rage tracker structure for Werewolf20th.

        Args:
            value: Rage tracker data

        Returns:
            Validated ConsumableTracker instance

        Raises:
            ValidationError: If structure is invalid
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("Rage must be a dictionary")

        if "total" not in value or "current" not in value:
            raise serializers.ValidationError(
                "Rage must contain total and current fields"
            )

        total = value.get("total", 0)
        current = value.get("current", 0)

        if not isinstance(total, int) or not isinstance(current, int):
            raise serializers.ValidationError("Rage fields must be integers")

        if total < 1 or total > 10:
            raise serializers.ValidationError("Rage total must be between 1 and 10")
        if current < 0 or current > 10:
            raise serializers.ValidationError("Rage current must be between 0 and 10")

        return {
            "total": total,
            "current": current,
        }

    def validate_gnosis(self, value: Any) -> ConsumableTracker:
        """
        Validate gnosis tracker structure for Werewolf20th.

        Args:
            value: Gnosis tracker data

        Returns:
            Validated ConsumableTracker instance

        Raises:
            ValidationError: If structure is invalid
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("Gnosis must be a dictionary")

        if "total" not in value or "current" not in value:
            raise serializers.ValidationError(
                "Gnosis must contain total and current fields"
            )

        total = value.get("total", 0)
        current = value.get("current", 0)

        if not isinstance(total, int) or not isinstance(current, int):
            raise serializers.ValidationError("Gnosis fields must be integers")

        if total < 1 or total > 10:
            raise serializers.ValidationError("Gnosis total must be between 1 and 10")
        if current < 0 or current > 10:
            raise serializers.ValidationError("Gnosis current must be between 0 and 10")
        if current > total:
            raise serializers.ValidationError(
                "Current Gnosis cannot exceed total Gnosis"
            )

        return {
            "total": total,
            "current": current,
        }

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform cross-field validation for Werewolf20th characters.

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
        Flatten the data dictionary to match the Werewolf20th model fields.

        Args:
            data: Nested data dictionary

        Returns:
            Flattened dictionary with keys matching Werewolf20th model fields
        """
        # Flatten rage data
        rage: ConsumableTracker | None = data.pop("rage", None)
        if rage and rage.get("total", None) is not None:
            data["rage_total"] = rage["total"]
        if rage and rage.get("current", None) is not None:
            data["rage_current"] = rage["current"]

        # Flatten gnosis data
        gnosis: ConsumableTracker | None = data.pop("gnosis", None)
        if gnosis and gnosis.get("total", None) is not None:
            data["gnosis_total"] = gnosis["total"]
        if gnosis and gnosis.get("current", None) is not None:
            data["gnosis_current"] = gnosis["current"]

        return data


def _expand_common(instance: Werewolf20th, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Expand Werewolf-specific tracker fields for serialization.

    Args:
        instance: Werewolf20th model instance
        data: Existing serialized data dictionary

    Returns:
        Updated data dictionary with expanded Werewolf tracker fields
    """
    # Rage tracking (current/total)
    rage: ConsumableTracker = {
        "current": instance.rage_current,
        "total": instance.rage_total,
    }
    data["rage"] = rage

    # Gnosis tracking (current/total)
    gnosis: ConsumableTracker = {
        "current": instance.gnosis_current,
        "total": instance.gnosis_total,
    }
    data["gnosis"] = gnosis

    return data
