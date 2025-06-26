from rest_framework import serializers
from haven.models import Vampire5th
from constants import Splats
from .Character5th import (
    Character5thSerializer,
    Character5thDeserializer,
    Tracker5thSerializer,
)


############################ Tracker Serializer ###############################
class V5TrackerSerializer(Tracker5thSerializer):
    class Meta(Tracker5thSerializer.Meta):
        model = Vampire5th
        fields = Tracker5thSerializer.Meta.fields + (
            "clan",
            "humanity",
            "stains",
            "hunger",
            "disciplines",
            "blood_potency",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.vampire5th.version

        return data


########################### Character Serializer ##############################
class Vampire5thSerializer(Character5thSerializer):
    # Define SerializerMethodField for skills

    class Meta(Character5thSerializer.Meta):
        model = Vampire5th
        fields = Character5thSerializer.Meta.fields + (
            "clan",
            "sire",
            "generation",
            "predator_type",
            "humanity",
            "stains",
            "hunger",
            "resonance",
            "hunting_roll",
            "blood_potency",
            "disciplines",
            "date_of_death",
            "apparent_age",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.vampire5th.version

        return data


############################ Character Deserializer ###########################
class Vampire5thDeserializer(Character5thDeserializer):
    class Meta(Character5thDeserializer.Meta):
        model = Vampire5th
        fields = "__all__"

    def create(self, validated_data):
        validated_data["splat"] = Splats.vampire5th.slug
        return super().create(validated_data)

    def validate_disciplines(self, disciplines):
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

        for name, data in disciplines.items():
            if not isinstance(data, dict):
                raise serializers.ValidationError(
                    f"Data for '{name}' should be a dictionary."
                )
            unexpected_keys = set(data.keys()) - set(allowed_discipline_keys)
            if unexpected_keys:
                raise serializers.ValidationError(
                    f"Unexpected keys found in Discipline '{name}': {', '.join(unexpected_keys)}"
                )

            # Validate Name
            if "name" not in data:
                raise serializers.ValidationError("No name input")
            elif not isinstance(data["name"], str):
                raise serializers.ValidationError("Name not a String")
            elif len(data["name"]) > 50:
                raise serializers.ValidationError("Name too long")

            # Validate Description
            if not isinstance(data["description"], list):
                raise serializers.ValidationError("description not a List")
            for item in data["description"]:
                if not isinstance(item, str):
                    raise serializers.ValidationError("item not a String")
            if len(" ".join(data["description"])) > 4000:
                raise serializers.ValidationError("Description is too long!")

            # Validate Description
            if not isinstance(data["characteristics"], list):
                raise serializers.ValidationError("Characteristics not a List")
            for item in data["characteristics"]:
                if not isinstance(item, str):
                    raise serializers.ValidationError("item not a String")
            if len(" ".join(data["characteristics"])) > 3000:
                raise serializers.ValidationError("Characteristics is too long!")

            # Validate custom
            if "custom" not in data:
                raise serializers.ValidationError("No custom input")
            elif not isinstance(data["custom"], int):
                raise serializers.ValidationError("Custom not an Int")
            elif data["custom"] != 0:
                raise serializers.ValidationError("Invalid value for Custom")

            # Validate source
            if not isinstance(data["source"], str):
                raise serializers.ValidationError("Source not a String")
            elif len(data["source"]) > 50:
                raise serializers.ValidationError("Source too long")

            # Validate value
            if "value" not in data:
                raise serializers.ValidationError("No Value input")
            elif not isinstance(data["value"], int):
                raise serializers.ValidationError("Custom not an Int")
            elif data["value"] < 0 or data["value"] > 5:
                raise serializers.ValidationError("Invalid value for Value")

            # Validate powers
            if "powers" not in data:
                raise serializers.ValidationError("No Powers input")
            elif not isinstance(data["powers"], dict):
                raise serializers.ValidationError("Powers not a dict")

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
            unexpected_keys = set(data["powers"].keys()) - set(allowed_powers_keys)
            if unexpected_keys:
                raise serializers.ValidationError(
                    f"Unexpected keys found in {name} Powers dict: {', '.join(unexpected_keys)}"
                )

            ################### Validate Each power ##########################
            for power_name, power_data in data["powers"].items():
                if power_data is None:
                    continue
                if not isinstance(power_data, dict):
                    raise serializers.ValidationError(
                        f"Data for Power '{power_name}' should be a dictionary."
                    )
                unexpected_keys = set(power_data) - set(allowed_power_keys)
                if unexpected_keys:
                    raise serializers.ValidationError(
                        f"Unexpected keys found in {name} Powers {power_name} dict: {', '.join(unexpected_keys)}"
                    )

                if "name" not in power_data:
                    raise serializers.ValidationError("No Power name input")
                elif not isinstance(power_data["name"], str):
                    raise serializers.ValidationError("Power Name not a String")
                elif len(power_data["name"]) > 50:
                    raise serializers.ValidationError("Power Name too long")

                if "amalgam" not in power_data:
                    raise serializers.ValidationError("No Power amalgam input")
                elif not isinstance(power_data["amalgam"], str):
                    raise serializers.ValidationError("Power amalgam not a String")
                elif len(power_data["amalgam"]) > 50:
                    raise serializers.ValidationError("Power amalgam too long")

                if "description" not in power_data:
                    raise serializers.ValidationError("No Power description input")
                elif not isinstance(power_data["description"], str):
                    raise serializers.ValidationError("Power description not a String")
                elif len(power_data["description"]) > 1000:
                    raise serializers.ValidationError("Power description too long")

                if "cost" not in power_data:
                    raise serializers.ValidationError("No Power cost input")
                elif not isinstance(power_data["cost"], str):
                    raise serializers.ValidationError("Power cost not a String")
                elif len(power_data["cost"]) > 50:
                    raise serializers.ValidationError("Power cost too long")

                if "dice_pool" not in power_data:
                    raise serializers.ValidationError("No Power dice_pool input")
                elif not isinstance(power_data["dice_pool"], str):
                    raise serializers.ValidationError("Power dice_pool not a String")
                elif len(power_data["dice_pool"]) > 200:
                    raise serializers.ValidationError("Power dice_pool too long")

                if "system" not in power_data:
                    raise serializers.ValidationError("No Power system input")
                elif not isinstance(power_data["system"], str):
                    raise serializers.ValidationError("Power system not a String")
                elif len(power_data["system"]) > 1000:
                    raise serializers.ValidationError("Power system too long")

                if "duration" not in power_data:
                    raise serializers.ValidationError("No Power duration input")
                elif not isinstance(power_data["duration"], str):
                    raise serializers.ValidationError("Power duration not a String")
                elif len(power_data["duration"]) > 50:
                    raise serializers.ValidationError("Power duration too long")

        return disciplines

    def validate(self, data):
        data = super().validate(data)
        # Validate Humanity
        if self.instance:
            humanity = data.get("humanity", None)
            stains = data.get("stains", None)

            if humanity == None:
                humanity = self.instance.humanity
            if stains == None:
                stains = self.instance.stains
            if (10 - humanity) < stains:
                raise serializers.ValidationError("Too many stains")

        return data
