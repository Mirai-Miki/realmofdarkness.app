from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .Character5th import Character5th


class Clan(models.TextChoices):
    CUSTOM = "Custom"
    BANU_HAQIM = "Banu Haqim"
    BRUJAH = "Brujah"
    GANGREL = "Gangrel"
    HECATA = "Hecata"
    LASOMBRA = "Lasombra"
    MALKAVIAN = "Malkavian"
    MINISTRY = "Ministry"
    NOSFERATU = "Nosferatu"
    RAVNOS = "Ravnos"
    SALUBRI = "Salubri"
    TOREADOR = "Toreador"
    TREMERE = "Tremere"
    TZIMISCE = "Tzimisce"
    VENTRUE = "Ventrue"
    CAITIFF = "Caitiff"
    THIN_BLOOD = "Thin Blood"


class PredatorType(models.TextChoices):
    CUSTOM = "Custom"
    ALLEYCAT = "Alleycat"
    BLOOD_LEECH = "Blood Leech"
    BAGGER = "Bagger"
    CLEAVER = "Cleaver"
    CONSENSUALIST = "Consensualist"
    FARMER = "Farmer"
    OSIRIS = "Osiris"
    SANDMAN = "Sandman"
    SCENE_QUEEN = "Scene Queen"
    SIREN = "Siren"
    EXTORTIONIST = "Extortionist"
    GRAVEROBBER = "Graverobber"
    ROADSIDE_KILLER = "Roadside Killer"
    GRIM_REAPER = "Grim Reaper"
    MONTERO = "Montero"
    PURSUER = "Pursuer"
    TRAPDOOR = "Trapdoor"
    TITHE_COLLECTOR = "Tithe Collector"


class Vampire5th(Character5th):
    # Core
    clan = models.CharField(choices=Clan.choices, blank=True, max_length=15)
    sire = models.CharField(max_length=50, blank=True)
    generation = models.IntegerField(
        null=True, validators=[MinValueValidator(1), MaxValueValidator(16)]
    )
    predator_type = models.CharField(
        choices=PredatorType.choices, blank=True, max_length=20
    )

    # Humanity
    humanity = models.IntegerField(
        default=7, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    stains = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )

    hunger = models.IntegerField(
        default=1, validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    blood_potency = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    hunting_roll = models.CharField(blank=True, max_length=100)
    resonance = models.CharField(blank=True, max_length=50)
    disciplines = models.JSONField(default=dict)

    # Profile
    date_of_death = models.CharField(blank=True, max_length=20)
    apparent_age = models.CharField(blank=True, max_length=20)


class CustomClan(models.Model):
    vampire = models.OneToOneField(Vampire5th, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)


class CustomPredatorType(models.Model):
    vampire = models.OneToOneField(Vampire5th, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
