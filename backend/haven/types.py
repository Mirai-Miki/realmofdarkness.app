from enum import Enum
from typing import Literal

from discordauth.supporter import Supporter


class Splats(Enum):
    """
    Enumeration of all character splats (types) supported by the system.
    Used throughout the application for type-safe character management.
    """

    VAMPIRE_20TH = "vampire20th"
    GHOUL_20TH = "ghoul20th"
    HUMAN_20TH = "human20th"
    WEREWOLF_20TH = "werewolf20th"
    CHANGELING_20TH = "changeling20th"
    MAGE_20TH = "mage20th"
    WRAITH_20TH = "wraith20th"
    DEMON_20TH = "demon20th"
    VAMPIRE_5TH = "vampire5th"
    HUMAN_5TH = "human5th"
    GHOUL_5TH = "ghoul5th"
    HUNTER_5TH = "hunter5th"
    WEREWOLF_5TH = "werewolf5th"


# Type aliases for common serializer types
SerializerType = Literal["tracker", "sheet", "deserializer"]


class CharacterSheetLimit:
    """
    Limits for the number of character sheets a user can have, based on supporter tier.
    """

    BASE = 2
    MORTAL = 4
    FLEDGLING = 8
    NEONATE = 30
    ANCILLA = 60
    ELDER = 150
    METHUSELAH = 300
    ANTEDILUVIAN = 500

    @staticmethod
    def get_amount(supporterLevel):
        """
        Get the character sheet limit for a given supporter level.
        """
        if supporterLevel == Supporter.NONE:
            return CharacterSheetLimit.BASE
        elif supporterLevel == Supporter.MORTAL:
            return CharacterSheetLimit.MORTAL
        elif supporterLevel == Supporter.FLEDGLING:
            return CharacterSheetLimit.FLEDGLING
        elif supporterLevel == Supporter.NEONATE:
            return CharacterSheetLimit.NEONATE
        elif supporterLevel == Supporter.ANCILLA:
            return CharacterSheetLimit.ANCILLA
        elif supporterLevel == Supporter.ELDER:
            return CharacterSheetLimit.ELDER
        elif supporterLevel == Supporter.METHUSELAH:
            return CharacterSheetLimit.METHUSELAH
        elif supporterLevel == Supporter.ANTEDILUVIAN:
            return CharacterSheetLimit.ANTEDILUVIAN
        else:
            return CharacterSheetLimit.BASE


class TrackerLimit:
    """
    Limits for the number of trackers a user can have, based on supporter tier.
    """

    BASE = 50
    MORTAL = 75
    FLEDGLING = 100
    NEONATE = 150
    ANCILLA = 200
    ELDER = 300
    METHUSELAH = 500
    ANTEDILUVIAN = 1000

    @staticmethod
    def get_amount(supporterLevel):
        """
        Get the tracker limit for a given supporter level.
        """
        if supporterLevel == Supporter.NONE:
            return TrackerLimit.BASE
        elif supporterLevel == Supporter.MORTAL:
            return TrackerLimit.MORTAL
        elif supporterLevel == Supporter.FLEDGLING:
            return TrackerLimit.FLEDGLING
        elif supporterLevel == Supporter.NEONATE:
            return TrackerLimit.NEONATE
        elif supporterLevel == Supporter.ANCILLA:
            return TrackerLimit.ANCILLA
        elif supporterLevel == Supporter.ELDER:
            return TrackerLimit.ELDER
        elif supporterLevel == Supporter.METHUSELAH:
            return TrackerLimit.METHUSELAH
        elif supporterLevel == Supporter.ANTEDILUVIAN:
            return TrackerLimit.ANTEDILUVIAN
        else:
            return TrackerLimit.BASE
