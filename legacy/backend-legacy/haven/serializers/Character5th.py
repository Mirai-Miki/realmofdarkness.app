from rest_framework import serializers
from .Character import (
    CharacterSerializer,
    CharacterDeserializer,
    CharacterTrackerSerializer,
)
from haven.models import Character5th


############################ Tracker Serializer ###############################
class Tracker5thSerializer(CharacterTrackerSerializer):

    class Meta(CharacterTrackerSerializer.Meta):
        model = Character5th

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["willpower"] = {
            "superficial": instance.willpower_superficial,
            "total": instance.willpower_total,
            "aggravated": instance.willpower_aggravated,
        }

        data["health"] = {
            "superficial": instance.health_superficial,
            "total": instance.health_total,
            "aggravated": instance.health_aggravated,
        }

        return data


############################ Character Deserializer ###########################
class Character5thDeserializer(CharacterDeserializer):
    class Meta(CharacterDeserializer.Meta):
        model = Character5th

    def validate_willpower_total(self, value):
        if value > 20 or value < 1:
            raise serializers.ValidationError()
        return value

    def validate_willpower_superficial(self, value):
        if value > 20 or value < 0:
            raise serializers.ValidationError()
        return value

    def validate_willpower_aggravated(self, value):
        if value > 20 or value < 0:
            raise serializers.ValidationError()
        return value

    def validate_health_total(self, value):
        if value > 20 or value < 1:
            raise serializers.ValidationError()
        return value

    def validate_health_superficial(self, value):
        if value > 20 or value < 0:
            raise serializers.ValidationError()
        return value

    def validate_health_aggravated(self, value):
        if value > 20 or value < 0:
            raise serializers.ValidationError()
        return value

    def validate_advantages(self, data):
        if not isinstance(data, list):
            raise serializers.ValidationError()

        allowed_keys = ["name", "description", "notes", "rating", "flaw", "modifier"]

        for item in data:
            if not isinstance(item, dict):
                raise serializers.ValidationError()
            if "name" not in item:
                raise serializers.ValidationError()
            if "description" not in item:
                raise serializers.ValidationError()
            if "notes" not in item:
                raise serializers.ValidationError()
            if "rating" not in item:
                raise serializers.ValidationError()
            if "flaw" not in item:
                raise serializers.ValidationError()
            if "modifier" not in item:
                raise serializers.ValidationError()

            unexpected_keys = set(item.keys()) - set(allowed_keys)
            if unexpected_keys:
                raise serializers.ValidationError(
                    f"Unexpected keys found in set: {', '.join(unexpected_keys)}"
                )
            elif not isinstance(item["name"], str):
                raise serializers.ValidationError()
            elif len(item["name"]) > 80:
                raise serializers.ValidationError("name too long")
            elif not isinstance(item["description"], str):
                raise serializers.ValidationError()
            elif len(item["description"]) > 1000:
                raise serializers.ValidationError("Description too long")
            elif not isinstance(item["rating"], int):
                raise serializers.ValidationError("Rating must be a number")
            elif not isinstance(item["notes"], str):
                raise serializers.ValidationError()
            elif len(item["notes"]) > 1000:
                raise serializers.ValidationError(
                    "Notes must be less then 1000 characters"
                )
            elif not isinstance(item["flaw"], bool):
                raise serializers.ValidationError()
            elif not isinstance(item["modifier"], int):
                raise serializers.ValidationError()

        return data

    def validate_merits(self, data):
        return self.validate_advantages(data)

    def validate_flaws(self, data):
        return self.validate_advantages(data)

    def validate_haven(self, data):
        return self.validate_advantages(data)

    def validate_backgrounds(self, data):
        return self.validate_advantages(data)

    def validate_loresheets(self, data):
        return self.validate_advantages(data)

    def validate(self, data):
        data = super().validate(data)

        # Validate Skills & Attributes
        for field in [
            "strength",
            "dexterity",
            "stamina",
            "charisma",
            "manipulation",
            "composure",
            "intelligence",
            "wits",
            "resolve",
            "athletics",
            "brawl",
            "craft",
            "drive",
            "firearms",
            "larcency",
            "melee",
            "stealth",
            "survival",
            "animal_ken",
            "etiquette",
            "insight",
            "intimidation",
            "leadership",
            "performance",
            "persuasion",
            "streetwise",
            "subterfuge",
            "academics",
            "awareness",
            "finance",
            "investigation",
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
        self.damage_validation(data, "willpower")
        self.damage_validation(data, "health")

        return data

    def damage_validation(self, data, damage_type):
        # Validate Damage trackers
        if self.instance:
            total = data.get(f"{damage_type}_total", None)
            superficial = data.get(f"{damage_type}_superficial", None)
            aggravated = data.get(f"{damage_type}_aggravated", None)

            if total == None:
                total = getattr(self.instance, f"{damage_type}_total")
            if superficial == None:
                superficial = getattr(self.instance, f"{damage_type}_superficial")
            if aggravated == None:
                aggravated = getattr(self.instance, f"{damage_type}_aggravated")

            if (superficial + aggravated) > total:
                raise serializers.ValidationError(f"{damage_type} failed validation")


########################### Character Serializer ##############################
# Base serializer with common fields for Character5th
class Character5thSerializer(CharacterSerializer):
    class Meta(CharacterSerializer.Meta):
        model = Character5th
        fields = CharacterSerializer.Meta.fields + (
            "ambition",
            "desire",
            "tenets",
            "touchstones",
            "convictions",
            "merits",
            "flaws",
            "backgrounds",
            "haven",
            "haven_name",
            "haven_location",
            "haven_description",
            "loresheets",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["willpower"] = {
            "superficial": instance.willpower_superficial,
            "total": instance.willpower_total,
            "aggravated": instance.willpower_aggravated,
        }

        data["health"] = {
            "superficial": instance.health_superficial,
            "total": instance.health_total,
            "aggravated": instance.health_aggravated,
        }

        data["attributes"] = {
            "strength": instance.strength,
            "dexterity": instance.dexterity,
            "stamina": instance.stamina,
            "charisma": instance.charisma,
            "manipulation": instance.manipulation,
            "composure": instance.composure,
            "intelligence": instance.intelligence,
            "wits": instance.wits,
            "resolve": instance.resolve,
        }

        data["skills"] = {
            "athletics": {
                "value": instance.athletics,
                "spec": instance.athletics_spec,
            },
            "brawl": {
                "value": instance.brawl,
                "spec": instance.brawl_spec,
            },
            "craft": {
                "value": instance.craft,
                "spec": instance.craft_spec,
            },
            "drive": {
                "value": instance.drive,
                "spec": instance.drive_spec,
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
            "stealth": {
                "value": instance.stealth,
                "spec": instance.stealth_spec,
            },
            "survival": {
                "value": instance.survival,
                "spec": instance.survival_spec,
            },
            "animal_ken": {
                "value": instance.animal_ken,
                "spec": instance.animal_ken_spec,
            },
            "etiquette": {
                "value": instance.etiquette,
                "spec": instance.etiquette_spec,
            },
            "insight": {
                "value": instance.insight,
                "spec": instance.insight_spec,
            },
            "intimidation": {
                "value": instance.intimidation,
                "spec": instance.intimidation_spec,
            },
            "leadership": {
                "value": instance.leadership,
                "spec": instance.leadership_spec,
            },
            "performance": {
                "value": instance.performance,
                "spec": instance.performance_spec,
            },
            "persuasion": {
                "value": instance.persuasion,
                "spec": instance.persuasion_spec,
            },
            "streetwise": {
                "value": instance.streetwise,
                "spec": instance.streetwise_spec,
            },
            "subterfuge": {
                "value": instance.subterfuge,
                "spec": instance.subterfuge_spec,
            },
            "academics": {
                "value": instance.academics,
                "spec": instance.academics_spec,
            },
            "awareness": {
                "value": instance.awareness,
                "spec": instance.awareness_spec,
            },
            "finance": {
                "value": instance.finance,
                "spec": instance.finance_spec,
            },
            "investigation": {
                "value": instance.investigation,
                "spec": instance.investigation_spec,
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
