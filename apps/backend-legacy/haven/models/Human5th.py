from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .Character5th import Character5th


class Human5th(Character5th):
    humanity = models.IntegerField(
        default=7, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    stains = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
