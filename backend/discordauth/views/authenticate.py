"""
Discord OAuth authentication views for the Realm of Darkness platform.

This module handles the complete Discord OAuth flow including login, logout,
and callback processing. It ensures type safety, secure authentication, and
proper user data synchronization using serializers.
"""

from typing import Dict, Any, Optional, Set, List, cast
from urllib.parse import quote
import hashlib
import os
import logging

from django.shortcuts import redirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.http import (
    HttpRequest,
    HttpResponse,
    HttpResponseBadRequest,
    HttpResponseForbidden,
)
from dotenv import load_dotenv
import requests
from rest_framework import serializers

from ..models import User
from ..serializers import UserSerializer
from chronicle.models import Chronicle, Member

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Type definitions for Discord API responses
DiscordUser = Dict[str, Any]
DiscordGuild = Dict[str, Any]
TokenResponse = Dict[str, Any]

# Get environment variables with validation
DISCORD_APP_ID: str = os.getenv("DISCORD_APP_ID", "")
DISCORD_APP_SECRET: str = os.getenv("DISCORD_APP_SECRET", "")
ENV: str = os.getenv("ENV", "development")

if not DISCORD_APP_ID or not DISCORD_APP_SECRET:
    raise ValueError(
        "DISCORD_APP_ID and DISCORD_APP_SECRET must be set in environment variables"
    )

# Set URLs based on environment
if ENV == "development":
    REDIRECT_URI = "http://localhost:8080/auth/login/success/"
    FINAL_REDIRECT = "http://localhost:3000/"
elif ENV == "preproduction":
    REDIRECT_URI = "https://dev.realmofdarkness.app/auth/login/success/"
    FINAL_REDIRECT = "https://dev.realmofdarkness.app/"
else:
    REDIRECT_URI = "https://realmofdarkness.app/auth/login/success/"
    FINAL_REDIRECT = "https://realmofdarkness.app/"

# Discord OAuth URLs with proper URL encoding
ENCODED_REDIRECT_URI = quote(REDIRECT_URI, safe="")
LOGIN_URL = (
    f"https://discord.com/api/oauth2/authorize"
    f"?client_id={DISCORD_APP_ID}"
    f"&redirect_uri={ENCODED_REDIRECT_URI}"
    f"&response_type=code"
    f"&scope=identify%20email%20guilds"
    f"&prompt=none"
)


class DiscordOAuthClient:
    """
    Discord OAuth client for handling authentication flow.

    This class provides methods for interacting with Discord's OAuth API,
    including token exchange and user/guild data retrieval. All methods
    include proper error handling and type safety.
    """

    def __init__(self) -> None:
        """Initialize the OAuth client with Discord API endpoints."""
        self.client_id: str = DISCORD_APP_ID
        self.client_secret: str = DISCORD_APP_SECRET
        self.client_scope: str = "identify email guilds"
        self.redirect_uri: str = REDIRECT_URI
        self.login_url: str = LOGIN_URL
        self.token_url: str = "https://discord.com/api/oauth2/token"
        self.api_url: str = "https://discord.com/api"

        # Request timeout settings for security
        self.timeout: int = 30

    def get_access_token(self, code: str) -> TokenResponse:
        """
        Exchange authorization code for access token.

        Args:
            code: Authorization code from Discord OAuth callback

        Returns:
            Dict containing access token and related data

        Raises:
            requests.RequestException: If the token exchange fails
            ValueError: If the response is invalid
        """
        payload = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": self.redirect_uri,
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        try:
            response = requests.post(
                self.token_url, data=payload, headers=headers, timeout=self.timeout
            )
            response.raise_for_status()
            token_data = response.json()

            if "access_token" not in token_data:
                raise ValueError("Invalid token response: missing access_token")

            return token_data
        except requests.RequestException:
            logger.exception(f"[Auth get_access_token] Failed to get access token")
            raise

    def get_user(self, access_token: str) -> DiscordUser:
        """
        Fetch Discord user information using access token.

        Args:
            access_token: Valid Discord OAuth access token

        Returns:
            Dict containing Discord user data

        Raises:
            requests.RequestException: If the API request fails
            ValueError: If the response is invalid
        """
        url = f"{self.api_url}/users/@me"
        headers = {"Authorization": f"Bearer {access_token}"}

        try:
            response = requests.get(url, headers=headers, timeout=self.timeout)
            response.raise_for_status()
            user_data = response.json()

            # Validate required fields
            required_fields = ["id", "username"]
            for field in required_fields:
                if field not in user_data:
                    raise ValueError(f"Invalid user response: missing {field}")

            return user_data
        except requests.RequestException:
            logger.exception(f"[Auth get_user] Failed to get user data")
            raise

    def get_guilds(self, access_token: str) -> List[DiscordGuild]:
        """
        Fetch Discord guilds (servers) the user is a member of.

        Args:
            access_token: Valid Discord OAuth access token

        Returns:
            List of dicts containing Discord guild data

        Raises:
            requests.RequestException: If the API request fails
        """
        url = f"{self.api_url}/users/@me/guilds"
        headers = {"Authorization": f"Bearer {access_token}"}

        try:
            response = requests.get(url, headers=headers, timeout=self.timeout)
            response.raise_for_status()
            guilds_data = response.json()

            if not isinstance(guilds_data, list):
                raise ValueError("Invalid guilds response: expected list")

            return guilds_data
        except requests.RequestException:
            logger.exception(f"[Auth get_guilds] Failed to get guilds data")
            raise


