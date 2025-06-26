from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .Character20th import Character20th


class Mage20th(Character20th):
    arete = models.IntegerField(
        default=1, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    paradox = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    quintessence = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
