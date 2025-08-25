from rest_framework import serializers
from haven.models import Ghoul5th
from constants import Splats
from .Character5th import (
    Character5thSerializer,
    Character5thDeserializer,
    Tracker5thSerializer,
)


############################ Tracker Serializer ###############################
class Ghoul5thTrackerSerializer(Tracker5thSerializer):
    class Meta(Tracker5thSerializer.Meta):
        model = Ghoul5th
        fields = Tracker5thSerializer.Meta.fields + (
            "humanity",
            "stains",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.ghoul5th.version

        return data


########################### Character Serializer ##############################
class Ghoul5thSerializer(Character5thSerializer):
    class Meta(Character5thSerializer.Meta):
        model = Ghoul5th
        fields = Character5thSerializer.Meta.fields + (
            "humanity",
            "stains",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.ghoul5th.version

        return data


############################ Character Deserializer ###########################
class Ghoul5thDeserializer(Character5thDeserializer):
    class Meta(Character5thDeserializer.Meta):
        model = Ghoul5th
        fields = "__all__"

    def create(self, validated_data):
        validated_data["splat"] = Splats.ghoul5th.slug
        return super().create(validated_data)

    def validate(self, data):
        data = super().validate(data)
        # Validate Humanity
        if self.instance:
            humanity = data.get("humanity", None)
            stains = data.get("stains", None)

            if humanity is None:
                humanity = self.instance.humanity
            if stains is None:
                stains = self.instance.stains
            if (10 - humanity) < stains:
                raise serializers.ValidationError("Too many stains")

        return data
