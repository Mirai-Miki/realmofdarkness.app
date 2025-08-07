"""
Serializers for the chronicle app.
"""

from typing import cast
from django.contrib.auth import get_user_model
from requests import get
from rest_framework import serializers
from .models import Chronicle, Member, StorytellerRole
from haven.models import Character
from discordauth.serializers import UserSerializer
from discordauth.models import User as UserModel

User = cast(UserModel, get_user_model())


class ChronicleSerializer(serializers.ModelSerializer):
    """
    Serializer for the Chronicle model.

    Handles serialization and deserialization of Chronicle instances.
    It includes nested serialization for related models and provides
    clear validation and help text for each field.
    """

    id = serializers.CharField(help_text="Chronicle's unique ID.")
    owner_id = serializers.CharField(help_text="ID of the chronicle's owner.")
    name = serializers.CharField(max_length=200, help_text="Name of the chronicle.")
    icon_url = serializers.URLField(
        allow_blank=True, help_text="URL for the chronicle's icon."
    )
    tracker_channel = serializers.CharField(
        max_length=20, allow_blank=True, help_text="ID of the tracker channel."
    )
    created_at = serializers.DateTimeField(
        read_only=True, help_text="Timestamp of chronicle creation."
    )
    last_updated = serializers.DateTimeField(
        read_only=True, help_text="Timestamp of the last update."
    )

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
        read_only_fields = ("id", "created_at", "last_updated")

    def update(self, instance, validated_data):
        validated_data.pop("id", None)  # Ensure ID is not updated
        return instance


class MemberSerializer(serializers.ModelSerializer):
    """
    Serializer for the Member model.

    Handles serialization and deserialization of Member instances.
    It uses nested serializers for related `Chronicle` and `User` models
    and provides clear validation and help text.
    """

    id = serializers.CharField(read_only=True, help_text="Member's unique ID.")
    chronicle_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source="chronicle",
        queryset=Chronicle.objects.all(),
        help_text="ID of the chronicle this member belongs to.",
    )
    user_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source="user",
        queryset=User.objects.all(),
        help_text="ID of the user associated with this member.",
    )
    admin = serializers.BooleanField(default=False, help_text="Is the member an admin?")
    storyteller = serializers.BooleanField(
        default=False, help_text="Is the member a storyteller?"
    )
    nickname = serializers.CharField(
        max_length=100, allow_blank=True, help_text="Member's nickname."
    )
    avatar_url = serializers.URLField(
        allow_blank=True, help_text="URL of the member's avatar."
    )
    created_at = serializers.DateTimeField(
        read_only=True, help_text="Timestamp of member creation."
    )
    last_updated = serializers.DateTimeField(
        read_only=True, help_text="Timestamp of the last update."
    )
    default_character_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source="default_character",
        queryset=Character.objects.all(),
        allow_null=True,
        help_text="Member's default character.",
    )
    default_auto_hunger = serializers.BooleanField(
        default=False, help_text="Default setting for auto-hunger."
    )

    class Meta:
        model = Member
        fields = (
            "id",
            "chronicle_id",
            "user_id",
            "admin",
            "storyteller",
            "nickname",
            "avatar_url",
            "created_at",
            "last_updated",
            "default_character",
            "default_auto_hunger",
        )
        read_only_fields = ("id", "created_at", "last_updated")

    def with_related(self):
        """
        Returns a serializer instance that includes related fields.
        This is useful for fetching related objects like chronicle and user.
        """
        self.fields["chronicle"] = ChronicleSerializer(read_only=True)
        self.fields["user"] = UserSerializer(read_only=True)
        return self

    def to_representation(self, instance: Member) -> dict:
        """
        Custom representation to always include chronicle_id and user_id, and only include
        chronicle/user objects if present (e.g., fetched via select_related).
        """
        data = super().to_representation(instance)
        # Always include chronicle_id and user_id in output
        data["chronicle_id"] = str(getattr(instance, "chronicle_id", None))
        data["user_id"] = str(getattr(instance, "user_id", None))
        return data

    def update(self, instance, validated_data):
        # Remove fields that should not be updated
        validated_data.pop("chronicle", None)
        validated_data.pop("user", None)
        return instance


class StorytellerRoleSerializer(serializers.ModelSerializer):
    """
    Serializer for the StorytellerRole model.

    Handles serialization and deserialization of StorytellerRole instances.
    """

    id = serializers.CharField(help_text="The ID of the storyteller role.")
    guild = serializers.PrimaryKeyRelatedField(
        queryset=Chronicle.objects.all(),
        help_text="The guild associated with this role.",
    )

    class Meta:
        model = StorytellerRole
        fields = ("id", "guild")
