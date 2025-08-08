"""
Custom Django authentication backend for Discord OAuth integration.

This backend replaces Django's default username/password authentication with
Discord-based user ID authentication. It's specifically designed for applications
that use Discord OAuth as the sole authentication method.

Security considerations:
- No password-based authentication (passwords are set as unusable)
- User ID validation through Discord OAuth flow
- Additional security checks can be added to user_can_authenticate()
"""

from typing import Optional, Union, Any
import logging

from django.contrib.auth.backends import BaseBackend
from django.http import HttpRequest
from .models import User

logger = logging.getLogger(__name__)


class DiscordAuthBackend(BaseBackend):
    """
    Custom authentication backend for Discord OAuth integration.

    This backend handles authentication for users who have logged in through
    Discord's OAuth2 flow. It replaces Django's default ModelBackend since
    this application doesn't use username/password authentication.

    Security features:
    - Only authenticates users with valid Discord user IDs
    - Validates user existence in database
    - Applies additional security checks via user_can_authenticate()
    - Logs authentication attempts for security monitoring
    """

    def authenticate(
        self,
        request: Optional[HttpRequest],
        user_id: Optional[Union[int, str]] = None,
    ) -> Optional[User]:
        """
        Authenticate a user by their Discord user ID.

        This method is called during the Django authentication process.
        It validates that the user exists in the database and is allowed
        to authenticate.

        Args:
            request: The HTTP request object (optional)
            user_id: The Discord user ID to authenticate (can be int or str)

        Returns:
            User instance if authentication succeeds, None otherwise

        Security notes:
            - Accepts both integer and string user IDs for flexibility
            - Validates user existence before authentication
            - Applies additional security checks via user_can_authenticate()
        """
        if user_id is None:
            logger.warning("Authentication attempted with None user_id")
            return None

        try:
            # Convert to int to ensure we have a valid Discord user ID
            user_id_int = int(user_id)
        except (ValueError, TypeError):
            logger.warning(f"Authentication attempted with invalid user_id: {user_id}")
            return None

        try:
            user = User._default_manager.get(pk=user_id_int)
        except User.DoesNotExist:
            return None
        except Exception as e:
            logger.error(
                f"Database error during authentication for user {user_id_int}: {e}"
            )
            return None

        if self.user_can_authenticate(user):
            return user
        else:
            logger.warning(
                f"Authentication blocked for user: {user.username} ({user_id_int})"
            )
            return None

    def get_user(self, user_id: Union[int, str]) -> Optional[User]:
        """
        Retrieve a user by their ID for session-based authentication.

        This method is called by Django to retrieve the user object
        from the user ID stored in the session. It's used for maintaining
        authentication state across requests.

        Args:
            user_id: The Discord user ID to retrieve (can be int or str)

        Returns:
            User instance if found and can authenticate, None otherwise

        Security notes:
            - Accepts both integer and string user IDs for flexibility
            - Validates user existence on every request
            - Re-applies security checks via user_can_authenticate()
            - Handles database errors gracefully
        """
        try:
            # Ensure user_id is an integer
            user_id_int = int(user_id)
        except (ValueError, TypeError):
            logger.warning(f"get_user called with invalid user_id: {user_id}")
            return None

        try:
            user = User._default_manager.get(pk=user_id_int)
        except User.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Database error in get_user for user {user_id_int}: {e}")
            return None

        if self.user_can_authenticate(user):
            return user
        else:
            logger.warning(
                f"get_user: User {user.username} ({user_id_int}) cannot authenticate"
            )
            return None

    def user_can_authenticate(self, user: Optional[User]) -> bool:
        """
        Determine if a user is allowed to authenticate.

        This method provides a central place to implement additional
        security checks beyond basic user existence. Currently returns
        True for all valid users, but can be extended to implement:
        - Account suspension checks
        - Email verification requirements
        - Rate limiting
        - IP-based restrictions
        - Supporter tier requirements

        Args:
            user: The User instance to check

        Returns:
            True if the user can authenticate, False otherwise

        Security notes:
            - Called for both initial authentication and session retrieval
            - Can be extended to implement additional security policies
            - Should return False for suspended or banned accounts
        """
        # Basic check: user must exist (implicit from calling context)
        if user is None:
            return False

        # Add additional security checks here as needed:
        # - Check if user account is suspended
        # - Verify email if required
        # - Check supporter status for restricted features
        # - Implement rate limiting
        # - Validate IP restrictions

        return True