def _generate_state_hash(request: HttpRequest) -> str:
    """
    Generate a secure state hash for CSRF protection.

    Args:
        request: Django HTTP request object

    Returns:
        SHA256 hash string for state validation
    """
    # Use session key and user agent for more entropy
    session_key = request.session.session_key or ""
    user_agent = request.META.get("HTTP_USER_AGENT", "")
    cookies_str = str(request.COOKIES)

    state_input = f"{session_key}{user_agent}{cookies_str}".encode()
    return hashlib.sha256(state_input).hexdigest()


def _build_avatar_url(user_id: str, avatar_hash: Optional[str]) -> str:
    """
    Build Discord avatar URL from user ID and avatar hash.

    Args:
        user_id: Discord user ID
        avatar_hash: Discord avatar hash (can be None)

    Returns:
        Complete avatar URL or empty string if no avatar
    """
    if not avatar_hash:
        return ""
    return f"https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.png"


def _prepare_user_data(discord_user: DiscordUser) -> Dict[str, Any]:
    """
    Prepare Discord user data for serializer validation.

    Args:
        discord_user: Raw Discord user data from API

    Returns:
        Dict formatted for UserSerializer
    """
    user_id = str(discord_user["id"])
    avatar_hash = discord_user.get("avatar")

    return {
        "id": user_id,
        "username": discord_user["username"],
        "avatar_url": _build_avatar_url(user_id, avatar_hash),
        "email": discord_user.get("email", ""),
        "verified": discord_user.get("verified", False),
        "registered": True,
        "admin": False,
        "supporter": 0,
    }


def _update_user_guilds(user: User, guilds: List[DiscordGuild]) -> None:
    """
    Update user's guild memberships based on Discord API data.

    Args:
        user: User instance to update
        guilds: List of Discord guild data
    """
    # Get current guild IDs from Discord API
    current_guild_ids: Set[int] = {int(guild["id"]) for guild in guilds}

    # Process each guild
    for guild in guilds:
        try:
            guild_id = int(guild["id"])
            permissions = int(guild.get("permissions", 0))

            # Check if this guild exists as a Chronicle
            try:
                chronicle = Chronicle.objects.get(id=guild_id)
            except Chronicle.DoesNotExist:
                continue

            # Check if user has admin permissions (MANAGE_GUILD permission)
            # Discord permission flags: https://discord.com/developers/docs/topics/permissions
            is_admin = (permissions & (1 << 3)) != 0  # Admin = 1 << 3

            # Create or update member relation
            member, created = Member.objects.get_or_create(
                chronicle=chronicle, user=user, defaults={"admin": is_admin}
            )

            # Update admin status if changed
            if not created and member.admin != is_admin:
                member.admin = is_admin
                member.save()

        except (ValueError, TypeError):
            logger.exception("[Auth _update_user_guilds] Invalid guild data")
            continue

    # Remove stale member relations
    existing_members = Member.objects.filter(user=user)
    for member in existing_members:
        if member.chronicle.id not in current_guild_ids:
            member.delete()


