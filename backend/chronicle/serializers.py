from rest_framework import serializers
from chronicle.models import Chronicle, Member, StorytellerRole
from bot.models import Bot


class ChronicleSerializer(serializers.ModelSerializer):
    """
    Serializer for the Chronicle model.
    """

    class Meta:
        model = Chronicle
        fields = (
            "id",
            "name",
            "owner_id",
            "bot",
            "shard",
            "is_guild",
            "members",
            "icon_url",
            "tracker_channel",
            "created_at",
            "last_updated",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["bot"] = [bot.id for bot in instance.bot.all()]
        data["members"] = [member.id for member in instance.members.all()]
        return data


class ChronicleDeserializer(serializers.ModelSerializer):
    """
    Deserializer for the Chronicle model.
    """

    bot = serializers.ListField(child=serializers.IntegerField(), write_only=True)

    class Meta:
        model = Chronicle
        fields = "__all__"

    def create(self, validated_data):
        bot_ids = validated_data.pop("bot", [])
        chronicle = super().create(validated_data)
        chronicle.bot.set(bot_ids)
        return chronicle

    def update(self, instance, validated_data):
        bot_ids = validated_data.pop("bot", [])
        instance = super().update(instance, validated_data)
        instance.bot.set(bot_ids)
        return instance


class MemberSerializer(serializers.ModelSerializer):
    """
    Serializer for the Member model.
    """

    class Meta:
        model = Member
        fields = (
            "id",
            "chronicle",
            "user",
            "admin",
            "storyteller",
            "nickname",
            "avatar_url",
            "created_at",
            "last_updated",
            "default_character",
            "default_auto_hunger",
        )


class MemberDeserializer(serializers.ModelSerializer):
    """
    Deserializer for the Member model.
    """

    class Meta:
        model = Member
        fields = "__all__"


class StorytellerRoleSerializer(serializers.ModelSerializer):
    """
    Serializer for the StorytellerRole model.
    """

    class Meta:
        model = StorytellerRole
        fields = ("id", "guild")


class StorytellerRoleDeserializer(serializers.ModelSerializer):
    """
    Deserializer for the StorytellerRole model.
    """

    class Meta:
        model = StorytellerRole
        fields = "__all__"
