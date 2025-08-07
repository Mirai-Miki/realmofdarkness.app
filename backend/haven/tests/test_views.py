"""
Tests for Haven API views.

This module tests the character management API endpoints including
authentication, CRUD operations, error handling, and proper status codes.
"""

import json
from typing import Dict, Any
from django.urls import reverse
from rest_framework import status

from haven.models import Character
from haven.types import Splats
from .test_base import HavenAPITestCase


class CharacterViewTestCase(HavenAPITestCase):
    """Test cases for CharacterView API endpoint."""

    def setUp(self) -> None:
        """Set up test data."""
        super().setUp()
        self.create_url = reverse("character-create")

        # Create a test character for detail tests
        self.character_data = self.get_valid_character_data()
        self.character = Character.objects.create(user=self.user, **self.character_data)
        self.detail_url = reverse(
            "character-detail", kwargs={"character_id": str(self.character.pk)}
        )

    def test_authentication_required(self) -> None:
        """Test that all endpoints require authentication."""
        self.remove_authentication()

        # Test GET without auth
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test POST without auth
        response = self.client.post(self.create_url, data={})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test PUT without auth
        response = self.client.put(self.detail_url, data={})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test DELETE without auth
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_character_success(self) -> None:
        """Test successful character retrieval."""
        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = json.loads(response.content)  # type: ignore
        self.assertIn("name", response_data)
        self.assertEqual(response_data["name"], self.character.name)
        self.assertEqual(response_data["splat"], self.character.splat)

    def test_get_character_not_found(self) -> None:
        """Test character retrieval with invalid ID."""
        invalid_url = reverse("character-detail", kwargs={"character_id": "999999"})
        response = self.client.get(invalid_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        response_data = json.loads(response.content)  # type: ignore
        self.assertIn("error", response_data)

    def test_get_character_without_id_fails(self) -> None:
        """Test that GET without character ID returns 400."""
        response = self.client.get(self.create_url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response_data = json.loads(response.content)  # type: ignore
        self.assertIn("error", response_data)
        self.assertIn("Character ID is required", response_data["error"])

    def test_get_other_users_character_fails(self) -> None:
        """Test that users cannot access other users' characters."""
        # Create character for other user
        other_character = Character.objects.create(
            user=self.other_user,
            **self.get_valid_character_data(name="Other User Character"),
        )
        other_url = reverse(
            "character-detail", kwargs={"character_id": str(other_character.pk)}
        )

        response = self.client.get(other_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_character_success(self) -> None:
        """Test successful character creation."""
        data = self.get_valid_character_data(name="New Character", splat="vampire5th")

        response = self.client.post(self.create_url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response_data = json.loads(response.content)  # type: ignore
        self.assertIn("name", response_data)
        self.assertEqual(response_data["name"], "New Character")
        self.assertEqual(response_data["splat"], "vampire5th")

        # Verify character was created in database
        character = Character.objects.get(name="New Character", user=self.user)
        self.assertEqual(character.splat, "vampire5th")

    def test_create_character_missing_name(self) -> None:
        """Test character creation fails without name."""
        data = self.get_valid_character_data()
        del data["name"]

        response = self.client.post(self.create_url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response_data = json.loads(response.content)  # type: ignore
        self.assertIn("error", response_data)

    def test_create_character_missing_splat(self) -> None:
        """Test character creation fails without splat."""
        data = self.get_valid_character_data()
        del data["splat"]

        response = self.client.post(self.create_url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response_data = json.loads(response.content)  # type: ignore
        self.assertIn("error", response_data)

    def test_create_character_invalid_splat(self) -> None:
        """Test character creation fails with invalid splat."""
        data = self.get_valid_character_data(splat="invalid_splat")

        response = self.client.post(self.create_url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response_data = json.loads(response.content)  # type: ignore
        self.assertIn("error", response_data)

    def test_create_character_empty_name(self) -> None:
        """Test character creation fails with empty name."""
        data = self.get_valid_character_data(name="")

        response = self.client.post(self.create_url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response_data = json.loads(response.content)  # type: ignore
        self.assertIn("error", response_data)

    def test_create_character_whitespace_name(self) -> None:
        """Test character creation fails with whitespace-only name."""
        data = self.get_valid_character_data(name="   ")

        response = self.client.post(self.create_url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response_data = json.loads(response.content)  # type: ignore
        self.assertIn("error", response_data)

    def test_update_character_success(self) -> None:
        """Test successful character update."""
        update_data = {
            "name": "Updated Character Name",
            "age": "30",
            "appearance_description": "Updated description",
        }

        response = self.client.put(self.detail_url, data=update_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = json.loads(response.content)  # type: ignore
        self.assertEqual(response_data["name"], "Updated Character Name")

        # Verify character was updated in database
        self.character.refresh_from_db()
        self.assertEqual(self.character.name, "Updated Character Name")

    def test_update_character_without_id_fails(self) -> None:
        """Test that PUT without character ID returns 400."""
        response = self.client.put(self.create_url, data={}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response_data = json.loads(response.content)  # type: ignore
        self.assertIn("error", response_data)
        self.assertIn("Character ID is required", response_data["error"])

    def test_update_other_users_character_fails(self) -> None:
        """Test that users cannot update other users' characters."""
        other_character = Character.objects.create(
            user=self.other_user,
            **self.get_valid_character_data(name="Other User Character"),
        )
        other_url = reverse(
            "character-detail", kwargs={"character_id": str(other_character.pk)}
        )

        response = self.client.put(other_url, data={"name": "Hacked"}, format="json")
        self.assertNotEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_character_success(self) -> None:
        """Test successful character deletion."""
        character_id = self.character.pk

        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = json.loads(response.content)  # type: ignore
        self.assertIn("message", response_data)
        self.assertIn("deleted successfully", response_data["message"])

        # Verify character was deleted from database
        self.assertFalse(Character.objects.filter(pk=character_id).exists())

    def test_delete_character_without_id_fails(self) -> None:
        """Test that DELETE without character ID returns 400."""
        response = self.client.delete(self.create_url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response_data = json.loads(response.content)  # type: ignore
        self.assertIn("error", response_data)
        self.assertIn("Character ID is required", response_data["error"])

    def test_delete_other_users_character_fails(self) -> None:
        """Test that users cannot delete other users' characters."""
        other_character = Character.objects.create(
            user=self.other_user,
            **self.get_valid_character_data(name="Other User Character"),
        )
        other_url = reverse(
            "character-detail", kwargs={"character_id": str(other_character.pk)}
        )

        response = self.client.delete(other_url)
        self.assertNotEqual(response.status_code, status.HTTP_200_OK)

        # Verify character still exists
        self.assertTrue(Character.objects.filter(pk=other_character.pk).exists())

    def test_delete_nonexistent_character_fails(self) -> None:
        """Test deletion of non-existent character."""
        invalid_url = reverse("character-detail", kwargs={"character_id": "999999"})
        response = self.client.delete(invalid_url)

        self.assertNotEqual(response.status_code, status.HTTP_200_OK)

    def test_create_character_with_chronicle(self) -> None:
        """Test character creation with chronicle association."""
        data = self.get_valid_character_data(
            name="Chronicle Character", chronicle_id=str(self.chronicle.pk)
        )

        response = self.client.post(self.create_url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify character was associated with chronicle
        character = Character.objects.get(name="Chronicle Character", user=self.user)
        self.assertEqual(character.chronicle, self.chronicle)

    def test_create_character_invalid_chronicle(self) -> None:
        """Test character creation with invalid chronicle ID."""
        data = self.get_valid_character_data(
            name="Invalid Chronicle Character", chronicle_id="999999"
        )

        response = self.client.post(self.create_url, data=data, format="json")

        self.assertNotEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_character_unauthorized_chronicle(self) -> None:
        """Test character creation with chronicle user is not member of."""
        # Create chronicle with other user as owner
        other_chronicle = self.create_test_chronicle(
            name="Other Chronicle", owner=self.other_user
        )

        data = self.get_valid_character_data(
            name="Unauthorized Chronicle Character",
            chronicle_id=str(other_chronicle.pk),
        )

        response = self.client.post(self.create_url, data=data, format="json")

        self.assertNotEqual(response.status_code, status.HTTP_201_CREATED)

    def test_error_response_format(self) -> None:
        """Test that error responses have consistent format."""
        # Test with missing name
        data = self.get_valid_character_data()
        del data["name"]

        response = self.client.post(self.create_url, data=data, format="json")

        response_data = json.loads(response.content)  # type: ignore
        self.assertIn("error", response_data)
        self.assertIsInstance(response_data["error"], str)

    def test_content_type_handling(self) -> None:
        """Test that endpoint handles different content types."""
        data = self.get_valid_character_data(name="Content Type Test")

        # Test JSON
        response = self.client.post(self.create_url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Test form data
        response = self.client.post(self.create_url, data=data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
