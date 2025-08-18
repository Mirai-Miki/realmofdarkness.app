"""
Tests for the serializers in the bot app.
"""

from __future__ import annotations

from typing import cast
from django.contrib.auth import get_user_model
from django.test import TestCase

from bot.models import Bot, CommandStat, InitiativeTracker20th
from bot.serializers import (
    BotSerializer,
    CommandStatSerializer,
    InitiativeTracker20thSerializer,
)
from chronicle.models import Chronicle

User = get_user_model()


class BotSerializerTest(TestCase):
    """Tests for the BotSerializer."""

    def test_serialization(self):
        """Test serializing a Bot instance."""
        bot = Bot.objects.create(
            id=123, username="TestBot", discriminator="1234", shard_count=1
        )
        serializer = BotSerializer(instance=bot)
        data = serializer.data
        self.assertEqual(data["id"], "123")  # type: ignore
        self.assertEqual(data["username"], "TestBot")  # type: ignore
        self.assertEqual(data["discriminator"], "1234")  # type: ignore
        self.assertEqual(data["shard_count"], 1)  # type: ignore

    def test_deserialization_and_create(self):
        """Test deserializing valid data to create a Bot."""
        data = {
            "id": "456",
            "username": "NewBot",
            "discriminator": "5678",
            "avatar_url": "http://example.com/avatar.png",
            "shard_count": 3,
        }
        serializer = BotSerializer(data=data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        bot = cast(Bot, serializer.save())
        self.assertEqual(bot.id, 456)  # Stored as int
        self.assertEqual(bot.username, "NewBot")

    def test_deserialization_and_update(self):
        """Test deserializing valid data to update a Bot."""
        bot = Bot.objects.create(id=789, username="OldBot", discriminator="9876")
        data = {"username": "UpdatedBot", "shard_count": 5}
        serializer = BotSerializer(instance=bot, data=data, partial=True)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        updated_bot = cast(Bot, serializer.save())
        self.assertEqual(updated_bot.username, "UpdatedBot")
        self.assertEqual(updated_bot.shard_count, 5)
        self.assertEqual(updated_bot.id, 789)  # ID should not change

    def test_invalid_data(self):
        """Test deserialization with invalid data."""
        # Invalid discriminator
        data = {"id": "111", "username": "FailBot", "discriminator": "123"}
        serializer = BotSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("discriminator", serializer.errors)

        # Invalid shard_count
        data = {
            "id": "222",
            "username": "FailBot",
            "discriminator": "1234",
            "shard_count": -1,
        }
        serializer = BotSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("shard_count", serializer.errors)


class CommandStatSerializerTest(TestCase):
    """Tests for the CommandStatSerializer."""

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(username="testuser", id=1)
        cls.bot = Bot.objects.create(id=1, username="TestBot", discriminator="1234")
        cls.stat = CommandStat.objects.create(
            user=cls.user, bot=cls.bot, command="test", used=10
        )

    def test_serialization(self):
        """Test serializing a CommandStat instance."""
        serializer = CommandStatSerializer(instance=self.stat)
        data = serializer.data
        self.assertIsNotNone(data.pop("id"))  # type: ignore
        self.assertEqual(data["user_id"], str(self.user.id))  # type: ignore
        self.assertEqual(data["bot_id"], str(self.bot.id))  # type: ignore
        self.assertEqual(data["command"], "test")  # type: ignore
        self.assertEqual(data["used"], 10)  # type: ignore
        self.assertIn("last_used", data)

    def test_serialization_with_related(self):
        """Test serialization with nested related objects."""
        serializer = CommandStatSerializer(instance=self.stat).with_related()  # type: ignore
        data = serializer.data
        self.assertIsInstance(data["user"], dict)
        self.assertIsInstance(data["bot"], dict)
        self.assertEqual(data["user"]["username"], self.user.username)
        self.assertEqual(data["bot"]["username"], self.bot.username)

    def test_deserialization_and_create(self):
        """Test deserializing valid data to create a CommandStat."""
        data = {
            "user_id": self.user.pk,
            "bot_id": self.bot.id,
            "command": "new_command",
            "used": 1,
        }
        serializer = CommandStatSerializer(data=data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        stat = cast(CommandStat, serializer.save())
        self.assertEqual(stat.user, self.user)
        self.assertEqual(stat.bot, self.bot)
        self.assertEqual(stat.command, "new_command")

    def test_deserialization_and_update(self):
        """Test deserializing valid data to update a CommandStat."""
        data = {"used": 20}
        serializer = CommandStatSerializer(instance=self.stat, data=data, partial=True)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        updated_stat = cast(CommandStat, serializer.save())
        self.assertEqual(updated_stat.used, 20)
        # Check that FKs are not changed
        self.assertEqual(updated_stat.user, self.user)
        self.assertEqual(updated_stat.bot, self.bot)


class InitiativeTracker20thSerializerTest(TestCase):
    """Tests for the InitiativeTracker20thSerializer."""

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(username="storyteller", id=2)
        cls.chronicle = Chronicle.objects.create(
            name="Test Chronicle", game_type="V20", storyteller_id=cls.user.pk
        )
        cls.tracker = InitiativeTracker20th.objects.create(
            id=12345, chronicle=cls.chronicle, data={"turn": 1}
        )

    def test_serialization(self):
        """Test serializing an InitiativeTracker20th instance."""
        serializer = InitiativeTracker20thSerializer(instance=self.tracker)
        data = serializer.data
        self.assertEqual(data["id"], "12345")  # type: ignore
        self.assertEqual(data["chronicle_id"], str(self.chronicle.id))  # type: ignore
        self.assertEqual(data["data"], {"turn": 1})  # type: ignore
        self.assertIn("last_updated", data)

    def test_serialization_with_related(self):
        """Test serialization with nested chronicle object."""
        serializer = InitiativeTracker20thSerializer(
            instance=self.tracker
        ).with_related()  # type: ignore
        data = serializer.data
        self.assertIsInstance(data["chronicle"], dict)
        self.assertEqual(data["chronicle"]["name"], self.chronicle.name)

    def test_deserialization_and_create(self):
        """Test deserializing valid data to create a tracker."""
        data = {
            "id": "54321",
            "chronicle_id": self.chronicle.id,
            "data": {"combatants": ["a", "b"]},
        }
        serializer = InitiativeTracker20thSerializer(data=data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        tracker = cast(InitiativeTracker20th, serializer.save())
        self.assertEqual(tracker.id, 54321)  # Stored as int
        self.assertEqual(tracker.chronicle, self.chronicle)
        self.assertEqual(tracker.data, {"combatants": ["a", "b"]})

    def test_deserialization_and_update(self):
        """Test deserializing valid data to update a tracker."""
        data = {"data": {"turn": 2}}
        serializer = InitiativeTracker20thSerializer(
            instance=self.tracker, data=data, partial=True
        )
        self.assertTrue(serializer.is_valid(raise_exception=True))
        updated_tracker = cast(InitiativeTracker20th, serializer.save())
        self.assertEqual(updated_tracker.data, {"turn": 2})
        self.assertEqual(updated_tracker.id, 12345)  # ID should not change
