"""
Custom DRF permission classes for the Bot API.

This module contains reusable permission logic for internal bot endpoints.
The Bot API is intended for localhost/internal use only and must be
protected by an API key present in the server environment settings.

Usage:
    - Apply `BotAPIKeyPermission` to any DRF view handling bot requests.

The permission validates two things:
    1) The request originates from a local/private address.
    2) The request presents a valid API key that matches `settings.API_KEY`.

Accepted API key locations (checked in order):
    - HTTP Header:  "X-API-KEY: <token>"
    - HTTP Header:  "Authorization: ApiKey <token>"
    - Request body: JSON field "APIKey"
    - Query param:  ?APIKey=<token>

If the key or IP is invalid, access is denied.
"""

from __future__ import annotations

from typing import Any, Optional

from django.conf import settings
from rest_framework.permissions import BasePermission
from rest_framework.request import Request
import logging

logger = logging.getLogger(__name__)


class BotAPIKeyPermission(BasePermission):
    """
    DRF permission that authorizes internal bot requests by API key and IP.

    This is designed for localhost-only traffic. It allows loopback/localhost
    and common RFC1918 private ranges. It then validates an API key using the
    locations described in the module docstring.
    """

    message = "Invalid or missing Bot API credentials"

    def has_permission(self, request: Request, view: Any) -> bool:
        client_ip = self._get_client_ip(request)
        if not self._is_allowed_ip(client_ip):
            logger.warning("Bot API denied due to IP restriction: %s", client_ip)
            return False

        token = self._extract_token(request)
        expected: Optional[str] = getattr(settings, "API_KEY", None)

        if not token or not expected or token != expected:
            logger.warning(
                "Bot API denied due to missing/invalid API key from %s", client_ip
            )
            return False

        return True

    def _get_client_ip(self, request: Request) -> str:
        """Get remote address string from the request META.

        Args:
            request: DRF Request object
        Returns:
            Remote IP address as string (may be IPv4/IPv6)
        """
        # Prefer REMOTE_ADDR. X-Forwarded-For is intentionally ignored for internal API.
        meta = getattr(request, "META", {}) or {}
        ip = str(meta.get("REMOTE_ADDR", ""))
        return ip

    def _is_allowed_ip(self, ip: str) -> bool:
        """Return True if the IP looks like a local/private address.

        This is a lightweight check suitable for localhost/internal usage.
        """
        if not ip:
            return False
        allowed_prefixes = (
            "127.",  # IPv4 loopback
            "::1",  # IPv6 loopback
            "localhost",
            "10.",  # RFC1918 private
            "172.",  # RFC1918 private (includes 172.16/12)
            "192.168.",  # RFC1918 private
        )
        return any(ip.startswith(prefix) for prefix in allowed_prefixes)

    def _extract_token(self, request: Request) -> Optional[str]:
        """Extract API token from headers, body or query string.

        Args:
            request: DRF Request
        Returns:
            Token string or None
        """
        # 1) X-API-KEY header
        token = (
            request.headers.get("X-API-KEY") if hasattr(request, "headers") else None
        )
        if token:
            return token.strip()

        # 2) Authorization: ApiKey <token>
        auth = (
            request.headers.get("Authorization")
            if hasattr(request, "headers")
            else None
        )
        if auth and auth.lower().startswith("apikey "):
            return auth.split(" ", 1)[1].strip()

        # 3) Body field `APIKey` (if parsed)
        try:
            if (
                hasattr(request, "data")
                and isinstance(request.data, dict)
                and "APIKey" in request.data
            ):
                body_token = request.data.get("APIKey")
                if isinstance(body_token, str):
                    return body_token.strip()
        except Exception:  # pragma: no cover - defensive
            pass

        # 4) Query string
        qs_token = (
            request.query_params.get("APIKey")
            if hasattr(request, "query_params")
            else None
        )
        if isinstance(qs_token, str):
            return qs_token.strip()

        return None
