"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { Splats } = require("@constants");
const tracker = require("@modules/tracker");
const commandUpdate = require("@modules/commandDatabaseUpdate");
const autocomplete20th = require("@modules/autocomplete");

module.exports = {
  data: getCommands(),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await commandUpdate(interaction);

    if (!interaction.isRepliable()) return "notRepliable";
    interaction.arguments = getArgs(interaction);
    return await tracker.update(interaction, Splats.changeling20th);
  },

  async autocomplete(interaction) {
    return await autocomplete20th(interaction, Splats.changeling20th.slug);
  },
};

function getArgs(interaction) {
  return {
    player: interaction.options.getUser("player"),
    name: interaction.options.getString("name"),
    exp: interaction.options.getInteger("exp"),
    notes: interaction.options.getString("notes"),
    willpower: interaction.options.getInteger("willpower"),
    health: interaction.options.getInteger("health"),
    bashing: interaction.options.getInteger("bashing_damage"),
    lethal: interaction.options.getInteger("lethal_damage"),
    agg: interaction.options.getInteger("agg_damage"),
    glamour: interaction.options.getInteger("glamour"),
    banality: interaction.options.getInteger("banality"),
    nightmare: interaction.options.getInteger("nightmare"),
    imbalance: interaction.options.getInteger("imbalance"),
    healthChimerical: interaction.options.getInteger("health_chimerical"),
    bashingChimerical: interaction.options.getInteger("bashing_chimerical"),
    lethalChimerical: interaction.options.getInteger("lethal_chimerical"),
    aggChimerical: interaction.options.getInteger("agg_chimerical"),
  };
}

function getCommands() {
  const slashCommand = new SlashCommandBuilder()
    .setName("changeling_update")
    .setDescription("Update values for your Changeling character.")

    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Your character's name.")
        .setMaxLength(50)
        .setRequired(true)
        .setAutocomplete(true)
    )

    .addIntegerOption((option) =>
      option
        .setName("willpower")
        .setDescription("Change Willpower by amount (-15 to 15).")
        .setMinValue(-15)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("glamour")
        .setDescription("Change Glamour by amount (-15 to 15).")
        .setMinValue(-15)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("banality")
        .setDescription("Change Banality by amount (-15 to 15).")
        .setMinValue(-15)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("nightmare")
        .setDescription("Change Nightmare by amount (-15 to 15).")
        .setMinValue(-15)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("imbalance")
        .setDescription("Change Imbalance by amount (-15 to 15).")
        .setMinValue(-15)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("exp")
        .setDescription("Change current XP. Positive values also raise total.")
        .setMinValue(-3000)
        .setMaxValue(3000)
    )

    .addIntegerOption((option) =>
      option
        .setName("health")
        .setDescription("Change Health by amount (-20 to 20).")
        .setMinValue(-20)
        .setMaxValue(20)
    )

    .addIntegerOption((option) =>
      option
        .setName("bashing_damage")
        .setDescription("Change bashing damage by amount (-50 to 50).")
        .setMinValue(-50)
        .setMaxValue(50)
    )

    .addIntegerOption((option) =>
      option
        .setName("lethal_damage")
        .setDescription("Change lethal damage by amount (-50 to 50).")
        .setMinValue(-50)
        .setMaxValue(50)
    )

    .addIntegerOption((option) =>
      option
        .setName("agg_damage")
        .setDescription("Change aggravated damage by amount (-50 to 50).")
        .setMinValue(-50)
        .setMaxValue(50)
    )

    .addIntegerOption((option) =>
      option
        .setName("health_chimerical")
        .setDescription("Change Chimerical Health by amount (-20 to 20).")
        .setMinValue(-20)
        .setMaxValue(20)
    )

    .addIntegerOption((option) =>
      option
        .setName("bashing_chimerical")
        .setDescription("Change Chimerical bashing damage (-50 to 50).")
        .setMinValue(-50)
        .setMaxValue(50)
    )

    .addIntegerOption((option) =>
      option
        .setName("lethal_chimerical")
        .setDescription("Change Chimerical lethal damage (-50 to 50).")
        .setMinValue(-50)
        .setMaxValue(50)
    )

    .addIntegerOption((option) =>
      option
        .setName("agg_chimerical")
        .setDescription("Change Chimerical aggravated damage (-50 to 50).")
        .setMinValue(-50)
        .setMaxValue(50)
    )

    .addUserOption((option) =>
      option
        .setName("player")
        .setDescription(
          "Storytellers must select the player this character belongs to."
        )
    )

    .addStringOption((option) =>
      option
        .setName("notes")
        .setDescription("Additional notes or info.")
        .setMaxLength(300)
    );
  return slashCommand;
}
