from haven.serializers import *
from haven.models import (
    Vampire5th,
    Werewolf5th,
    Hunter5th,
    Human5th,
    Ghoul5th,
    Vampire20th,
    Werewolf20th,
    Mage20th,
    Changeling20th,
    Wraith20th,
    Human20th,
    Ghoul20th,
    DemonTF,
    Character,
)


def get_derived_instance(character):
    """
    Returns the derived instance of a character based on its type.

    Args:
        character: The character instance to get the derived instance for.

    Returns:
        The derived instance of the character. If none of the derived models match,
        the original character instance is returned.
    """
    # Check if the instance is a base Character model
    if type(character) == Character:
        # Use the splat to get the specific instance of the derived class
        model = get_character_model(character.splat)
        derived_instance = model.objects.get(pk=character.pk)
        return derived_instance

    return character


# Define a dictionary mapping each splat to its corresponding configuration
SPLAT_CLASSES = {
    "vampire5th": {
        "model": Vampire5th,
        "trackerSerializer": V5TrackerSerializer,
        "serializer": Vampire5thSerializer,
        "deserializer": Vampire5thDeserializer,
    },
    "werewolf5th": {
        "model": Werewolf5th,
        "trackerSerializer": W5TrackerSerializer,
        "serializer": Werewolf5thSerializer,
        "deserializer": Werewolf5thDeserializer,
    },
    "hunter5th": {
        "model": Hunter5th,
        "trackerSerializer": Hunter5thTrackerSerializer,
        "serializer": Hunter5thSerializer,
        "deserializer": Hunter5thDeserializer,
    },
    "human5th": {
        "model": Human5th,
        "trackerSerializer": Human5thTrackerSerializer,
        "serializer": Human5thSerializer,
        "deserializer": Human5thDeserializer,
    },
    "ghoul5th": {
        "model": Ghoul5th,
        "trackerSerializer": Ghoul5thTrackerSerializer,
        "serializer": Ghoul5thSerializer,
        "deserializer": Ghoul5thDeserializer,
    },
    "vampire20th": {
        "model": Vampire20th,
        "trackerSerializer": V20TrackerSerializer,
        "serializer": Vampire20thSerializer,
        "deserializer": Vampire20thDeserializer,
    },
    "werewolf20th": {
        "model": Werewolf20th,
        "trackerSerializer": Werewolf20thTrackerSerializer,
        "serializer": Werewolf20thSerializer,
        "deserializer": Werewolf20thDeserializer,
    },
    "mage20th": {
        "model": Mage20th,
        "trackerSerializer": Mage20thTrackerSerializer,
        "serializer": Mage20thSerializer,
        "deserializer": Mage20thDeserializer,
    },
    "changeling20th": {
        "model": Changeling20th,
        "trackerSerializer": C20TrackerSerializer,
        "serializer": Changeling20thSerializer,
        "deserializer": Changeling20thDeserializer,
    },
    "wraith20th": {
        "model": Wraith20th,
        "trackerSerializer": Wraith20thTrackerSerializer,
        "serializer": Wraith20thSerializer,
        "deserializer": Wraith20thDeserializer,
    },
    "human20th": {
        "model": Human20th,
        "trackerSerializer": Human20thTrackerSerializer,
        "serializer": Human20thSerializer,
        "deserializer": Human20thDeserializer,
    },
    "ghoul20th": {
        "model": Ghoul20th,
        "trackerSerializer": Ghoul20thTrackerSerializer,
        "serializer": Ghoul20thSerializer,
        "deserializer": Ghoul20thDeserializer,
    },
    "demon20th": {
        "model": DemonTF,
        "trackerSerializer": DtfTrackerSerializer,
        "serializer": DemonTFSerializer,
        "deserializer": DemonTFDeserializer,
    },
}


def get_splat_classes(splat):
    """
    Returns the character classes for the specified splat.

    Args:
        splat: The splat to get the character classes for.

    Returns:
        A dictionary containing the character classes for the specified splat.
        If the splat is not found, returns a default configuration.
    """
    return SPLAT_CLASSES.get(
        splat,
        {
            "model": Character,
            "trackerSerializer": None,
            "serializer": None,
            "deserializer": None,
        },
    )


def get_character_model(splat):
    """
    Returns the character class based on the given splat.

    Args:
        splat (str): The splat of the character.

    Returns:
        class: The character class corresponding to the given splat.

    """
    return get_splat_classes(splat)["model"]


def get_deserializer(splat):
    """
    Returns the character deserializer based on the given splat.

    Args:
        splat (str): The splat of the character.

    Returns:
        class: The character deserializer corresponding to the given splat.

    """
    return get_splat_classes(splat)["deserializer"]


def get_serializer(splat):
    """
    Returns the character serializer based on the given splat.

    Args:
        splat (str): The splat of the character.

    Returns:
        class: The character serializer corresponding to the given splat.

    """
    return get_splat_classes(splat)["serializer"]


def get_tracker_serializer(splat):
    """
    Returns the tracker serializer based on the given splat.

    Args:
        splat (str): The splat of the character.

    Returns:
        class: The tracker serializer corresponding to the given splat.

    """
    return get_splat_classes(splat)["trackerSerializer"]
