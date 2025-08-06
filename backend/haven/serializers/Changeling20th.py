"""
Changeling20th serializers for Changeling: The Dreaming 20th Anniversary Edition characters.

This module provides type-safe, well-documented serializers for Changeling20th model
operations, extending the base Character20th serializers with Changeling-specific
fields and validation logic.
"""

from typing import Dict, Any, cast
from rest_framework import serializers
from haven.models import Changeling20th
from ..types import Splats
from .types import ConsumableTracker, HealthTracker20th
from .Character20th import (
    Character20thSerializer,
    Character20thDeserializer,
    Tracker20thSerializer,
)
from .validators import validate_health_20th


class Changeling20thTrackerSerializer(Tracker20thSerializer):
    """
    Lightweight tracker serializer for Changeling 20th Edition characters.

    Extends the base Tracker20thSerializer with Changeling-specific fields:
        - glamour_total, glamour_current
        - banality_total, banality_current
        - nightmare, imbalance
        - chimerical_total, chimerical_bashing, chimerical_lethal, chimerical_aggravated
    """

    class Meta(Tracker20thSerializer.Meta):
        model = Changeling20th
        fields = Tracker20thSerializer.Meta.fields + (
            "nightmare",
            "imbalance",
        )

    def to_representation(self, instance: Changeling20th) -> Dict[str, Any]:
        """
        Convert Changeling20th instance to tracker representation.

        Args:
            instance: Changeling20th model instance

        Returns:
            Dictionary containing tracker data with Changeling-specific fields
        """
        data = super().to_representation(instance)
        data = _expand_common(instance, data)
        return data


class Changeling20thSerializer(Character20thSerializer):
    """
    Full serializer for Changeling 20th Edition character data.

    Extends the base Character20thSerializer with Changeling-specific fields:
        - glamour_total, glamour_current
        - banality_total, banality_current
        - nightmare, imbalance
        - chimerical_total, chimerical_bashing, chimerical_lethal, chimerical_aggravated
    """

    class Meta(Character20thSerializer.Meta):
        model = Changeling20th
        fields = Character20thSerializer.Meta.fields + (
            "nightmare",
            "imbalance",
        )

    def to_representation(self, instance: Changeling20th) -> Dict[str, Any]:
        """
        Convert Changeling20th instance to full representation.

        Args:
            instance: Changeling20th model instance

        Returns:
            Dictionary containing complete character data with Changeling-specific fields
        """
        data = super().to_representation(instance)
        data = _expand_common(instance, data)
        return data


