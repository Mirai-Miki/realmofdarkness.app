"""
Character5th serializers for Vampire: The Masquerade 5th Edition characters.

This module provides type-safe, well-documented serializers for Character5th model
operations, extending the base Character serializers with 5th Edition specific
fields and validation logic.
"""

from re import A
from typing import Dict, Any, List
from rest_framework import serializers

from .Character import (
    CharacterSerializer,
    CharacterDeserializer,
    CharacterTrackerSerializer,
)
from .types import (
    ATTRIBUTES_5TH,
    SKILLS_5TH,
    DamageTracker5th,
    SkillEntry5th,
    AdvantageEntry,
    AdvantageList,
)
from haven.models import Character5th


class Character5thSerializer(CharacterSerializer):
    """
    Full serializer for 5th Edition character data.

    Extends the base CharacterSerializer with all Character5th specific fields
    including damage tracking, attributes, skills, and advantage lists.

    Additional fields:
        - willpower/health: DamageTracker5th with superficial/aggravated damage
        - attributes: AttributeData5th with all nine attributes
        - skills: Dictionary of SkillEntry5th with values and specializations
        - Various advantage lists (merits, flaws, backgrounds, etc.)
    """

    class Meta(CharacterSerializer.Meta):
        model = Character5th
        fields = CharacterSerializer.Meta.fields + (
            "ambition",
            "desire",
            "tenets",
            "touchstones",
            "convictions",
            "merits",
            "flaws",
            "backgrounds",
            "haven",
            "haven_name",
            "haven_location",
            "haven_description",
            "loresheets",
        )

    def to_representation(self, instance: Character5th) -> Dict[str, Any]:
        """
        Convert Character5th instance to full representation.

        Args:
            instance: Character5th model instance

        Returns:
            Dictionary containing complete character data with structured
            damage tracking, attributes, and skills
        """
        data = super().to_representation(instance)

        # 5th Edition willpower tracking
        willpower_data: DamageTracker5th = {
            "superficial": instance.willpower_superficial,
            "total": instance.willpower_total,
            "aggravated": instance.willpower_aggravated,
        }
        data["willpower"] = willpower_data

        # 5th Edition health tracking
        health_data: DamageTracker5th = {
            "superficial": instance.health_superficial,
            "total": instance.health_total,
            "aggravated": instance.health_aggravated,
        }
        data["health"] = health_data

        attributes_data: dict[str, int] = {}
        for attr_name in ATTRIBUTES_5TH:
            attributes_data[attr_name] = getattr(instance, attr_name, 0)
        data["attributes"] = attributes_data

        # Skills with values and specializations
        skills_data: dict[str, SkillEntry5th] = {}
        for skill in SKILLS_5TH:
            skills_data[skill] = {
                "value": getattr(instance, skill, 0),
                "spec": getattr(instance, f"{skill}_spec", ""),
            }
        data["skills"] = skills_data

        return data


class Tracker5thSerializer(CharacterTrackerSerializer):
    """
    Lightweight tracker serializer for 5th Edition characters.

    Extends the base CharacterTrackerSerializer with willpower and health
    tracking specific to Vampire: The Masquerade 5th Edition.

    Additional fields:
        - willpower: DamageTracker5th with superficial/aggravated damage
        - health: DamageTracker5th with superficial/aggravated damage
    """

    class Meta(CharacterTrackerSerializer.Meta):
        model = Character5th

    def to_representation(self, instance: Character5th) -> Dict[str, Any]:
        """
        Convert Character5th instance to tracker representation.

        Args:
            instance: Character5th model instance

        Returns:
            Dictionary containing tracker data with 5th Edition damage tracking
        """
        data = super().to_representation(instance)

        # 5th Edition willpower tracking
        willpower_data: DamageTracker5th = {
            "superficial": instance.willpower_superficial,
            "total": instance.willpower_total,
            "aggravated": instance.willpower_aggravated,
        }
        data["willpower"] = willpower_data

        # 5th Edition health tracking
        health_data: DamageTracker5th = {
            "superficial": instance.health_superficial,
            "total": instance.health_total,
            "aggravated": instance.health_aggravated,
        }
        data["health"] = health_data

        return data


