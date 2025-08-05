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
