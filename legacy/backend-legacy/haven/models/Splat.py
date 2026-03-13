from django.db import models


class Splat(models.Model):
    name = models.CharField(max_length=50)
    version = models.CharField(max_length=20)
    slug = models.SlugField(max_length=50, unique=True)
    description = models.TextField(blank=True)


class Morality(models.Model):
    character = models.OneToOneField("haven.Character", on_delete=models.CASCADE)
    morality_info = models.ForeignKey("MoralityInfo", on_delete=models.CASCADE)
    current = models.IntegerField(default=7)


class MoralityInfo(models.Model):
    slug = models.SlugField(max_length=50)
    name = models.CharField(max_length=50)
    conviction = models.BooleanField(default=False)
    instinct = models.BooleanField(default=False)
    referance = models.CharField(max_length=50, blank=True)
    custom = models.BooleanField(default=False)


class Health20th(models.Model):
    character = models.ForeignKey(
        "haven.Character", on_delete=models.CASCADE, related_name="health"
    )
    slug = models.SlugField()
    total = models.IntegerField(default=7)
    bashing = models.IntegerField(default=0)
    lethal = models.IntegerField(default=0)
    aggravated = models.IntegerField(default=0)


class Humanity(models.Model):
    character = models.OneToOneField(
        "haven.Character", on_delete=models.CASCADE, related_name="old_humanity"
    )
    current = models.IntegerField(default=7)
    stains = models.IntegerField(default=0)


class Damage5th(models.Model):
    character = models.ForeignKey(
        "haven.Character", on_delete=models.CASCADE, related_name="damage"
    )
    slug = models.SlugField()
    total = models.IntegerField(default=1)
    superficial = models.IntegerField(default=0)
    aggravated = models.IntegerField(default=0)

    class Meta:
        unique_together = ("character", "slug")
        indexes = [models.Index(fields=["character", "slug"])]


class DespairModal(models.Model):
    character = models.OneToOneField(
        "character", on_delete=models.CASCADE, primary_key=True
    )
    despair = models.BooleanField(default=False)
