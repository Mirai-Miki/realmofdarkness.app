"use strict";
require(`${process.cwd()}/alias`);
const Consumable = require("../Consumable");
const Character20th = require("./base/Character20th");
const { Splats, Emoji } = require("@constants");
const { EmbedBuilder } = require("discord.js");

module.exports = class Werewolf20th extends Character20th {
  constructor({ client, name, rage = 7, gnosis = 7, willpower = 6 } = {}) {
    super({ client, name, willpower });
    this.splat = Splats.werewolf20th;
    this.rage = new Consumable(rage, rage, 0);
    this.gnosis = new Consumable(gnosis, gnosis, 0);
    this.rage.unlock(10);
  }

  static getSplat() {
    return Splats.werewolf20th;
  }

  setFields(args) {
    super.setFields(args);
    if (args.rage != null) this.rage.setTotal(args.rage);
    if (args.gnosis != null) this.gnosis.setTotal(args.gnosis);
  }

  updateFields(args) {
    super.updateFields(args);
    if (args.rage != null) this.rage.updateCurrent(args.rage);
    if (args.gnosis != null) this.gnosis.updateCurrent(args.gnosis);
  }

  async deserilize(char) {
    await super.deserilize(char);
    this.rage.setTotal(char.rage_total);
    this.rage.setCurrent(char.rage_current);
    this.gnosis.setTotal(char.gnosis_total);
    this.gnosis.setCurrent(char.gnosis_current);
    return this;
  }

  serialize() {
    const s = super.serialize();
    s.character["splat"] = this.splat.slug;
    s.character["rage_total"] = this.rage.total;
    s.character["rage_current"] = this.rage.current;
    s.character["gnosis_total"] = this.gnosis.total;
    s.character["gnosis_current"] = this.gnosis.current;
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
      name: `Rage [${this.rage.current}/${this.rage.total}]`,
      value: this.rage.getTracker({ emoji: Emoji.tracker_2_filled.toString() }),
      inline: false,
    });

    embed.addFields({
      name: `Gnosis [${this.gnosis.current}/${this.gnosis.total}]`,
      value: this.gnosis.getTracker({
        emoji: Emoji.tracker_1_filled.toString(),
      }),
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
