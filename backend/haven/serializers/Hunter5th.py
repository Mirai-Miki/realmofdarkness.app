from rest_framework import serializers
from haven.models import Hunter5th
from constants import Splats
from .Character5th import (
    Character5thSerializer,
    Character5thDeserializer,
    Tracker5thSerializer,
)


############################ Tracker Serializer ###############################
class Hunter5thTrackerSerializer(Tracker5thSerializer):
    class Meta(Tracker5thSerializer.Meta):
        model = Hunter5th
        fields = Tracker5thSerializer.Meta.fields + (
            "desperation",
            "danger",
            "despair",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.hunter5th.version

        return data


########################### Character Serializer ##############################
class Hunter5thSerializer(Character5thSerializer):
    class Meta(Character5thSerializer.Meta):
        model = Hunter5th
        fields = Character5thSerializer.Meta.fields + (
            "desperation",
            "danger",
            "despair",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.hunter5th.version

        return data


############################ Character Deserializer ###########################
class Hunter5thDeserializer(Character5thDeserializer):
    class Meta(Character5thDeserializer.Meta):
        model = Hunter5th
        fields = "__all__"

    def create(self, validated_data):
        validated_data["splat"] = Splats.hunter5th.slug
        return super().create(validated_data)

    def validate(self, data):
        data = super().validate(data)
        # Validate Desperation and Danger
        if data.get("desperation", 0) < 0 or data.get("desperation", 0) > 10:
            raise serializers.ValidationError("Desperation must be between 0 and 10")
        if data.get("danger", 0) < 0 or data.get("danger", 0) > 10:
            raise serializers.ValidationError("Danger must be between 0 and 10")

        return data
