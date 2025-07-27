from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    """

    # Convert BigInt ID to string for API safety
    id = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "discriminator",
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
        read_only_fields = (
            "id",
            "created_at",
            "last_saved",
            "last_active",
        )
