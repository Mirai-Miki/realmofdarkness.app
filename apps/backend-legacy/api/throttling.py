# api/throttling.py
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
import logging

logger = logging.getLogger("DEBUG")


class BaseThrottle:
    """Base mixin for all throttle classes to add logging"""

    def allow_request(self, request, view):
        # Store request for use in throttle_failure
        self.request = request
        # Call parent's allow_request
        return super().allow_request(request, view)

    def throttle_failure(self):
        """Log information when rate limit is exceeded"""
        request = self.request  # Use the stored request
        user_id = request.user.id if request.user.is_authenticated else "anonymous"
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        endpoint = request.path
        username = (
            request.user.username if request.user.is_authenticated else "anonymous"
        )

        logger.warning(
            f"Rate limit exceeded: user_id={user_id}, username={username}, ip={client_ip}, endpoint={endpoint}"
        )
        # Return parent implementation (which returns False)
        return super().throttle_failure()


class AnonThrottle(BaseThrottle, AnonRateThrottle):
    scope = "anon"


class StandardUserThrottle(BaseThrottle, UserRateThrottle):
    scope = "standard_user"


class SupporterUserThrottle(BaseThrottle, UserRateThrottle):
    scope = "supporter_user"


class PremiumUserThrottle(BaseThrottle, UserRateThrottle):
    scope = "premium_user"


def get_throttles(user):
    """Return appropriate throttle classes based on user status"""
    if not user or user.is_anonymous:
        return [AnonThrottle()]

    # Check if user is admin or staff
    if user.admin:
        return []  # No throttling for staff/admin

    # Determine throttle based on supporter level
    if user.supporter >= 3:  # High-tier supporters
        return [PremiumUserThrottle()]
    elif user.supporter >= 1:  # Regular supporters
        return [SupporterUserThrottle()]
    else:
        return [StandardUserThrottle()]
