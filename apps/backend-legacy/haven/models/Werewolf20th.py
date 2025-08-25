from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .Character20th import Character20th


class Werewolf20th(Character20th):
    rage_total = models.IntegerField(
        default=1, validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    rage_current = models.IntegerField(
        default=1, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    gnosis_total = models.IntegerField(
        default=1, validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    gnosis_current = models.IntegerField(
        default=1, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
