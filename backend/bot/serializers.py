"""
Serializers for the bot app.

These serializers follow DRF conventions, enforce strong validation, and
return string IDs in API responses for consistency across the platform.

Related fields are represented by their *_id counterparts by default to
minimize database hits. Use `.with_related()` on a serializer instance to
include nested serialized related data when needed.
"""

from __future__ import annotations

from typing import Any, Dict, cast, TYPE_CHECKING

from django.contrib.auth import get_user_model
from rest_framework import serializers

from bot.models import Bot, CommandStat, InitiativeTracker20th
from chronicle.models import Chronicle
from chronicle.serializers import ChronicleSerializer
from discordauth.serializers import UserSerializer

if TYPE_CHECKING:
    from discordauth.models import User as CustomUser

User = cast("CustomUser", get_user_model())


class BotSerializer(serializers.ModelSerializer):
    """Serializer for the Bot model.

    - Accepts string or int IDs on input; stores as integers.
    - Serializes `id` as a string.
    - Validates discriminator to be "0" or a 4-digit string.
    """

    id = serializers.CharField(help_text="Discord snowflake ID for the bot.")
    username = serializers.CharField(
        max_length=200, help_text="Public username of the bot."
    )
    discriminator = serializers.RegexField(
        regex=r"^(0|\d{4})$",
        max_length=5,
        help_text="Discord discriminator (4 digits) or '0'.",
    )
    avatar_url = serializers.URLField(
        allow_blank=True, help_text="Optional URL to the bot's avatar."
    )
    shard_count = serializers.IntegerField(
        min_value=0, default=0, help_text="Number of shards used by the bot."
    )

    class Meta:
        model = Bot
        fields = (
            "id",
            "username",
            "discriminator",
            "avatar_url",
            "shard_count",
        )

    def create(self, validated_data: Dict[str, Any]) -> Bot:
        """Create a new Bot instance.

        Ensures `id` is stored as an integer in the database.
        """
        validated_data["id"] = int(validated_data["id"])  # type: ignore[call-arg]
        return super().create(validated_data)

    def update(self, instance: Bot, validated_data: Dict[str, Any]) -> Bot:
        """Update an existing Bot.

        Prevents updating the primary key.
        """
        validated_data.pop("id", None)
        return super().update(instance, validated_data)

    def to_representation(self, instance: Bot) -> Dict[str, Any]:
        """Ensure `id` is always a string when serialized."""
        data = super().to_representation(instance)
        data["id"] = str(instance.id)
        return data


class CommandStatSerializer(serializers.ModelSerializer):
    """Serializer for the CommandStat model.

    - Exposes `user_id` and `bot_id` for write operations.
    - Serializes `id`, `user_id`, and `bot_id` as strings.
    - Provides `.with_related()` to include nested `user` and `bot` when needed.
    """

    # Write-only relation inputs
    user_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source="user",
        queryset=User.objects.all(),
        help_text="ID of the user who invoked the command.",
    )
    bot_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source="bot",
        queryset=Bot.objects.all(),
        help_text="ID of the bot on which the command was executed.",
    )

    command = serializers.CharField(
        max_length=100, help_text="Command name or identifier."
    )
    used = serializers.IntegerField(
        min_value=1, default=1, help_text="Number of times this command was used."
    )
    last_used = serializers.DateTimeField(
        read_only=True, help_text="Timestamp of the most recent use."
    )

    class Meta:
        model = CommandStat
        fields = (
            "id",
            "user_id",
            "bot_id",
            "command",
            "used",
            "last_used",
        )
        read_only_fields = ("last_used",)

    def with_related(self) -> "CommandStatSerializer":
        """Enable nested related serialization for `user` and `bot`.

        This method mutates the serializer instance by adding `user` and
        `bot` fields as read-only nested serializers. Use this only when
        related data is required to avoid unnecessary database access.
        """
        self.fields["user"] = UserSerializer(read_only=True)
        self.fields["bot"] = BotSerializer(read_only=True)
        return self

    def to_representation(self, instance: CommandStat) -> Dict[str, Any]:
        """Ensure IDs are strings and include `user_id` and `bot_id` in output."""
        data = super().to_representation(instance)
        data["id"] = str(getattr(instance, "id", ""))
        data["user_id"] = str(getattr(instance, "user_id", ""))
        data["bot_id"] = str(getattr(instance, "bot_id", ""))
        return data

    def update(
        self, instance: CommandStat, validated_data: Dict[str, Any]
    ) -> CommandStat:
        """Disallow updating immutable relation keys and primary key."""
        validated_data.pop("id", None)
        validated_data.pop("user", None)
        validated_data.pop("bot", None)
        return super().update(instance, validated_data)


class InitiativeTracker20thSerializer(serializers.ModelSerializer):
    """Serializer for the InitiativeTracker20th model.

    - Accepts string or int IDs on input; stores as integers.
    - Exposes `chronicle_id` for writes; serializes `id` and `chronicle_id` as strings.
    - Provides `.with_related()` to include nested `chronicle` when needed.
    """

    id = serializers.CharField(
        help_text="Discord channel ID where this tracker is active."
    )
    chronicle_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source="chronicle",
        queryset=Chronicle.objects.all(),
        help_text="ID of the chronicle associated with this tracker.",
    )
    last_updated = serializers.DateTimeField(
        read_only=True, help_text="Timestamp of the last update to this tracker."
    )

    class Meta:
        model = InitiativeTracker20th
        fields = (
            "id",
            "chronicle_id",
            "data",
            "last_updated",
        )
        read_only_fields = ("last_updated",)
        extra_kwargs = {
            "data": {"help_text": "JSON payload storing the tracker state."}
        }

    def with_related(self) -> "InitiativeTracker20thSerializer":
        """Enable nested related serialization for `chronicle`."""
        self.fields["chronicle"] = ChronicleSerializer(read_only=True)
        return self

    def create(self, validated_data: Dict[str, Any]) -> InitiativeTracker20th:
        """Create a new tracker, ensuring `id` is stored as an integer."""
        validated_data["id"] = int(validated_data["id"])  # type: ignore[call-arg]
        return super().create(validated_data)

    def update(
        self, instance: InitiativeTracker20th, validated_data: Dict[str, Any]
    ) -> InitiativeTracker20th:
        """Prevent updating the primary key and switch out write-only inputs."""
        validated_data.pop("id", None)
        return super().update(instance, validated_data)

    def to_representation(self, instance: InitiativeTracker20th) -> Dict[str, Any]:
        """Ensure `id` and `chronicle_id` are serialized as strings."""
        data = super().to_representation(instance)
        data["id"] = str(instance.id)
        data["chronicle_id"] = str(getattr(instance, "chronicle_id", ""))
        return data
