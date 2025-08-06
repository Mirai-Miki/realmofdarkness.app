from typing import Any
from rest_framework import serializers


def validate_mortal_blood_20th(value: Any) -> int:
    """
    Validate blood value for Mortals in 20th Edition.

    Args:
        value: Blood value

    Returns:
        Validated blood value

    Raises:
        ValidationError: If blood is not an integer or out of range
    """
    if not isinstance(value, int):
        raise serializers.ValidationError("Blood must be an integer")
    if value < 0 or value > 10:
        raise serializers.ValidationError("Blood must be between 0 and 10")
    return value
