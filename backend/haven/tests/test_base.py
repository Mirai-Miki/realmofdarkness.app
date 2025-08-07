"""
Base test utilities and fixtures for Haven app tests.

This module provides common test utilities, fixtures, and helper methods
used across all Haven app tests.
"""

from typing import Dict, Any, Optional, cast
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework.authtoken.models import Token

from chronicle.models import Chronicle, Member
from haven.types import Splats
from discordauth.models import User as UserModel

User = cast(UserModel, get_user_model())


class HavenTestCase(TestCase):
    """Base test case for Haven app with common utilities."""

    def setUp(self) -> None:
        """Set up test data."""
        super().setUp()
        self.user = self.create_test_user()
        self.other_user = self.create_test_user(
            username="otheruser", email="other@test.com"
        )
        self.chronicle = self.create_test_chronicle()
        self.member = self.create_test_member()

    def create_test_user(
        self,
        username: str = "testuser",
        email: str = "test@example.com",
        password: str = "testpass123",
    ) -> UserModel:
        """Create a test user."""
        return User.objects.create_user(  # type: ignore
            username=username, email=email, password=password
        )

    def create_test_chronicle(
        self, name: str = "Test Chronicle", owner: Optional[UserModel] = None
    ) -> Chronicle:
        """Create a test chronicle."""
        if owner is None:
            owner = self.user
        return Chronicle.objects.create(
            name=name, owner=owner, description="A test chronicle"
        )

    def create_test_member(
        self, user: Optional[UserModel] = None, chronicle: Optional[Chronicle] = None
    ) -> Member:
        """Create a test chronicle member."""
        if user is None:
            user = self.user
        if chronicle is None:
            chronicle = self.chronicle
        return Member.objects.create(user=user, chronicle=chronicle, is_st=False)

    def get_valid_character_data(
        self, splat: str = "human5th", name: str = "Test Character", **kwargs
    ) -> Dict[str, Any]:
        """Get valid character data for testing."""
        data = {
            "name": name,
            "splat": splat,
            "age": "25",
            "date_of_birth": "1999-01-01",
            "appearance_description": "A test character",
            "history": "Test character history",
            **kwargs,
        }
        return data


class HavenAPITestCase(APITestCase, HavenTestCase):
    """Base API test case for Haven app with authentication."""

    def setUp(self) -> None:
        """Set up test data and API client."""
        super().setUp()
        self.client = APIClient()
        self.token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")  # type: ignore

    def authenticate_as(self, user: UserModel) -> None:
        """Authenticate API client as a specific user."""
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")  # type: ignore

    def remove_authentication(self) -> None:
        """Remove authentication from API client."""
        self.client.credentials()  # type: ignore
