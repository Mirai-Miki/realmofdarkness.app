"""
Character20th serializers for World of Darkness 20th Anniversary Edition characters.

This module provides type-safe, well-documented serializers for Character20th model
operations, extending the base Character serializers with 20th Edition specific
fields and validation logic.
"""

from typing import Dict, Any
from rest_framework import serializers

from .Character import (
    CharacterSerializer,
    CharacterDeserializer,
    CharacterTrackerSerializer,
)
from .types import (
    ATTRIBUTES_20TH,
    SKILLS_20TH,
    DamageTracker20th,
    HealthTracker20th,
    AttributeEntry20th,
    SkillEntry20th,
)
from haven.models import Character20th


class Tracker20thSerializer(CharacterTrackerSerializer):
    """
    Lightweight tracker serializer for 20th Edition characters.

    Extends the base CharacterTrackerSerializer with willpower and health
    tracking specific to World of Darkness 20th Anniversary Edition.

    Additional fields:
        - willpower: DamageTracker20th with current/total
        - health: HealthTracker20th with bashing/lethal/aggravated/total
    """

    class Meta(CharacterTrackerSerializer.Meta):
        model = Character20th

    def to_representation(self, instance: Character20th) -> Dict[str, Any]:
        """
        Convert Character20th instance to tracker representation.

        Args:
            instance: Character20th model instance

        Returns:
            Dictionary containing tracker data with 20th Edition damage tracking
        """
        data = super().to_representation(instance)

        # 20th Edition willpower tracking (current/total)
        willpower_data: DamageTracker20th = {
            "total": instance.willpower_total,
            "current": instance.willpower_current,
        }
        data["willpower"] = willpower_data

        # 20th Edition health tracking (bashing/lethal/aggravated)
        health_data: HealthTracker20th = {
            "total": instance.health_total,
            "bashing": instance.health_bashing,
            "lethal": instance.health_lethal,
            "aggravated": instance.health_aggravated,
        }
        data["health"] = health_data

        return data


class Character20thSerializer(CharacterSerializer):
    """
    Full serializer for 20th Edition character data.

    Extends the base CharacterSerializer with all Character20th specific fields
    including damage tracking, attributes with specializations, and skills.

    Additional fields:
        - willpower: DamageTracker20th with current/total
        - health: HealthTracker20th with bashing/lethal/aggravated/total
        - attributes: AttributeData20th with values and specializations
        - skills: SkillData20th with values and specializations
    """

    class Meta(CharacterSerializer.Meta):
        model = Character20th

    def to_representation(self, instance: Character20th) -> Dict[str, Any]:
        """
        Convert Character20th instance to full representation.

        Args:
            instance: Character20th model instance

        Returns:
            Dictionary containing complete character data with structured
            damage tracking, attributes, and skills with specializations
        """
        data = super().to_representation(instance)

        # 20th Edition willpower tracking
        willpower_data: DamageTracker20th = {
            "current": instance.willpower_current,
            "total": instance.willpower_total,
        }
        data["willpower"] = willpower_data

        # 20th Edition health tracking
        health_data: HealthTracker20th = {
            "bashing": instance.health_bashing,
            "lethal": instance.health_lethal,
            "aggravated": instance.health_aggravated,
            "total": instance.health_total,
        }
        data["health"] = health_data

        # Attributes with specializations
        attributes_data: Dict[str, AttributeEntry20th] = {}
        for attr_name in ATTRIBUTES_20TH:
            attributes_data[attr_name] = {
                "value": getattr(instance, attr_name, 0),
                "spec": getattr(instance, f"{attr_name}_spec", ""),
            }
        data["attributes"] = attributes_data

        # Skills with specializations
        skills_data: Dict[str, SkillEntry20th] = {}
        for skill in SKILLS_20TH:
            skills_data[skill] = {
                "value": getattr(instance, skill, 0),
                "spec": getattr(instance, f"{skill}_spec", ""),
            }
        data["skills"] = skills_data

        return data


