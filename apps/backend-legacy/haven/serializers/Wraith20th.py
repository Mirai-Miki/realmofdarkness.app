from rest_framework import serializers
from haven.models import Wraith20th
from constants import Splats
from .Character20th import (
    Character20thSerializer,
    Character20thDeserializer,
    Tracker20thSerializer,
)


############################ Tracker Serializer ###############################
class Wraith20thTrackerSerializer(Tracker20thSerializer):
    class Meta(Tracker20thSerializer.Meta):
        model = Wraith20th
        fields = Tracker20thSerializer.Meta.fields + (
            "corpus_total",
            "corpus_current",
            "pathos",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.wraith20th.version

        return data


########################### Character Serializer ##############################
class Wraith20thSerializer(Character20thSerializer):
    class Meta(Character20thSerializer.Meta):
        model = Wraith20th
        fields = Character20thSerializer.Meta.fields + (
            "corpus_total",
            "corpus_current",
            "pathos",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.wraith20th.version

        return data


############################ Character Deserializer ###########################
class Wraith20thDeserializer(Character20thDeserializer):
    class Meta(Character20thDeserializer.Meta):
        model = Wraith20th
        fields = "__all__"

    def create(self, validated_data):
        validated_data["splat"] = Splats.wraith20th.slug
        return super().create(validated_data)

    def validate(self, data):
        data = super().validate(data)
        # Validate Corpus and Pathos
        if data.get("corpus_total", 0) < 0 or data.get("corpus_total", 0) > 10:
            raise serializers.ValidationError("Corpus Total must be between 0 and 10")
        if data.get("corpus_current", 0) < 0 or data.get("corpus_current", 0) > 10:
            raise serializers.ValidationError("Corpus Current must be between 0 and 10")
        if data.get("pathos", 0) < 0 or data.get("pathos", 0) > 10:
            raise serializers.ValidationError("Pathos must be between 0 and 10")

        return data
