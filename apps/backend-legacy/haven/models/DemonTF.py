from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .Character20th import Character20th


class DemonTF(Character20th):
    faith_total = models.IntegerField(
        default=1, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    faith_current = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    torment_permanent = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    torment_temporary = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
