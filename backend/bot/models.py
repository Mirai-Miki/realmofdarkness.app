"""
Models for the bot app.

This module defines database models used by Discord bot integrations, such as
bot instances, command usage statistics, and initiative trackers for systems.

All models include clear documentation, type hints compatible with django-stubs,
and sensible validators to ensure data integrity at the model layer.
"""

from __future__ import annotations

from typing import Any

from django.conf import settings
from django.core.validators import MinValueValidator, RegexValidator
from django.db import models
from chronicle.models import Chronicle


class Bot(models.Model):
    """Represents a Discord bot instance connected to the platform.

    Attributes:
        id (int): Discord snowflake ID for the bot (primary key).
        username (str): Public username of the bot.
        discriminator (str): Discord discriminator ("0001" style) or "0" for username-only accounts.
        avatar_url (str): Optional URL to the bot's avatar.
        shard_count (int): Number of shards the bot is running with.
    """

    id: models.BigIntegerField[int] = models.BigIntegerField(
        primary_key=True,
        help_text="Discord snowflake ID for the bot.",
    )
    username: models.CharField = models.CharField(
        max_length=200,
        help_text="Public username of the bot.",
    )
    discriminator: models.CharField = models.CharField(
        max_length=5,
        validators=[
            RegexValidator(r"^(0|\d{4})$", "Must be '0' or a 4-digit discriminator.")
        ],
        help_text="Discord discriminator (4 digits) or '0'.",
    )
    avatar_url: models.URLField = models.URLField(
        blank=True,
        help_text="Optional URL to the bot's avatar.",
    )
    shard_count: models.IntegerField = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Number of shards used by the bot (non-negative).",
    )

    class Meta:
        verbose_name = "Bot"
        verbose_name_plural = "Bots"
        ordering = ("id",)

    def __str__(self) -> str:  # pragma: no cover - trivial representation
        return f"{self.username}#{self.discriminator}"


class CommandStat(models.Model):
    """Tracks usage statistics for bot commands on a per-user basis.

    Attributes:
        user: Reference to the authenticated user who invoked the command.
        bot: Reference to the bot that received the command.
        command (str): The command name or key.
        used (int): The number of times this command has been used by the user on this bot.
        last_used: Timestamp that auto-updates whenever this record is saved.
    """

    user: models.ForeignKey = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="command_stats",
        help_text="User who invoked the command.",
    )
    bot: models.ForeignKey = models.ForeignKey(
        "bot.Bot",
        on_delete=models.CASCADE,
        related_name="command_stats",
        help_text="Bot on which the command was executed.",
    )
    command: models.CharField = models.CharField(
        max_length=100,
        help_text="Command name or identifier.",
    )
    used: models.IntegerField = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Number of times this command has been used (>= 1).",
    )
    last_used: models.DateTimeField = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp of the most recent use.",
    )

    class Meta:
        verbose_name = "Command Stat"
        verbose_name_plural = "Command Stats"
        ordering = ("-last_used",)
        constraints = [
            models.UniqueConstraint(
                fields=("user", "command", "bot"),
                name="uniq_user_command_bot",
            )
        ]

    def __str__(self) -> str:  # pragma: no cover - trivial representation
        return f"{self.command}: {self.used}"


class InitiativeTracker20th(models.Model):
    """Stores initiative tracker state per Discord channel for 20th Anniversary systems.

    Attributes:
        id (int): Discord channel ID (primary key) where the tracker is active.
        chronicle: Chronicle to which this tracker belongs.
        data (dict[str, Any]): Opaque JSON payload storing tracker state.
        last_updated: Auto-updated timestamp for last modification.
    """

    id: models.BigIntegerField[int] = models.BigIntegerField(
        primary_key=True,
        help_text="Discord channel ID where this tracker is active.",
    )
    chronicle: models.ForeignKey = models.ForeignKey(
        Chronicle,
        on_delete=models.CASCADE,
        related_name="initiative_trackers_20th",
        help_text="Chronicle associated with this tracker.",
    )
    data: models.JSONField = models.JSONField(
        help_text="JSON payload storing the tracker state.",
    )
    last_updated: models.DateTimeField = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp of the last update to this tracker.",
    )

    class Meta:
        verbose_name = "Initiative Tracker (20th)"
        verbose_name_plural = "Initiative Trackers (20th)"
        ordering = ("-last_updated",)

    def __str__(self) -> str:  # pragma: no cover - trivial representation
        return f"InitiativeTracker20th(channel={self.id})"
