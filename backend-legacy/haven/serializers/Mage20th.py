from rest_framework import serializers
from haven.models import Mage20th
from constants import Splats
from .Character20th import (
    Character20thSerializer,
    Character20thDeserializer,
    Tracker20thSerializer,
)


############################ Tracker Serializer ###############################
class Mage20thTrackerSerializer(Tracker20thSerializer):
    class Meta(Tracker20thSerializer.Meta):
        model = Mage20th
        fields = Tracker20thSerializer.Meta.fields + (
            "arete",
            "paradox",
            "quintessence",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.mage20th.version

        return data


########################### Character Serializer ##############################
class Mage20thSerializer(Character20thSerializer):
    class Meta(Character20thSerializer.Meta):
        model = Mage20th
        fields = Character20thSerializer.Meta.fields + (
            "arete",
            "paradox",
            "quintessence",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.mage20th.version

        return data


############################ Character Deserializer ###########################
class Mage20thDeserializer(Character20thDeserializer):
    class Meta(Character20thDeserializer.Meta):
        model = Mage20th
        fields = "__all__"

    def create(self, validated_data):
        validated_data["splat"] = Splats.mage20th.slug
        return super().create(validated_data)

    def validate(self, data):
        data = super().validate(data)
        # Validate Arete, Paradox, and Quintessence
        if data.get("arete", 0) < 0 or data.get("arete", 0) > 10:
            raise serializers.ValidationError("Arete must be between 0 and 10")
        if data.get("paradox", 0) < 0 or data.get("paradox", 0) > 20:
            raise serializers.ValidationError("Paradox must be between 0 and 20")
        if data.get("quintessence", 0) < 0 or data.get("quintessence", 0) > 20:
            raise serializers.ValidationError("Quintessence must be between 0 and 20")
        if data.get("paradox", 0) + data.get("quintessence", 0) > 20:
            raise serializers.ValidationError(
                "The combined total of Paradox and Quintessence cannot exceed 20"
            )

        return data
