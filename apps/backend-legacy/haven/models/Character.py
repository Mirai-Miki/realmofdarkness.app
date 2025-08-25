from django.db import models
from rod.settings import AUTH_USER_MODEL
from . import Splat


class Trackable(models.Model):
    character = models.ForeignKey(
        "haven.Character", on_delete=models.CASCADE, related_name="trackable"
    )
    slug = models.SlugField()
    total = models.IntegerField(null=True)
    current = models.IntegerField(default=1)

    class Meta:
        unique_together = ("character", "slug")
        indexes = [models.Index(fields=["character", "slug"])]


class SheetStatus(models.IntegerChoices):
    DRAFT = 1, "Draft"
    REVIEW = 2, "Review"
    ACTIVE = 3, "Active"
    DEAD = 4, "Dead"
    ARCHIVE = 5, "Archive"


class Character(models.Model):
    name = models.CharField(max_length=50, blank=True)
    user = models.ForeignKey(AUTH_USER_MODEL, on_delete=models.CASCADE)
    chronicle = models.ForeignKey(
        "chronicle.Chronicle", on_delete=models.SET_NULL, null=True
    )
    member = models.ForeignKey("chronicle.Member", on_delete=models.SET_NULL, null=True)

    is_sheet = models.BooleanField(default=False)
    status = models.IntegerField(choices=SheetStatus.choices, default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    avatar = models.ImageField(upload_to="char_avatars/", blank=True)
    theme = models.CharField(default="#000000", max_length=10)

    # Experiance
    exp_current = models.IntegerField(default=0)
    exp_total = models.IntegerField(default=0)
    exp_spends = models.JSONField(default=list)

    # Profile
    date_of_birth = models.CharField(blank=True, max_length=20)
    age = models.CharField(blank=True, max_length=20)
    history = models.TextField(blank=True, max_length=6000)
    appearance_description = models.TextField(blank=True, max_length=1000)

    notes = models.TextField(blank=True, max_length=6000)
    notes2 = models.TextField(blank=True, max_length=6000)

    # splat_old is used to store the old splat name for the character. It should be removed after all characters are updated.
    splat_old = models.ForeignKey(Splat, on_delete=models.CASCADE, null=True)
    splat = models.CharField(max_length=50, blank=True, null=True)

    # Story Teller Lock will stop the player from making non-tracker edits to their sheet.
    st_lock = models.BooleanField(default=False)

    class Meta:
        unique_together = ("name", "user")
        indexes = [models.Index(fields=["name", "user"])]
