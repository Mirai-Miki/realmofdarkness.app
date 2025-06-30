"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder } = require("@discordjs/builders");
const { update } = require("@modules/tracker");
const { Splats } = require("@constants");
const commandUpdate = require("@modules/commandDatabaseUpdate");
const autocomplete20th = require("@modules/autocomplete");
const { MessageFlags } = require("discord.js");

module.exports = {
  data: getCommands(),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await commandUpdate(interaction);
    if (!interaction.isRepliable()) return "notRepliable";
    interaction.arguments = await getArgs(interaction);
    switch (interaction.options.getSubcommand()) {
      case "use":
        return await applyBlood(interaction);
      case "gain":
        return await update(interaction, Splats.vampire20th);
      case "check":
        return await update(interaction, Splats.vampire20th);
    }
  },

  async autocomplete(interaction) {
    return await autocomplete20th(interaction, Splats.vampire20th.slug);
  },
};

async function applyBlood(interaction) {
  const damageType = interaction.arguments.action;
  const bloodAmount = -interaction.arguments.blood;
  interaction.arguments.blood = bloodAmount;
  const damageToFieldMap = {
    bashing_damage: "bashing",
    lethal_damage: "lethal",
    agg_damage: "agg",
  };
  const healthField = damageToFieldMap[damageType];
  if (healthField) {
    interaction.arguments[healthField] = bloodAmount;
  }
  return await update(interaction, Splats.vampire20th);
}

async function getArgs(interaction) {
  const args = {
    name: interaction.options.getString("name"),
    blood: interaction.options.getInteger("amount"),
    action: interaction.options.getString("action"),
    notes: interaction.options.getString("notes"),
  };
  return args;
}

function getCommands() {
  const slashCommand = new SlashCommandBuilder()
    .setName("blood")
    .setDescription("Commands for managing Vampire blood pools 20th");

  /////////////////////// use blood ////////////////////////////

  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("use")
      .setDescription("Uses blood to heal damage or activate disciplines")

      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The name of your Character")
          .setRequired(true)
          .setMaxLength(50)
          .setAutocomplete(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setDescription(
            "Amount of blood points to use. Must be between 1 and 50."
          )
          .setMinValue(1)
          .setMaxValue(50)
          .setRequired(true)
      )

      .addStringOption((option) =>
        option
          .setName("action")
          .setDescription("Action for which the blood points are spent.")
          .setRequired(true)
          .addChoices(
            { name: "Heal bashing", value: "bashing_damage" },
            { name: "Heal lethal", value: "lethal_damage" },
            { name: "Heal aggravated", value: "agg_damage" },
            { name: "disciplines", value: "use_discipline" }
          )
      )
  );

  ///////////////////////// gain blood ////////////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("gain")
      .setDescription("Gain blood points from a source")

      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The name of your Character")
          .setRequired(true)
          .setMaxLength(50)
          .setAutocomplete(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setDescription(
            "Amount of blood points to gain. Must be between 1 and 50."
          )
          .setMinValue(1)
          .setMaxValue(50)
          .setRequired(true)
      )
  );

  /////////////////////// check blood ////////////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("check")
      .setDescription("Check the current blood points of your character")

      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The name of your Character")
          .setRequired(true)
          .setMaxLength(50)
          .setAutocomplete(true)
      )
  );
  return slashCommand;
}
