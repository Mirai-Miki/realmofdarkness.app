"use strict";
require(`${process.cwd()}/alias`);
const Consumable = require("../Consumable");
const Character20th = require("./base/Character20th");
const { Splats, Emoji } = require("@constants");
const { EmbedBuilder } = require("discord.js");

module.exports = class Wraith20 extends Character20th {
  constructor({ client, name, corpus = 10, pathos = 5, willpower = 6 } = {}) {
    super({ client, name, willpower });
    this.splat = Splats.wraith20th;
    this.corpus = new Consumable(corpus, corpus, 0);
    this.pathos = new Consumable(10, pathos, 0);
  }

  static getSplat() {
    return Splats.wraith20th;
  }

  setFields(args) {
    super.setFields(args);
    if (args.corpus != null) this.corpus.setTotal(args.corpus);
    if (args.pathos != null) this.pathos.setCurrent(args.pathos);
  }

  updateFields(args) {
    super.updateFields(args);
    if (args.corpus != null) this.corpus.updateCurrent(args.corpus);
    if (args.pathos != null) this.pathos.updateCurrent(args.pathos);
  }

  async deserilize(char) {
    await super.deserilize(char);
    this.corpus.setTotal(char.corpus_total);
    this.corpus.setCurrent(char.corpus_current);
    this.pathos.setCurrent(char.pathos);
    return this;
  }

  serialize() {
    const s = super.serialize();
    s.character["splat"] = this.splat.slug;
    s.character["corpus_total"] = this.corpus.total;
    s.character["corpus_current"] = this.corpus.current;
    s.character["pathos"] = this.pathos.current;
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
      name: `Corpus [${this.corpus.current}/${this.corpus.total}]`,
      value: this.corpus.getTracker({
        emoji: Emoji.tracker_0_filled.toString(),
      }),
      inline: false,
    });

    embed.addFields({
      name: `Pathos ${this.pathos.current}`,
      value: this.pathos.getTracker({
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
