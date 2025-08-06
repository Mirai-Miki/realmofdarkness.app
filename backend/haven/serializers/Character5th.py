"""
Character5th serializers for Vampire: The Masquerade 5th Edition characters.

This module provides type-safe, well-documented serializers for Character5th model
operations, extending the base Character serializers with 5th Edition specific
fields and validation logic.
"""

from re import A
from typing import Dict, Any
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
    HavenDetails5th,
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
        data = _expand_common(instance, data)
        data = _expand_advantages(instance, data)
        data = _expand_haven_details(instance, data)

        attributes_data: dict[str, int] = {}
        for attr_name in ATTRIBUTES_5TH:
            attributes_data[attr_name] = getattr(instance, attr_name, 0)
        data["attributes"] = attributes_data

        # Skills with values and specializations
        skills_data: dict[str, SkillEntry5th] = {}
        for skill in SKILLS_5TH:
            skills_data[skill] = {
                "value": getattr(instance, skill, 0),
                "spec": getattr(instance, f"{skill}_spec", []),
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
        data = _expand_common(instance, data)

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

    def validate_willpower(self, value: Any) -> DamageTracker5th:
        """
        Validate willpower damage tracker structure.

        Args:
            value: Willpower damage tracker data

        Returns:
            Validated DamageTracker5th instance

        Raises:
            ValidationError: If structure is invalid
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("Willpower must be a dictionary")

        if (
            "total" not in value
            or "superficial" not in value
            or "aggravated" not in value
        ):
            raise serializers.ValidationError(
                "Willpower must contain total, superficial, and aggravated fields"
            )

        total = value.get("total", 0)
        superficial = value.get("superficial", 0)
        aggravated = value.get("aggravated", 0)

        if (
            not isinstance(total, int)
            or not isinstance(superficial, int)
            or not isinstance(aggravated, int)
        ):
            raise serializers.ValidationError("Willpower fields must be integers")

        if total < 1 or total > 20:
            raise serializers.ValidationError(
                "Willpower total must be between 1 and 20"
            )
        if superficial < 0 or superficial > 20:
            raise serializers.ValidationError(
                "Willpower superficial damage must be between 0 and 20"
            )
        if aggravated < 0 or aggravated > 20:
            raise serializers.ValidationError(
                "Willpower aggravated damage must be between 0 and 20"
            )
        if (superficial + aggravated) > total:
            raise serializers.ValidationError(
                "Willpower damage cannot exceed total willpower"
            )

        return {
            "total": total,
            "superficial": superficial,
            "aggravated": aggravated,
        }

    def validate_health(self, value: Any) -> DamageTracker5th:
        """
        Validate health damage tracker structure.

        Args:
            value: Health damage tracker data

        Returns:
            Validated DamageTracker5th instance

        Raises:
            ValidationError: If structure is invalid
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("Health must be a dictionary")

        if (
            "total" not in value
            or "superficial" not in value
            or "aggravated" not in value
        ):
            raise serializers.ValidationError(
                "Health must contain total, superficial, and aggravated fields"
            )

        total = value.get("total", 0)
        superficial = value.get("superficial", 0)
        aggravated = value.get("aggravated", 0)

        if (
            not isinstance(total, int)
            or not isinstance(superficial, int)
            or not isinstance(aggravated, int)
        ):
            raise serializers.ValidationError("Health fields must be integers")

        if total < 1 or total > 20:
            raise serializers.ValidationError("Health total must be between 1 and 20")
        if superficial < 0 or superficial > 20:
            raise serializers.ValidationError(
                "Health superficial damage must be between 0 and 20"
            )
        if aggravated < 0 or aggravated > 20:
            raise serializers.ValidationError(
                "Health aggravated damage must be between 0 and 20"
            )
        if (superficial + aggravated) > total:
            raise serializers.ValidationError(
                "Health damage cannot exceed total health"
            )

        return {
            "total": total,
            "superficial": superficial,
            "aggravated": aggravated,
        }

    def validate_advantages(self, data: Any) -> Dict[str, AdvantageList]:
        """
        Validate advantage dictionary for merits, flaws, backgrounds, haven, loresheets.

        Args:
            data: Dictionary mapping allowed advantage names to lists of advantage entries.

        Returns:
            Dictionary of validated advantage lists, only including provided keys.

        Raises:
            ValidationError: If structure or keys are invalid.
        """
        if not isinstance(data, dict):
            raise serializers.ValidationError(
                "Advantage data must be a dictionary of advantage lists."
            )

        allowed_advantages = {
            "merits",
            "flaws",
            "backgrounds",
            "haven",
            "loresheets",
        }
        allowed_keys = {"name", "description", "notes", "rating", "flaw", "modifier"}

        # Disallow any top-level keys not in allowed_advantages
        unexpected_top_keys = set(data.keys()) - allowed_advantages
        if unexpected_top_keys:
            raise serializers.ValidationError(
                f"Unexpected advantage categories: {', '.join(unexpected_top_keys)}"
            )

        validated: Dict[str, AdvantageList] = {}
        for adv_type, adv_list in data.items():
            if adv_type not in allowed_advantages:
                continue  # Should not happen due to check above
            if not isinstance(adv_list, list):
                raise serializers.ValidationError(
                    f"Advantage list for '{adv_type}' must be a list."
                )

            validated_advantages: AdvantageList = []
            for item in adv_list:
                if not isinstance(item, dict):
                    raise serializers.ValidationError(
                        f"Each advantage in '{adv_type}' must be a dictionary."
                    )

                # Disallow any keys not in allowed_keys
                unexpected_keys = set(item.keys()) - allowed_keys
                if unexpected_keys:
                    raise serializers.ValidationError(
                        f"Unexpected keys in advantage entry for '{adv_type}': {', '.join(unexpected_keys)}"
                    )

                # Validate individual fields using get with default None
                name = item.get("name", None)
                description = item.get("description", None)
                notes = item.get("notes", None)
                rating = item.get("rating", None)
                flaw = item.get("flaw", None)
                modifier = item.get("modifier", None)

                if not isinstance(name, str):
                    raise serializers.ValidationError("Advantage name must be a string")
                if len(name) > 100:
                    raise serializers.ValidationError(
                        "Advantage name too long (max 100 characters)"
                    )

                if not isinstance(description, str):
                    raise serializers.ValidationError(
                        "Advantage description must be a string"
                    )
                if len(description) > 2000:
                    raise serializers.ValidationError(
                        "Advantage description too long (max 2000 characters)"
                    )

                if not isinstance(notes, str):
                    raise serializers.ValidationError(
                        "Advantage notes must be a string"
                    )
                if len(notes) > 2000:
                    raise serializers.ValidationError(
                        "Advantage notes too long (max 2000 characters)"
                    )

                if not isinstance(rating, int):
                    raise serializers.ValidationError(
                        "Advantage rating must be an integer"
                    )

                if not isinstance(flaw, bool):
                    raise serializers.ValidationError(
                        "Advantage flaw must be a boolean"
                    )

                if not isinstance(modifier, int):
                    raise serializers.ValidationError(
                        "Advantage modifier must be an integer"
                    )

                advantage: AdvantageEntry = {
                    "name": name,
                    "description": description,
                    "notes": notes,
                    "rating": rating,
                    "flaw": flaw,
                    "modifier": modifier,
                }
                validated_advantages.append(advantage)

            # Sort the advantage list alphabetically by name if included
            validated[adv_type] = sorted(
                validated_advantages, key=lambda x: x["name"].lower()
            )

        return validated

    def validate_haven_details(self, data: Any) -> HavenDetails5th:
        """
        Validate haven details structure. Only update provided allowed fields, disallow unexpected keys, and validate type/length constraints.

        Args:
            data: Haven details dictionary

        Returns:
            Validated HavenDetails5th instance (with only provided fields)

        Raises:
            ValidationError: If structure or field constraints are invalid
        """
        if not isinstance(data, dict):
            raise serializers.ValidationError("Haven details must be a dictionary")

        allowed_fields = {"name", "description", "location"}
        unexpected_keys = set(data.keys()) - allowed_fields
        if unexpected_keys:
            raise serializers.ValidationError(
                f"Unexpected keys in haven details: {', '.join(unexpected_keys)}"
            )

        validated = {}
        # Validate each field if present
        name = data.get("name", None)
        if name is not None:
            if not isinstance(name, str):
                raise serializers.ValidationError("Haven name must be a string")
            if len(name) > 50:
                raise serializers.ValidationError(
                    "Haven name too long (max 50 characters)"
                )
            validated["name"] = name

        description = data.get("description", None)
        if description is not None:
            if not isinstance(description, str):
                raise serializers.ValidationError("Haven description must be a string")
            if len(description) > 1000:
                raise serializers.ValidationError(
                    "Haven description too long (max 1000 characters)"
                )
            validated["description"] = description

        location = data.get("location", None)
        if location is not None:
            if not isinstance(location, str):
                raise serializers.ValidationError("Haven location must be a string")
            if len(location) > 500:
                raise serializers.ValidationError(
                    "Haven location too long (max 500 characters)"
                )
            validated["location"] = location

        return HavenDetails5th(**validated)

    def validate_attributes(self, data: Any) -> Dict[str, int]:
        """
        Validate attributes structure and values.

        Args:
            data: Dictionary of attributes with integer values
        Returns:
            Dictionary of validated attributes
        Raises:
            ValidationError: If structure is invalid or values are out of range
        """
        if not isinstance(data, dict):
            raise serializers.ValidationError("Attributes must be a dictionary")

        # throw error if unexpected keys are present
        unexpected_keys = set(data.keys()) - set(ATTRIBUTES_5TH)
        if unexpected_keys:
            raise serializers.ValidationError(
                f"Unexpected keys in attributes: {', '.join(unexpected_keys)}"
            )

        validated: Dict[str, int] = {}
        for attr, value in data.items():
            if not isinstance(value, int):
                raise serializers.ValidationError(
                    f"Attribute '{attr}' must be an integer"
                )
            if value < 0 or value > 5:
                raise serializers.ValidationError(
                    f"Attribute '{attr}' must be between 0 and 5"
                )
            validated[attr] = value

        return validated

    def validate_skills(self, data: Any) -> Dict[str, SkillEntry5th]:
        """
        Validate skills structure and values.

        Args:
            data: Dictionary of skills with SkillEntry5th values
        Returns:
            Dictionary of validated skills
        Raises:
            ValidationError: If structure is invalid or values are out of range
        """
        if not isinstance(data, dict):
            raise serializers.ValidationError("Skills must be a dictionary")

        # throw error if unexpected keys are present
        unexpected_keys = set(data.keys()) - set(SKILLS_5TH)
        if unexpected_keys:
            raise serializers.ValidationError(
                f"Unexpected keys in skills: {', '.join(unexpected_keys)}"
            )

        validated: Dict[str, SkillEntry5th] = {}
        for skill, entry in data.items():
            if not isinstance(entry, dict):
                raise serializers.ValidationError(
                    f"Skill '{skill}' must be a dictionary"
                )
            value = entry.get("value", 0)
            spec = entry.get("spec", [])
            if not isinstance(value, int):
                raise serializers.ValidationError(
                    f"Skill '{skill}' value must be an integer"
                )
            if value < 0 or value > 5:
                raise serializers.ValidationError(
                    f"Skill '{skill}' must be between 0 and 5"
                )
            if not isinstance(spec, list):
                raise serializers.ValidationError(
                    f"Skill '{skill}' specialization must be a list"
                )

            if len(spec) > 10:
                raise serializers.ValidationError(
                    f"Skill '{skill}' can have a maximum of 10 specializations"
                )

            for s in spec:
                if not isinstance(s, str):
                    raise serializers.ValidationError(
                        f"Skill '{skill}' specialization must be a string"
                    )
                if len(s) == 0:
                    raise serializers.ValidationError(
                        f"Skill '{skill}' specialization cannot be empty"
                    )
                if len(s) > 50:
                    raise serializers.ValidationError(
                        f"Skill '{skill}' specialization too long (max 50 characters)"
                    )
            validated[skill] = {"value": value, "spec": spec}

        return validated

    def validate_ambition(self, value: Any) -> str:
        """
        Validate ambition field.

        Args:
            value: Ambition string

        Returns:
            Validated ambition string

        Raises:
            ValidationError: If ambition is not a string or too long
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("Ambition must be a string")
        if len(value) > 100:
            raise serializers.ValidationError("Ambition too long (max 100 characters)")
        return value

    def validate_desire(self, value: Any) -> str:
        """
        Validate desire field.

        Args:
            value: Desire string

        Returns:
            Validated desire string

        Raises:
            ValidationError: If desire is not a string or too long
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("Desire must be a string")
        if len(value) > 100:
            raise serializers.ValidationError("Desire too long (max 100 characters)")
        return value

    def validate_tenets(self, value: Any) -> str:
        """
        Validate tenets field.

        Args:
            value: Tenets string

        Returns:
            Validated tenets string

        Raises:
            ValidationError: If tenets is not a string or too long
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("Tenets must be a string")
        if len(value) > 1000:
            raise serializers.ValidationError("Tenets too long (max 1000 characters)")
        return value

    def validate_touchstones(self, value: Any) -> str:
        """
        Validate touchstones field.

        Args:
            value: Touchstones string

        Returns:
            Validated touchstones string

        Raises:
            ValidationError: If touchstones is not a string or too long
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("Touchstones must be a string")
        if len(value) > 2000:
            raise serializers.ValidationError(
                "Touchstones too long (max 2000 characters)"
            )
        return value

    def validate_convictions(self, value: Any) -> str:
        """
        Validate convictions field.

        Args:
            value: Convictions string

        Returns:
            Validated convictions string

        Raises:
            ValidationError: If convictions is not a string or too long
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("Convictions must be a string")
        if len(value) > 2000:
            raise serializers.ValidationError(
                "Convictions too long (max 2000 characters)"
            )
        return value

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
        data = self._flatten_data(data)

        return data

    def _flatten_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Flatten the data dictionary to match the Character5th model fields.

        Args:
            data: Nested data dictionary

        Returns:
            Flattened dictionary with keys matching Character5th model fields
        """

        willpower: DamageTracker5th | None = data.pop("willpower", None)
        if willpower and willpower.get("total", None):
            data["willpower_total"] = willpower["total"]
        if willpower and willpower.get("superficial", None):
            data["willpower_superficial"] = willpower["superficial"]
        if willpower and willpower.get("aggravated", None):
            data["willpower_aggravated"] = willpower["aggravated"]

        health: DamageTracker5th | None = data.pop("health", None)
        if health and health.get("total", None):
            data["health_total"] = health["total"]
        if health and health.get("superficial", None):
            data["health_superficial"] = health["superficial"]
        if health and health.get("aggravated", None):
            data["health_aggravated"] = health["aggravated"]

        attributes: Dict[str, int] = data.pop("attributes", {})
        for attr, value in attributes.items():
            data[attr] = value

        skills: Dict[str, SkillEntry5th] = data.pop("skills", {})
        for skill, entry in skills.items():
            data[skill] = entry["value"]
            if entry["spec"] is not None:
                data[f"{skill}_spec"] = entry["spec"]

        advantages: Dict[str, AdvantageList] = data.pop("advantages", {})
        for adv_type, adv_list in advantages.items():
            if adv_list is not None:
                data[adv_type] = adv_list

        haven_details: HavenDetails5th = data.pop("haven_details", {})
        if haven_details and haven_details.get("name", None):
            data["haven_name"] = haven_details["name"]
        if haven_details and haven_details.get("description", None):
            data["haven_description"] = haven_details["description"]
        if haven_details and haven_details.get("location", None):
            data["haven_location"] = haven_details["location"]

        return data


def _expand_common(instance: Character5th, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Expand willpower and health fields into separate damage trackers.
    Args:
        instance: Character5th model instance
        data: Existing serialized data dictionary
    Returns:
        Updated data dictionary with expanded damage trackers
    """
    willpower: DamageTracker5th = {
        "total": instance.willpower_total,
        "superficial": instance.willpower_superficial,
        "aggravated": instance.willpower_aggravated,
    }

    health: DamageTracker5th = {
        "total": instance.health_total,
        "superficial": instance.health_superficial,
        "aggravated": instance.health_aggravated,
    }

    # Add expanded damage trackers to data
    data["willpower"] = willpower
    data["health"] = health

    return data


def _expand_advantages(instance: Character5th, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Expand advantages into structured lists.

    Args:
        instance: Character5th model instance
        data: Existing serialized data dictionary

    Returns:
        Updated data dictionary with structured advantage lists
    """
    advantages: Dict[str, AdvantageList] = {
        "merits": instance.merits,
        "flaws": instance.flaws,
        "haven": instance.haven,
        "backgrounds": instance.backgrounds,
        "loresheets": instance.loresheets,
        "haven": instance.haven,
    }
    data["advantages"] = advantages

    return data


def _expand_haven_details(
    instance: Character5th, data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Expand haven details into structured object.

    Args:
        instance: Character5th model instance
        data: Existing serialized data dictionary

    Returns:
        Updated data dictionary with structured haven details
    """
    haven_details = {
        "name": instance.haven_name,
        "description": instance.haven_description,
        "location": instance.haven_location,
    }
    data["haven_details"] = haven_details

    return data
