from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .Character20th import Character20th


class Changeling20th(Character20th):
    glamour_total = models.IntegerField(
        default=5, validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    glamour_current = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    banality_total = models.IntegerField(
        default=5, validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    banality_current = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    nightmare = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    imbalance = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )

    chimerical_total = models.IntegerField(
        default=7, validators=[MinValueValidator(7), MaxValueValidator(15)]
    )
    chimerical_bashing = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(15)]
    )
    chimerical_lethal = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(15)]
    )
    chimerical_aggravated = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(15)]
    )
