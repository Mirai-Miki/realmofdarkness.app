from rest_framework import serializers
from haven.models import Werewolf5th
from constants import Splats
from .Character5th import (
    Character5thSerializer,
    Character5thDeserializer,
    Tracker5thSerializer,
)


########################### Character Serializer ##############################
class Werewolf5thSerializer(Character5thSerializer):
    # Define SerializerMethodField for skills

    class Meta(Character5thSerializer.Meta):
        model = Werewolf5th
        fields = Character5thSerializer.Meta.fields + (
            "rage",
            "harano",
            "hauglosk",
            "form",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["splat"] = Splats.werewolf5th.slug
        data["version"] = Splats.werewolf5th.version
        data["class"] = Splats.werewolf5th.slug  # Temporary value to denote new type

        return data


############################ Tracker Serializer ###############################
class W5TrackerSerializer(Tracker5thSerializer):
    class Meta(Tracker5thSerializer.Meta):
        model = Werewolf5th
        fields = Tracker5thSerializer.Meta.fields + (
            "rage",
            "harano",
            "hauglosk",
            "form",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["splat"] = Splats.werewolf5th.slug
        data["version"] = Splats.werewolf5th.version
        data["class"] = Splats.werewolf5th.slug  # Temporary value to denote new splat

        return data


############################ Character Deserializer ###########################
class Werewolf5thDeserializer(Character5thDeserializer):
    def create(self, validated_data):
        validated_data["splat_new"] = Splats.werewolf5th.slug
        return super().create(validated_data)

    class Meta(Character5thDeserializer.Meta):
        model = Werewolf5th
        fields = "__all__"
