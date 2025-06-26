from .serializeCharacter import (
    serializeVampire20th,
    serializeChangeling20th,
    serializeDemon20th,
    serializeGhoul20th,
    serializeHuman20th,
    serializeMage20th,
    serializeMortal5th,
    serializeVampire5th,
    serializeWerewolf20th,
    serializeWraith20th,
    serializeHunter5th,
)
from gateway.constants import Splats
from .serializeUser import serialize_user
from .serializeChronicle import serialize_chronicle
from .serializeMember import serialize_member

from haven.utility import get_derived_instance, get_tracker_serializer

serializers = {
    Splats.changeling20th: serializeChangeling20th,
    Splats.demonTF: serializeDemon20th,
    Splats.mage20th: serializeMage20th,
    Splats.wraith20th: serializeWraith20th,
    Splats.werewolf20th: serializeWerewolf20th,
    Splats.vampire20th: serializeVampire20th,
    Splats.ghoul20th: serializeGhoul20th,
    Splats.human20th: serializeHuman20th,
    Splats.vampire5th: serializeVampire5th,
    Splats.mortal5th: serializeMortal5th,
    Splats.hunter5th: serializeHunter5th,
}


def serialize_character(base_character):
    character = get_derived_instance(base_character)
    TrackerSerializer = get_tracker_serializer(character.splat_new)
    if character.splat_new:
        return TrackerSerializer(character).data
    else:
        return serializers[character.splat.slug](character)
