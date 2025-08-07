"""
Tests for CharacterManager service.

This module tests the CharacterManager business logic including
character creation, retrieval, updates, deletion, and validation.
"""

from typing import Dict, Any
from django.test import TestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock

from haven.character_manager import CharacterManager
from haven.models import Character
from haven.types import Splats
from haven.errors import (
    CharacterNotFoundError,
    ChronicleNotFoundError,
    PermissionDeniedError,
    ValidationError,
    CharacterLimitExceededError,
)
from .test_base import HavenTestCase


class CharacterManagerTestCase(HavenTestCase):
    """Test cases for CharacterManager service."""

    def test_create_character_success(self) -> None:
        """Test successful character creation."""
        character_data = self.get_valid_character_data()

        result = CharacterManager.create_character(
            requester=self.user, character_data=character_data
        )

        self.assertIsInstance(result, dict)
        self.assertIn("name", result)
        self.assertEqual(result["name"], character_data["name"])
        self.assertEqual(result["splat"], character_data["splat"])

        # Verify character was created in database
        character = Character.objects.get(name=character_data["name"], user=self.user)
        self.assertEqual(character.splat, character_data["splat"])

    def test_create_character_missing_name(self) -> None:
        """Test character creation fails without name."""
        character_data = self.get_valid_character_data()
        del character_data["name"]

        with self.assertRaises(ValidationError) as context:
            CharacterManager.create_character(
                requester=self.user, character_data=character_data
            )

        self.assertIn("name is required", str(context.exception.message))

    def test_create_character_empty_name(self) -> None:
        """Test character creation fails with empty name."""
        character_data = self.get_valid_character_data(name="")

        with self.assertRaises(ValidationError) as context:
            CharacterManager.create_character(
                requester=self.user, character_data=character_data
            )

        self.assertIn("name is required", str(context.exception.message))

    def test_create_character_whitespace_name(self) -> None:
        """Test character creation fails with whitespace-only name."""
        character_data = self.get_valid_character_data(name="   ")

        with self.assertRaises(ValidationError) as context:
            CharacterManager.create_character(
                requester=self.user, character_data=character_data
            )

        self.assertIn("name is required", str(context.exception.message))

    def test_create_character_missing_splat(self) -> None:
        """Test character creation fails without splat."""
        character_data = self.get_valid_character_data()
        del character_data["splat"]

        with self.assertRaises(ValidationError) as context:
            CharacterManager.create_character(
                requester=self.user, character_data=character_data
            )

        self.assertIn("splat is required", str(context.exception.message))

    def test_create_character_invalid_splat(self) -> None:
        """Test character creation fails with invalid splat."""
        character_data = self.get_valid_character_data(splat="invalid_splat")

        with self.assertRaises(ValidationError) as context:
            CharacterManager.create_character(
                requester=self.user, character_data=character_data
            )

        self.assertIn("Invalid splat", str(context.exception.message))

    def test_create_character_missing_requester(self) -> None:
        """Test character creation fails without requester."""
        character_data = self.get_valid_character_data()

        with self.assertRaises(ValidationError) as context:
            CharacterManager.create_character(
                requester=None, character_data=character_data  # type: ignore
            )

        self.assertIn("user is required", str(context.exception.message))

    def test_create_character_with_chronicle(self) -> None:
        """Test character creation with chronicle association."""
        character_data = self.get_valid_character_data(
            chronicle_id=str(self.chronicle.pk)
        )

        result = CharacterManager.create_character(
            requester=self.user, character_data=character_data
        )

        # Verify character was associated with chronicle
        character = Character.objects.get(name=character_data["name"], user=self.user)
        self.assertEqual(character.chronicle, self.chronicle)

    def test_create_character_invalid_chronicle(self) -> None:
        """Test character creation with invalid chronicle ID."""
        character_data = self.get_valid_character_data(chronicle_id="999999")

        with self.assertRaises(ChronicleNotFoundError):
            CharacterManager.create_character(
                requester=self.user, character_data=character_data
            )

    def test_create_character_unauthorized_chronicle(self) -> None:
        """Test character creation with chronicle user is not member of."""
        # Create chronicle with other user as owner (no membership for self.user)
        other_chronicle = self.create_test_chronicle(
            name="Other Chronicle", owner=self.other_user
        )

        character_data = self.get_valid_character_data(
            chronicle_id=str(other_chronicle.pk)
        )

        with self.assertRaises(PermissionDeniedError):
            CharacterManager.create_character(
                requester=self.user, character_data=character_data
            )

    @patch("haven.character_manager.CharacterManager._is_at_character_limit")
    def test_create_character_limit_exceeded(self, mock_limit_check: MagicMock) -> None:
        """Test character creation fails when limit is exceeded."""
        mock_limit_check.return_value = False  # At limit

        character_data = self.get_valid_character_data()

        with self.assertRaises(CharacterLimitExceededError):
            CharacterManager.create_character(
                requester=self.user, character_data=character_data
            )

    def test_get_character_by_id_success(self) -> None:
        """Test successful character retrieval by ID."""
        # Create a character
        character = Character.objects.create(
            user=self.user, **self.get_valid_character_data()
        )

        result = CharacterManager.get_character_by_id(
            character_id=str(character.pk),
            requester_id=str(self.user.pk),
            serializer_type="sheet",
        )

        self.assertIsInstance(result, list)
        self.assertEqual(len(result), 1)
        self.assertIn("name", result[0])
        self.assertEqual(result[0]["name"], character.name)

    def test_get_character_by_id_not_found(self) -> None:
        """Test character retrieval with invalid ID."""
        result = CharacterManager.get_character_by_id(
            character_id="999999",
            requester_id=str(self.user.pk),
            serializer_type="sheet",
        )

        self.assertEqual(result, [])

    def test_get_character_by_id_permission_denied(self) -> None:
        """Test character retrieval fails for other user's character."""
        # Create character for other user
        other_character = Character.objects.create(
            user=self.other_user,
            **self.get_valid_character_data(name="Other User Character"),
        )

        result = CharacterManager.get_character_by_id(
            character_id=str(other_character.pk),
            requester_id=str(self.user.pk),
            serializer_type="sheet",
        )

        # Should return empty list for unauthorized access
        self.assertEqual(result, [])

    def test_update_character_success(self) -> None:
        """Test successful character update."""
        character = Character.objects.create(
            user=self.user, **self.get_valid_character_data()
        )

        update_data = {"name": "Updated Name", "age": "30"}

        result = CharacterManager.update_character(
            character_id=str(character.pk), update_data=update_data, requester=self.user
        )

        self.assertIsInstance(result, dict)
        self.assertEqual(result["name"], "Updated Name")

        # Verify character was updated in database
        character.refresh_from_db()
        self.assertEqual(character.name, "Updated Name")

    def test_update_character_not_found(self) -> None:
        """Test character update with invalid ID."""
        update_data = {"name": "Updated Name"}

        with self.assertRaises(CharacterNotFoundError):
            CharacterManager.update_character(
                character_id="999999", update_data=update_data, requester=self.user
            )

    def test_update_character_permission_denied(self) -> None:
        """Test character update fails for other user's character."""
        other_character = Character.objects.create(
            user=self.other_user,
            **self.get_valid_character_data(name="Other User Character"),
        )

        update_data = {"name": "Hacked Name"}

        with self.assertRaises(PermissionDeniedError):
            CharacterManager.update_character(
                character_id=str(other_character.pk),
                update_data=update_data,
                requester=self.user,
            )

    def test_delete_character_success(self) -> None:
        """Test successful character deletion."""
        character = Character.objects.create(
            user=self.user, **self.get_valid_character_data()
        )
        character_id = character.pk

        CharacterManager.delete_character(
            character_id=str(character_id), requester_id=str(self.user.pk)
        )

        # Verify character was deleted from database
        self.assertFalse(Character.objects.filter(pk=character_id).exists())

    def test_delete_character_not_found(self) -> None:
        """Test character deletion with invalid ID."""
        with self.assertRaises(CharacterNotFoundError):
            CharacterManager.delete_character(
                character_id="999999", requester_id=str(self.user.pk)
            )

    def test_delete_character_permission_denied(self) -> None:
        """Test character deletion fails for other user's character."""
        other_character = Character.objects.create(
            user=self.other_user,
            **self.get_valid_character_data(name="Other User Character"),
        )

        with self.assertRaises(PermissionDeniedError):
            CharacterManager.delete_character(
                character_id=str(other_character.pk), requester_id=str(self.user.pk)
            )

        # Verify character still exists
        self.assertTrue(Character.objects.filter(pk=other_character.pk).exists())

    def test_get_characters_by_user_success(self) -> None:
        """Test successful retrieval of user's characters."""
        # Create multiple characters
        character1 = Character.objects.create(
            user=self.user,
            **self.get_valid_character_data(name="Character 1", splat="human5th"),
        )
        character2 = Character.objects.create(
            user=self.user,
            **self.get_valid_character_data(name="Character 2", splat="vampire5th"),
        )

        result = CharacterManager.get_characters_by_user(
            user_id=str(self.user.pk),
            requester_id=str(self.user.pk),
            serializer_type="sheet",
        )

        self.assertIsInstance(result, list)
        self.assertEqual(len(result), 2)

        # Verify both characters are in results
        names = [char["name"] for char in result]
        self.assertIn("Character 1", names)
        self.assertIn("Character 2", names)

    def test_get_characters_by_user_with_splat_filter(self) -> None:
        """Test character retrieval with splat filtering."""
        # Create characters with different splats
        Character.objects.create(
            user=self.user,
            **self.get_valid_character_data(name="Human", splat="human5th"),
        )
        Character.objects.create(
            user=self.user,
            **self.get_valid_character_data(name="Vampire", splat="vampire5th"),
        )

        # Filter for vampire only
        result = CharacterManager.get_characters_by_user(
            user_id=str(self.user.pk),
            requester_id=str(self.user.pk),
            splat_filter=[Splats.VAMPIRE_5TH],
            serializer_type="sheet",
        )

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["name"], "Vampire")
        self.assertEqual(result[0]["splat"], "vampire5th")

    def test_duplicate_character_name_validation(self) -> None:
        """Test that duplicate character names are not allowed for same user."""
        # Create first character
        Character.objects.create(
            user=self.user, **self.get_valid_character_data(name="Duplicate Name")
        )

        # Try to create second character with same name
        character_data = self.get_valid_character_data(name="Duplicate Name")

        # This should fail due to database unique constraint
        with self.assertRaises(Exception):  # Could be ValidationError or IntegrityError
            CharacterManager.create_character(
                requester=self.user, character_data=character_data
            )

    def test_different_users_can_have_same_character_name(self) -> None:
        """Test that different users can have characters with the same name."""
        character_data = self.get_valid_character_data(name="Same Name")

        # Create character for first user
        CharacterManager.create_character(
            requester=self.user, character_data=character_data
        )

        # Create character with same name for second user - should succeed
        CharacterManager.create_character(
            requester=self.other_user, character_data=character_data
        )

        # Verify both characters exist
        user1_chars = Character.objects.filter(user=self.user, name="Same Name")
        user2_chars = Character.objects.filter(user=self.other_user, name="Same Name")

        self.assertEqual(user1_chars.count(), 1)
        self.assertEqual(user2_chars.count(), 1)
