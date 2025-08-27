from rest_framework import serializers
from haven.models import Vampire20th
from constants import Splats
from .Character20th import (
    Character20thSerializer,
    Character20thDeserializer,
    Tracker20thSerializer,
)


############################ Tracker Serializer ###############################
class V20TrackerSerializer(Tracker20thSerializer):
    class Meta(Tracker20thSerializer.Meta):
        model = Vampire20th
        fields = Tracker20thSerializer.Meta.fields + (
            "clan",
            "morality_name",
            "morality_value",
            "blood_total",
            "blood_current",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.vampire20th.version

        return data


########################### Character Serializer ##############################
class Vampire20thSerializer(Character20thSerializer):
    class Meta(Character20thSerializer.Meta):
        model = Vampire20th
        fields = Character20thSerializer.Meta.fields + (
            "clan",
            "clan_description",
            "sire",
            "morality_name",
            "morality_description",
            "morality_value",
            "blood_total",
            "blood_current",
            "date_of_death",
            "apparent_age",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.vampire20th.version

        return data


############################ Character Deserializer ###########################
class Vampire20thDeserializer(Character20thDeserializer):
    class Meta(Character20thDeserializer.Meta):
        model = Vampire20th
        fields = "__all__"

    def create(self, validated_data):
        validated_data["splat"] = Splats.vampire20th.slug
        return super().create(validated_data)

    def validate_morality_name(self, value):
        if value == "":
            raise serializers.ValidationError("Morality Name cannot be empty")
        return value

    def validate(self, data):
        data = super().validate(data)
        # Validate Blood Pool
        if data.get("blood_current", 0) > data.get("blood_total", 0):
            raise serializers.ValidationError(
                "Current Blood Pool cannot be greater than Total Blood Pool"
            )

        return data
