from typing import Any
from rest_framework import serializers
from ..types import HumanityTracker5th


def validate_humanity_5th(value: Any) -> HumanityTracker5th:
    """
    Validate humanity tracker structure for Human5th.

    Args:
        value: Humanity tracker data

    Returns:
        Validated HumanityTracker5th instance

    Raises:
        ValidationError: If structure is invalid
    """
    if not isinstance(value, dict):
        raise serializers.ValidationError("Humanity must be a dictionary")

    if "current" not in value or "stains" not in value:
        raise serializers.ValidationError(
            "Humanity must contain current and stains fields"
        )

    current = value.get("current", 7)
    stains = value.get("stains", 0)

    if not isinstance(current, int) or not isinstance(stains, int):
        raise serializers.ValidationError("Humanity fields must be integers")

    if current < 0 or current > 10:
        raise serializers.ValidationError("Humanity current must be between 0 and 10")
    if stains < 0 or stains > 10:
        raise serializers.ValidationError("Stains must be between 0 and 10")
    if stains > (10 - current):
        raise serializers.ValidationError("Too many stains for current humanity level")

    return {
        "current": current,
        "stains": stains,
    }
