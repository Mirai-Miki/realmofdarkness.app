"use strict";
require(`${process.cwd()}/alias`);
const Consumable = require("../Consumable");
const Counter = require("../Counter");
const DamageTracker20th = require("../DamageTracker20th");
const Character20th = require("./base/Character20th");
const { Splats, Emoji } = require("@constants");
const { EmbedBuilder } = require("discord.js");

module.exports = class Changeling extends Character20th {
  constructor({
    client,
    name,
    glamour = 4,
    banality = 3,
    willpower = 4,
    nightmare = 0,
    imbalance = 0,
  } = {}) {
    super({ client, name, willpower });
    this.splat = Splats.changeling20th;
    this.glamour = new Consumable(glamour, glamour, 1);
    this.banality = new Counter(banality, 0);
    this.nightmare = new Counter(imbalance, nightmare);
    this.chimericalHealth = new DamageTracker20th();
  }

  static getSplat() {
    return Splats.changeling20th;
  }

  setFields(args) {
    super.setFields(args);
    if (args.glamour != null) this.glamour.setTotal(args.glamour);
    if (args.banality != null) this.banality.setPrimary(args.banality);
    if (args.nightmare != null) this.nightmare.setSecondary(args.nightmare);
    if (args.imbalance != null) this.nightmare.setPrimary(args.imbalance);
    if (args.healthChimerical != null)
      this.chimericalHealth.setTotal(args.healthChimerical);
    if (args.bashingChimerical != null)
      this.chimericalHealth.setBashing(args.bashingChimerical);
    if (args.lethalChimerical != null)
      this.chimericalHealth.setLethal(args.lethalChimerical);
    if (args.aggChimerical != null)
      this.chimericalHealth.setAgg(args.aggChimerical);
  }

  updateFields(args) {
    super.updateFields(args);
    if (args.glamour != null) this.glamour.updateCurrent(args.glamour);
    if (args.banality != null) this.banality.updateSecondary(args.banality);
    if (args.nightmare != null) this.nightmare.updateSecondary(args.nightmare);
    if (args.imbalance != null) this.nightmare.updatePrimary(args.imbalance);
    if (args.healthChimerical != null)
      this.chimericalHealth.updateCurrent(args.healthChimerical);
    if (args.bashingChimerical != null)
      this.chimericalHealth.updateBashing(args.bashingChimerical);
    if (args.lethalChimerical != null)
      this.chimericalHealth.updateLethal(args.lethalChimerical);
    if (args.aggChimerical != null)
      this.chimericalHealth.updateAgg(args.aggChimerical);
  }

  async deserilize(char) {
    await super.deserilize(char);
    this.glamour.setTotal(char.glamour_total);
    this.glamour.setCurrent(char.glamour_current);
    this.banality.setPrimary(char.banality_total);
    this.banality.setSecondary(char.banality_current);
    this.nightmare.setPrimary(char.imbalance);
    this.nightmare.setSecondary(char.nightmare);
    this.chimericalHealth.setTotal(char.chimerical_total);
    this.chimericalHealth.setBashing(char.chimerical_bashing);
    this.chimericalHealth.setLethal(char.chimerical_lethal);
    this.chimericalHealth.setAgg(char.chimerical_aggravated);
    return this;
  }

  serialize() {
    const s = super.serialize();
    s.character["splat"] = this.splat.slug;
    s.character["glamour_total"] = this.glamour.total;
    s.character["glamour_current"] = this.glamour.current;
    s.character["banality_total"] = this.banality.primary;
    s.character["banality_current"] = this.banality.secondary;
    s.character["nightmare"] = this.nightmare.secondary;
    s.character["imbalance"] = this.nightmare.primary;
    s.character["chimerical_total"] = this.chimericalHealth.total;
    s.character["chimerical_bashing"] = this.chimericalHealth.bashing;
    s.character["chimerical_lethal"] = this.chimericalHealth.lethal;
    s.character["chimerical_aggravated"] = this.chimericalHealth.aggravated;
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
      value: this.willpower.getTracker({ emoji: Emoji.purple_dot_3 }),
      inline: false,
    });

    embed.addFields({
      name: `Glamour [${this.glamour.current}/${this.glamour.total}]`,
      value: this.glamour.getTracker({ emoji: Emoji.purple_dot_1 }),
      inline: false,
    });

    embed.addFields({
      name: `Imbalance ${this.nightmare.primary}`,
      value: this.nightmare.getPrimaryTracker({ emoji: Emoji.purple_dot_2 }),
      inline: false,
    });

    embed.addFields({
      name: `Nightmare ${this.nightmare.secondary}`,
      value: this.nightmare.getSecondaryTracker({ emoji: Emoji.red_dot }),
      inline: false,
    });

    embed.addFields({
      name: `Banality Permanent ${this.banality.primary}`,
      value: this.banality.getPrimaryTracker({ emoji: Emoji.purple_dot_2 }),
      inline: false,
    });

    embed.addFields({
      name: `Banality Temporary ${this.banality.secondary}`,
      value: this.banality.getSecondaryTracker({ emoji: Emoji.yellow_dot }),
      inline: false,
    });

    embed.addFields({
      name: "Chimerical Health",
      value: this.chimericalHealth.getTracker(),
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
