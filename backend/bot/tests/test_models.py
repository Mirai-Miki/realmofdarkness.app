"""
Tests for the models in the bot app.
"""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from django.test import TestCase

from bot.models import Bot, CommandStat, InitiativeTracker20th
from chronicle.models import Chronicle

User = get_user_model()


class BotModelTest(TestCase):
    """Tests for the Bot model."""

    def test_create_bot_valid(self):
        """Test creating a Bot with valid data."""
        bot = Bot.objects.create(
            id=123456789012345678,
            username="TestBot",
            discriminator="1234",
            avatar_url="http://example.com/avatar.png",
            shard_count=2,
        )
        self.assertEqual(bot.id, 123456789012345678)
        self.assertEqual(bot.username, "TestBot")
        self.assertEqual(bot.discriminator, "1234")
        self.assertEqual(str(bot), "TestBot#1234")

    def test_create_bot_username_discriminator(self):
        """Test creating a Bot with the new username system (discriminator '0')."""
        bot = Bot.objects.create(
            id=987654321098765432,
            username="NewBot",
            discriminator="0",
        )
        self.assertEqual(bot.discriminator, "0")
        self.assertEqual(str(bot), "NewBot#0")

    def test_bot_invalid_discriminator(self):
        """Test that a Bot cannot be created with an invalid discriminator."""
        with self.assertRaises(ValidationError):
            bot = Bot(id=1, username="BadBot", discriminator="123")
            bot.full_clean()  # Validators are run on full_clean

    def test_bot_invalid_shard_count(self):
        """Test that a Bot cannot be created with a negative shard count."""
        with self.assertRaises(ValidationError):
            bot = Bot(id=1, username="BadBot", discriminator="1234", shard_count=-1)
            bot.full_clean()


class CommandStatModelTest(TestCase):
    """Tests for the CommandStat model."""

    @classmethod
    def setUpTestData(cls):
        """Set up data for the whole test case."""
        cls.user = User.objects.create_user(username="testuser", id=1)
        cls.bot = Bot.objects.create(id=1, username="TestBot", discriminator="1234")

    def test_create_command_stat(self):
        """Test creating a CommandStat instance."""
        stat = CommandStat.objects.create(
            user=self.user,
            bot=self.bot,
            command="test_command",
            used=5,
        )
        self.assertEqual(stat.user, self.user)
        self.assertEqual(stat.bot, self.bot)
        self.assertEqual(stat.command, "test_command")
        self.assertEqual(stat.used, 5)
        self.assertIsNotNone(stat.last_used)
        self.assertEqual(str(stat), "test_command: 5")

    def test_command_stat_default_used(self):
        """Test that 'used' defaults to 1."""
        stat = CommandStat.objects.create(
            user=self.user, bot=self.bot, command="another_command"
        )
        self.assertEqual(stat.used, 1)

    def test_command_stat_last_used_updates(self):
        """Test that 'last_used' timestamp is updated on save."""
        stat = CommandStat.objects.create(
            user=self.user, bot=self.bot, command="update_test"
        )
        first_timestamp = stat.last_used
        # Ensure some time passes
        stat.used = 2
        stat.save()
        self.assertGreater(stat.last_used, first_timestamp)

    def test_command_stat_invalid_used(self):
        """Test that 'used' cannot be less than 1."""
        with self.assertRaises(ValidationError):
            stat = CommandStat(
                user=self.user, bot=self.bot, command="bad_command", used=0
            )
            stat.full_clean()

    def test_command_stat_unique_constraint(self):
        """Test the unique constraint on (user, command, bot)."""
        CommandStat.objects.create(
            user=self.user, bot=self.bot, command="unique_command"
        )
        with self.assertRaises(IntegrityError):
            CommandStat.objects.create(
                user=self.user, bot=self.bot, command="unique_command"
            )


class InitiativeTracker20thModelTest(TestCase):
    """Tests for the InitiativeTracker20th model."""

    @classmethod
    def setUpTestData(cls):
        """Set up data for the whole test case."""
        user = User.objects.create_user(username="storyteller", id=2)
        cls.chronicle = Chronicle.objects.create(
            name="Test Chronicle",
            game_type="V20",
            storyteller_id=user.pk,
        )

    def test_create_initiative_tracker(self):
        """Test creating an InitiativeTracker20th instance."""
        tracker_data = {"turn": 1, "combatants": []}
        tracker = InitiativeTracker20th.objects.create(
            id=12345,  # Channel ID
            chronicle=self.chronicle,
            data=tracker_data,
        )
        self.assertEqual(tracker.id, 12345)
        self.assertEqual(tracker.chronicle, self.chronicle)
        self.assertEqual(tracker.data, tracker_data)
        self.assertIsNotNone(tracker.last_updated)
        self.assertEqual(str(tracker), "InitiativeTracker20th(channel=12345)")

    def test_initiative_tracker_last_updated_updates(self):
        """Test that 'last_updated' timestamp is updated on save."""
        tracker = InitiativeTracker20th.objects.create(
            id=54321, chronicle=self.chronicle, data={}
        )
        first_timestamp = tracker.last_updated
        tracker.data = {"new": "data"}
        tracker.save()
        self.assertGreater(tracker.last_updated, first_timestamp)
