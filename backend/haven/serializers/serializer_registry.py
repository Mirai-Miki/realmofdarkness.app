"""
Serializer Registry for dynamic serializer selection based on character splat.

This module provides a centralized registry that maps character splats to their
corresponding serializers (tracker, sheet, and deserializer variants).
"""

from typing import Type, Dict
from rest_framework.serializers import ModelSerializer

from ..types import Splats, SerializerType

# Import all serializers
from .Vampire5th import *
from .Werewolf5th import *
from .Vampire20th import *
from .Changeling20th import *
from .Demon20th import *
from .Ghoul5th import *
from .Ghoul20th import *
from .Human5th import *
from .Human20th import *
from .Hunter5th import *
from .Mage20th import *
from .Werewolf20th import *
from .Wraith20th import *


class SerializerRegistry:
    """
    Static registry for managing all serializers for each splat/system.

    Maps splat/system to a dictionary of serializer types (tracker, sheet, deserializer).
    Provides type-safe access to the correct serializer for any character type.
    """

    # Registry mapping splats to their serializers
    _registry: Dict[Splats, Dict[SerializerType, Type[ModelSerializer]]] = {
        Splats.VAMPIRE_5TH: {
            "tracker": Vampire5thTrackerSerializer,
            "sheet": Vampire5thSerializer,
            "deserializer": Vampire5thDeserializer,
        },
        Splats.WEREWOLF_5TH: {
            "tracker": Werewolf5thTrackerSerializer,
            "sheet": Werewolf5thSerializer,
            "deserializer": Werewolf5thDeserializer,
        },
        Splats.VAMPIRE_20TH: {
            "tracker": Vampire20thTrackerSerializer,
            "sheet": Vampire20thSerializer,
            "deserializer": Vampire20thDeserializer,
        },
        Splats.CHANGELING_20TH: {
            "tracker": Changeling20thTrackerSerializer,
            "sheet": Changeling20thSerializer,
            "deserializer": Changeling20thDeserializer,
        },
        Splats.DEMON_20TH: {
            "tracker": Demon20thTrackerSerializer,
            "sheet": Demon20thSerializer,
            "deserializer": Demon20thDeserializer,
        },
        Splats.GHOUL_5TH: {
            "tracker": Ghoul5thTrackerSerializer,
            "sheet": Ghoul5thSerializer,
            "deserializer": Ghoul5thDeserializer,
        },
        Splats.GHOUL_20TH: {
            "tracker": Ghoul20thTrackerSerializer,
            "sheet": Ghoul20thSerializer,
            "deserializer": Ghoul20thDeserializer,
        },
        Splats.HUMAN_5TH: {
            "tracker": Human5thTrackerSerializer,
            "sheet": Human5thSerializer,
            "deserializer": Human5thDeserializer,
        },
        Splats.HUMAN_20TH: {
            "tracker": Human20thTrackerSerializer,
            "sheet": Human20thSerializer,
            "deserializer": Human20thDeserializer,
        },
        Splats.HUNTER_5TH: {
            "tracker": Hunter5thTrackerSerializer,
            "sheet": Hunter5thSerializer,
            "deserializer": Hunter5thDeserializer,
        },
        Splats.MAGE_20TH: {
            "tracker": Mage20thTrackerSerializer,
            "sheet": Mage20thSerializer,
            "deserializer": Mage20thDeserializer,
        },
        Splats.WEREWOLF_20TH: {
            "tracker": Werewolf20thTrackerSerializer,
            "sheet": Werewolf20thSerializer,
            "deserializer": Werewolf20thDeserializer,
        },
        Splats.WRAITH_20TH: {
            "tracker": Wraith20thTrackerSerializer,
            "sheet": Wraith20thSerializer,
            "deserializer": Wraith20thDeserializer,
        },
    }

    @classmethod
    def get_serializer(
        cls, splat: Splats, serializer_type: SerializerType
    ) -> Type[ModelSerializer]:
        """
        Get the serializer class for a given splat and serializer type.

        Args:
            splat: The character splat (from Splats enum)
            serializer_type: Type of serializer needed ('tracker', 'sheet', 'deserializer')

        Returns:
            The appropriate serializer class

        Raises:
            KeyError: If the splat or serializer type is not found in registry
        """
        try:
            return cls._registry[splat][serializer_type]
        except KeyError as e:
            raise KeyError(
                f"No {serializer_type} serializer found for splat {splat.value}"
            ) from e

    @classmethod
    def get_serializer_by_string(
        cls, splat_str: str, serializer_type: SerializerType
    ) -> Type[ModelSerializer]:
        """
        Get the serializer class for a given splat string and serializer type.

        Args:
            splat_str: The character splat as a string value
            serializer_type: Type of serializer needed ('tracker', 'sheet', 'deserializer')

        Returns:
            The appropriate serializer class

        Raises:
            ValueError: If the splat string is not a valid Splats enum value
            KeyError: If the serializer type is not found for the splat
        """
        try:
            splat = Splats(splat_str)
            return cls.get_serializer(splat, serializer_type)
        except ValueError as e:
            raise ValueError(f"Invalid splat string: {splat_str}") from e

    @classmethod
    def is_supported_splat(cls, splat: Splats) -> bool:
        """
        Check if a splat is supported by the registry.

        Args:
            splat: The character splat to check

        Returns:
            True if the splat is supported, False otherwise
        """
        return splat in cls._registry

    @classmethod
    def get_supported_splats(cls) -> list[Splats]:
        """
        Get a list of all supported splats.

        Returns:
            List of all supported Splats enum values
        """
        return list(cls._registry.keys())

    @classmethod
    def get_available_serializer_types(cls, splat: Splats) -> list[SerializerType]:
        """
        Get available serializer types for a given splat.

        Args:
            splat: The character splat

        Returns:
            List of available serializer types for the splat

        Raises:
            KeyError: If the splat is not found in registry
        """
        if splat not in cls._registry:
            raise KeyError(f"Splat {splat.value} not found in registry")

        return list(cls._registry[splat].keys())