class Changeling20thDeserializer(Character20thDeserializer):
    """
    Deserializer for creating and updating Changeling20th instances.

    Extends the base Character20thDeserializer with Changeling-specific validation:
        - glamour_current <= glamour_total
        - banality_current <= banality_total
        - chimerical damage (bashing + lethal + aggravated) <= chimerical_total
    """

    class Meta(Character20thDeserializer.Meta):
        model = Changeling20th
        fields = "__all__"

    def create(self, validated_data: Dict[str, Any]) -> Changeling20th:
        """
        Create a new Changeling20th instance, ensuring splat is set.

        Args:
            validated_data: Validated character data

        Returns:
            Created Changeling20th instance
        """
        validated_data["splat"] = Splats.CHANGELING_20TH.value
        return cast(Changeling20th, super().create(validated_data))

    def validate_glamour(self, data: Any) -> ConsumableTracker:
        """
        Validate glamour fields for Changeling 20th Edition characters.

        Args:
            data: Dictionary containing glamour fields

        Returns:
            Validated data dictionary with glamour fields

        Raises:
            ValidationError: If glamour_current > glamour_total
        """
        if not isinstance(data, dict):
            raise serializers.ValidationError("Glamour data must be a dictionary.")

        glamour_current = data.get("glamour_current", 0)
        glamour_total = data.get("glamour_total", 0)

        if not isinstance(glamour_current, int) or not isinstance(glamour_total, int):
            raise serializers.ValidationError(
                "Glamour current and total must be integers."
            )

        if glamour_current < 0 or glamour_current > 10:
            raise serializers.ValidationError(
                "Glamour current values must be between 0 and 10."
            )

        if glamour_total < 1 or glamour_total > 10:
            raise serializers.ValidationError(
                "Glamour total values must be between 1 and 10."
            )

        if glamour_current > glamour_total:
            raise serializers.ValidationError(
                "Glamour current cannot be greater than glamour total."
            )

        glamour: ConsumableTracker = {
            "current": glamour_current,
            "total": glamour_total,
        }
        return glamour

    def validate_banality(self, data: Any) -> ConsumableTracker:
        """
        Validate banality fields for Changeling 20th Edition characters.

        Args:
            data: Dictionary containing banality fields

        Returns:
            Validated data dictionary with banality fields

        Raises:
            ValidationError: If banality_current > banality_total
        """
        if not isinstance(data, dict):
            raise serializers.ValidationError("Banality data must be a dictionary.")

        banality_current = data.get("banality_current", 0)
        banality_total = data.get("banality_total", 0)

        if not isinstance(banality_current, int) or not isinstance(banality_total, int):
            raise serializers.ValidationError(
                "Banality current and total must be integers."
            )

        if banality_current < 0 or banality_current > 10:
            raise serializers.ValidationError(
                "Banality current values must be between 0 and 10."
            )

        if banality_total < 1 or banality_total > 10:
            raise serializers.ValidationError(
                "Banality total values must be between 1 and 10."
            )

        if banality_current > banality_total:
            raise serializers.ValidationError(
                "Banality current cannot be greater than banality total."
            )

        banality: ConsumableTracker = {
            "current": banality_current,
            "total": banality_total,
        }
        return banality

    def validate_chimerical(self, data: Any) -> HealthTracker20th:
        """
        Validate chimerical damage tracker for Changeling 20th Edition characters.

        Args:
            data: Dictionary containing chimerical damage fields

        Returns:
            Validated HealthTracker20th instance

        Raises:
            ValidationError: If total damage exceeds chimerical total
        """
        return validate_health_20th(data)

    def validate_nightmare(self, value: Any) -> int:
        """
        Validate nightmare value for Changeling 20th Edition characters.

        Args:
            value: Nightmare value

        Returns:
            Validated nightmare value

        Raises:
            ValidationError: If value is outside range 0-10
        """
        if not isinstance(value, int):
            raise serializers.ValidationError("Nightmare must be an integer")

        if value < 0 or value > 10:
            raise serializers.ValidationError("Nightmare must be between 0 and 10")
        return value

    def validate_imbalance(self, value: Any) -> int:
        """
        Validate imbalance value for Changeling 20th Edition characters.

        Args:
            value: Imbalance value

        Returns:
            Validated imbalance value

        Raises:
            ValidationError: If value is outside range 0-10
        """
        if not isinstance(value, int):
            raise serializers.ValidationError("Imbalance must be an integer")

        if value < 0 or value > 10:
            raise serializers.ValidationError("Imbalance must be between 0 and 10")
        return value

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform cross-field validation for Changeling 20th Edition characters.

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
        Flatten nested data structure for Changeling 20th Edition.

        Args:
            data: Nested data dictionary

        Returns:
            Flattened data dictionary
        """
        glamour: ConsumableTracker = data.pop("glamour", {})
        if glamour and glamour.get("total", None):
            data["glamour_total"] = glamour.get("total", 0)
        if glamour and glamour.get("current", None):
            data["glamour_current"] = glamour.get("current", 0)

        banality: ConsumableTracker = data.pop("banality", {})
        if banality and banality.get("total", None):
            data["banality_total"] = banality.get("total", 0)
        if banality and banality.get("current", None):
            data["banality_current"] = banality.get("current", 0)

        chimerical: HealthTracker20th = data.pop("chimerical", {})
        if chimerical and chimerical.get("total", None):
            data["chimerical_total"] = chimerical.get("total", 0)
        if chimerical and chimerical.get("bashing", None):
            data["chimerical_bashing"] = chimerical.get("bashing", 0)
        if chimerical and chimerical.get("lethal", None):
            data["chimerical_lethal"] = chimerical.get("lethal", 0)
        if chimerical and chimerical.get("aggravated", None):
            data["chimerical_aggravated"] = chimerical.get("aggravated", 0)

        if "nightmare" in data:
            data["nightmare"] = self.validate_nightmare(data["nightmare"])

        if "imbalance" in data:
            data["imbalance"] = self.validate_imbalance(data["imbalance"])
        return data


def _expand_common(instance: Changeling20th, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Expand common fields for Changeling 20th Edition characters.

    Args:
        instance: Changeling20th model instance
        data: Data dictionary to populate

    Returns:
        Updated data dictionary with structured chimerical damage tracker
    """

    glamour: ConsumableTracker = {
        "total": instance.glamour_total,
        "current": instance.glamour_current,
    }
    data["glamour"] = glamour

    banality: ConsumableTracker = {
        "total": instance.banality_total,
        "current": instance.banality_current,
    }
    data["banality"] = banality

    chimerical: HealthTracker20th = {
        "bashing": instance.chimerical_bashing,
        "lethal": instance.chimerical_lethal,
        "aggravated": instance.chimerical_aggravated,
        "total": instance.chimerical_total,
    }
    data["chimerical"] = chimerical
    return data
