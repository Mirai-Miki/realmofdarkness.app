class Splat:
    def __init__(self, name, version, slug):
        self.name = name
        self.version = version
        self.slug = slug


class Splats:
    vampire20th = Splat("Vampire", "20th", "vampire20th")
    ghoul20th = Splat("Ghoul", "20th", "ghoul20th")
    human20th = Splat("Human", "20th", "human20th")
    werewolf20th = Splat("Werewolf", "20th", "werewolf20th")
    changeling20th = Splat("Changeling", "20th", "changeling20th")
    mage20th = Splat("Mage", "20th", "mage20th")
    wraith20th = Splat("Wraith", "20th", "wraith20th")
    demon20th = Splat("Demon", "20th", "demon20th")
    vampire5th = Splat("Vampire", "5th", "vampire5th")
    human5th = Splat("Human", "5th", "human5th")
    ghoul5th = Splat("Ghoul", "5th", "ghoul5th")
    hunter5th = Splat("Hunter", "5th", "hunter5th")
    werewolf5th = Splat("Werewolf", "5th", "werewolf5th")


class Versions:
    v5 = "5th"
    v20 = "20th"
