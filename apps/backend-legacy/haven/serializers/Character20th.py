from rest_framework import serializers
from .Character import (
    CharacterSerializer,
    CharacterDeserializer,
    CharacterTrackerSerializer,
)
from haven.models import Character20th


############################ Tracker Serializer ###############################
class Tracker20thSerializer(CharacterTrackerSerializer):

    class Meta(CharacterTrackerSerializer.Meta):
        model = Character20th

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["willpower"] = {
            "total": instance.willpower_total,
            "current": instance.willpower_current,
        }

        data["health"] = {
            "total": instance.health_total,
            "bashing": instance.health_bashing,
            "lethal": instance.health_lethal,
            "aggravated": instance.health_aggravated,
        }

        return data


########################### Character Serializer ##############################
# Base serializer with common fields for Character20th
class Character20thSerializer(CharacterSerializer):
    class Meta(CharacterSerializer.Meta):
        model = Character20th

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["willpower"] = {
            "current": instance.willpower_current,
            "total": instance.willpower_total,
        }

        data["health"] = {
            "bashing": instance.health_bashing,
            "lethal": instance.health_lethal,
            "aggravated": instance.health_aggravated,
            "total": instance.health_total,
        }

        data["attributes"] = {
            "strength": {
                "value": instance.strength,
                "spec": instance.strength_spec,
            },
            "dexterity": {
                "value": instance.dexterity,
                "spec": instance.dexterity_spec,
            },
            "stamina": {
                "value": instance.stamina,
                "spec": instance.stamina_spec,
            },
            "charisma": {
                "value": instance.charisma,
                "spec": instance.charisma_spec,
            },
            "manipulation": {
                "value": instance.manipulation,
                "spec": instance.manipulation_spec,
            },
            "appearance": {
                "value": instance.appearance,
                "spec": instance.appearance_spec,
            },
            "perception": {
                "value": instance.perception,
                "spec": instance.perception_spec,
            },
            "intelligence": {
                "value": instance.intelligence,
                "spec": instance.intelligence_spec,
            },
            "wits": {
                "value": instance.wits,
                "spec": instance.wits_spec,
            },
        }

        data["skills"] = {
            "alertness": {
                "value": instance.alertness,
                "spec": instance.alertness_spec,
            },
            "athletics": {
                "value": instance.athletics,
                "spec": instance.athletics_spec,
            },
            "awareness": {
                "value": instance.awareness,
                "spec": instance.awareness_spec,
            },
            "brawl": {
                "value": instance.brawl,
                "spec": instance.brawl_spec,
            },
            "empathy": {
                "value": instance.empathy,
                "spec": instance.empathy_spec,
            },
            "expression": {
                "value": instance.expression,
                "spec": instance.expression_spec,
            },
            "intimidation": {
                "value": instance.intimidation,
                "spec": instance.intimidation_spec,
            },
            "leadership": {
                "value": instance.leadership,
                "spec": instance.leadership_spec,
            },
            "streetwise": {
                "value": instance.streetwise,
                "spec": instance.streetwise_spec,
            },
            "subterfuge": {
                "value": instance.subterfuge,
                "spec": instance.subterfuge_spec,
            },
            "animal_ken": {
                "value": instance.animal_ken,
                "spec": instance.animal_ken_spec,
            },
            "crafts": {
                "value": instance.crafts,
                "spec": instance.crafts_spec,
            },
            "drive": {
                "value": instance.drive,
                "spec": instance.drive_spec,
            },
            "etiquette": {
                "value": instance.etiquette,
                "spec": instance.etiquette_spec,
            },
            "firearms": {
                "value": instance.firearms,
                "spec": instance.firearms_spec,
            },
            "larceny": {
                "value": instance.larceny,
                "spec": instance.larceny_spec,
            },
            "melee": {
                "value": instance.melee,
                "spec": instance.melee_spec,
            },
            "performance": {
                "value": instance.performance,
                "spec": instance.performance_spec,
            },
            "stealth": {
                "value": instance.stealth,
                "spec": instance.stealth_spec,
            },
            "survival": {
                "value": instance.survival,
                "spec": instance.survival_spec,
            },
            "academics": {
                "value": instance.academics,
                "spec": instance.academics_spec,
            },
            "computer": {
                "value": instance.computer,
                "spec": instance.computer_spec,
            },
            "finance": {
                "value": instance.finance,
                "spec": instance.finance_spec,
            },
            "investigation": {
                "value": instance.investigation,
                "spec": instance.investigation_spec,
            },
            "law": {
                "value": instance.law,
                "spec": instance.law_spec,
            },
            "medicine": {
                "value": instance.medicine,
                "spec": instance.medicine_spec,
            },
            "occult": {
                "value": instance.occult,
                "spec": instance.occult_spec,
            },
            "politics": {
                "value": instance.politics,
                "spec": instance.politics_spec,
            },
            "science": {
                "value": instance.science,
                "spec": instance.science_spec,
            },
            "technology": {
                "value": instance.technology,
                "spec": instance.technology_spec,
            },
        }
        return data


############################ Character Deserializer ###########################
class Character20thDeserializer(CharacterDeserializer):
    class Meta(CharacterDeserializer.Meta):
        model = Character20th

    def validate_willpower_total(self, value):
        if value > 10 or value < 1:
            raise serializers.ValidationError()
        return value

    def validate_willpower_current(self, value):
        if value > 10 or value < 0:
            raise serializers.ValidationError()
        return value

    def validate_health_total(self, value):
        if value > 15 or value < 7:
            raise serializers.ValidationError()
        return value

    def validate_health_bashing(self, value):
        if value > 15 or value < 0:
            raise serializers.ValidationError()
        return value

    def validate_health_lethal(self, value):
        if value > 15 or value < 0:
            raise serializers.ValidationError()
        return value

    def validate_health_aggravated(self, value):
        if value > 15 or value < 0:
            raise serializers.ValidationError()
        return value

    def validate(self, data):
        data = super().validate(data)

        # Validate Skills & Attributes
        for field in [
            "strength",
            "dexterity",
            "stamina",
            "charisma",
            "manipulation",
            "appearance",
            "perception",
            "intelligence",
            "wits",
            "alertness",
            "athletics",
            "awareness",
            "brawl",
            "empathy",
            "expression",
            "intimidation",
            "leadership",
            "streetwise",
            "subterfuge",
            "animal_ken",
            "crafts",
            "drive",
            "etiquette",
            "firearms",
            "larceny",
            "melee",
            "performance",
            "stealth",
            "survival",
            "academics",
            "computer",
            "finance",
            "investigation",
            "law",
            "medicine",
            "occult",
            "politics",
            "science",
            "technology",
        ]:
            value = data.get(field)
            if value is not None and (value < 0 or value > 5):
                raise serializers.ValidationError()

        # Validate Damage trackers
        self.willpower_validation(data)
        self.damage_validation(data)

        return data

    def damage_validation(self, data):
        # Validate Damage trackers
        if self.instance:
            total = data.get("health_total", None)
            bashing = data.get("health_bashing", 0)
            lethal = data.get("health_lethal", 0)
            aggravated = data.get("health_aggravated", 0)

            if total is not None and total < bashing + lethal + aggravated:
                raise serializers.ValidationError(
                    "Total health cannot be less than the sum of bashing, lethal, and aggravated"
                )

    def willpower_validation(self, data):
        if self.instance:
            total = data.get("willpower_total", None)
            current = data.get("willpower_current", None)

            if total is not None and current is not None and current > total:
                raise serializers.ValidationError(
                    "Current willpower cannot be more than total willpower"
                )
