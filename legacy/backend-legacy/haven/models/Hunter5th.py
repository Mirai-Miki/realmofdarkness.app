from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .Character5th import Character5th


class Hunter5th(Character5th):
    desperation = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    danger = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    despair = models.BooleanField(default=False)
