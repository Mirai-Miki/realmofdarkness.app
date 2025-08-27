from rest_framework import serializers
from bot.models import Bot, CommandStat, InitiativeTracker20th


class BotSerializer(serializers.ModelSerializer):
    """
    Serializer for the Bot model.
    """

    class Meta:
        model = Bot
        fields = (
            "id",
            "username",
            "discriminator",
            "avatar_url",
            "shard_count",
        )


class BotDeserializer(serializers.ModelSerializer):
    """
    Deserializer for the Bot model.
    """

    class Meta:
        model = Bot
        fields = "__all__"


class CommandStatSerializer(serializers.ModelSerializer):
    """
    Serializer for the CommandStat model.
    """

    class Meta:
        model = CommandStat
        fields = (
            "id",
            "user",
            "bot",
            "command",
            "used",
            "last_used",
        )


class CommandStatDeserializer(serializers.ModelSerializer):
    """
    Deserializer for the CommandStat model.
    """

    class Meta:
        model = CommandStat
        fields = "__all__"


class InitiativeTracker20thSerializer(serializers.ModelSerializer):
    """
    Serializer for the InitiativeTracker20th model.
    """

    class Meta:
        model = InitiativeTracker20th
        fields = (
            "id",
            "chronicle",
            "data",
            "last_updated",
        )


class InitiativeTracker20thDeserializer(serializers.ModelSerializer):
    """
    Deserializer for the InitiativeTracker20th model.
    """

    class Meta:
        model = InitiativeTracker20th
        fields = "__all__"
