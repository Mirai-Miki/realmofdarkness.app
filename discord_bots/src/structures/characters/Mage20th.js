"use strict";
require(`${process.cwd()}/alias`);
const Consumable = require("../Consumable");
const Quintessence = require("../Quintessence");
const Character20th = require("./base/Character20th");
const { Splats, Emoji } = require("@constants");
const { EmbedBuilder } = require("discord.js");

module.exports = class Mage extends Character20th {
  constructor({
    client,
    name,
    willpower = 5,
    arete = 1,
    quintessence = 5,
    paradox = 0,
  } = {}) {
    super({ client, name, willpower });
    this.splat = Splats.mage20th;
    this.arete = new Consumable(10, arete, 0);
    this.quint = new Quintessence({
      quintessence: quintessence,
      paradox: paradox,
    });
  }

  static getSplat() {
    return Splats.mage20th;
  }

  setFields(args) {
    super.setFields(args);
    if (args.arete != null) this.arete.setCurrent(args.arete);
    if (args.paradox != null) this.quint.setParadox(args.paradox);
    if (args.quintessence != null) this.quint.setQuint(args.quintessence);
  }

  updateFields(args) {
    super.updateFields(args);
    if (args.arete != null) this.arete.updateCurrent(args.arete);
    if (args.quintessence != null) this.quint.updateQuint(args.quintessence);
    if (args.paradox != null) this.quint.updateParadox(args.paradox);
  }

  async deserilize(char) {
    await super.deserilize(char);
    this.arete.setCurrent(char.arete);
    this.quint.setQuint(char.quintessence);
    this.quint.setParadox(char.paradox);
    return this;
  }

  serialize() {
    const s = super.serialize();
    s.character["splat"] = this.splat.slug;
    s.character["arete"] = this.arete.current;
    s.character["quintessence"] = this.quint.quintessence;
    s.character["paradox"] = this.quint.paradox;
    return s;
  }

  getEmbed(notes) {
    const embed = new EmbedBuilder()
      .setColor(this.color)
      .setAuthor(this.getAuthor())
      .setTitle(this.name)
      .setURL("https://realmofdarkness.app/");

    if (this.thumbnail) embed.setThumbnail(this.thumbnail);

    embed.addFields({
      name: `Willpower [${this.willpower.current}/${this.willpower.total}]`,
      value: this.willpower.getTracker({
        emoji: Emoji.tracker_3_filled.toString(),
      }),
      inline: false,
    });

    embed.addFields({
      name: `Arete ${this.arete.current}`,
      value: this.arete.getTracker({
        emoji: Emoji.tracker_0_filled.toString(),
      }),
      inline: false,
    });

    embed.addFields({
      name:
        `Quintessence ${this.quint.quintessence} ` +
        `& Paradox ${this.quint.paradox}`,
      value: this.quint.getTracker(),
      inline: false,
    });

    embed.addFields({
      name: "Health",
      value: this.health.getTracker(),
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
      "\n[Website](https://realmofdarkness.app/) " +
      "| [Commands](https://realmofdarkness.app/20th/commands/) " +
      "| [Patreon](https://www.patreon.com/MiraiMiki)";
    embed.data.fields.at(-1).value += links;

    return embed;
  }
};
