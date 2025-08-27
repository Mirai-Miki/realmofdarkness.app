"use strict";
require(`${process.cwd()}/alias`);
const Consumable = require("../Consumable");
const Character20th = require("./base/Character20th");
const { Splats, Emoji } = require("@constants");
const { EmbedBuilder } = require("discord.js");

module.exports = class Vampire20th extends Character20th {
  constructor({ client, name, humanity = 7, blood = 10, willpower = 6 } = {}) {
    super({ client, name, willpower });
    this.splat = Splats.vampire20th;
    this.morality = {
      name: "Humanity",
      pool: new Consumable(10, humanity, 0),
    };
    this.blood = new Consumable(blood, blood, 0);
  }

  static getSplat() {
    return Splats.vampire20th;
  }

  setFields(args) {
    super.setFields(args);
    if (args.blood != null) this.blood.setTotal(args.blood);
    if (args.morality != null) this.morality.pool.setCurrent(args.morality);
    if (args.moralityName != null) this.morality.name = args.moralityName;
  }

  updateFields(args) {
    super.updateFields(args);
    if (args.blood != null) this.blood.updateCurrent(args.blood);
    if (args.morality != null) this.morality.pool.updateCurrent(args.morality);
  }

  async deserilize(json) {
    await super.deserilize(json);
    this.class = json.class;
    this.morality.pool.setCurrent(json.morality_value);
    this.morality.name = json.morality_name;
    this.blood.setTotal(json.blood_total);
    this.blood.setCurrent(json.blood_current);
    return this;
  }

  serialize() {
    const serializer = super.serialize();
    serializer.character["morality_name"] = this.morality.name;
    serializer.character["morality_value"] = this.morality.pool.current;
    serializer.character["blood_total"] = this.blood.total;
    serializer.character["blood_current"] = this.blood.current;
    serializer.character["splat"] = this.splat.slug;
    return serializer;
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

    if (this.blood.total > 15) {
      embed.addFields({
        name: "Blood",
        value: this.blood.getTracker({ showEmoji: false }),
        inline: false,
      });
    } else {
      embed.addFields({
        name: `Blood [${this.blood.current}/${this.blood.total}]`,
        value: this.blood.getTracker({
          emoji: Emoji.tracker_0_filled.toString(),
        }),
        inline: false,
      });
    }

    embed.addFields({
      name: `${this.morality.name} ${this.morality.pool.current}`,
      value: this.morality.pool.getTracker({
        emoji: Emoji.tracker_2_filled.toString(),
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