def login(request: HttpRequest) -> HttpResponse:
    """
    Initiate Discord OAuth login flow.

    Args:
        request: Django HTTP request

    Returns:
        Redirect to Discord OAuth authorization URL
    """
    try:
        client_state = _generate_state_hash(request)
        oauth_url = f"{LOGIN_URL}&state={client_state}"

        return redirect(oauth_url)
    except Exception:
        logger.exception("[Auth login] Error initiating OAuth login")
        return HttpResponseBadRequest("Failed to initiate OAuth login")


def logout(request: HttpRequest) -> HttpResponse:
    """
    Log out the current user and redirect to home page.

    Args:
        request: Django HTTP request

    Returns:
        Redirect to the application home page
    """
    try:
        if request.user.is_authenticated:
            auth_logout(request)
    except Exception:
        logger.exception("[Auth logout] Error during logout")

    return redirect(FINAL_REDIRECT)


def login_success(request: HttpRequest) -> HttpResponse:
    """
    Handle Discord OAuth callback and complete authentication.

    This function validates the OAuth state, exchanges the authorization code
    for tokens, fetches user data, and creates/updates the user account using
    the UserSerializer for type safety and validation.

    Args:
        request: Django HTTP request containing OAuth callback data

    Returns:
        Redirect to the application with authenticated user or error response
    """
    try:
        # Validate OAuth state for CSRF protection
        client_state = request.GET.get("state")
        server_state = _generate_state_hash(request)

        if not client_state or client_state != server_state:
            logger.warning(
                f"[Auth login_success] Invalid OAuth state detected from IP {request.META.get('REMOTE_ADDR', 'unknown')}"
            )
            return HttpResponseForbidden(
                "Invalid authentication state. Please try logging in again."
            )

        # Get authorization code
        code = request.GET.get("code")
        if not code:
            logger.warning(
                "[Auth login_success] OAuth callback received without authorization code"
            )
            return HttpResponseBadRequest("No authorization code received")

        # Initialize OAuth client and fetch data
        oauth_client = DiscordOAuthClient()

        # Exchange code for access token
        token_data = oauth_client.get_access_token(code)
        access_token = token_data["access_token"]

        # Fetch user and guild data
        discord_user = oauth_client.get_user(access_token)
        guilds = oauth_client.get_guilds(access_token)

        # Try to authenticate existing user
        authenticated_user = authenticate(request, user_id=discord_user["id"])
        user: Optional[User] = None

        if authenticated_user and isinstance(authenticated_user, User):
            # Update existing user with serializer
            user_data = _prepare_user_data(discord_user)
            serializer = UserSerializer(
                authenticated_user, data=user_data, partial=True
            )

            if serializer.is_valid():
                user = cast(User, serializer.save())
            else:
                logger.error(
                    f"Failed to update user {discord_user['id']}: {serializer.errors}"
                )
                return HttpResponseBadRequest("Failed to update user data")
        else:
            # Create new user with serializer
            user_data = _prepare_user_data(discord_user)
            serializer = UserSerializer(data=user_data)

            if serializer.is_valid():
                user = cast(User, serializer.save())
            else:
                logger.error(
                    f"Failed to create user {discord_user['id']}: {serializer.errors}"
                )
                return HttpResponseBadRequest("Failed to create user account")

        # Update guild memberships
        _update_user_guilds(user, guilds)

        # Log the user in
        auth_login(request, user, backend="discordauth.backends.DiscordAuthBackend")

        return redirect(FINAL_REDIRECT)

    except requests.RequestException:
        logger.exception("[Auth login_success] Discord API error during authentication")
        return HttpResponseBadRequest("Discord service unavailable")
    except serializers.ValidationError:
        logger.error("[Auth login_success] User data validation error")
        return HttpResponseBadRequest("Invalid user data")
    except Exception:
        logger.exception("[Auth login_success] Unexpected error during authentication")
        return HttpResponseBadRequest("Authentication failed")
