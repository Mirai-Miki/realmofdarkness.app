from rest_framework import serializers
from haven.models import Werewolf5th
from ..types import Splats
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
        return data


############################ Tracker Serializer ###############################
class Werewolf5thTrackerSerializer(Tracker5thSerializer):
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
        return data


############################ Character Deserializer ###########################
class Werewolf5thDeserializer(Character5thDeserializer):
    def create(self, validated_data):
        validated_data["splat"] = Splats.WEREWOLF_5TH.value
        return super().create(validated_data)

    class Meta(Character5thDeserializer.Meta):
        model = Werewolf5th
        fields = "__all__"
