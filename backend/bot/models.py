from django.db import models
from rod.settings import AUTH_USER_MODEL
from chronicle.models import Chronicle


class Bot(models.Model):
    id = models.BigIntegerField(primary_key=True)  # Snowflake
    username = models.CharField(max_length=200)
    discriminator = models.CharField(max_length=5)
    avatar_url = models.URLField(blank=True)
    shard_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.username}#{self.discriminator}"


class CommandStat(models.Model):
    user = models.ForeignKey(AUTH_USER_MODEL, on_delete=models.CASCADE)
    bot = models.ForeignKey(Bot, on_delete=models.CASCADE)
    command = models.CharField(max_length=100)
    used = models.IntegerField(default=1)
    last_used = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.command}: {self.used}"

    class Meta:
        unique_together = ("user", "command", "bot")


class InitiativeTracker20th(models.Model):
    id = models.BigIntegerField(primary_key=True)  # Discord ChannelId
    chronicle = models.ForeignKey(Chronicle, on_delete=models.CASCADE)
    data = models.JSONField()
    last_updated = models.DateTimeField(auto_now=True)
