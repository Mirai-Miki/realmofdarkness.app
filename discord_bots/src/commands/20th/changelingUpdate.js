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
    .setDescription("Update values for your Changeling 20th")

    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of your Character")
        .setMaxLength(50)
        .setRequired(true)
        .setAutocomplete(true)
    )

    .addIntegerOption((option) =>
      option
        .setName("willpower")
        .setDescription(
          "Updates your Willpower Pool by the amount. " +
            "Must be between -15 and 15. CtD 20th Corebook p258"
        )
        .setMinValue(-15)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("glamour")
        .setDescription(
          "Updates your Glamour Pool by the amount. " +
            "Must be between -15 and 15. CtD 20th Corebook p259"
        )
        .setMinValue(-15)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("banality")
        .setDescription(
          "Updates your Banality Pool by the amount. " +
            "Must be between -15 and 15. CtD 20th Corebook p267"
        )
        .setMinValue(-15)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("nightmare")
        .setDescription(
          "Updates your Nightmare by the amount. " +
            "Must be between -15 and 15. CtD 20th Corebook p274"
        )
        .setMinValue(-15)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("imbalance")
        .setDescription(
          "Updates your imbalance by the amount. " +
            "Must be between -15 and 15. CtD 20th Corebook p275"
        )
        .setMinValue(-15)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("exp")
        .setDescription(
          "Updates your current exp. + values will increase" +
            " total as well. CtD 20th Corebook p175"
        )
        .setMinValue(-3000)
        .setMaxValue(3000)
    )

    .addIntegerOption((option) =>
      option
        .setName("health")
        .setDescription(
          "Updates your Health by the amount. " +
            "Must be between -20 and 20. CtD 20th Corebook p290"
        )
        .setMinValue(-20)
        .setMaxValue(20)
    )

    .addIntegerOption((option) =>
      option
        .setName("bashing_damage")
        .setDescription(
          "Updates your Bashing damage by the amount. " +
            "CtD 20th Corebook p290"
        )
        .setMinValue(-50)
        .setMaxValue(50)
    )

    .addIntegerOption((option) =>
      option
        .setName("lethal_damage")
        .setDescription(
          "Updates your Lethal damage by the amount. " +
            "CtD 20th Corebook p290"
        )
        .setMinValue(-50)
        .setMaxValue(50)
    )

    .addIntegerOption((option) =>
      option
        .setName("agg_damage")
        .setDescription(
          "Updates your Agg damage by the amount. " + "CtD 20th Corebook p290"
        )
        .setMinValue(-50)
        .setMaxValue(50)
    )

    .addIntegerOption((option) =>
      option
        .setName("health_chimerical")
        .setDescription(
          "Your total Chimerical Health. " +
            "Must be between -20 and 20. CtD 20th Corebook p290"
        )
        .setMinValue(-20)
        .setMaxValue(20)
    )

    .addIntegerOption((option) =>
      option
        .setName("bashing_chimerical")
        .setDescription(
          "The total Chimerical bashing damage inflicted. " +
            "CtD 20th Corebook p290"
        )
        .setMinValue(-50)
        .setMaxValue(50)
    )

    .addIntegerOption((option) =>
      option
        .setName("lethal_chimerical")
        .setDescription(
          "The total Chimerical lethal damage inflicted. " +
            "CtD 20th Corebook p290"
        )
        .setMinValue(-50)
        .setMaxValue(50)
    )

    .addIntegerOption((option) =>
      option
        .setName("agg_chimerical")
        .setDescription(
          "The total Chimerical Agg damage inflicted. " +
            "CtD 20th Corebook p290"
        )
        .setMinValue(-50)
        .setMaxValue(50)
    )

    .addUserOption((option) =>
      option
        .setName("player")
        .setDescription(
          "The player the character belongs to. Used by STs" +
            " to update another players Char [ST Only]"
        )
    )

    .addStringOption((option) =>
      option
        .setName("notes")
        .setDescription("Any aditional information you would like to include.")
        .setMaxLength(300)
    );
  return slashCommand;
}
