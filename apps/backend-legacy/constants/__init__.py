"""
Central location for application-wide constants used throughout the backend.
Defines supporter tiers, limits for character sheets and trackers, and image error codes.
"""

from .splats import Splats, Versions


class Supporter:
    """
    Enum-like class for supporter tiers.
    Used to represent user support levels and unlock features accordingly.
    """

    NONE = 0  # No support
    MORTAL = 1  # Mortal tier
    FLEDGLING = 2  # Fledgling tier
    NEONATE = 3  # Neonate tier
    ANCILLA = 4  # Ancilla tier
    ELDER = 5  # Elder tier
    METHUSELAH = 6  # Methuselah tier
    ANTEDILUVIAN = 7  # Antediluvian tier

    @staticmethod
    def convert_patreon_id(tier_id):
        """
        Convert a Patreon tier ID to a Supporter tier constant.
        Returns the corresponding Supporter tier, or NONE if not matched.
        """
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


class ImageError:
    """
    Constants for image download errors.
    Used to indicate the result of image download and validation operations.
    """

    NO_URL = "NO_URL"  # No URL provided
    TOO_LARGE = "TOO_LARGE"  # Image file too large
    DOWNLOAD_FAILED = "DOWNLOAD_FAILED"  # Download failed
    INVALID_IMAGE = "INVALID_IMAGE"  # Image is not valid
    SUCCESS = "SUCCESS"  # Image download and validation succeeded


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
