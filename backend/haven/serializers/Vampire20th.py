"""
Vampire20th serializers for World of Darkness 20th Anniversary Edition Vampire characters.

This module provides type-safe, well-documented serializers for Vampire20th model
operations, extending the Character20th serializers with Vampire-specific fields
and validation logic.
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
    MoralityTracker20th,
    ClanInfo,
)
from haven.types import Splats
from haven.models import Vampire20th


class Vampire20thTrackerSerializer(Tracker20thSerializer):
    """
    Lightweight tracker serializer for Vampire20th characters.

    Extends Tracker20thSerializer with Vampire-specific tracking fields:
        - morality: MoralityTracker20th with name/description/value
        - blood: ConsumableTracker with current/total Blood Pool
        - clan: ClanInfo with name/description
    """

    class Meta(Tracker20thSerializer.Meta):
        model = Vampire20th
        fields = Tracker20thSerializer.Meta.fields + ("clan",)

    def to_representation(self, instance: Vampire20th) -> Dict[str, Any]:
        """
        Convert Vampire20th instance to tracker representation.

        Args:
            instance: Vampire20th model instance

        Returns:
            Dictionary containing tracker data with Vampire-specific fields
        """
        data = super().to_representation(instance)
        data = _expand_vampire_trackers(instance, data)
        return data


class Vampire20thSerializer(Character20thSerializer):
    """
    Full serializer for Vampire20th character data.

    Extends Character20thSerializer with Vampire-specific fields:
        - morality: MoralityTracker20th with name/description/value
        - blood: ConsumableTracker with current/total Blood Pool
        - clan: ClanInfo with name/description
        - Additional vampire profile fields (sire, date_of_death, apparent_age)
    """

    class Meta(Character20thSerializer.Meta):
        model = Vampire20th
        fields = Character20thSerializer.Meta.fields + (
            "sire",
            "date_of_death",
            "apparent_age",
        )

    def to_representation(self, instance: Vampire20th) -> Dict[str, Any]:
        """
        Convert Vampire20th instance to full representation.

        Args:
            instance: Vampire20th model instance

        Returns:
            Dictionary containing complete character data with Vampire-specific fields
        """
        data = super().to_representation(instance)
        data = _expand_vampire_trackers(instance, data)
        return data


class Vampire20thDeserializer(Character20thDeserializer):
    """
    Deserializer for creating and updating Vampire20th instances.

    Extends Character20thDeserializer with Vampire-specific validation for
    Blood Pool and Morality tracking.

    Validates:
        - Blood current/total tracking
        - Morality name/description/value
        - Clan information
    """

    class Meta(Character20thDeserializer.Meta):
        model = Vampire20th

    def create(self, validated_data: Dict[str, Any]) -> Vampire20th:
        """
        Create a new Vampire20th instance, setting the splat field appropriately.

        Args:
            validated_data: Validated character data

        Returns:
            Created Vampire20th instance
        """
        from typing import cast

        validated_data["splat"] = Splats.VAMPIRE_20TH.value
        instance = super().create(validated_data)
        return cast(Vampire20th, instance)

    def validate_morality(self, value: Any) -> MoralityTracker20th:
        """
        Validate morality tracker structure for Vampire20th.

        Args:
            value: Morality tracker data

        Returns:
            Validated MoralityTracker20th instance

        Raises:
            ValidationError: If structure is invalid
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("Morality must be a dictionary")

        required_fields = ["name", "description", "value"]
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(
                    f"Morality must contain {field} field"
                )

        name = value.get("name", "")
        description = value.get("description", "")
        morality_value = value.get("value", 0)

        if not isinstance(name, str):
            raise serializers.ValidationError("Morality name must be a string")
        if not isinstance(description, str):
            raise serializers.ValidationError("Morality description must be a string")
        if not isinstance(morality_value, int):
            raise serializers.ValidationError("Morality value must be an integer")

        if len(name) == 0:
            raise serializers.ValidationError("Morality name cannot be empty")
        if len(name) > 100:
            raise serializers.ValidationError(
                "Morality name too long (max 100 characters)"
            )
        if len(description) > 1000:
            raise serializers.ValidationError(
                "Morality description too long (max 1000 characters)"
            )
        if morality_value < 0 or morality_value > 10:
            raise serializers.ValidationError("Morality value must be between 0 and 10")

        return {
            "name": name,
            "description": description,
            "value": morality_value,
        }

    def validate_blood(self, value: Any) -> ConsumableTracker:
        """
        Validate blood tracker structure for Vampire20th.

        Args:
            value: Blood tracker data

        Returns:
            Validated ConsumableTracker instance

        Raises:
            ValidationError: If structure is invalid
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("Blood must be a dictionary")

        if "total" not in value or "current" not in value:
            raise serializers.ValidationError(
                "Blood must contain total and current fields"
            )

        total = value.get("total", 0)
        current = value.get("current", 0)

        if not isinstance(total, int) or not isinstance(current, int):
            raise serializers.ValidationError("Blood fields must be integers")

        if total < 0 or total > 100:
            raise serializers.ValidationError("Blood total must be between 0 and 100")
        if current < 0 or current > 100:
            raise serializers.ValidationError("Blood current must be between 0 and 100")
        if current > total:
            raise serializers.ValidationError("Current Blood cannot exceed total Blood")

        return {
            "total": total,
            "current": current,
        }

    def validate_clan(self, value: Any) -> Dict[str, str]:
        """
        Validate clan information structure for Vampire20th.

        Args:
            value: Clan information data

        Returns:
            Validated ClanInfo instance

        Raises:
            ValidationError: If structure is invalid
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("Clan must be a dictionary")

        if "name" not in value:
            raise serializers.ValidationError("Clan must contain name field")

        allowed_keys = ["name", "description"]
        validated_value: Dict[str, str] = {}

        unexpected_keys = set(value.keys()) - set(allowed_keys)
        if unexpected_keys:
            raise serializers.ValidationError(
                f"Unexpected keys in clan data: {', '.join(unexpected_keys)}"
            )

        for key, value in value.items():
            if not isinstance(value, str):
                raise serializers.ValidationError(f"Clan {key} must be a string")

            if key == "name" and len(value) > 50:
                raise serializers.ValidationError(
                    "Clan name too long (max 50 characters)"
                )

            if key == "description" and len(value) > 2000:
                raise serializers.ValidationError(
                    "Clan description too long (max 2000 characters)"
                )

            validated_value[key] = value

        return validated_value

    def validate_sire(self, value: Any) -> str:
        """
        Validate sire field.

        Args:
            value: Sire string

        Returns:
            Validated sire string

        Raises:
            ValidationError: If sire is too long
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("Sire must be a string")
        if len(value) > 50:
            raise serializers.ValidationError("Sire name too long (max 50 characters)")
        return value

    def validate_date_of_death(self, value: Any) -> str:
        """
        Validate date of death field.

        Args:
            value: Date of death string

        Returns:
            Validated date of death string

        Raises:
            ValidationError: If date is too long
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("Date of death must be a string")
        if len(value) > 20:
            raise serializers.ValidationError(
                "Date of death too long (max 20 characters)"
            )
        return value

    def validate_apparent_age(self, value: Any) -> str:
        """
        Validate apparent age field.

        Args:
            value: Apparent age string

        Returns:
            Validated apparent age string

        Raises:
            ValidationError: If apparent age is too long
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("Apparent age must be a string")
        if len(value) > 20:
            raise serializers.ValidationError(
                "Apparent age too long (max 20 characters)"
            )
        return value

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform cross-field validation for Vampire20th characters.

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
        Flatten the data dictionary to match the Vampire20th model fields.

        Args:
            data: Nested data dictionary

        Returns:
            Flattened dictionary with keys matching Vampire20th model fields
        """
        # Flatten morality data
        morality: MoralityTracker20th | None = data.pop("morality", None)
        if morality and morality.get("name", None) is not None:
            data["morality_name"] = morality["name"]
        if morality and morality.get("description", None) is not None:
            data["morality_description"] = morality["description"]
        if morality and morality.get("value", None) is not None:
            data["morality_value"] = morality["value"]

        # Flatten blood data
        blood: ConsumableTracker | None = data.pop("blood", None)
        if blood and blood.get("total", None) is not None:
            data["blood_total"] = blood["total"]
        if blood and blood.get("current", None) is not None:
            data["blood_current"] = blood["current"]

        # Flatten clan data
        clan: ClanInfo | None = data.pop("clan", None)
        if clan and clan.get("name", None) is not None:
            data["clan"] = clan["name"]
        if clan and clan.get("description", None) is not None:
            data["clan_description"] = clan["description"]

        return data


def _expand_vampire_trackers(
    instance: Vampire20th, data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Expand Vampire-specific tracker fields for serialization.

    Args:
        instance: Vampire20th model instance
        data: Existing serialized data dictionary

    Returns:
        Updated data dictionary with expanded Vampire tracker fields
    """
    # Morality tracking (name/description/value)
    morality: MoralityTracker20th = {
        "name": instance.morality_name,
        "description": instance.morality_description,
        "value": instance.morality_value,
    }
    data["morality"] = morality

    # Blood tracking (current/total)
    blood: ConsumableTracker = {
        "current": instance.blood_current,
        "total": instance.blood_total,
    }
    data["blood"] = blood

    # Clan information (name/description)
    clan: ClanInfo = {
        "name": instance.clan,
        "description": instance.clan_description,
    }
    data["clan"] = clan

    return data
