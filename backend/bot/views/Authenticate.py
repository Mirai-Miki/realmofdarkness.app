from rest_framework.exceptions import NotFound
from django.conf import settings
import logging
import json

logger = logging.getLogger("DEBUG")


def authenticate(request):
    client_ip = request.META.get("REMOTE_ADDR")

    # Handle both REST framework and regular Django requests
    token = None

    # For REST framework requests
    if hasattr(request, "data"):
        token = request.data.get("APIKey", None)

    # For regular Django requests
    if token is None and request.method == "POST":
        try:
            # Parse the request body
            body_data = json.loads(request.body)
            token = body_data.get("APIKey", None)
        except (json.JSONDecodeError, AttributeError):
            pass

    # Check query parameters as a last resort
    if token is None:
        token = request.GET.get("APIKey", None)

    # List of allowed IPs
    allowed_ips = ["127.0.0.1", "::1", "localhost", "172.", "192.168."]
    is_allowed_ip = any(str(client_ip).startswith(prefix) for prefix in allowed_ips)

    if token != settings.API_KEY or not is_allowed_ip:
        logger.warning(f"Unauthorized bot API access attempt from {client_ip}")
        raise NotFound

    return
