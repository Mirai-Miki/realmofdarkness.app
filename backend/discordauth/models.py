"""
Discord authentication models for Realm of Darkness.

This module defines the User model and UserManager for Discord OAuth authentication.
Users are identified by their Discord user ID rather than username/password.
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.utils import timezone


class User(AbstractBaseUser):
    """
    Custom user model for Discord OAuth authentication.

    This model represents users who authenticate through Discord OAuth2.
    It stores Discord-specific information and platform-specific metadata.

    Key features:
    - Uses Discord user ID as primary key
    - No password authentication (uses Discord OAuth)
    - Stores Discord profile information
    - Tracks platform-specific data (supporter tier, admin status)
    """

    # Discord User Details
    id = models.BigIntegerField(
        primary_key=True, help_text="Discord user ID (snowflake)"
    )
    username = models.CharField(max_length=80, help_text="Discord username")
    avatar_url = models.URLField(blank=True, help_text="URL to user's Discord avatar")
    email = models.EmailField(
        max_length=100,
        blank=True,
        null=True,
    )
    verified = models.BooleanField()  # if the user is verified on Discord
    registered = models.BooleanField()  # Whether the user has ever logged in
    admin = models.BooleanField(default=False)
    supporter = models.IntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    last_saved = models.DateTimeField(auto_now=True)
    last_active = models.DateTimeField(default=timezone.now)

    # Authentication fields
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        """Meta configuration for User model."""

        verbose_name = "User"
        verbose_name_plural = "Users"
        db_table = "discordauth_user"

    def __str__(self) -> str:
        """Return string representation of the user."""
        return f"{self.username}"
