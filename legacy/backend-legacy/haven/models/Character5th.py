from django.db import models
from .Character import Character


class Character5th(Character):
    ambition = models.CharField(blank=True, max_length=100)
    desire = models.CharField(blank=True, max_length=100)

    # Willpower
    willpower_superficial = models.IntegerField(default=0)
    willpower_aggravated = models.IntegerField(default=0)
    willpower_total = models.IntegerField(default=2)

    # Health
    health_superficial = models.IntegerField(default=0)
    health_aggravated = models.IntegerField(default=0)
    health_total = models.IntegerField(default=4)

    # Beliefs
    tenets = models.TextField(blank=True, max_length=1000)
    touchstones = models.TextField(blank=True, max_length=2000)
    convictions = models.TextField(blank=True, max_length=2000)

    # Advantages
    merits = models.JSONField(default=list)
    flaws = models.JSONField(default=list)
    haven = models.JSONField(default=list)
    backgrounds = models.JSONField(default=list)
    loresheets = models.JSONField(default=list)

    # Haven
    haven_name = models.CharField(blank=True, max_length=50)
    haven_location = models.TextField(blank=True, max_length=500)
    haven_description = models.TextField(blank=True, max_length=1000)

    ################################# Attributes ###############################
    # Physical
    strength = models.IntegerField(default=1)
    dexterity = models.IntegerField(default=1)
    stamina = models.IntegerField(default=1)
    # Social
    charisma = models.IntegerField(default=1)
    manipulation = models.IntegerField(default=1)
    composure = models.IntegerField(default=1)
    # Mental
    intelligence = models.IntegerField(default=1)
    wits = models.IntegerField(default=1)
    resolve = models.IntegerField(default=1)

    ################################### Skills #################################
    # Physical
    athletics = models.IntegerField(default=0)
    brawl = models.IntegerField(default=0)
    craft = models.IntegerField(default=0)
    drive = models.IntegerField(default=0)
    firearms = models.IntegerField(default=0)
    larceny = models.IntegerField(default=0)
    melee = models.IntegerField(default=0)
    stealth = models.IntegerField(default=0)
    survival = models.IntegerField(default=0)
    # Social
    animal_ken = models.IntegerField(default=0)
    etiquette = models.IntegerField(default=0)
    insight = models.IntegerField(default=0)
    intimidation = models.IntegerField(default=0)
    leadership = models.IntegerField(default=0)
    performance = models.IntegerField(default=0)
    persuasion = models.IntegerField(default=0)
    streetwise = models.IntegerField(default=0)
    subterfuge = models.IntegerField(default=0)
    # Mental
    academics = models.IntegerField(default=0)
    awareness = models.IntegerField(default=0)
    finance = models.IntegerField(default=0)
    investigation = models.IntegerField(default=0)
    medicine = models.IntegerField(default=0)
    occult = models.IntegerField(default=0)
    politics = models.IntegerField(default=0)
    science = models.IntegerField(default=0)
    technology = models.IntegerField(default=0)

    ################################# Specialties ##############################
    # Physical
    athletics_spec = models.JSONField(null=True)
    brawl_spec = models.JSONField(null=True)
    craft_spec = models.JSONField(null=True)
    drive_spec = models.JSONField(null=True)
    firearms_spec = models.JSONField(null=True)
    larceny_spec = models.JSONField(null=True)
    melee_spec = models.JSONField(null=True)
    stealth_spec = models.JSONField(null=True)
    survival_spec = models.JSONField(null=True)
    # Social
    animal_ken_spec = models.JSONField(null=True)
    etiquette_spec = models.JSONField(null=True)
    insight_spec = models.JSONField(null=True)
    intimidation_spec = models.JSONField(null=True)
    leadership_spec = models.JSONField(null=True)
    performance_spec = models.JSONField(null=True)
    persuasion_spec = models.JSONField(null=True)
    streetwise_spec = models.JSONField(null=True)
    subterfuge_spec = models.JSONField(null=True)
    # Mental
    academics_spec = models.JSONField(null=True)
    awareness_spec = models.JSONField(null=True)
    finance_spec = models.JSONField(null=True)
    investigation_spec = models.JSONField(null=True)
    medicine_spec = models.JSONField(null=True)
    occult_spec = models.JSONField(null=True)
    politics_spec = models.JSONField(null=True)
    science_spec = models.JSONField(null=True)
    technology_spec = models.JSONField(null=True)
