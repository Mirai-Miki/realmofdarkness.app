"use strict";
require(`${process.cwd()}/alias`);
const Consumable = require("../Consumable");
const Character5th = require("./base/Character5th");
const Form = require("../WerewolfForm");
const { Splats } = require("@constants");
const { EmbedBuilder } = require("discord.js");

module.exports = class Werewolf5th extends Character5th {
  constructor({ client, name, health = 4, willpower = 2 } = {}) {
    super({ client, name, health, willpower });

    this.splat = Splats.werewolf5th;
    this.rage = new Consumable(5, 1, 0);
    this.harano = new Consumable(5, 0, 0);
    this.hauglosk = new Consumable(5, 0, 0);
    this.form = new Form();
  }

  static getSplat() {
    return Splats.werewolf5th;
  }

  setFields(args) {
    if (args.form) this.form.updateForm(args.form, this);
    super.setFields(args);
    if (args.rage) this.rage.setCurrent(args.rage);
    if (args.harano) this.harano.setCurrent(args.harano);
    if (args.hauglosk) this.hauglosk.setCurrent(args.hauglosk);
  }

  updateFields(args) {
    if (args.form) this.form.updateForm(args.form, this);
    super.updateFields(args);
    if (args.rage) this.rage.updateCurrent(args.rage);
    if (args.harano) this.harano.updateCurrent(args.harano);
    if (args.hauglosk) this.hauglosk.updateCurrent(args.hauglosk);
  }

  async deserilize(json) {
    await super.deserilize(json);
    this.rage.setCurrent(json.rage);
    this.harano.setCurrent(json.harano);
    this.hauglosk.setCurrent(json.hauglosk);
    this.form.setForm(json.form, this);
    return this;
  }

  /**
   * Serializes the Werewolf5th character object.
   * @returns {Object} The serialized character object.
   */
  serialize() {
    const serializer = super.serialize();
    serializer.character["splat"] = this.splat.slug;
    serializer.character["rage"] = this.rage.current;
    serializer.character["harano"] = this.harano.current;
    serializer.character["hauglosk"] = this.hauglosk.current;
    serializer.character["form"] = this.form.getForm();
    return serializer;
  }

  /**
   * Returns an embed object with character information.
   * @param {string} notes - Additional notes for the character.
   * @returns {EmbedBuilder} - The embed object containing character information.
   */
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

    embed.addFields({
      name: "Form",
      value: this.form.getForm(),
      inline: false,
    });

    embed.addFields({
      name: "Harano",
      value: this.harano.getTracker({ inverted: true }),
      inline: true,
    });

    embed.addFields({
      name: "Hauglosk",
      value: this.hauglosk.getTracker(),
      inline: true,
    });

    embed.addFields({
      name: "Rage",
      value: this.rage.getTracker(),
      inline: false,
    });

    if (this.thumbnail) embed.setThumbnail(this.thumbnail);

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
