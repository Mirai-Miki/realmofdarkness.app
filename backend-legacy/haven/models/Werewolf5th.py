from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .Character5th import Character5th


class Form(models.TextChoices):
    HOMID = "Homid"
    GLABRO = "Glabro"
    CHRINOS = "Crinos"
    HISPO = "Hispo"
    LUPUS = "Lupus"


class Werewolf5th(Character5th):
    rage = models.IntegerField(
        default=1, validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    harano = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    hauglosk = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    form = models.CharField(choices=Form.choices, default="Homid", max_length=15)
