"""
Test configuration and utilities for the discordauth app.

This module provides test configuration, fixtures, and utilities
for comprehensive testing of the Discord authentication system.
"""

import os
from typing import Dict, Any, Optional
from unittest.mock import Mock, patch
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model

from ..models import User
from ..supporter import Supporter


class DiscordAuthTestCase(TestCase):
    """
    Base test case class for Discord authentication tests.

    Provides common fixtures, utilities, and mock configurations
    for testing Discord OAuth integration.
    """

    @classmethod
    def setUpClass(cls) -> None:
        """Set up class-level test fixtures."""
        super().setUpClass()
        cls.User = get_user_model()

    def setUp(self) -> None:
        """Set up test fixtures for each test method."""
        super().setUp()

        # Create test users with different supporter tiers
        self.test_users = self._create_test_users()

        # Set up mock Discord API responses
        self.mock_discord_responses = self._setup_mock_discord_responses()

    def _create_test_users(self) -> Dict[str, User]:
        """
        Create a set of test users with various configurations.

        Returns:
            Dictionary mapping user types to User instances.
        """
        users = {}

        # Basic verified user
        users["verified"] = User.objects.create(
            id=123456789012345678,
            username="verified_user",
            verified=True,
            registered=True,
            supporter=Supporter.NONE,
        )

        # Unverified user
        users["unverified"] = User.objects.create(
            id=234567890123456789,
            username="unverified_user",
            verified=False,
            registered=True,
            supporter=Supporter.NONE,
        )

        # Admin user
        users["admin"] = User.objects.create(
            id=345678901234567890,
            username="admin_user",
            verified=True,
            registered=True,
            admin=True,
            supporter=Supporter.ELDER,
        )

        # Supporter users
        users["fledgling"] = User.objects.create(
            id=456789012345678901,
            username="fledgling_supporter",
            verified=True,
            registered=True,
            supporter=Supporter.FLEDGLING,
        )

        users["elder"] = User.objects.create(
            id=567890123456789012,
            username="elder_supporter",
            verified=True,
            registered=True,
            supporter=Supporter.ELDER,
        )

        # Inactive user
        users["inactive"] = User.objects.create(
            id=678901234567890123,
            username="inactive_user",
            verified=True,
            registered=True,
            is_active=False,
            supporter=Supporter.NONE,
        )

        return users

    def _setup_mock_discord_responses(self) -> Dict[str, Dict[str, Any]]:
        """
        Set up mock Discord API responses for testing.

        Returns:
            Dictionary mapping response types to mock data.
        """
        responses = {}

        # Valid user response
        responses["valid_user"] = {
            "status_code": 200,
            "json_data": {
                "id": "123456789012345678",
                "username": "valid_user",
                "verified": True,
                "email": "valid@example.com",
                "avatar": "avatar_hash",
            },
        }

        # Invalid token response
        responses["invalid_token"] = {
            "status_code": 401,
            "json_data": {"message": "Unauthorized"},
        }

        # Rate limited response
        responses["rate_limited"] = {
            "status_code": 429,
            "json_data": {"message": "Too Many Requests", "retry_after": 1000},
        }

        # Malformed response
        responses["malformed"] = {
            "status_code": 200,
            "json_data": {
                "username": "incomplete_user"
                # Missing required 'id' field
            },
        }

        return responses

    def mock_discord_api_call(
        self,
        response_type: str = "valid_user",
        custom_data: Optional[Dict[str, Any]] = None,
    ) -> Mock:
        """
        Create a mock Discord API call with specified response.

        Args:
            response_type: Type of response to mock ('valid_user', 'invalid_token', etc.)
            custom_data: Custom response data to override defaults

        Returns:
            Mock object configured for Discord API response
        """
        mock_response = Mock()

        if custom_data:
            mock_response.status_code = custom_data.get("status_code", 200)
            mock_response.json.return_value = custom_data.get("json_data", {})
        else:
            response_config = self.mock_discord_responses.get(
                response_type, self.mock_discord_responses["valid_user"]
            )
            mock_response.status_code = response_config["status_code"]
            mock_response.json.return_value = response_config["json_data"]

        return mock_response

    def assertUserValid(self, user: User, expected_data: Dict[str, Any]) -> None:
        """
        Assert that a user matches expected data.

        Args:
            user: User instance to validate
            expected_data: Dictionary of expected user attributes
        """
        self.assertIsNotNone(user)

        for field, expected_value in expected_data.items():
            if hasattr(user, field):
                actual_value = getattr(user, field)
                self.assertEqual(
                    actual_value,
                    expected_value,
                    f"User {field} mismatch: expected {expected_value}, got {actual_value}",
                )

    def assertSupporterTierValid(self, tier: int) -> None:
        """
        Assert that a supporter tier value is valid.

        Args:
            tier: Supporter tier value to validate
        """
        self.assertTrue(
            Supporter.is_valid_tier(tier), f"Invalid supporter tier: {tier}"
        )

        tier_name = Supporter.get_tier_name(tier)
        self.assertNotEqual(
            tier_name, "Unknown", f"Supporter tier {tier} should have a valid name"
        )