class Character20thDeserializer(CharacterDeserializer):
    """
    Deserializer for creating and updating Character20th instances.

    Extends the base CharacterDeserializer with 20th Edition specific validation
    for damage trackers, attributes, and skills.

    Validates:
        - Willpower current/total tracking
        - Health bashing/lethal/aggravated tracking
        - Attribute and skill ranges (0-5)
        - Cross-field damage validation
    """

    class Meta(CharacterDeserializer.Meta):
        model = Character20th

    def validate_willpower_total(self, value: int) -> int:
        """
        Validate willpower total range for 20th Edition.

        Args:
            value: Willpower total value

        Returns:
            Validated willpower total

        Raises:
            ValidationError: If value is outside range 1-10
        """
        if value > 10 or value < 1:
            raise serializers.ValidationError(
                "Willpower total must be between 1 and 10"
            )
        return value

    def validate_willpower_current(self, value: int) -> int:
        """
        Validate willpower current range.

        Args:
            value: Current willpower value

        Returns:
            Validated willpower current value

        Raises:
            ValidationError: If value is outside range 0-10
        """
        if value > 10 or value < 0:
            raise serializers.ValidationError(
                "Current willpower must be between 0 and 10"
            )
        return value

    def validate_health_total(self, value: int) -> int:
        """
        Validate health total range for 20th Edition.

        Args:
            value: Health total value

        Returns:
            Validated health total

        Raises:
            ValidationError: If value is outside range 7-15
        """
        if value > 15 or value < 7:
            raise serializers.ValidationError("Health total must be between 7 and 15")
        return value

    def validate_health_bashing(self, value: int) -> int:
        """
        Validate health bashing damage range.

        Args:
            value: Bashing damage value

        Returns:
            Validated bashing damage value

        Raises:
            ValidationError: If value is outside range 0-15
        """
        if value > 15 or value < 0:
            raise serializers.ValidationError("Bashing damage must be between 0 and 15")
        return value

    def validate_health_lethal(self, value: int) -> int:
        """
        Validate health lethal damage range.

        Args:
            value: Lethal damage value

        Returns:
            Validated lethal damage value

        Raises:
            ValidationError: If value is outside range 0-15
        """
        if value > 15 or value < 0:
            raise serializers.ValidationError("Lethal damage must be between 0 and 15")
        return value

    def validate_health_aggravated(self, value: int) -> int:
        """
        Validate health aggravated damage range.

        Args:
            value: Aggravated damage value

        Returns:
            Validated aggravated damage value

        Raises:
            ValidationError: If value is outside range 0-15
        """
        if value > 15 or value < 0:
            raise serializers.ValidationError(
                "Aggravated damage must be between 0 and 15"
            )
        return value

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform cross-field validation for 20th Edition characters.

        Args:
            data: Complete validated data dictionary

        Returns:
            Final validated data dictionary

        Raises:
            ValidationError: If cross-field validation fails
        """
        data = super().validate(data)

        # Validate attributes and skills range (0-5)
        attributes: dict[str, AttributeEntry20th] = data.get("attributes", {})
        skills: dict[str, SkillEntry20th] = data.get("skills", {})

        for attribute, entry in attributes.items():
            value = entry.get("value", 0)
            if value < 0 or value > 5:
                raise serializers.ValidationError(
                    f"{attribute} must be between 0 and 5"
                )

        for skill, entry in skills.items():
            value = entry.get("value", 0)
            if value < 0 or value > 5:
                raise serializers.ValidationError(f"{skill} must be between 0 and 5")

        # Validate damage trackers
        self._validate_willpower_tracking(data)
        self._validate_health_tracking(data)

        return data

    def _validate_willpower_tracking(self, data: Dict[str, Any]) -> None:
        """
        Validate willpower current doesn't exceed total.

        Args:
            data: Validation data

        Raises:
            ValidationError: If current willpower exceeds total
        """
        if not self.instance:
            return

        total = data.get("willpower_total")
        current = data.get("willpower_current")

        if total is not None and current is not None and current > total:
            raise serializers.ValidationError(
                "Current willpower cannot exceed total willpower"
            )

    def _validate_health_tracking(self, data: Dict[str, Any]) -> None:
        """
        Validate health damage doesn't exceed total.

        Args:
            data: Validation data

        Raises:
            ValidationError: If total damage exceeds health total
        """
        if not self.instance:
            return

        total = data.get("health_total")
        bashing = data.get("health_bashing", 0)
        lethal = data.get("health_lethal", 0)
        aggravated = data.get("health_aggravated", 0)

        if total is not None and total < (bashing + lethal + aggravated):
            raise serializers.ValidationError(
                "Total health damage cannot exceed health total"
            )
