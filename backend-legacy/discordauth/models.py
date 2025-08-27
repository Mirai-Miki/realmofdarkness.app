from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, discord_user, is_registered=False):
        user = self.model(
            id=int(discord_user["id"]),  # Req
            username=discord_user["username"],  # Req
            discriminator=discord_user["discriminator"],
            avatar_url=discord_user.get("avatarURL", ""),
            email=discord_user.get("email", ""),
            verified=discord_user.get("verified", False),
            registered=is_registered,
            admin=False,
        )
        user.set_unusable_password()
        user.save(using=self._db)

        return user


class User(AbstractBaseUser):
    # Discord User Details
    id = models.BigIntegerField(primary_key=True)
    username = models.CharField(max_length=80)
    discriminator = models.CharField(max_length=50, default="0")
    avatar_url = models.URLField(blank=True)
    email = models.EmailField(max_length=100, blank=True, null=True)
    verified = models.BooleanField()
    registered = models.BooleanField()
    admin = models.BooleanField(default=False)
    supporter = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    last_saved = models.DateTimeField(auto_now=True)
    last_active = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "id"
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.username}#{self.discriminator}"
