"""
Vampire5th serializers for World of Darkness 5th Edition Vampire characters.

This module provides type-safe, well-documented serializers for Vampire5th model
operations, extending the Character5th serializers with Vampire-specific fields
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
from haven.models import Vampire5th
from .validators import validate_humanity_5th


class Vampire5thTrackerSerializer(Tracker5thSerializer):
    """
    Lightweight tracker serializer for Vampire5th characters.

    Extends Tracker5thSerializer with Vampire-specific tracking fields:
        - humanity: HumanityTracker5th with current humanity and stains
        - hunger: Hunger value (0-5)
        - blood_potency: Blood Potency value (0-10)
        - clan: Vampire clan
        - disciplines: JSON field containing discipline data
    """

    class Meta(Tracker5thSerializer.Meta):
        model = Vampire5th
        fields = Tracker5thSerializer.Meta.fields + (
            "clan",
            "hunger",
            "disciplines",
            "blood_potency",
        )

    def to_representation(self, instance: Vampire5th) -> Dict[str, Any]:
        """
        Convert Vampire5th instance to tracker representation.

        Args:
            instance: Vampire5th model instance

        Returns:
            Dictionary containing tracker data with Vampire-specific fields
        """
        data = super().to_representation(instance)
        data = _expand_vampire_trackers(instance, data)
        return data


class Vampire5thSerializer(Character5thSerializer):
    """
    Full serializer for Vampire5th character data.

    Extends Character5thSerializer with Vampire-specific fields:
        - humanity: HumanityTracker5th with current humanity and stains
        - hunger: Hunger value (0-5)
        - blood_potency: Blood Potency value (0-10)
        - clan: Vampire clan
        - disciplines: JSON field containing discipline data
        - Various vampire-specific profile fields
    """

    class Meta(Character5thSerializer.Meta):
        model = Vampire5th
        fields = Character5thSerializer.Meta.fields + (
            "clan",
            "sire",
            "generation",
            "predator_type",
            "hunger",
            "resonance",
            "hunting_roll",
            "blood_potency",
            "disciplines",
            "date_of_death",
            "apparent_age",
        )

    def to_representation(self, instance: Vampire5th) -> Dict[str, Any]:
        """
        Convert Vampire5th instance to full representation.

        Args:
            instance: Vampire5th model instance

        Returns:
            Dictionary containing complete character data with Vampire-specific fields
        """
        data = super().to_representation(instance)
        data = _expand_vampire_trackers(instance, data)
        return data


class Vampire5thDeserializer(Character5thDeserializer):
    """
    Deserializer for creating and updating Vampire5th instances.

    Extends Character5thDeserializer with Vampire-specific validation for
    Humanity tracking, Hunger, Blood Potency, Clan, Disciplines, and profile fields.

    Validates:
        - Humanity value and stains (0-10)
        - Hunger value (0-5)
        - Blood Potency value (0-10)
        - Generation value (1-16)
        - Clan and Predator Type choices
        - Complex discipline and power structures
        - Profile field constraints
    """

    class Meta(Character5thDeserializer.Meta):
        model = Vampire5th

    def create(self, validated_data: Dict[str, Any]) -> Vampire5th:
        """
        Create a new Vampire5th instance, setting the splat field appropriately.

        Args:
            validated_data: Validated character data

        Returns:
            Created Vampire5th instance
        """
        from typing import cast

        validated_data["splat"] = Splats.VAMPIRE_5TH.value
        instance = super().create(validated_data)
        return cast(Vampire5th, instance)

    def validate_humanity(self, value: Any) -> HumanityTracker5th:
        """
        Validate humanity tracker structure for Vampire5th.

        Args:
            value: Humanity tracker data

        Returns:
            Validated HumanityTracker5th instance

        Raises:
            ValidationError: If structure is invalid
        """
        return validate_humanity_5th(value)

    def validate_clan(self, value: Any) -> str:
        """
        Validate clan choice for Vampire5th.

        Args:
            value: Clan choice

        Returns:
            Validated clan choice

        Raises:
            ValidationError: If clan is not a valid choice
        """
        from haven.models.Vampire5th import Clan

        if not isinstance(value, str):
            raise serializers.ValidationError("Clan must be a string")

        valid_clans = [choice.value for choice in Clan]
        if value not in valid_clans:
            raise serializers.ValidationError(
                f"Clan must be one of: {', '.join(valid_clans)}"
            )
        return value

    def validate_predator_type(self, value: Any) -> str:
        """
        Validate predator type choice for Vampire5th.

        Args:
            value: Predator type choice

        Returns:
            Validated predator type choice

        Raises:
            ValidationError: If predator type is not a valid choice
        """
        from haven.models.Vampire5th import PredatorType

        if not isinstance(value, str):
            raise serializers.ValidationError("Predator type must be a string")

        valid_types = [choice.value for choice in PredatorType]
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Predator type must be one of: {', '.join(valid_types)}"
            )
        return value

    def validate_generation(self, value: Any) -> int:
        """
        Validate generation value for Vampire5th.

        Args:
            value: Generation value

        Returns:
            Validated generation value

        Raises:
            ValidationError: If value is outside range 1-16
        """
        if value is None:
            return value
        if not isinstance(value, int):
            raise serializers.ValidationError("Generation must be an integer")
        if value < 1 or value > 16:
            raise serializers.ValidationError("Generation must be between 1 and 16")
        return value

    def validate_hunger(self, value: Any) -> int:
        """
        Validate hunger value for Vampire5th.

        Args:
            value: Hunger value

        Returns:
            Validated hunger value

        Raises:
            ValidationError: If value is outside range 0-5
        """
        if not isinstance(value, int):
            raise serializers.ValidationError("Hunger must be an integer")
        if value < 0 or value > 5:
            raise serializers.ValidationError("Hunger must be between 0 and 5")
        return value

    def validate_blood_potency(self, value: Any) -> int:
        """
        Validate blood potency value for Vampire5th.

        Args:
            value: Blood potency value

        Returns:
            Validated blood potency value

        Raises:
            ValidationError: If value is outside range 0-10
        """
        if not isinstance(value, int):
            raise serializers.ValidationError("Blood potency must be an integer")
        if value < 0 or value > 10:
            raise serializers.ValidationError("Blood potency must be between 0 and 10")
        return value

    def validate_sire(self, value: Any) -> str:
        """
        Validate sire field for Vampire5th.

        Args:
            value: Sire name

        Returns:
            Validated sire name

        Raises:
            ValidationError: If sire name is too long
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("Sire must be a string")
        if len(value) > 50:
            raise serializers.ValidationError("Sire name too long (max 50 characters)")
        return value

    def validate_resonance(self, value: Any) -> str:
        """
        Validate resonance field for Vampire5th.

        Args:
            value: Resonance description

        Returns:
            Validated resonance description

        Raises:
            ValidationError: If resonance description is too long
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("Resonance must be a string")
        if len(value) > 50:
            raise serializers.ValidationError("Resonance too long (max 50 characters)")
        return value

    def validate_hunting_roll(self, value: Any) -> str:
        """
        Validate hunting roll field for Vampire5th.

        Args:
            value: Hunting roll description

        Returns:
            Validated hunting roll description

        Raises:
            ValidationError: If hunting roll description is too long
        """
        if not isinstance(value, str):
            raise serializers.ValidationError("Hunting roll must be a string")
        if len(value) > 100:
            raise serializers.ValidationError(
                "Hunting roll too long (max 100 characters)"
            )
        return value

    def validate_date_of_death(self, value: Any) -> str:
        """
        Validate date of death field for Vampire5th.

        Args:
            value: Date of death

        Returns:
            Validated date of death

        Raises:
            ValidationError: If date of death is too long
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
        Validate apparent age field for Vampire5th.

        Args:
            value: Apparent age

        Returns:
            Validated apparent age

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

    def validate_disciplines(self, disciplines: Any) -> Dict[str, Any]:
        """
        Validate disciplines JSON structure for Vampire5th.

        This method validates the complex discipline and power structures that are
        stored as JSON in the database.

        Args:
            disciplines: Disciplines dictionary containing discipline data

        Returns:
            Validated disciplines dictionary

        Raises:
            ValidationError: If structure or content validation fails
        """
        if not isinstance(disciplines, dict):
            raise serializers.ValidationError("Disciplines should be a dictionary.")

        allowed_discipline_keys = [
            "name",
            "description",
            "characteristics",
            "custom",
            "powers",
            "source",
            "value",
        ]

        # remove custom key if it exists
        if "custom" in disciplines:
            del disciplines["custom"]

        for name, data in disciplines.items():
            if not isinstance(data, dict):
                raise serializers.ValidationError(
                    f"Data for discipline '{name}' should be a dictionary."
                )
            unexpected_keys = set(data.keys()) - set(allowed_discipline_keys)
            if unexpected_keys:
                raise serializers.ValidationError(
                    f"Unexpected keys found in discipline '{name}': {', '.join(unexpected_keys)}"
                )

            # Validate discipline name
            if "name" not in data:
                raise serializers.ValidationError(
                    f"Discipline '{name}' missing name field"
                )
            elif not isinstance(data["name"], str):
                raise serializers.ValidationError(
                    f"Discipline '{name}' name must be a string"
                )
            elif len(data["name"]) > 50:
                raise serializers.ValidationError(
                    f"Discipline '{name}' name too long (max 50 characters)"
                )

            # Validate description
            # We use a list to split paragraphs
            if not isinstance(data["description"], list):
                raise serializers.ValidationError(
                    f"Discipline '{name}' description must be a list"
                )
            for item in data["description"]:
                if not isinstance(item, str):
                    raise serializers.ValidationError(
                        f"Discipline '{name}' description items must be strings"
                    )
            if len(" ".join(data["description"])) > 4000:
                raise serializers.ValidationError(
                    f"Discipline '{name}' description too long (max 4000 characters)"
                )

            # Validate characteristics
            # We use a list to split paragraphs
            if not isinstance(data["characteristics"], list):
                raise serializers.ValidationError(
                    f"Discipline '{name}' characteristics must be a list"
                )
            for item in data["characteristics"]:
                if not isinstance(item, str):
                    raise serializers.ValidationError(
                        f"Discipline '{name}' characteristics items must be strings"
                    )
            if len(" ".join(data["characteristics"])) > 3000:
                raise serializers.ValidationError(
                    f"Discipline '{name}' characteristics too long (max 3000 characters)"
                )

            # Validate source
            if not isinstance(data["source"], str):
                raise serializers.ValidationError(
                    f"Discipline '{name}' source must be a string"
                )
            elif len(data["source"]) > 50:
                raise serializers.ValidationError(
                    f"Discipline '{name}' source too long (max 50 characters)"
                )

            # Validate value
            if "value" not in data:
                raise serializers.ValidationError(
                    f"Discipline '{name}' missing value field"
                )
            elif not isinstance(data["value"], int):
                raise serializers.ValidationError(
                    f"Discipline '{name}' value must be an integer"
                )
            elif data["value"] < 0 or data["value"] > 5:
                raise serializers.ValidationError(
                    f"Discipline '{name}' value must be between 0 and 5"
                )

            # Validate powers
            if "powers" not in data:
                raise serializers.ValidationError(
                    f"Discipline '{name}' missing powers field"
                )
            elif not isinstance(data["powers"], dict):
                raise serializers.ValidationError(
                    f"Discipline '{name}' powers must be a dictionary"
                )

            self._validate_powers(data["powers"], name)

        return disciplines

    def _validate_powers(self, powers: Dict[str, Any], discipline_name: str) -> None:
        """
        Validate powers structure within a discipline.

        Args:
            powers: Powers dictionary
            discipline_name: Name of the parent discipline for error messages

        Raises:
            ValidationError: If powers structure is invalid
        """
        allowed_powers_keys = ["1", "2", "3", "4", "5"]
        allowed_power_keys = [
            "name",
            "amalgam",
            "description",
            "cost",
            "dice_pool",
            "system",
            "duration",
        ]

        unexpected_keys = set(powers.keys()) - set(allowed_powers_keys)
        if unexpected_keys:
            raise serializers.ValidationError(
                f"Unexpected power levels in discipline '{discipline_name}': {', '.join(unexpected_keys)}"
            )

        for power_level, power_data in powers.items():
            if power_data is None:
                continue
            if not isinstance(power_data, dict):
                raise serializers.ValidationError(
                    f"Power level '{power_level}' in discipline '{discipline_name}' must be a dictionary"
                )
            unexpected_keys = set(power_data.keys()) - set(allowed_power_keys)
            if unexpected_keys:
                raise serializers.ValidationError(
                    f"Unexpected keys in power '{power_level}' of discipline '{discipline_name}': {', '.join(unexpected_keys)}"
                )

            # Validate each power field
            power_fields = [
                ("name", 50, "Power name"),
                ("amalgam", 50, "Power amalgam"),
                ("description", 1000, "Power description"),
                ("cost", 50, "Power cost"),
                ("dice_pool", 200, "Power dice pool"),
                ("system", 1000, "Power system"),
                ("duration", 50, "Power duration"),
            ]

            for field_name, max_length, display_name in power_fields:
                if field_name not in power_data:
                    raise serializers.ValidationError(
                        f"{display_name} missing in power '{power_level}' of discipline '{discipline_name}'"
                    )
                if not isinstance(power_data[field_name], str):
                    raise serializers.ValidationError(
                        f"{display_name} must be a string in power '{power_level}' of discipline '{discipline_name}'"
                    )
                if len(power_data[field_name]) > max_length:
                    raise serializers.ValidationError(
                        f"{display_name} too long (max {max_length} characters) in power '{power_level}' of discipline '{discipline_name}'"
                    )

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform cross-field validation for Vampire5th characters.

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
        Flatten the data dictionary to match the Vampire5th model fields.

        Args:
            data: Nested data dictionary

        Returns:
            Flattened dictionary with keys matching Vampire5th model fields
        """
        # Flatten humanity data
        humanity: HumanityTracker5th | None = data.pop("humanity", None)
        if humanity and humanity.get("current", None) is not None:
            data["humanity"] = humanity["current"]
        if humanity and humanity.get("stains", None) is not None:
            data["stains"] = humanity["stains"]

        return data


def _expand_vampire_trackers(
    instance: Vampire5th, data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Expand Vampire-specific tracker fields for serialization.

    Args:
        instance: Vampire5th model instance
        data: Existing serialized data dictionary

    Returns:
        Updated data dictionary with expanded Vampire tracker fields
    """
    # Humanity tracking (current/stains)
    humanity: HumanityTracker5th = {
        "current": getattr(instance, "humanity", 7),
        "stains": getattr(instance, "stains", 0),
    }
    data["humanity"] = humanity

    return data
