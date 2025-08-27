from rest_framework import serializers
from chronicle.models import Chronicle, Member, StorytellerRole
from discordauth.serializers import UserSerializer


class ChronicleSerializer(serializers.ModelSerializer):
    """
    Serializer for the Chronicle model.
    """

    # Convert ID to string for API safety
    id = serializers.CharField(read_only=True)
    owner_id = serializers.CharField(read_only=True)

    class Meta:
        model = Chronicle
        fields = (
            "id",
            "name",
            "owner_id",
            "icon_url",
            "tracker_channel",
            "created_at",
            "last_updated",
        )
        read_only_fields = (
            "id",
            "created_at",
            "last_updated",
        )


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

    # Convert ID to string for API safety
    id = serializers.CharField(read_only=True)
    chronicle = ChronicleSerializer(read_only=True)
    user = UserSerializer(read_only=True)

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
        read_only_fields = (
            "id",
            "created_at",
            "last_updated",
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
