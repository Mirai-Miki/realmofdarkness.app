from rest_framework import serializers
from haven.models import Human20th
from constants import Splats
from .Character20th import (
    Character20thSerializer,
    Character20thDeserializer,
    Tracker20thSerializer,
)


############################ Tracker Serializer ###############################
class Human20thTrackerSerializer(Tracker20thSerializer):
    class Meta(Tracker20thSerializer.Meta):
        model = Human20th
        fields = Tracker20thSerializer.Meta.fields + (
            "blood",
            "humanity",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.human20th.version

        return data


########################### Character Serializer ##############################
class Human20thSerializer(Character20thSerializer):
    class Meta(Character20thSerializer.Meta):
        model = Human20th
        fields = Character20thSerializer.Meta.fields + (
            "blood",
            "humanity",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.human20th.version

        return data


############################ Character Deserializer ###########################
class Human20thDeserializer(Character20thDeserializer):
    class Meta(Character20thDeserializer.Meta):
        model = Human20th
        fields = "__all__"

    def create(self, validated_data):
        validated_data["splat"] = Splats.human20th.slug
        return super().create(validated_data)

    def validate(self, data):
        data = super().validate(data)
        # Validate Blood
        if data.get("blood", 0) < 0 or data.get("blood", 0) > 10:
            raise serializers.ValidationError("Blood must be between 0 and 10")

        return data
