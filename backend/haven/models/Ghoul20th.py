from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .Character20th import Character20th


class Ghoul20th(Character20th):
    blood = models.IntegerField(
        default=10, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    vitae = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    humanity = models.IntegerField(
        default=7, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
