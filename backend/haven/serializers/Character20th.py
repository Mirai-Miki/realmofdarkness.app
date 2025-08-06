"""
Character20th serializers for World of Darkness 20th Anniversary Edition characters.

This module provides type-safe, well-documented serializers for Character20th model
operations, extending the base Character serializers with 20th Edition specific
fields and validation logic.
"""

from typing import Dict, Any, Literal
from rest_framework import serializers

from .Character import (
    CharacterSerializer,
    CharacterDeserializer,
    CharacterTrackerSerializer,
)
from .types import (
    ATTRIBUTES_20TH,
    SKILLS_20TH,
    ConsumableTracker,
    HealthTracker20th,
    AttributeEntry20th,
)
from .validators import validate_health_20th
from haven.models import Character20th


class Tracker20thSerializer(CharacterTrackerSerializer):
    """
    Lightweight tracker serializer for 20th Edition characters.

    Extends the base CharacterTrackerSerializer with willpower and health
    tracking specific to World of Darkness 20th Anniversary Edition.

    Additional fields:
        - willpower: ConsumableTracker with current/total
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
        data = _expand_common(instance, data)

        return data


class Character20thSerializer(CharacterSerializer):
    """
    Full serializer for 20th Edition character data.

    Extends the base CharacterSerializer with all Character20th specific fields
    including damage tracking, attributes with specializations, and skills.

    Additional fields:
        - willpower: ConsumableTracker with current/total
        - health: HealthTracker20th with bashing/lethal/aggravated/total
        - attributes: Dictionary of AttributeEntry20th with values and specializations
        - skills: Dictionary of SkillEntry20th with values and specializations
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
        data = _expand_common(instance, data)
        data = _expand_attributes(instance, data)
        data = _expand_skills(instance, data)

        return data


class Character20thDeserializer(CharacterDeserializer):
    """
    Deserializer for creating and updating Character20th instances.

    Extends the base CharacterDeserializer with 20th Edition specific validation
    for damage trackers, attributes, and skills.

    Validates:
        - Willpower current/total tracking
        - Health bashing/lethal/aggravated tracking
        - Attribute and skill ranges with specializations
        - Cross-field damage validation
    """

    class Meta(CharacterDeserializer.Meta):
        model = Character20th

    def validate_willpower(self, value: Any) -> ConsumableTracker:
        """
        Validate willpower tracker structure for 20th Edition.

        Args:
            value: Willpower tracker data

        Returns:
            Validated ConsumableTracker instance

        Raises:
            ValidationError: If structure is invalid
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("Willpower must be a dictionary")

        if "total" not in value or "current" not in value:
            raise serializers.ValidationError(
                "Willpower must contain total and current fields"
            )

        total = value.get("total", 0)
        current = value.get("current", 0)

        if not isinstance(total, int) or not isinstance(current, int):
            raise serializers.ValidationError("Willpower fields must be integers")

        if total < 1 or total > 10:
            raise serializers.ValidationError(
                "Willpower total must be between 1 and 10"
            )
        if current < 0 or current > 10:
            raise serializers.ValidationError(
                "Willpower current must be between 0 and 10"
            )
        if current > total:
            raise serializers.ValidationError(
                "Current willpower cannot exceed total willpower"
            )

        return {
            "total": total,
            "current": current,
        }

    def validate_health(self, value: Any) -> HealthTracker20th:
        """
        Validate health tracker structure for 20th Edition.

        Args:
            value: Health tracker data

        Returns:
            Validated HealthTracker20th instance

        Raises:
            ValidationError: If structure is invalid
        """
        return validate_health_20th(value)

    def validate_attributes(self, data: Any) -> Dict[str, AttributeEntry20th]:
        """
        Validate attributes structure and values for 20th Edition.

        Args:
            data: Dictionary of attributes with AttributeEntry20th values

        Returns:
            Dictionary of validated attributes

        Raises:
            ValidationError: If structure is invalid or values are out of range
        """
        return self._validate_skills_or_attributes(data, "Attribute")

    def validate_skills(self, data: Any) -> Dict[str, AttributeEntry20th]:
        """
        Validate skills structure and values for 20th Edition.

        Args:
            data: Dictionary of skills with AttributeEntry20th values

        Returns:
            Dictionary of validated skills

        Raises:
            ValidationError: If structure is invalid or values are out of range
        """
        return self._validate_skills_or_attributes(data, "Skill")

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
        data = self._flatten_data(data)

        return data

    def _flatten_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Flatten the data dictionary to match the Character20th model fields.

        Args:
            data: Nested data dictionary

        Returns:
            Flattened dictionary with keys matching Character20th model fields
        """
        # Flatten willpower data
        willpower: ConsumableTracker | None = data.pop("willpower", None)
        if willpower and willpower.get("total", None) is not None:
            data["willpower_total"] = willpower["total"]
        if willpower and willpower.get("current", None) is not None:
            data["willpower_current"] = willpower["current"]

        # Flatten health data
        health: HealthTracker20th | None = data.pop("health", None)
        if health and health.get("total", None) is not None:
            data["health_total"] = health["total"]
        if health and health.get("bashing", None) is not None:
            data["health_bashing"] = health["bashing"]
        if health and health.get("lethal", None) is not None:
            data["health_lethal"] = health["lethal"]
        if health and health.get("aggravated", None) is not None:
            data["health_aggravated"] = health["aggravated"]

        # Flatten attributes data
        attributes: Dict[str, AttributeEntry20th] = data.pop("attributes", {})
        for attr, entry in attributes.items():
            if "value" in entry:
                data[attr] = entry["value"]
            if "spec" in entry:
                data[f"{attr}_spec"] = entry["spec"]

        # Flatten skills data
        skills: Dict[str, AttributeEntry20th] = data.pop("skills", {})
        for skill, entry in skills.items():
            if "value" in entry:
                data[skill] = entry["value"]
            if "spec" in entry:
                data[f"{skill}_spec"] = entry["spec"]

        return data

    def _validate_skills_or_attributes(
        self, data: Any, core_type: Literal["Skill", "Attribute"]
    ) -> Dict[str, Any]:
        """
        Validate that either skills or attributes are provided.

        Args:
            data: Data dictionary containing character fields
            field_name: Name of the field to validate (skills or attributes)
            valid_keys: Set of valid keys for the field

        Returns:
            Validated data dictionary for the specified field

        Raises:
            ValidationError: If neither skills nor attributes are provided
        """
        if not isinstance(data, dict):
            raise serializers.ValidationError(f"{core_type} must be a dictionary")

        if core_type == "Skill":
            valid_keys = SKILLS_20TH
        else:
            valid_keys = ATTRIBUTES_20TH

        # Check for unexpected skill keys
        unexpected_keys = set(data.keys()) - set(valid_keys)
        if unexpected_keys:
            raise serializers.ValidationError(
                f"Unexpected {core_type} keys: {', '.join(unexpected_keys)}"
            )

        validated: Dict[str, AttributeEntry20th] = {}
        for key, entry in data.items():
            if not isinstance(entry, dict):
                raise serializers.ValidationError(
                    f"{core_type} {key} must be a dictionary"
                )

            if "value" not in entry:
                raise serializers.ValidationError(
                    f"{core_type} {key} must have a value field"
                )

            value = entry.get("value")
            spec = entry.get("spec", [])

            if not isinstance(value, int):
                raise serializers.ValidationError(
                    f"{core_type} {key} value must be an integer"
                )
            if value < 0 or value > 5:
                raise serializers.ValidationError(
                    f"{core_type} {key} must be between 0 and 5"
                )

            if not isinstance(spec, list):
                raise serializers.ValidationError(
                    f"{core_type} {key} specializations must be a list"
                )

            for specialization in spec:
                if not isinstance(specialization, str):
                    raise serializers.ValidationError(
                        f"Specialization for {key} must be a string"
                    )
                if len(specialization) == 0:
                    raise serializers.ValidationError(
                        f"Specialization for {key} cannot be empty"
                    )
                if len(specialization) > 50:
                    raise serializers.ValidationError(
                        f"Specialization for {key} is too long: {specialization} (max 50 characters)"
                    )

            validated[key] = {
                "value": value,
                "spec": spec,
            }

        return validated


