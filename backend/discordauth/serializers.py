"""
Serializers for the discordauth app.
"""

from rest_framework import serializers
from .models import User
from .supporter import Supporter


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.

    This serializer handles the conversion of User model instances to JSON
    and validates incoming data. It explicitly defines all model fields
    to ensure type safety and provides clear documentation through `help_text`.

    Validation is handled by DRF's built-in field validators where possible
    (e.g., `max_length`, `URLField`) and custom `validate_` methods for
    application-specific rules.
    """

    # Read-only fields
    created_at = serializers.DateTimeField(
        read_only=True, help_text="Timestamp of user creation."
    )
    last_saved = serializers.DateTimeField(
        read_only=True, help_text="Timestamp of the last save."
    )
    last_active = serializers.DateTimeField(
        read_only=True, help_text="Timestamp of the user's last activity."
    )

    # Writable fields with built-in validation
    username = serializers.CharField(
        max_length=80, help_text="User's Discord username."
    )
    avatar_url = serializers.URLField(
        allow_blank=True, help_text="URL of the user's avatar."
    )
    email = serializers.EmailField(
        max_length=100,
        allow_blank=True,
        allow_null=True,
        help_text="User's email address.",
    )
    verified = serializers.BooleanField(
        help_text="Indicates if the user's email is verified."
    )
    registered = serializers.BooleanField(
        help_text="Indicates if the user is registered on the site."
    )
    admin = serializers.BooleanField(
        default=False, help_text="Indicates if the user is an administrator."
    )
    supporter = serializers.IntegerField(
        default=0, help_text="User's supporter tier (0 for non-supporter)."
    )

    class Meta:
        """
        Meta class for UserSerializer.

        - Makes 'id' writable on create, read-only on update.
        - Ensures strict type safety and documentation for all fields.
        """

        model = User
        fields = (
            "id",
            "username",
            "avatar_url",
            "email",
            "verified",
            "registered",
            "admin",
            "supporter",
            "created_at",
            "last_saved",
            "last_active",
        )
        read_only_fields = ("created_at", "last_saved", "last_active")

    def create(self, validated_data: dict) -> User:
        """
        Create a new User instance, set an unusable password, and save to the database.

        Args:
            validated_data (dict): Validated data for the new user.

        Returns:
            User: The created User instance.
        """
        # Ensure id is stored as int in the model, but always returned as str in serialization
        validated_data["id"] = int(validated_data["id"])
        user = User(**validated_data)
        user.set_unusable_password()
        user.save()
        return user

    def update(self, instance: User, validated_data: dict) -> User:
        """
        Update an existing User instance. Prevents updating the 'id' field.

        Args:
            instance (User): The User instance to update.
            validated_data (dict): Validated data for update.

        Returns:
            User: The updated User instance.
        """
        validated_data.pop("id", None)
        return super().update(instance, validated_data)

    def to_representation(self, instance: User) -> dict:
        """
        Ensure 'id' is always serialized as a string.

        Args:
            instance (User): The User instance being serialized.

        Returns:
            dict: Serialized representation of the User.
        """
        ret = super().to_representation(instance)
        ret["id"] = str(instance.id)
        return ret

    def validate_supporter(self, value: int) -> int:
        """
        Validate that the supporter tier is a non-negative integer.
        """
        if value < Supporter.NONE or value > Supporter.ANTEDILUVIAN:
            raise serializers.ValidationError("Supporter tier must be a valid tier.")
        return value