class MockDiscordAPI:
    """
    Utility class for mocking Discord API interactions.

    Provides context managers and decorators for comprehensive
    Discord API mocking in tests.
    """

    @staticmethod
    def mock_successful_auth(user_data: Dict[str, Any]):
        """
        Context manager for mocking successful Discord authentication.

        Args:
            user_data: Discord user data to return
        """

        def decorator(func):
            def wrapper(*args, **kwargs):
                with patch("requests.get") as mock_get:
                    mock_response = Mock()
                    mock_response.status_code = 200
                    mock_response.json.return_value = user_data
                    mock_get.return_value = mock_response
                    return func(*args, **kwargs)

            return wrapper

        return decorator

    @staticmethod
    def mock_failed_auth(status_code: int = 401):
        """
        Context manager for mocking failed Discord authentication.

        Args:
            status_code: HTTP status code to return
        """

        def decorator(func):
            def wrapper(*args, **kwargs):
                with patch("requests.get") as mock_get:
                    mock_response = Mock()
                    mock_response.status_code = status_code
                    mock_get.return_value = mock_response
                    return func(*args, **kwargs)

            return wrapper

        return decorator

    @staticmethod
    def mock_network_error():
        """Context manager for mocking network errors."""

        def decorator(func):
            def wrapper(*args, **kwargs):
                with patch("requests.get") as mock_get:
                    mock_get.side_effect = Exception("Network error")
                    return func(*args, **kwargs)

            return wrapper

        return decorator


# Test settings for comprehensive testing
TEST_SETTINGS = {
    "DATABASES": {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        }
    },
    "SECRET_KEY": "test-secret-key-for-discord-auth-tests",
    "DEBUG": True,
    "USE_TZ": True,
    "INSTALLED_APPS": [
        "django.contrib.auth",
        "django.contrib.contenttypes",
        "django.contrib.sessions",
        "django.contrib.messages",
        "rest_framework",
        "discordauth",
    ],
    "REST_FRAMEWORK": {
        "DEFAULT_AUTHENTICATION_CLASSES": [
            "rest_framework.authentication.SessionAuthentication",
        ],
        "DEFAULT_PERMISSION_CLASSES": [
            "rest_framework.permissions.IsAuthenticated",
        ],
    },
    "AUTH_USER_MODEL": "discordauth.User",
    "AUTHENTICATION_BACKENDS": [
        "discordauth.backends.DiscordAuthBackend",
    ],
}


# Test data fixtures
TEST_DISCORD_USERS = {
    "valid_basic": {
        "id": "123456789012345678",
        "username": "test_user",
        "verified": True,
        "email": "test@example.com",
    },
    "valid_supporter": {
        "id": "234567890123456789",
        "username": "supporter_user",
        "verified": True,
        "email": "supporter@example.com",
    },
    "unverified": {
        "id": "345678901234567890",
        "username": "unverified_user",
        "verified": False,
        "email": "unverified@example.com",
    },
    "malformed_missing_id": {
        "username": "no_id_user",
        "verified": True,
        "email": "noid@example.com",
    },
    "malformed_invalid_id": {
        "id": "invalid_snowflake",
        "username": "invalid_id_user",
        "verified": True,
        "email": "invalid@example.com",
    },
}


# Security test data
SECURITY_TEST_DATA = {
    "malicious_usernames": [
        "<script>alert('xss')</script>",
        "'; DROP TABLE discordauth_user; --",
        "javascript:alert('xss')",
        "\x00\x01\x02\x03",  # Control characters
        "a" * 1000,  # Very long username
        "admin",  # Potentially privileged name
        "root",
        "system",
    ],
    "malicious_tokens": [
        "",
        " " * 1000,
        "Bearer malicious_token",
        "javascript:alert('xss')",
        "<script>alert('xss')</script>",
        "'; DROP TABLE discordauth_user; --",
        "\x00\x01\x02\x03",
    ],
    "malicious_ids": [
        "1'; DROP TABLE discordauth_user; --",
        "1 OR 1=1",
        "1 UNION SELECT * FROM discordauth_user",
        "'; DELETE FROM discordauth_user WHERE '1'='1",
        "<script>alert('xss')</script>",
        "javascript:alert('xss')",
    ],
}


# Performance test configuration
PERFORMANCE_TEST_CONFIG = {
    "bulk_user_count": 1000,
    "concurrent_auth_attempts": 50,
    "large_username_length": 10000,
    "stress_test_iterations": 100,
}


def run_comprehensive_tests():
    """
    Run all comprehensive tests for the discordauth app.

    This function can be called to execute the full test suite
    with proper configuration and reporting.
    """
    import subprocess
    import sys

    test_commands = [
        # Run all discordauth tests
        "python manage.py test discordauth.tests --verbosity=2",
        # Run specific test modules
        "python manage.py test discordauth.tests.test_models --verbosity=2",
        "python manage.py test discordauth.tests.test_backends --verbosity=2",
        "python manage.py test discordauth.tests.test_serializers --verbosity=2",
        "python manage.py test discordauth.tests.test_supporter --verbosity=2",
        "python manage.py test discordauth.tests.test_views --verbosity=2",
        # Run with coverage if available
        "coverage run --source=discordauth manage.py test discordauth.tests",
        "coverage report --show-missing",
        "coverage html",
    ]

    print("Running comprehensive Discord authentication tests...")

    for command in test_commands:
        print(f"\nExecuting: {command}")
        try:
            result = subprocess.run(
                command.split(),
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
            )

            if result.returncode == 0:
                print("✓ Command executed successfully")
                if result.stdout:
                    print(result.stdout)
            else:
                print("✗ Command failed")
                if result.stderr:
                    print(result.stderr)

        except subprocess.TimeoutExpired:
            print("✗ Command timed out")
        except FileNotFoundError:
            print(f"✗ Command not found: {command.split()[0]}")
        except Exception as e:
            print(f"✗ Error executing command: {e}")


if __name__ == "__main__":
    # Run tests if this module is executed directly
    run_comprehensive_tests()
