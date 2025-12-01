"use strict";
require(`${process.cwd()}/alias`);
const Character5th = require("./base/Character5th");
const Humanity = require("../Humanity5th.js");
const { Splats } = require("@constants");
const { EmbedBuilder } = require("discord.js");

module.exports = class Human5th extends Character5th {
  constructor({ client, name, health = 4, willpower = 2, humanity = 7 } = {}) {
    super({ client, name, health, willpower });
    this.splat = Splats.human5th;
    this.humanity = new Humanity(humanity);
  }

  static getSplat() {
    return Splats.human5th;
  }

  setFields(args) {
    super.setFields(args);
    if (args.humanity != null) this.humanity.setCurrent(args.humanity);
    if (args.stains != null) this.humanity.setStains(args.stains);
  }

  updateFields(args) {
    super.updateFields(args);
    if (args.humanity != null) this.humanity.updateCurrent(args.humanity);
    if (args.stains != null) this.humanity.takeStains(args.stains);
  }

  async deserilize(char) {
    await super.deserilize(char);
    this.humanity = new Humanity(char.humanity);
    this.humanity.takeStains(char.stains);
    return this;
  }

  serialize() {
    const s = super.serialize();
    s.character["splat"] = this.splat.slug;
    s.character["humanity"] = this.humanity.total;
    s.character["stains"] = this.humanity.stains;
    return s;
  }

  getEmbed(notes) {
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
    embed.data.fields.at(-1).value += links;
    return embed;
  }
};
