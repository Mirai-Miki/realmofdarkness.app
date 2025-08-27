from rest_framework import serializers
from haven.models import Ghoul20th
from constants import Splats
from .Character20th import (
    Character20thSerializer,
    Character20thDeserializer,
    Tracker20thSerializer,
)


############################ Tracker Serializer ###############################
class Ghoul20thTrackerSerializer(Tracker20thSerializer):
    class Meta(Tracker20thSerializer.Meta):
        model = Ghoul20th
        fields = Tracker20thSerializer.Meta.fields + (
            "blood",
            "vitae",
            "humanity",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.ghoul20th.version

        return data


########################### Character Serializer ##############################
class Ghoul20thSerializer(Character20thSerializer):
    class Meta(Character20thSerializer.Meta):
        model = Ghoul20th
        fields = Character20thSerializer.Meta.fields + (
            "blood",
            "vitae",
            "humanity",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.ghoul20th.version

        return data


############################ Character Deserializer ###########################
class Ghoul20thDeserializer(Character20thDeserializer):
    class Meta(Character20thDeserializer.Meta):
        model = Ghoul20th
        fields = "__all__"

    def create(self, validated_data):
        validated_data["splat"] = Splats.ghoul20th.slug
        return super().create(validated_data)

    def validate(self, data):
        data = super().validate(data)
        # Validate Blood and Vitae
        if data.get("vitae", 0) > data.get("blood", 0):
            raise serializers.ValidationError(
                "Current Vitae cannot be greater than Total Blood"
            )

        return data
