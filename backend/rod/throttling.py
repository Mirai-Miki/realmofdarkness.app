"""Custom DRF throttling utilities.

This module defines mixin-enhanced throttles and helpers to select the
appropriate throttle(s) for a request based on the current user's status.

Conventions & goals
- Align with DRF throttling conventions (instances returned by get_throttles)
- Strict typing and clear documentation
- Log only exceptional situations (i.e., when throttling denies a request)
"""

from __future__ import annotations

import logging
from typing import ClassVar, List, Optional, Protocol, runtime_checkable

from rest_framework.request import Request
from rest_framework.throttling import (
    AnonRateThrottle,
    UserRateThrottle,
    BaseThrottle as DRFBaseThrottle,
)

# Use module-based logger; configuration is controlled by Django LOGGING settings
logger = logging.getLogger(__name__)


@runtime_checkable
class SupportsThrottleUser(Protocol):
    """Protocol describing the subset of user attributes used for throttling.

    This avoids importing a concrete User model while still providing
    type safety and mypy compatibility.
    """

    # Django auth flags
    is_anonymous: bool
    is_authenticated: bool

    # Common identity fields
    id: Optional[int]
    username: str

    # Project-specific flags used for throttling decisions
    admin: bool  # Whether the user is an admin/staff
    supporter: int  # Supporter tier (0 = none)


class ThrottleLoggingMixin:
    """Mixin that logs when throttling denies a request.

    This mixin stores the request during allow_request and emits a warning
    via the module logger when throttling occurs. Regular successful requests
    are not logged.
    """

    _request: Optional[Request] = None

    def allow_request(self, request: Request, view) -> bool:  # type: ignore[override]
        """Store the request, then delegate to the parent implementation.

        Parameters
        - request: DRF Request instance for the incoming call.
        - view: The DRF view handling the request. Type left generic by DRF.

        Returns
        - bool: True if the request is allowed; False if throttled.
        """

        self._request = request
        return super().allow_request(request, view)  # type: ignore[misc]

    def throttle_failure(self) -> None:  # type: ignore[override]
        """Log details when the rate limit is exceeded.

        Note: DRF treats throttling as a client-side issue (HTTP 429). We log
        at WARNING level to aid diagnostics without polluting logs for
        successful requests.
        """

        req: Optional[Request] = getattr(self, "_request", None)
        if req is not None:
            user = getattr(req, "user", None)
            is_auth = bool(getattr(user, "is_authenticated", False))
            user_id = getattr(user, "id", None) if is_auth else None
            username = (
                getattr(user, "username", "anonymous") if is_auth else "anonymous"
            )

            # Prefer X-Forwarded-For when behind proxies, fall back to REMOTE_ADDR
            forwarded_for = req.META.get("HTTP_X_FORWARDED_FOR")
            client_ip = (
                forwarded_for.split(",")[0].strip()
                if isinstance(forwarded_for, str) and forwarded_for
                else req.META.get("REMOTE_ADDR", "unknown")
            )

            endpoint = req.path

            logger.warning(
                "Rate limit exceeded",
                extra={
                    "user_id": user_id,
                    "username": username,
                    "client_ip": client_ip,
                    "endpoint": endpoint,
                },
            )

        # Delegate to parent hook (DRF ignores the return value here)
        return super().throttle_failure()  # type: ignore[misc]


class AnonThrottle(ThrottleLoggingMixin, AnonRateThrottle):
    """Throttle for anonymous requests using the 'anon' scope.

    Configure the rate in Django settings under REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']:
      {'anon': '100/hour'}
    """

    scope: ClassVar[str] = "anon"


class StandardUserThrottle(ThrottleLoggingMixin, UserRateThrottle):
    """Default throttle for authenticated non-supporter users.

    Scope: 'standard_user'
    """

    scope: ClassVar[str] = "standard_user"


class SupporterUserThrottle(ThrottleLoggingMixin, UserRateThrottle):
    """Throttle for supporter users (tier >= 1).

    Scope: 'supporter_user'
    """

    scope: ClassVar[str] = "supporter_user"


class PremiumUserThrottle(ThrottleLoggingMixin, UserRateThrottle):
    """Throttle for premium supporters (tier >= 3).

    Scope: 'premium_user'
    """

    scope: ClassVar[str] = "premium_user"


def get_throttles(user: Optional[SupportsThrottleUser]) -> List[DRFBaseThrottle]:
    """Return throttle instances appropriate for the given user.

    Parameters
    - user: The current authenticated user or None.

    Returns
    - List[UserRateThrottle]: A list of configured throttle instances. Returning an
      empty list disables throttling for the request (e.g., for admins).

    Notes
    - This helper mirrors DRF's get_throttles pattern expecting instances.
    - For admin/staff users, throttling is disabled.
    - Supporter tiers select more permissive throttles.
    """

    if user is None or getattr(user, "is_anonymous", True):
        return [AnonThrottle()]

    # Admin/staff: no throttling
    if bool(getattr(user, "admin", False)):
        return []

    supporter_tier: int = int(getattr(user, "supporter", 0) or 0)

    if supporter_tier >= 3:
        return [PremiumUserThrottle()]
    if supporter_tier >= 1:
        return [SupporterUserThrottle()]
    return [StandardUserThrottle()]
