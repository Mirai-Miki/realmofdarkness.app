from rest_framework import serializers
from haven.models import DemonTF
from constants import Splats
from .Character20th import (
    Character20thSerializer,
    Character20thDeserializer,
    Tracker20thSerializer,
)


############################ Tracker Serializer ###############################
class DtfTrackerSerializer(Tracker20thSerializer):
    class Meta(Tracker20thSerializer.Meta):
        model = DemonTF
        fields = Tracker20thSerializer.Meta.fields + (
            "faith_total",
            "faith_current",
            "torment_permanent",
            "torment_temporary",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.demon20th.version

        return data


########################### Character Serializer ##############################
class DemonTFSerializer(Character20thSerializer):
    class Meta(Character20thSerializer.Meta):
        model = DemonTF
        fields = Character20thSerializer.Meta.fields + (
            "faith_total",
            "faith_current",
            "torment_permanent",
            "torment_temporary",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.demon20th.version

        return data


############################ Character Deserializer ###########################
class DemonTFDeserializer(Character20thDeserializer):
    class Meta(Character20thDeserializer.Meta):
        model = DemonTF
        fields = "__all__"

    def create(self, validated_data):
        validated_data["splat"] = Splats.demon20th.slug
        return super().create(validated_data)

    def validate_morality_name(self, value):
        if value == "":
            raise serializers.ValidationError("Morality Name cannot be empty")
        return value

    def validate(self, data):
        data = super().validate(data)
        # Validate Faith and Torment
        if data.get("faith_current", 0) > data.get("faith_total", 0):
            raise serializers.ValidationError(
                "Current Faith cannot be greater than Total Faith"
            )

        return data
