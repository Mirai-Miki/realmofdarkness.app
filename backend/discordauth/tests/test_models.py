"""
Test cases for the User model and related functionality.

This module tests the User model, its manager, and associated methods
to ensure proper Discord user data handling and validation.
"""

from django.test import TestCase
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from ..models import User


class UserModelTests(TestCase):
    """Test cases for the User model."""

    def setUp(self):
        """Set up test data."""
        self.valid_user_data = {
            "id": 123456789012345678,
            "username": "testuser",
            "avatar_url": "https://cdn.discordapp.com/avatars/123/avatar.png",
            "email": "test@example.com",
            "verified": True,
            "registered": False,
            "admin": False,
            "supporter": 0,
        }

    def test_create_user_with_complete_data(self):
        """Test creating a user with all Discord data fields."""
        user = User.objects.create(**self.valid_user_data)

        self.assertEqual(user.id, 123456789012345678)
        self.assertEqual(user.username, "testuser")
        self.assertEqual(
            user.avatar_url, "https://cdn.discordapp.com/avatars/123/avatar.png"
        )
        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.verified)
        self.assertFalse(user.registered)
        self.assertFalse(user.admin)
        self.assertEqual(user.supporter, 0)
        self.assertFalse(user.has_usable_password())

    def test_create_user_with_minimal_data(self):
        """Test creating a user with minimal required data."""
        minimal_data = {
            "id": 987654321098765432,
            "username": "minimaluser",
            "verified": False,
            "registered": False,
        }
        user = User.objects.create(**minimal_data)

        self.assertEqual(user.id, 987654321098765432)
        self.assertEqual(user.username, "minimaluser")
        self.assertEqual(user.avatar_url, "")
        self.assertEqual(user.email, "")
        self.assertFalse(user.verified)
        self.assertFalse(user.registered)
        self.assertFalse(user.admin)
        self.assertEqual(user.supporter, 0)
        self.assertFalse(user.has_usable_password())

    def test_user_str_representation(self):
        """Test the string representation of a user."""
        user = User.objects.create(**self.valid_user_data)
        self.assertEqual(str(user), "testuser")

    def test_user_timestamps(self):
        """Test that timestamps are properly set and updated."""
        user = User.objects.create(**self.valid_user_data)

        self.assertIsNotNone(user.created_at)
        self.assertIsNotNone(user.last_saved)
        self.assertIsNotNone(user.last_active)

        # Test that timestamps are recent
        now = timezone.now()
        self.assertLess((now - user.created_at).seconds, 5)
        self.assertLess((now - user.last_saved).seconds, 5)

        # Test that last_saved updates on save
        original_last_saved = user.last_saved
        user.username = "updateduser"
        user.save()
        self.assertGreater(user.last_saved, original_last_saved)

    def test_duplicate_user_id_fails(self):
        """Test that creating a user with duplicate ID fails."""
        User.objects.create(**self.valid_user_data)

        with self.assertRaises(IntegrityError):
            User.objects.create(**self.valid_user_data)

    def test_user_username_max_length(self):
        """Test username maximum length validation."""
        data = self.valid_user_data.copy()
        data["username"] = "a" * 81  # Exceeds max_length=80

        user = User(**data)
        with self.assertRaises(ValidationError):
            user.full_clean()

    def test_user_email_validation(self):
        """Test email field validation."""
        data = self.valid_user_data.copy()

        # Test valid email
        data["email"] = "valid@example.com"
        user = User(**data)
        user.full_clean()  # Should not raise

        # Test invalid email
        data["email"] = "invalid-email"
        user = User(**data)
        with self.assertRaises(ValidationError):
            user.full_clean()

        # Test blank email (should be allowed)
        data["email"] = ""
        user = User(**data)
        user.full_clean()  # Should not raise

        # Test null email (should be allowed)
        data["email"] = None
        user = User(**data)
        user.full_clean()  # Should not raise

    def test_user_avatar_url_validation(self):
        """Test avatar URL field validation."""
        data = self.valid_user_data.copy()

        # Test valid URL
        data["avatar_url"] = "https://example.com/avatar.png"
        user = User(**data)
        user.full_clean()  # Should not raise

        # Test invalid URL
        data["avatar_url"] = "not-a-url"
        user = User(**data)
        with self.assertRaises(ValidationError):
            user.full_clean()

        # Test blank URL (should be allowed)
        data["avatar_url"] = ""
        user = User(**data)
        user.full_clean()  # Should not raise

    def test_user_boolean_fields(self):
        """Test boolean field handling."""
        data = self.valid_user_data.copy()

        # Test all boolean combinations
        boolean_combinations = [
            (True, True, True),
            (True, True, False),
            (True, False, True),
            (True, False, False),
            (False, True, True),
            (False, True, False),
            (False, False, True),
            (False, False, False),
        ]

        for verified, registered, admin in boolean_combinations:
            with self.subTest(verified=verified, registered=registered, admin=admin):
                data.update(
                    {
                        "id": data["id"] + 1,  # Ensure unique ID
                        "verified": verified,
                        "registered": registered,
                        "admin": admin,
                    }
                )
                user = User.objects.create(**data)
                self.assertEqual(user.verified, verified)
                self.assertEqual(user.registered, registered)
                self.assertEqual(user.admin, admin)

    def test_user_supporter_field(self):
        """Test supporter field validation."""
        data = self.valid_user_data.copy()

        # Test valid supporter values
        valid_supporters = [0, 1, 2, 3, 4, 5, 6, 7]
        for supporter_level in valid_supporters:
            with self.subTest(supporter=supporter_level):
                data.update(
                    {"id": data["id"] + supporter_level, "supporter": supporter_level}
                )
                user = User.objects.create(**data)
                self.assertEqual(user.supporter, supporter_level)

    def test_user_password_security(self):
        """Test that users have no usable passwords by default."""
        user = User.objects.create(**self.valid_user_data)
        self.assertFalse(user.has_usable_password())
        self.assertIsNone(user.password)

    def test_user_meta_configuration(self):
        """Test User model meta configuration."""
        self.assertEqual(User._meta.verbose_name, "User")
        self.assertEqual(User._meta.verbose_name_plural, "Users")
        self.assertEqual(User._meta.db_table, "discordauth_user")

    def test_user_large_discord_id(self):
        """Test handling of large Discord IDs (64-bit integers)."""
        large_id = 2**63 - 1  # Maximum 64-bit signed integer
        data = self.valid_user_data.copy()
        data["id"] = large_id

        user = User.objects.create(**data)
        self.assertEqual(user.id, large_id)

    def test_user_query_operations(self):
        """Test basic query operations on User model."""
        # Create multiple users
        user1 = User.objects.create(
            id=111111111111111111,
            username="user1",
            verified=True,
            registered=True,
            admin=False,
        )
        user2 = User.objects.create(
            id=222222222222222222,
            username="user2",
            verified=False,
            registered=True,
            admin=True,
        )
        user3 = User.objects.create(
            id=333333333333333333,
            username="user3",
            verified=True,
            registered=False,
            admin=False,
        )

        # Test filtering
        verified_users = User.objects.filter(verified=True)
        self.assertEqual(len(verified_users), 2)
        self.assertIn(user1, verified_users)
        self.assertIn(user3, verified_users)

        registered_users = User.objects.filter(registered=True)
        self.assertEqual(len(registered_users), 2)
        self.assertIn(user1, registered_users)
        self.assertIn(user2, registered_users)

        admin_users = User.objects.filter(admin=True)
        self.assertEqual(len(admin_users), 1)
        self.assertIn(user2, admin_users)

        # Test get by ID
        retrieved_user = User.objects.get(id=user1.id)
        self.assertEqual(retrieved_user, user1)

        # Test get by username
        retrieved_user = User.objects.get(username="user2")
        self.assertEqual(retrieved_user, user2)

    def test_user_ordering(self):
        """Test user queryset ordering."""
        # Create users with different timestamps
        user1 = User.objects.create(
            id=111111111111111111, username="auser", verified=True, registered=True
        )
        user2 = User.objects.create(
            id=222222222222222222, username="buser", verified=True, registered=True
        )

        # Test ordering by username
        users_by_username = User.objects.order_by("username")
        self.assertEqual(list(users_by_username), [user1, user2])

        # Test ordering by ID
        users_by_id = User.objects.order_by("id")
        self.assertEqual(list(users_by_id), [user1, user2])

        # Test reverse ordering
        users_reverse = User.objects.order_by("-id")
        self.assertEqual(list(users_reverse), [user2, user1])

    def test_user_email_uniqueness_not_enforced(self):
        """Test that email uniqueness is not enforced (multiple users can have same email)."""
        email = "shared@example.com"
        user1 = User.objects.create(
            id=111111111111111111,
            username="user1",
            email=email,
            verified=True,
            registered=True,
        )
        user2 = User.objects.create(
            id=222222222222222222,
            username="user2",
            email=email,
            verified=True,
            registered=True,
        )

        # Both users should exist with the same email
        self.assertEqual(user1.email, email)
        self.assertEqual(user2.email, email)
        self.assertEqual(User.objects.filter(email=email).count(), 2)
