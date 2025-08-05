"""
Type definitions for Character serializer data structures.

This module defines TypedDict classes for structured JSON fields
to ensure type safety and proper validation throughout the application.
"""

from typing import TypedDict, List


class ExperienceSpend(TypedDict):
    """
    Type definition for individual experience point expenditures.

    Attributes:
        description: Human-readable description of what the XP was spent on (max 80 chars)
        cost: Integer cost in experience points
    """

    description: str
    cost: int


class ExperienceData(TypedDict):
    """
    Type definition for character experience point tracking.

    Attributes:
        current: Current unspent experience points
        total: Total experience points ever earned
    """

    current: int
    total: int


# Type alias for list of experience spends
ExperienceSpendList = List[ExperienceSpend]


class AdvantageEntry(TypedDict):
    """
    Type definition for Character5th advantage entries (merits, flaws, backgrounds, etc.).

    Attributes:
        name: Name of the advantage (max 80 chars)
        description: Description of the advantage (max 1000 chars)
        notes: Additional notes (max 1000 chars)
        rating: Dot rating (1-5 typically)
        flaw: Whether this is a flaw (negative trait)
        modifier: Dice pool modifier value
    """

    name: str
    description: str
    notes: str
    rating: int
    flaw: bool
    modifier: int


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


class DamageTracker20th(TypedDict):
    """
    Type definition for 20th Edition damage tracking.

    For Willpower:
        current: Current willpower points
        total: Total willpower points

    For Health:
        bashing: Bashing damage taken
        lethal: Lethal damage taken
        aggravated: Aggravated damage taken
        total: Total health levels
    """

    current: int
    total: int


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
    spec: str  # Will be empty string if no specialization


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
    spec: str  # Will be empty string if no specialization


class SkillEntry20th(TypedDict):
    """
    Type definition for 20th Edition skill entries with specializations.

    Attributes:
        value: Skill level (0-5)
        spec: Specialization text (can be empty string)
    """

    value: int
    spec: str  # Will be empty string if no specialization


# Type aliases for common collections
AdvantageList = List[AdvantageEntry]
SkillSpecializationList = List[str]  # For JSON skill specialization fields
