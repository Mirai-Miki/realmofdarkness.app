from typing import Any
from rest_framework import serializers


def validate_humanity_20th(value: Any) -> int:
    """
    Validate humanity value for 20th edition.

    Args:
        value: Humanity value

    Returns:
        Validated humanity value

    Raises:
        ValidationError: If humanity is not an integer or out of range
    """
    if not isinstance(value, int):
        raise serializers.ValidationError("Humanity must be an integer")
    if value < 0 or value > 10:
        raise serializers.ValidationError("Humanity must be between 0 and 10")
    return value
