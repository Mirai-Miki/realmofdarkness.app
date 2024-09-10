from .serializeCharacter import serialize20th, serialize5th


def serializeChangeling20th(character):
    s = serialize20th(character)

    glamour = character.trackable.get(slug="glamour")
    banality = character.trackable.get(slug="banality")
    nightmare = character.trackable.get(slug="nightmare")
    imbalance = character.trackable.get(slug="imbalance")
    chimerical = character.health.get(slug="chimerical")

    s["glamour"] = {"total": glamour.total, "current": glamour.current}
    s["banality"] = {"total": banality.total, "current": banality.current}
    s["nightmare"] = nightmare.current
    s["imbalance"] = imbalance.current
    s["chimerical"] = {
        "total": chimerical.total,
        "bashing": chimerical.bashing,
        "lethal": chimerical.lethal,
        "aggravated": chimerical.aggravated,
    }

    return s


def serializeDemon20th(character):
    s = serialize20th(character)

    faith = character.trackable.get(slug="faith")
    torment = character.trackable.get(slug="torment")

    s["faith"] = {"total": faith.total, "current": faith.current}
    s["torment"] = {"total": torment.total, "current": torment.current}

    return s


def serializeWerewolf20th(character):
    s = serialize20th(character)

    rage = character.trackable.get(slug="rage")
    gnosis = character.trackable.get(slug="gnosis")

    s["rage"] = {"total": rage.total, "current": rage.current}
    s["gnosis"] = {"total": gnosis.total, "current": gnosis.current}

    return s


def serializeMage20th(character):
    s = serialize20th(character)

    arete = character.trackable.get(slug="arete")
    quint_paradox = character.trackable.get(slug="quint_paradox")

    s["arete"] = arete.current
    s["quintessence"] = quint_paradox.total
    s["paradox"] = quint_paradox.current
    return s


def serializeWraith20th(character):
    s = serialize20th(character)

    pathos = character.trackable.get(slug="pathos")
    corpus = character.trackable.get(slug="corpus")

    s["pathos"] = pathos.current
    s["corpus"] = {"total": corpus.total, "current": corpus.current}

    return s


def serializeVampire20th(character):
    s = serialize20th(character)

    blood = character.trackable.get(slug="blood")

    s["blood_total"] = blood.total
    s["blood_current"] = blood.current

    s["morality_name"] = character.morality.morality_info.name
    s["morality_value"] = character.morality.current

    return s


def serializeGhoul20th(character):
    s = serialize20th(character)

    blood = character.trackable.get(slug="blood")
    vitae = character.trackable.get(slug="vitae")

    s["blood"] = blood.current
    s["vitae"] = vitae.current
    s["morality"] = character.morality.current

    return s


def serializeHuman20th(character):
    s = serialize20th(character)

    blood = character.trackable.get(slug="blood")

    s["blood"] = blood.current
    s["morality"] = character.morality.current

    return s


def serializeVampire5th(character):
    s = serialize5th(character)

    hunger = character.trackable.get(slug="hunger")

    s["hunger"] = hunger.current
    s["humanity"] = character.old_humanity.current
    s["stains"] = character.old_humanity.stains

    return s


def serializeMortal5th(character):
    s = serialize5th(character)

    s["humanity"] = {
        "total": character.old_humanity.current,
        "stains": character.old_humanity.stains,
    }

    return s


def serializeHunter5th(character):
    s = serialize5th(character)

    s["desperation"] = character.trackable.get(slug="desperation").current
    s["danger"] = character.trackable.get(slug="danger").current
    s["despair"] = character.hunter5th.despair

    return s
