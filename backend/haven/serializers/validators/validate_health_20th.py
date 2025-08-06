from ..types import HealthTracker20th
from typing import Any
from rest_framework import serializers


def validate_health_20th(value: Any) -> HealthTracker20th:
    """
    Validate health tracker structure for 20th Edition.

    Args:
        value: Health tracker data

    Returns:
        Validated HealthTracker20th instance

    Raises:
        ValidationError: If structure is invalid
    """
    if not isinstance(value, dict):
        raise serializers.ValidationError("Health must be a dictionary")

    required_fields = ["total", "bashing", "lethal", "aggravated"]
    for field in required_fields:
        if field not in value:
            raise serializers.ValidationError(f"Health must contain {field} field")

    total = value.get("total", 0)
    bashing = value.get("bashing", 0)
    lethal = value.get("lethal", 0)
    aggravated = value.get("aggravated", 0)

    if not all(isinstance(x, int) for x in [total, bashing, lethal, aggravated]):
        raise serializers.ValidationError("Health fields must be integers")

    if total < 7 or total > 15:
        raise serializers.ValidationError("Health total must be between 7 and 15")
    if bashing < 0 or bashing > 15:
        raise serializers.ValidationError("Bashing damage must be between 0 and 15")
    if lethal < 0 or lethal > 15:
        raise serializers.ValidationError("Lethal damage must be between 0 and 15")
    if aggravated < 0 or aggravated > 15:
        raise serializers.ValidationError("Aggravated damage must be between 0 and 15")
    if (bashing + lethal + aggravated) > total:
        raise serializers.ValidationError("Total damage cannot exceed health total")

    return {
        "total": total,
        "bashing": bashing,
        "lethal": lethal,
        "aggravated": aggravated,
    }
