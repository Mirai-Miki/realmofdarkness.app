"use strict";
require(`${process.cwd()}/alias`);
/**
 * Represents a Vampire character in the 5th edition of the game.
 * @class
 * @extends Character5th
 */
const Consumable = require("../Consumable");
const Character5th = require("./base/Character5th");
const Humanity = require("../Humanity5th");
const { Splats } = require("@constants");
const { EmbedBuilder } = require("discord.js");

module.exports = class Vampire5th extends Character5th {
  /**
   * Creates a new instance of the Vampire5th class.
   * @constructor
   * @param {Object} options - The options for the Vampire5th character.
   * @param {Object} options.client - The Discord client.
   * @param {string} options.name - The name of the character.
   * @param {number} [options.health=4] - The health of the character.
   * @param {number} [options.willpower=2] - The willpower of the character.
   * @param {number} [options.humanity=7] - The humanity of the character.
   */
  constructor({ client, name, health = 4, willpower = 2, humanity = 7 } = {}) {
    super({ client, name, health, willpower });

    this.splat = Splats.vampire5th;
    this.hunger = new Consumable(5, 1, 0);
    this.humanity = new Humanity(humanity);
  }

  static getSplat() {
    return Splats.vampire5th;
  }

  setFields(args) {
    super.setFields(args);
    if (args.hunger != null) this.hunger.setCurrent(args.hunger);
    if (args.humanity != null) this.humanity.setCurrent(args.humanity);
    if (args.stains != null) this.humanity.setStains(args.stains);
  }

  updateFields(args) {
    super.updateFields(args);
    if (args.hunger != null) this.hunger.updateCurrent(args.hunger);
    if (args.humanity != null) this.humanity.updateCurrent(args.humanity);
    if (args.stains != null) this.humanity.takeStains(args.stains);
  }

  async deserilize(json) {
    await super.deserilize(json);
    this.hunger.setCurrent(json.hunger);
    this.humanity = new Humanity(json.humanity);
    this.humanity.takeStains(json.stains);
    this.class = json.class;
    this.disciplines = json.disciplines;
    this.bloodPotency = json.blood_potency;
    return this;
  }

  serialize() {
    const serializer = super.serialize();
    serializer.character["splat"] = this.splat.slug;
    serializer.character["hunger"] = this.hunger.current;
    serializer.character["humanity"] = this.humanity.total;
    serializer.character["stains"] = this.humanity.stains;
    return serializer;
  }

  getEmbed(notes) {
    let hungerOverflow = "";
    // Adding Hunger messages if character has hunger
    if (this.hunger.overflow > 0) {
      hungerOverflow =
        `${this.hunger.overflow} hunger has ` +
        "overflowed. You should now do a hunger frenzy check. p220";
    } else if (this.hunger.current == 5) {
      hungerOverflow =
        `Hunger is currently 5` +
        ". You can no longer intentionally rouse the blood. p211";
    }

    const embed = new EmbedBuilder();
    embed
      .setColor(this.color)
      .setURL("https://realmofdarkness.app/")
      .setTitle(this.name)
      .setAuthor(this.getAuthor());

    embed.addFields({
      name: "Willpower",
      value:
        this.willpower.getTracker() +
        this.willpower.getHealthStatus("willpower"),
      inline: false,
    });
    embed.addFields({
      name: "Health",
      value: this.health.getTracker() + this.health.getHealthStatus("health"),
      inline: false,
    });

    if (this.thumbnail) embed.setThumbnail(this.thumbnail);

    embed.addFields({
      name: "Humanity",
      value: this.humanity.getTracker() + this.humanity.getDegenerationInfo(),
      inline: false,
    });

    embed.addFields({
      name: "Hunger",
      value: this.hunger.getTracker() + hungerOverflow,
      inline: false,
    });

    if (this.exp.total)
      embed.addFields({
        name: "Experience",
        value: this.exp.getTracker({ showEmoji: false }),
        inline: false,
      });

    if (notes) embed.addFields({ name: "Notes", value: notes });

    const links =
      "\n[Website](https://realmofdarkness.app/)" +
      " | [Commands](https://realmofdarkness.app/v5/commands/)" +
      " | [Patreon](https://www.patreon.com/MiraiMiki)";
    embed.addFields({ name: "⠀", value: links });
    return embed;
  }
};
