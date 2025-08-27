from django.db import models
from rod.settings import AUTH_USER_MODEL
from haven.models import Character

"""
A Chronicle is a game played usually on a Discord Guild. A chronicle can
only be linked to a single Discord Guild and a Discord Guild can only 
a single Chronicle. This is due to the complexeties of dealing with 
characters on a discord server from multiple chronicles.
"""


class Chronicle(models.Model):
    # Need to create own snowflake generator
    id = models.BigIntegerField(primary_key=True)  # Snowflake
    name = models.CharField(max_length=200)
    owner_id = models.BigIntegerField(default=0)
    bot = models.ManyToManyField("bot.Bot", related_name="chronicles")
    shard = models.IntegerField(default=0)
    is_guild = models.BooleanField(default=True)
    members = models.ManyToManyField(
        AUTH_USER_MODEL, through="Member", related_name="chronicles"
    )
    icon_url = models.URLField(blank=True)
    tracker_channel = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name}"


"""
The role used by the bot to note which roles are Storyteller roles.
We link to a Chronicle in case we ever want to allow multiple chronicles
in the same Guild.

Primary Key is a Discord Role Snowflake
"""


class StorytellerRole(models.Model):
    id = models.BigIntegerField(primary_key=True)
    guild = models.ForeignKey(Chronicle, on_delete=models.CASCADE)


"""
This is not a Guild Member but rather a member of a Chronicle.
We do not keep track of Guild members who do not use the bot
"""


class Member(models.Model):
    chronicle = models.ForeignKey(Chronicle, on_delete=models.CASCADE)
    user = models.ForeignKey(AUTH_USER_MODEL, on_delete=models.CASCADE)
    admin = models.BooleanField(default=False)
    storyteller = models.BooleanField(default=False)
    nickname = models.CharField(max_length=100, blank=True)
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    default_character = models.ForeignKey(
        Character, on_delete=models.SET_NULL, null=True, related_name="member_defaults"
    )
    default_auto_hunger = models.BooleanField(default=False)

    class Meta:
        unique_together = ("chronicle", "user")