def _expand_common(instance: Character20th, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Expand willpower and health fields into separate damage trackers.

    Args:
        instance: Character20th model instance
        data: Existing serialized data dictionary

    Returns:
        Updated data dictionary with expanded damage trackers
    """
    # 20th Edition willpower tracking (current/total)
    willpower: ConsumableTracker = {
        "current": instance.willpower_current,
        "total": instance.willpower_total,
    }
    data["willpower"] = willpower

    # 20th Edition health tracking (bashing/lethal/aggravated/total)
    health: HealthTracker20th = {
        "bashing": instance.health_bashing,
        "lethal": instance.health_lethal,
        "aggravated": instance.health_aggravated,
        "total": instance.health_total,
    }
    data["health"] = health

    return data


def _expand_attributes(instance: Character20th, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Expand attributes into structured entries with values and specializations.

    Args:
        instance: Character20th model instance
        data: Existing serialized data dictionary

    Returns:
        Updated data dictionary with structured attribute entries
    """
    attributes_data: Dict[str, AttributeEntry20th] = {}
    for attr_name in ATTRIBUTES_20TH:
        attributes_data[attr_name] = {
            "value": getattr(instance, attr_name, 1),
            "spec": getattr(instance, f"{attr_name}_spec", []),
        }
    data["attributes"] = attributes_data

    return data


def _expand_skills(instance: Character20th, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Expand skills into structured entries with values and specializations.

    Args:
        instance: Character20th model instance
        data: Existing serialized data dictionary

    Returns:
        Updated data dictionary with structured skill entries
    """
    skills_data: Dict[str, AttributeEntry20th] = {}
    for skill in SKILLS_20TH:
        skills_data[skill] = {
            "value": getattr(instance, skill, 0),
            "spec": getattr(instance, f"{skill}_spec", []),
        }
    data["skills"] = skills_data

    return data