class Character5thDeserializer(CharacterDeserializer):
    """
    Deserializer for creating and updating Character5th instances.

    Extends the base CharacterDeserializer with 5th Edition specific validation
    for damage trackers, attributes, skills, and advantage lists.

    Validates:
        - Willpower and health damage tracking
        - Attribute and skill ranges (0-5)
        - Advantage list structures (merits, flaws, backgrounds, etc.)
        - Cross-field damage validation
    """

    class Meta(CharacterDeserializer.Meta):
        model = Character5th

    def validate_willpower_total(self, value: int) -> int:
        """
        Validate willpower total range.

        Args:
            value: Willpower total value

        Returns:
            Validated willpower total

        Raises:
            ValidationError: If value is outside range 1-20
        """
        if value > 20 or value < 1:
            raise serializers.ValidationError(
                "Willpower total must be between 1 and 20"
            )
        return value

    def validate_willpower_superficial(self, value: int) -> int:
        """
        Validate willpower superficial damage range.

        Args:
            value: Superficial willpower damage

        Returns:
            Validated superficial damage value

        Raises:
            ValidationError: If value is outside range 0-20
        """
        if value > 20 or value < 0:
            raise serializers.ValidationError(
                "Willpower superficial damage must be between 0 and 20"
            )
        return value

    def validate_willpower_aggravated(self, value: int) -> int:
        """
        Validate willpower aggravated damage range.

        Args:
            value: Aggravated willpower damage

        Returns:
            Validated aggravated damage value

        Raises:
            ValidationError: If value is outside range 0-20
        """
        if value > 20 or value < 0:
            raise serializers.ValidationError(
                "Willpower aggravated damage must be between 0 and 20"
            )
        return value

    def validate_health_total(self, value: int) -> int:
        """
        Validate health total range.

        Args:
            value: Health total value

        Returns:
            Validated health total

        Raises:
            ValidationError: If value is outside range 1-20
        """
        if value > 20 or value < 1:
            raise serializers.ValidationError("Health total must be between 1 and 20")
        return value

    def validate_health_superficial(self, value: int) -> int:
        """
        Validate health superficial damage range.

        Args:
            value: Superficial health damage

        Returns:
            Validated superficial damage value

        Raises:
            ValidationError: If value is outside range 0-20
        """
        if value > 20 or value < 0:
            raise serializers.ValidationError(
                "Health superficial damage must be between 0 and 20"
            )
        return value

    def validate_health_aggravated(self, value: int) -> int:
        """
        Validate health aggravated damage range.

        Args:
            value: Aggravated health damage

        Returns:
            Validated aggravated damage value

        Raises:
            ValidationError: If value is outside range 0-20
        """
        if value > 20 or value < 0:
            raise serializers.ValidationError(
                "Health aggravated damage must be between 0 and 20"
            )
        return value

    def validate_advantage_list(self, data: List[Dict[str, Any]]) -> AdvantageList:
        """
        Validate advantage list structure for merits, flaws, backgrounds, etc.

        Args:
            data: List of advantage dictionaries

        Returns:
            Validated list of advantage entries

        Raises:
            ValidationError: If advantage structure is invalid
        """
        allowed_keys = {"name", "description", "notes", "rating", "flaw", "modifier"}
        validated_advantages: AdvantageList = []

        for item in data:
            if not isinstance(item, dict):
                raise serializers.ValidationError("Each advantage must be a dictionary")

            # Check required fields
            required_fields = [
                "name",
                "description",
                "notes",
                "rating",
                "flaw",
                "modifier",
            ]
            for field in required_fields:
                if field not in item:
                    raise serializers.ValidationError(
                        f"Advantage missing required field: {field}"
                    )

            # Check for unexpected keys
            unexpected_keys = set(item.keys()) - allowed_keys
            if unexpected_keys:
                raise serializers.ValidationError(
                    f"Unexpected keys in advantage: {', '.join(unexpected_keys)}"
                )

            # Validate individual fields
            if not isinstance(item["name"], str):
                raise serializers.ValidationError("Advantage name must be a string")
            if len(item["name"]) > 80:
                raise serializers.ValidationError(
                    "Advantage name too long (max 80 characters)"
                )

            if not isinstance(item["description"], str):
                raise serializers.ValidationError(
                    "Advantage description must be a string"
                )
            if len(item["description"]) > 1000:
                raise serializers.ValidationError(
                    "Advantage description too long (max 1000 characters)"
                )

            if not isinstance(item["notes"], str):
                raise serializers.ValidationError("Advantage notes must be a string")
            if len(item["notes"]) > 1000:
                raise serializers.ValidationError(
                    "Advantage notes too long (max 1000 characters)"
                )

            if not isinstance(item["rating"], int):
                raise serializers.ValidationError("Advantage rating must be an integer")

            if not isinstance(item["flaw"], bool):
                raise serializers.ValidationError("Advantage flaw must be a boolean")

            if not isinstance(item["modifier"], int):
                raise serializers.ValidationError(
                    "Advantage modifier must be an integer"
                )

            # Create typed advantage entry
            advantage: AdvantageEntry = {
                "name": item["name"],
                "description": item["description"],
                "notes": item["notes"],
                "rating": item["rating"],
                "flaw": item["flaw"],
                "modifier": item["modifier"],
            }
            validated_advantages.append(advantage)

        return validated_advantages

    def validate_merits(self, data: Any) -> AdvantageList:
        """Validate merits list."""
        return self.validate_advantage_list(data)

    def validate_flaws(self, data: Any) -> AdvantageList:
        """Validate flaws list."""
        return self.validate_advantage_list(data)

    def validate_haven(self, data: Any) -> AdvantageList:
        """Validate haven advantages list."""
        return self.validate_advantage_list(data)

    def validate_backgrounds(self, data: Any) -> AdvantageList:
        """Validate backgrounds list."""
        return self.validate_advantage_list(data)

    def validate_loresheets(self, data: Any) -> AdvantageList:
        """Validate loresheets list."""
        return self.validate_advantage_list(data)

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform cross-field validation for 5th Edition characters.

        Args:
            data: Complete validated data dictionary

        Returns:
            Final validated data dictionary

        Raises:
            ValidationError: If cross-field validation fails
        """
        data = super().validate(data)

        # Validate attributes and skills range (0-5)
        attributes: Dict[str, int] = data.get("attributes", {})
        skills: Dict[str, SkillEntry5th] = data.get("skills", {})

        for attribute, value in attributes.items():
            if value and (value < 0 or value > 5):
                raise serializers.ValidationError(
                    f"{attribute} must be between 0 and 5"
                )

        for skill, entry in skills.items():
            if entry.get("value", 0) < 0 or entry.get("value", 0) > 5:
                raise serializers.ValidationError(f"{skill} must be between 0 and 5")

        # Validate damage trackers
        self._validate_damage_tracker(data, "willpower")
        self._validate_damage_tracker(data, "health")

        return data

    def _validate_damage_tracker(self, data: Dict[str, Any], tracker_type: str) -> None:
        """
        Validate damage tracker consistency.

        Args:
            data: Validation data
            tracker_type: Type of tracker ('willpower' or 'health')

        Raises:
            ValidationError: If damage exceeds total
        """
        if not self.instance:
            return

        # Get values from data or instance
        total = data.get(f"{tracker_type}_total")
        if total is None:
            total = getattr(self.instance, f"{tracker_type}_total")

        superficial = data.get(f"{tracker_type}_superficial")
        if superficial is None:
            superficial = getattr(self.instance, f"{tracker_type}_superficial")

        aggravated = data.get(f"{tracker_type}_aggravated")
        if aggravated is None:
            aggravated = getattr(self.instance, f"{tracker_type}_aggravated")

        # Validate that damage doesn't exceed total
        if (superficial + aggravated) > total:
            raise serializers.ValidationError(
                f"{tracker_type.title()} damage cannot exceed total {tracker_type}"
            )
