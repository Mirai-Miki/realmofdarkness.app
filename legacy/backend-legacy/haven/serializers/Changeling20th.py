from rest_framework import serializers
from haven.models import Changeling20th
from constants import Splats
from .Character20th import (
    Character20thSerializer,
    Character20thDeserializer,
    Tracker20thSerializer,
)


############################ Tracker Serializer ###############################
class C20TrackerSerializer(Tracker20thSerializer):
    class Meta(Tracker20thSerializer.Meta):
        model = Changeling20th
        fields = Tracker20thSerializer.Meta.fields + (
            "glamour_total",
            "glamour_current",
            "banality_total",
            "banality_current",
            "nightmare",
            "imbalance",
            "chimerical_total",
            "chimerical_bashing",
            "chimerical_lethal",
            "chimerical_aggravated",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.changeling20th.version

        return data


########################### Character Serializer ##############################
class Changeling20thSerializer(Character20thSerializer):
    class Meta(Character20thSerializer.Meta):
        model = Changeling20th
        fields = Character20thSerializer.Meta.fields + (
            "glamour_total",
            "glamour_current",
            "banality_total",
            "banality_current",
            "nightmare",
            "imbalance",
            "chimerical_total",
            "chimerical_bashing",
            "chimerical_lethal",
            "chimerical_aggravated",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Add the additional fields to the serialized data
        data["version"] = Splats.changeling20th.version

        return data


############################ Character Deserializer ###########################
class Changeling20thDeserializer(Character20thDeserializer):
    class Meta(Character20thDeserializer.Meta):
        model = Changeling20th
        fields = "__all__"

    def create(self, validated_data):
        validated_data["splat"] = Splats.changeling20th.slug
        return super().create(validated_data)

    def validate(self, data):
        data = super().validate(data)

        # Validate that glamour current is not greater than glamour total
        if data["glamour_current"] > data["glamour_total"]:
            raise serializers.ValidationError(
                "Glamour current cannot be greater than glamour total."
            )

        # Validate that banality current is not greater than banality total
        if data["banality_current"] > data["banality_total"]:
            raise serializers.ValidationError(
                "Banality current cannot be greater than banality total."
            )

        # Validate Damage tracker
        if self.instance:
            total = data.get("chimerical_total", None)
            bashing = data.get("chimerical_bashing", 0)
            lethal = data.get("chimericalh_lethal", 0)
            aggravated = data.get("chimerical_aggravated", 0)

            if total is not None and total < bashing + lethal + aggravated:
                raise serializers.ValidationError(
                    "Total chimerical cannot be less than the sum of bashing, lethal, and aggravated"
                )

        return data
