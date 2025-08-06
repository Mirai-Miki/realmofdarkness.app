"""
Demon20th serializers for World of Darkness 20th Anniversary Edition Demon characters.

This module provides type-safe, well-documented serializers for Demon20th model operations,
extending the Character20th serializers with Demon-specific fields and validation logic.
"""

from typing import Dict, Any
from rest_framework import serializers

from .Character20th import (
    Character20thSerializer,
    Character20thDeserializer,
    Tracker20thSerializer,
)
from .types import (
    ConsumableTracker,
    TormentTracker,
)
from haven.types import Splats
from haven.models import Demon20th


class Demon20thTrackerSerializer(Tracker20thSerializer):
    """
    Lightweight tracker serializer for Demon20th characters.

    Extends Tracker20thSerializer with Demon-specific tracking fields:
        - faith: ConsumableTracker with current/total Faith
        - torment: TormentTracker with permanent/temporary Torment
    """

    class Meta(Tracker20thSerializer.Meta):
        model = Demon20th

    def to_representation(self, instance: Demon20th) -> Dict[str, Any]:
        """
        Convert Demon20th instance to tracker representation.

        Args:
            instance: Demon20th model instance

        Returns:
            Dictionary containing tracker data with Demon-specific fields
        """
        data = super().to_representation(instance)
        data = _expand_demon_trackers(instance, data)
        return data


class Demon20thSerializer(Character20thSerializer):
    """
    Full serializer for Demon20th character data.

    Extends Character20thSerializer with Demon-specific fields:
        - faith: ConsumableTracker with current/total Faith
        - torment: TormentTracker with permanent/temporary Torment
    """

    class Meta(Character20thSerializer.Meta):
        model = Demon20th

    def to_representation(self, instance: Demon20th) -> Dict[str, Any]:
        """
        Convert Demon20th instance to full representation.

        Args:
            instance: Demon20th model instance

        Returns:
            Dictionary containing complete character data with Demon-specific fields
        """
        data = super().to_representation(instance)
        data = _expand_demon_trackers(instance, data)
        return data


class Demon20thDeserializer(Character20thDeserializer):
    """
    Deserializer for creating and updating Demon20th instances.

    Extends Character20thDeserializer with Demon-specific validation for Faith and Torment.

    Validates:
        - Faith current/total tracking
        - Torment permanent/temporary values
        - Cross-field validation
    """

    class Meta(Character20thDeserializer.Meta):
        model = Demon20th

    def create(self, validated_data: Dict[str, Any]) -> Demon20th:
        """
        Create a new Demon20th instance, setting the splat field appropriately.

        Args:
            validated_data: Validated character data

        Returns:
            Created Demon20th instance
        """
        from typing import cast

        validated_data["splat"] = Splats.DEMON_20TH.value
        instance = super().create(validated_data)
        return cast(Demon20th, instance)

    def validate_faith(self, value: Any) -> ConsumableTracker:
        """
        Validate faith tracker structure for Demon20th.

        Args:
            value: Faith tracker data

        Returns:
            Validated ConsumableTracker instance

        Raises:
            ValidationError: If structure is invalid
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("Faith must be a dictionary")

        if "total" not in value or "current" not in value:
            raise serializers.ValidationError(
                "Faith must contain total and current fields"
            )

        total = value.get("total", 0)
        current = value.get("current", 0)

        if not isinstance(total, int) or not isinstance(current, int):
            raise serializers.ValidationError("Faith fields must be integers")

        if total < 1 or total > 10:
            raise serializers.ValidationError("Faith total must be between 1 and 10")
        if current < 0 or current > 10:
            raise serializers.ValidationError("Faith current must be between 0 and 10")
        if current > total:
            raise serializers.ValidationError("Current Faith cannot exceed total Faith")

        return {
            "total": total,
            "current": current,
        }

    def validate_torment(self, value: Any) -> TormentTracker:
        """
        Validate torment tracker structure for Demon20th.

        Args:
            value: Torment tracker data

        Returns:
            Validated TormentTracker instance

        Raises:
            ValidationError: If structure is invalid
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("Torment must be a dictionary")

        if "permanent" not in value or "temporary" not in value:
            raise serializers.ValidationError(
                "Torment must contain permanent and temporary fields"
            )

        permanent = value.get("permanent", 0)
        temporary = value.get("temporary", 0)

        if not isinstance(permanent, int) or not isinstance(temporary, int):
            raise serializers.ValidationError("Torment fields must be integers")

        if permanent < 0 or permanent > 10:
            raise serializers.ValidationError(
                "Permanent Torment must be between 0 and 10"
            )
        if temporary < 0 or temporary > 10:
            raise serializers.ValidationError(
                "Temporary Torment must be between 0 and 10"
            )

        return {
            "permanent": permanent,
            "temporary": temporary,
        }

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform cross-field validation for Demon20th characters.

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
        Flatten the data dictionary to match the Demon20th model fields.

        Args:
            data: Nested data dictionary

        Returns:
            Flattened dictionary with keys matching Demon20th model fields
        """
        # Flatten faith data
        faith: ConsumableTracker | None = data.pop("faith", None)
        if faith and faith.get("total", None) is not None:
            data["faith_total"] = faith["total"]
        if faith and faith.get("current", None) is not None:
            data["faith_current"] = faith["current"]

        # Flatten torment data
        torment: TormentTracker | None = data.pop("torment", None)
        if torment and torment.get("permanent", None) is not None:
            data["torment_permanent"] = torment["permanent"]
        if torment and torment.get("temporary", None) is not None:
            data["torment_temporary"] = torment["temporary"]

        return data


def _expand_demon_trackers(instance: Demon20th, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Expand Demon-specific tracker fields for serialization.

    Args:
        instance: Demon20th model instance
        data: Existing serialized data dictionary

    Returns:
        Updated data dictionary with expanded Demon tracker fields
    """
    # Faith tracking (current/total)
    faith: ConsumableTracker = {
        "current": instance.faith_current,
        "total": instance.faith_total,
    }
    data["faith"] = faith

    # Torment tracking (permanent/temporary)
    torment: TormentTracker = {
        "permanent": instance.torment_permanent,
        "temporary": instance.torment_temporary,
    }
    data["torment"] = torment

    return data
