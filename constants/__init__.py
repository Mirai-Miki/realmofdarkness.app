"""
Central location for application-wide constants
"""

from .splats import Splats, Versions


class Supporter:
    NONE = 0
    FLEDGLING = 1
    NEONATE = 2
    ANCILLA = 3
    ELDER = 4
    METHUSELAH = 5

    @staticmethod
    def convert_patreon_id(tier_id):
        if tier_id == "8618368":
            return Supporter.FLEDGLING
        elif tier_id == "8618737":
            return Supporter.NEONATE
        elif tier_id == "8618768":
            return Supporter.ANCILLA
        elif tier_id == "8618838":
            return Supporter.ELDER
        elif tier_id == "8618981":
            return Supporter.METHUSELAH
        else:
            return Supporter.NONE


class CharacterSheetLimit:
    BASE = 2
    MORTAL = 4
    FLEDGLING = 8
    NEONATE = 30
    ANCILLA = 200

    @staticmethod
    def get_amount(supporterLevel):
        if supporterLevel == Supporter.NONE:
            return CharacterSheetLimit.BASE
        elif supporterLevel == Supporter.FLEDGLING:
            return CharacterSheetLimit.FLEDGLING
        elif supporterLevel == Supporter.NEONATE:
            return CharacterSheetLimit.NEONATE
        elif supporterLevel >= Supporter.ANCILLA:
            return CharacterSheetLimit.ANCILLA


class ImageError:
    """Constants for image download errors"""

    NO_URL = "NO_URL"
    TOO_LARGE = "TOO_LARGE"
    DOWNLOAD_FAILED = "DOWNLOAD_FAILED"
    INVALID_IMAGE = "INVALID_IMAGE"
    SUCCESS = "SUCCESS"


class TrackerLimit:
    BASE = 50
    FLEDGLING = 100
    NEONATE = 150
    ANCILLA = 200
    ELDER = 300
    METHUSELAH = 500

    @staticmethod
    def get_amount(supporterLevel):
        if supporterLevel == Supporter.NONE:
            return TrackerLimit.BASE
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
        else:
            return TrackerLimit.BASE
