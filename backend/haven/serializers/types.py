"""
Type definitions for Character serializer data structures.

This module defines TypedDict classes for structured JSON fields
to ensure type safety and proper validation throughout the application.
"""

from typing import TypedDict, List

SpecializationList = List[str]


class ExperienceSpend(TypedDict):
    """
    Type definition for individual experience point expenditures.

    Attributes:
        description: Human-readable description of what the XP was spent on
        cost: Integer cost in experience points
    """

    description: str
    cost: int


# Type alias for list of experience spends
ExperienceSpendList = List[ExperienceSpend]


class AdvantageEntry(TypedDict):
    """
    Type definition for Character5th advantage entries (merits, flaws, backgrounds, etc.).

    Attributes:
        name: Name of the advantage
        description: Description of the advantage
        notes: Additional notes
        rating: Dot rating (1-5 typically)
        flaw: Whether this is a flaw
        modifier: Dice pool modifier value
    """

    name: str
    description: str
    notes: str
    rating: int
    flaw: bool
    modifier: int


AdvantageList = List[AdvantageEntry]


class HavenDetails5th(TypedDict):
    """
    Type definition for 5th Edition Haven character data.
    """

    name: str
    description: str
    location: str


class DamageTracker5th(TypedDict):
    """
    Type definition for 5th Edition damage tracking (willpower/health).

    Attributes:
        superficial: Superficial damage taken
        total: Total track size
        aggravated: Aggravated damage taken
    """

    superficial: int
    total: int
    aggravated: int


class HumanityTracker5th(TypedDict):
    """
    Type definition for 5th Edition humanity tracking.

    Attributes:
        current: Current humanity level
        stains: Number of stains on humanity
    """

    current: int
    stains: int


class HealthTracker20th(TypedDict):
    """
    Type definition for 20th Edition health tracking specifically.

    Attributes:
        bashing: Bashing damage taken
        lethal: Lethal damage taken
        aggravated: Aggravated damage taken
        total: Total health levels
    """

    bashing: int
    lethal: int
    aggravated: int
    total: int


ATTRIBUTES_5TH = [
    "strength",
    "dexterity",
    "stamina",
    "charisma",
    "manipulation",
    "composure",
    "intelligence",
    "wits",
    "resolve",
]

SKILLS_5TH = [
    "athletics",
    "brawl",
    "craft",
    "drive",
    "firearms",
    "larceny",
    "melee",
    "stealth",
    "survival",
    "animal_ken",
    "etiquette",
    "insight",
    "intimidation",
    "leadership",
    "performance",
    "persuasion",
    "streetwise",
    "subterfuge",
    "academics",
    "awareness",
    "finance",
    "investigation",
    "medicine",
    "occult",
    "politics",
    "science",
    "technology",
]


class SkillEntry5th(TypedDict):
    """
    Type definition for 5th Edition skill entries with specializations.

    Attributes:
        value: Skill level (0-5)
        spec: Specialization text (can be empty string)
    """

    value: int
    spec: SpecializationList


ATTRIBUTES_20TH = [
    "strength",
    "dexterity",
    "stamina",
    "charisma",
    "manipulation",
    "appearance",
    "perception",
    "intelligence",
    "wits",
]

SKILLS_20TH = [
    "alertness",
    "athletics",
    "awareness",
    "brawl",
    "empathy",
    "expression",
    "intimidation",
    "leadership",
    "streetwise",
    "subterfuge",
    "animal_ken",
    "crafts",
    "drive",
    "etiquette",
    "firearms",
    "larceny",
    "melee",
    "performance",
    "stealth",
    "survival",
    "academics",
    "computer",
    "finance",
    "investigation",
    "law",
    "medicine",
    "occult",
    "politics",
    "science",
    "technology",
]


class AttributeEntry20th(TypedDict):
    """
    Type definition for 20th Edition attribute entries with specializations.

    Attributes:
        value: Attribute level (1-5)
        spec: Specialization text (can be empty string)
    """

    value: int
    spec: SpecializationList


class ConsumableTracker(TypedDict):
    """
    Generic type definition for consumable trackers.
    """

    current: int
    total: int


class MoralityTracker20th(TypedDict):
    """
    Type definition for 20th Edition morality tracking.

    Attributes:
        name: Name of the morality
        description: Description of the morality
        current: Current morality value
    """

    name: str
    description: str
    value: int


class TormentTracker(TypedDict):
    """
    Type definition for Demon20th torment tracking.

    Attributes:
        permanent: Permanent Torment value
        temporary: Temporary Torment value
    """

    permanent: int
    temporary: int


class ClanInfo(TypedDict):
    """
    Type definition for Vampire20th clan information.

    Attributes:
        name: Name of the clan
        description: Description of the clan
    """

    name: str
    description: str


class QuintTracker(TypedDict):
    """
    Type definition for Mage20th specific trackers.

    Attributes:
        paradox: Current Paradox points (0-20)
        quintessence: Current Quintessence points (0-20)
    """

    paradox: int
    quintessence: int
