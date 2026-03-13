from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .Character20th import Character20th


class Vampire20th(Character20th):
    # Core
    clan = models.CharField(blank=True, max_length=50)
    clan_description = models.CharField(blank=True, max_length=2000)
    sire = models.CharField(max_length=50, blank=True)

    # Morality
    morality_name = models.CharField(default="Humanity", max_length=100)
    morality_description = models.CharField(blank=True, max_length=1000)
    morality_value = models.IntegerField(
        default=7, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )

    blood_total = models.IntegerField(
        default=10, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    blood_current = models.IntegerField(
        default=1, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    # Profile
    date_of_death = models.CharField(blank=True, max_length=20)
    apparent_age = models.CharField(blank=True, max_length=20)
