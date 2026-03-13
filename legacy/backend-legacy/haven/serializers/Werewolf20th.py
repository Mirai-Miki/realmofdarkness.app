from rest_framework import serializers
from haven.models import Werewolf20th
from constants import Splats
from .Character20th import (
    Character20thSerializer,
    Character20thDeserializer,
    Tracker20thSerializer,
)


############################ Tracker Serializer ###############################
class Werewolf20thTrackerSerializer(Tracker20thSerializer):
    class Meta(Tracker20thSerializer.Meta):
        model = Werewolf20th
        fields = Tracker20thSerializer.Meta.fields + (
            "rage_total",
            "rage_current",
            "gnosis_total",
            "gnosis_current",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.werewolf20th.version

        return data


########################### Character Serializer ##############################
class Werewolf20thSerializer(Character20thSerializer):
    class Meta(Character20thSerializer.Meta):
        model = Werewolf20th
        fields = Character20thSerializer.Meta.fields + (
            "rage_total",
            "rage_current",
            "gnosis_total",
            "gnosis_current",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.werewolf20th.version

        return data


############################ Character Deserializer ###########################
class Werewolf20thDeserializer(Character20thDeserializer):
    class Meta(Character20thDeserializer.Meta):
        model = Werewolf20th
        fields = "__all__"

    def create(self, validated_data):
        validated_data["splat"] = Splats.werewolf20th.slug
        return super().create(validated_data)

    def validate(self, data):
        data = super().validate(data)
        # Validate Rage and Gnosis
        if data.get("rage_total", 0) < 1 or data.get("rage_total", 0) > 10:
            raise serializers.ValidationError("Rage Total must be between 1 and 10")
        if data.get("rage_current", 0) < 0 or data.get("rage_current", 0) > 10:
            raise serializers.ValidationError("Rage Current must be between 0 and 10")
        if data.get("gnosis_total", 0) < 1 or data.get("gnosis_total", 0) > 10:
            raise serializers.ValidationError("Gnosis Total must be between 1 and 10")
        if data.get("gnosis_current", 0) < 0 or data.get("gnosis_current", 0) > 10:
            raise serializers.ValidationError("Gnosis Current must be between 0 and 10")

        return data
