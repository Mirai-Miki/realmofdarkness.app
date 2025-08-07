"""
Tests for Haven serializers.

This module tests the character serializers including validation,
data transformation, and proper handling of different character types.
"""

from typing import Dict, Any
from django.test import TestCase
from django.contrib.auth import get_user_model

from haven.models import Character
from haven.serializers.serializer_registry import SerializerRegistry
from haven.types import Splats
from .test_base import HavenTestCase


class SerializerTestCase(HavenTestCase):
    """Test cases for character serializers."""

    def test_human5th_serializer_valid_data(self) -> None:
        """Test Human5th serializer with valid data."""
        serializer_class = SerializerRegistry.get_serializer(
            Splats.HUMAN_5TH, "deserializer"
        )

        data = self.get_valid_character_data(splat="human5th")
        data.update(
            {
                "humanity": 7,
                "stains": 0,
            }
        )

        serializer = serializer_class(
            data=data,
            context={
                "user": self.user,
                "chronicle": None,
                "member": None,
                "is_owner": True,
            },
        )

        self.assertTrue(
            serializer.is_valid(), f"Serializer errors: {serializer.errors}"
        )
        instance = serializer.save()

        self.assertIsNotNone(instance)
        self.assertEqual(instance.name, data["name"])  # type: ignore
        self.assertEqual(instance.splat, "human5th")  # type: ignore

    def test_vampire5th_serializer_valid_data(self) -> None:
        """Test Vampire5th serializer with valid data."""
        serializer_class = SerializerRegistry.get_serializer(
            Splats.VAMPIRE_5TH, "deserializer"
        )

        data = self.get_valid_character_data(splat="vampire5th")
        data.update(
            {
                "humanity": 7,
                "stains": 0,
                "hunger": 1,
                "blood_potency": 1,
                "clan": "Brujah",
            }
        )

        serializer = serializer_class(
            data=data,
            context={
                "user": self.user,
                "chronicle": None,
                "member": None,
                "is_owner": True,
            },
        )

        self.assertTrue(
            serializer.is_valid(), f"Serializer errors: {serializer.errors}"
        )
        instance = serializer.save()

        self.assertIsNotNone(instance)
        self.assertEqual(instance.name, data["name"])  # type: ignore
        self.assertEqual(instance.splat, "vampire5th")  # type: ignore

    def test_serializer_missing_required_fields(self) -> None:
        """Test serializer validation with missing required fields."""
        serializer_class = SerializerRegistry.get_serializer(
            Splats.HUMAN_5TH, "deserializer"
        )

        # Missing name
        data = self.get_valid_character_data(splat="human5th")
        del data["name"]

        serializer = serializer_class(
            data=data,
            context={
                "user": self.user,
                "chronicle": None,
                "member": None,
                "is_owner": True,
            },
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    def test_serializer_invalid_field_values(self) -> None:
        """Test serializer validation with invalid field values."""
        serializer_class = SerializerRegistry.get_serializer(
            Splats.HUMAN_5TH, "deserializer"
        )

        data = self.get_valid_character_data(splat="human5th")
        data.update(
            {
                "humanity": 15,  # Invalid - max is 10
            }
        )

        serializer = serializer_class(
            data=data,
            context={
                "user": self.user,
                "chronicle": None,
                "member": None,
                "is_owner": True,
            },
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("humanity", serializer.errors)

    def test_sheet_serializer_output(self) -> None:
        """Test sheet serializer output format."""
        # Create a character
        character = Character.objects.create(
            user=self.user, **self.get_valid_character_data(splat="human5th")
        )

        # Get sheet serializer
        sheet_serializer_class = SerializerRegistry.get_serializer(
            Splats.HUMAN_5TH, "sheet"
        )
        serializer = sheet_serializer_class(character)

        data = serializer.data

        # Verify basic fields are present
        self.assertIn("name", data)  # type: ignore
        self.assertIn("splat", data)  # type: ignore
        self.assertIn("user", data)  # type: ignore
        self.assertIn("created_at", data)  # type: ignore
        self.assertEqual(data["name"], character.name)  # type: ignore
        self.assertEqual(data["splat"], character.splat)  # type: ignore

    def test_tracker_serializer_output(self) -> None:
        """Test tracker serializer output format."""
        # Create a character
        character = Character.objects.create(
            user=self.user, **self.get_valid_character_data(splat="human5th")
        )

        # Get tracker serializer
        tracker_serializer_class = SerializerRegistry.get_serializer(
            Splats.HUMAN_5TH, "tracker"
        )
        serializer = tracker_serializer_class(character)

        data = serializer.data

        # Verify basic fields are present
        self.assertIn("name", data)  # type: ignore
        self.assertIn("splat", data)  # type: ignore
        self.assertEqual(data["name"], character.name)  # type: ignore
        self.assertEqual(data["splat"], character.splat)  # type: ignore

    def test_serializer_registry_all_splats(self) -> None:
        """Test that serializer registry has entries for all splats."""
        for splat in Splats:
            with self.subTest(splat=splat.value):
                # Test that all serializer types exist
                try:
                    deserializer = SerializerRegistry.get_serializer(
                        splat, "deserializer"
                    )
                    sheet = SerializerRegistry.get_serializer(splat, "sheet")
                    tracker = SerializerRegistry.get_serializer(splat, "tracker")

                    self.assertIsNotNone(deserializer)
                    self.assertIsNotNone(sheet)
                    self.assertIsNotNone(tracker)
                except KeyError as e:
                    self.fail(f"Missing serializer for {splat.value}: {e}")

    def test_serializer_context_validation(self) -> None:
        """Test that serializers properly use context."""
        serializer_class = SerializerRegistry.get_serializer(
            Splats.HUMAN_5TH, "deserializer"
        )

        data = self.get_valid_character_data(splat="human5th")

        # Test with minimal context
        serializer = serializer_class(
            data=data,
            context={
                "user": self.user,
                "chronicle": None,
                "member": None,
                "is_owner": True,
            },
        )

        self.assertTrue(
            serializer.is_valid(), f"Serializer errors: {serializer.errors}"
        )

        # Test with chronicle context
        serializer_with_chronicle = serializer_class(
            data=data,
            context={
                "user": self.user,
                "chronicle": self.chronicle,
                "member": self.member,
                "is_owner": True,
            },
        )

        self.assertTrue(serializer_with_chronicle.is_valid())

    def test_character_creation_sets_user_correctly(self) -> None:
        """Test that character creation sets the user field correctly."""
        serializer_class = SerializerRegistry.get_serializer(
            Splats.HUMAN_5TH, "deserializer"
        )

        data = self.get_valid_character_data(splat="human5th")

        serializer = serializer_class(
            data=data,
            context={
                "user": self.user,
                "chronicle": None,
                "member": None,
                "is_owner": True,
            },
        )

        self.assertTrue(serializer.is_valid())
        character = serializer.save()

        self.assertEqual(character.user, self.user)  # type: ignore

    def test_character_creation_sets_chronicle_correctly(self) -> None:
        """Test that character creation sets chronicle and member correctly."""
        serializer_class = SerializerRegistry.get_serializer(
            Splats.HUMAN_5TH, "deserializer"
        )

        data = self.get_valid_character_data(splat="human5th")

        serializer = serializer_class(
            data=data,
            context={
                "user": self.user,
                "chronicle": self.chronicle,
                "member": self.member,
                "is_owner": True,
            },
        )

        self.assertTrue(serializer.is_valid())
        character = serializer.save()

        self.assertEqual(character.user, self.user)  # type: ignore
        self.assertEqual(character.chronicle, self.chronicle)  # type: ignore
        self.assertEqual(character.member, self.member)  # type: ignore

    def test_serializer_handles_optional_fields(self) -> None:
        """Test that serializers properly handle optional fields."""
        serializer_class = SerializerRegistry.get_serializer(
            Splats.HUMAN_5TH, "deserializer"
        )

        # Minimal data with only required fields
        data = {"name": "Minimal Character", "splat": "human5th"}

        serializer = serializer_class(
            data=data,
            context={
                "user": self.user,
                "chronicle": None,
                "member": None,
                "is_owner": True,
            },
        )

        self.assertTrue(
            serializer.is_valid(), f"Serializer errors: {serializer.errors}"
        )
        character = serializer.save()

        self.assertEqual(character.name, "Minimal Character")  # type: ignore
        self.assertEqual(character.splat, "human5th")  # type: ignore

    def test_serializer_field_validation_ranges(self) -> None:
        """Test that serializers validate field ranges correctly."""
        serializer_class = SerializerRegistry.get_serializer(
            Splats.HUMAN_5TH, "deserializer"
        )

        # Test humanity out of range
        test_cases = [
            {"humanity": -1, "should_fail": True},
            {"humanity": 0, "should_fail": False},
            {"humanity": 5, "should_fail": False},
            {"humanity": 10, "should_fail": False},
            {"humanity": 11, "should_fail": True},
        ]

        for case in test_cases:
            with self.subTest(humanity=case["humanity"]):
                data = self.get_valid_character_data(splat="human5th")
                data["humanity"] = case["humanity"]

                serializer = serializer_class(
                    data=data,
                    context={
                        "user": self.user,
                        "chronicle": None,
                        "member": None,
                        "is_owner": True,
                    },
                )

                if case["should_fail"]:
                    self.assertFalse(serializer.is_valid())
                    self.assertIn("humanity", serializer.errors)
                else:
                    self.assertTrue(
                        serializer.is_valid(),
                        f"Unexpected validation error: {serializer.errors}",
                    )

    def test_serializer_update_character(self) -> None:
        """Test that serializers can update existing characters."""
        # Create initial character
        character = Character.objects.create(
            user=self.user,
            **self.get_valid_character_data(splat="human5th", name="Original Name"),
        )

        # Update with serializer
        serializer_class = SerializerRegistry.get_serializer(
            Splats.HUMAN_5TH, "deserializer"
        )

        update_data = {
            "name": "Updated Name",
            "age": "30",
            "appearance_description": "Updated description",
        }

        serializer = serializer_class(
            character,
            data=update_data,
            partial=True,
            context={
                "user": self.user,
                "chronicle": None,
                "member": None,
                "is_owner": True,
            },
        )

        self.assertTrue(
            serializer.is_valid(), f"Serializer errors: {serializer.errors}"
        )
        updated_character = serializer.save()

        self.assertEqual(updated_character.name, "Updated Name")  # type: ignore
        self.assertEqual(updated_character.age, "30")  # type: ignore
        self.assertEqual(updated_character.appearance_description, "Updated description")  # type: ignore
