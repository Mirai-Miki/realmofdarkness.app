"""
Wraith20th serializers for World of Darkness 20th Anniversary Edition Wraith characters.

This module provides type-safe, well-documented serializers for Wraith20th model
operations, extending the Character20th serializers with Wraith-specific fields
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
from haven.models import Wraith20th


class Wraith20thTrackerSerializer(Tracker20thSerializer):
    """
    Lightweight tracker serializer for Wraith20th characters.

    Extends Tracker20thSerializer with Wraith-specific tracking fields:
        - corpus: ConsumableTracker with current/total Corpus
        - pathos: Pathos value (0-10)
    """

    class Meta(Tracker20thSerializer.Meta):
        model = Wraith20th
        fields = Tracker20thSerializer.Meta.fields + ("pathos",)

    def to_representation(self, instance: Wraith20th) -> Dict[str, Any]:
        """
        Convert Wraith20th instance to tracker representation.

        Args:
            instance: Wraith20th model instance

        Returns:
            Dictionary containing tracker data with Wraith-specific fields
        """
        data = super().to_representation(instance)
        data = _expand_wraith_trackers(instance, data)
        return data


class Wraith20thSerializer(Character20thSerializer):
    """
    Full serializer for Wraith20th character data.

    Extends Character20thSerializer with Wraith-specific fields:
        - corpus: ConsumableTracker with current/total Corpus
        - pathos: Pathos value (0-10)
    """

    class Meta(Character20thSerializer.Meta):
        model = Wraith20th
        fields = Character20thSerializer.Meta.fields + ("pathos",)

    def to_representation(self, instance: Wraith20th) -> Dict[str, Any]:
        """
        Convert Wraith20th instance to full representation.

        Args:
            instance: Wraith20th model instance

        Returns:
            Dictionary containing complete character data with Wraith-specific fields
        """
        data = super().to_representation(instance)
        data = _expand_wraith_trackers(instance, data)
        return data


class Wraith20thDeserializer(Character20thDeserializer):
    """
    Deserializer for creating and updating Wraith20th instances.

    Extends Character20thDeserializer with Wraith-specific validation for
    Corpus tracking and Pathos values.

    Validates:
        - Corpus current/total tracking
        - Pathos value (0-10)
    """

    class Meta(Character20thDeserializer.Meta):
        model = Wraith20th

    def create(self, validated_data: Dict[str, Any]) -> Wraith20th:
        """
        Create a new Wraith20th instance, setting the splat field appropriately.

        Args:
            validated_data: Validated character data

        Returns:
            Created Wraith20th instance
        """
        from typing import cast

        validated_data["splat"] = Splats.WRAITH_20TH.value
        instance = super().create(validated_data)
        return cast(Wraith20th, instance)

    def validate_corpus(self, value: Any) -> ConsumableTracker:
        """
        Validate corpus tracker structure for Wraith20th.

        Args:
            value: Corpus tracker data

        Returns:
            Validated ConsumableTracker instance

        Raises:
            ValidationError: If structure is invalid
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("Corpus must be a dictionary")

        if "total" not in value or "current" not in value:
            raise serializers.ValidationError(
                "Corpus must contain total and current fields"
            )

        total = value.get("total", 0)
        current = value.get("current", 0)

        if not isinstance(total, int) or not isinstance(current, int):
            raise serializers.ValidationError("Corpus fields must be integers")

        if total < 0 or total > 10:
            raise serializers.ValidationError("Corpus total must be between 0 and 10")
        if current < 0 or current > 10:
            raise serializers.ValidationError("Corpus current must be between 0 and 10")
        if current > total:
            raise serializers.ValidationError(
                "Current Corpus cannot exceed total Corpus"
            )

        return {
            "total": total,
            "current": current,
        }

    def validate_pathos(self, value: int) -> int:
        """
        Validate pathos value for Wraith20th.

        Args:
            value: Pathos value

        Returns:
            Validated pathos value

        Raises:
            ValidationError: If value is outside range 0-10
        """
        if not isinstance(value, int):
            raise serializers.ValidationError("Pathos must be an integer")
        if value < 0 or value > 10:
            raise serializers.ValidationError("Pathos must be between 0 and 10")
        return value

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform cross-field validation for Wraith20th characters.

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
        Flatten the data dictionary to match the Wraith20th model fields.

        Args:
            data: Nested data dictionary

        Returns:
            Flattened dictionary with keys matching Wraith20th model fields
        """
        # Flatten corpus data
        corpus: ConsumableTracker | None = data.pop("corpus", None)
        if corpus and corpus.get("total", None) is not None:
            data["corpus_total"] = corpus["total"]
        if corpus and corpus.get("current", None) is not None:
            data["corpus_current"] = corpus["current"]

        return data


def _expand_wraith_trackers(
    instance: Wraith20th, data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Expand Wraith-specific tracker fields for serialization.

    Args:
        instance: Wraith20th model instance
        data: Existing serialized data dictionary

    Returns:
        Updated data dictionary with expanded Wraith tracker fields
    """
    # Corpus tracking (current/total)
    corpus: ConsumableTracker = {
        "current": instance.corpus_current,
        "total": instance.corpus_total,
    }
    data["corpus"] = corpus

    return data
