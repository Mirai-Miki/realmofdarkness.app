"""
Supporter tier definitions for Realm of Darkness platform.

This module defines supporter tiers and provides conversion utilities
for integrating with external platforms like Patreon.
"""

from typing import Optional


class Supporter:
    """
    Enum-like class for supporter tiers.
    Used to represent user support levels and unlock features accordingly.

    Tier levels progress from NONE (0) to ANTEDILUVIAN (7), following
    World of Darkness vampire hierarchy terminology.
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
    def convert_patreon_id(tier_id: Optional[str]) -> int:
        """
        Convert a Patreon tier ID to a Supporter tier constant.

        Args:
            tier_id: The Patreon tier ID string, or None

        Returns:
            The corresponding Supporter tier, or NONE if not matched

        Security notes:
            - Handles None input gracefully
            - Returns safe default (NONE) for unknown tiers
            - Uses exact string matching to prevent injection
        """
        if tier_id is None:
            return Supporter.NONE

        # Patreon tier ID mappings
        tier_mapping = {
            "8618368": Supporter.FLEDGLING,
            "8618737": Supporter.NEONATE,
            "8618768": Supporter.ANCILLA,
            "8618838": Supporter.ELDER,
            "8618981": Supporter.METHUSELAH,
        }

        return tier_mapping.get(tier_id, Supporter.NONE)

    @staticmethod
    def get_tier_name(tier: int) -> str:
        """
        Get the human-readable name for a supporter tier.

        Args:
            tier: The supporter tier integer value

        Returns:
            The tier name as a string
        """
        tier_names = {
            Supporter.NONE: "None",
            Supporter.MORTAL: "Mortal",
            Supporter.FLEDGLING: "Fledgling",
            Supporter.NEONATE: "Neonate",
            Supporter.ANCILLA: "Ancilla",
            Supporter.ELDER: "Elder",
            Supporter.METHUSELAH: "Methuselah",
            Supporter.ANTEDILUVIAN: "Antediluvian",
        }

        return tier_names.get(tier, "Unknown")

    @staticmethod
    def is_valid_tier(tier: int) -> bool:
        """
        Check if a tier value is valid.

        Args:
            tier: The tier value to validate

        Returns:
            True if the tier is valid, False otherwise
        """
        return Supporter.NONE <= tier <= Supporter.ANTEDILUVIAN
