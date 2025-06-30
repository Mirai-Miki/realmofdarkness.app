"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { Splats } = require("@constants");
const tracker = require("@modules/tracker");
const getHexColor = require("@modules/getColorHex");
const verifySupporterStatus = require("@modules/verifySupporterStatus");
const commandUpdate = require("@modules/commandDatabaseUpdate");
const autocomplete5th = require("@modules/autocomplete");

module.exports = {
  data: getCommands(),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await commandUpdate(interaction);

    if (!interaction.isRepliable()) return "notRepliable";
    interaction.arguments = await getArgs(interaction);
    switch (interaction.options.getSubcommand()) {
      case "new":
        return await tracker.new(interaction, Splats.hunter5th);
      case "update":
        return await tracker.update(interaction, Splats.hunter5th);
      case "set":
        return await tracker.set(interaction, Splats.hunter5th);
    }
  },

  async autocomplete(interaction) {
    return await autocomplete5th(interaction, Splats.hunter5th.slug);
  },
};

async function getArgs(interaction) {
  const args = {
    player: interaction.options.getUser("player"),
    name: interaction.options.getString("name"),
    exp: interaction.options.getInteger("exp"),
    notes: interaction.options.getString("notes"),
    nameChange: interaction.options.getString("change_name"),
    thumbnail: interaction.options.getAttachment("image"),
    color: getHexColor(interaction.options.getString("color")),
    willpower: interaction.options.getInteger("willpower"),
    health: interaction.options.getInteger("health"),
    willpowerSup: interaction.options.getInteger("willpower_superficial"),
    willpowerAgg: interaction.options.getInteger("willpower_agg"),
    healthSup: interaction.options.getInteger("health_superficial"),
    healthAgg: interaction.options.getInteger("health_agg"),
    desperation: interaction.options.getInteger("desperation"),
    danger: interaction.options.getInteger("danger"),
    despair: interaction.options.getBoolean("despair"),
  };

  if (args.color || args.thumbnail)
    await verifySupporterStatus.fledgling(interaction.user.id);
  return args;
}

function getCommands() {
  const command = new SlashCommandBuilder()
    .setName("hunter")
    .setDescription("Hunter tracker commands");

  ////////////////// New Vampire ////////////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("new")
      .setDescription("Create a new Hunter 5th.")

      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The name of your Character")
          .setRequired(true)
          .setMaxLength(50)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower")
          .setDescription(
            "Your total Willpower. " +
              "Must be between 1 and 20. HtR 5th Corebook p60"
          )
          .setMaxValue(20)
          .setMinValue(1)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription(
            "Your total Health. " +
              "Must be between 1 and 20. HtR 5th Corebook p60"
          )
          .setMaxValue(20)
          .setMinValue(1)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("desperation")
          .setDescription(
            "Your current Desperation rating. " +
              "Must be between 1 and 5. HtR 5th Corebook p125"
          )
          .setMaxValue(5)
          .setMinValue(1)
      )

      .addIntegerOption((option) =>
        option
          .setName("danger")
          .setDescription(
            "Your current Danger rating. " +
              "Must be between 1 and 5. HtR 5th Corebook p125"
          )
          .setMaxValue(5)
          .setMinValue(1)
      )

      .addBooleanOption((option) =>
        option
          .setName("despair")
          .setDescription(
            "If you are currently in despair. HtR 5th Corebook p128"
          )
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription("Your total Experiance. HtR 5th Corebook p82")
          .setMaxValue(1000)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_superficial")
          .setDescription(
            "Your current Superficial Willpower Damage. " +
              "Must be between 0 and 15. HtR 5th Corebook p123"
          )
          .setMaxValue(15)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_agg")
          .setDescription(
            "Your current Aggravated Willpower Damage. " +
              "HtR 5th Corebook p123"
          )
          .setMaxValue(15)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_superficial")
          .setDescription(
            "Your current Superficial Health Damage. " +
              "Must be between 0 and 20. HtR 5th Corebook p123"
          )
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_agg")
          .setDescription(
            "Your current Aggravated Health Damage. " +
              "Must be between 0 and 20. HtR 5th Corebook p123"
          )
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addStringOption((option) =>
        option
          .setName("notes")
          .setDescription(
            "Any additional information you would like to include."
          )
          .setMaxLength(300)
      )

      .addStringOption((option) =>
        option
          .setName("color")
          .setDescription(
            "Changes the side bar color." +
              " Enter a color hex code eg #6f82ab. [Supporter Only]"
          )
          .setMaxLength(7)
          .setMinLength(7)
      )

      .addAttachmentOption((option) =>
        option
          .setName("image")
          .setDescription(
            "Changes your Character's Thumbnail" + " Image. [Supporter Only]"
          )
      )
  );

  //////////////////// Set Command ////////////////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("set")
      .setDescription("Set values for your Hunter 5th.")

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
          .setName("willpower")
          .setDescription(
            "Your total Willpower. " +
              "Must be between 1 and 20. HtR 5th Corebook p60"
          )
          .setMaxValue(20)
          .setMinValue(1)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription(
            "Your total Health. " +
              "Must be between 1 and 20. HtR 5th Corebook p60"
          )
          .setMaxValue(20)
          .setMinValue(1)
      )

      .addIntegerOption((option) =>
        option
          .setName("desperation")
          .setDescription(
            "Your current Desperation rating. " +
              "Must be between 1 and 5. HtR 5th Corebook p125"
          )
          .setMaxValue(5)
          .setMinValue(1)
      )

      .addIntegerOption((option) =>
        option
          .setName("danger")
          .setDescription(
            "Your current Danger rating. " +
              "Must be between 1 and 5. HtR 5th Corebook p125"
          )
          .setMaxValue(5)
          .setMinValue(1)
      )

      .addBooleanOption((option) =>
        option
          .setName("despair")
          .setDescription(
            "If you are currently in despair. HtR 5th Corebook p128"
          )
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription(
            "Your total Experiance. " +
              "+ values will also increase your current. HtR 5th Corebook p82"
          )
          .setMaxValue(1000)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_superficial")
          .setDescription(
            "Your current Superficial Willpower Damage. " +
              "Must be between 0 and 15. HtR 5th Corebook p123"
          )
          .setMaxValue(15)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_agg")
          .setDescription(
            "Your current Aggravated Willpower Damage. " +
              "HtR 5th Corebook p123"
          )
          .setMaxValue(15)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_superficial")
          .setDescription(
            "Your current Superficial Health Damage. " +
              "Must be between 0 and 20. HtR 5th Corebook p123"
          )
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_agg")
          .setDescription(
            "Your current Aggravated Health Damage. " +
              "Must be between 0 and 20. HtR 5th Corebook p123"
          )
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addStringOption((option) =>
        option
          .setName("notes")
          .setDescription(
            "Any aditional information you would like to include."
          )
          .setMaxLength(300)
      )

      .addStringOption((option) =>
        option
          .setName("change_name")
          .setDescription("Change your Character's name.")
          .setMaxLength(50)
      )

      .addStringOption((option) =>
        option
          .setName("color")
          .setDescription(
            "Changes the side bar color." +
              " Enter a color hex code eg #6f82ab. [Supporter Only]"
          )
          .setMaxLength(7)
          .setMinLength(7)
      )

      .addAttachmentOption((option) =>
        option
          .setName("image")
          .setDescription(
            "Changes your Character's Thumbnail" + " Image. [Supporter Only]"
          )
      )
  );

  //////////////////////// Update Command ////////////////////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("update")
      .setDescription("Update values for your Hunter 5th.")

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
          .setName("desperation")
          .setDescription(
            "Upates your Desperation by the value. " +
              "Must be between -10 and 10. HtR 5th Corebook p125"
          )
          .setMaxValue(10)
          .setMinValue(-10)
      )

      .addIntegerOption((option) =>
        option
          .setName("danger")
          .setDescription(
            "Updates your Danger by the value. " +
              "Must be between -10 and 10. HtR 5th Corebook p125"
          )
          .setMaxValue(10)
          .setMinValue(-10)
      )

      .addBooleanOption((option) =>
        option
          .setName("despair")
          .setDescription(
            "If you are currently in despair. HtR 5th Corebook p128"
          )
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_superficial")
          .setDescription(
            "Updates you current SW damage" +
              " by the amount. Must be between -20 and 20. HtR 5th Corebook p123"
          )
          .setMaxValue(20)
          .setMinValue(-20)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_superficial")
          .setDescription(
            "Updates you current SH Damage" +
              " by the amount. Must be between -30 and 30. HtR 5th Corebook p123"
          )
          .setMaxValue(30)
          .setMinValue(-30)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_agg")
          .setDescription(
            "Updates you current AW Damage" +
              " by the amount. Must be between -20 and 20. HtR 5th Corebook p123"
          )
          .setMaxValue(20)
          .setMinValue(-20)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_agg")
          .setDescription(
            "Updates you current AH Damage" +
              " by the amount. Must be between -30 and 30. HtR 5th Corebook p123"
          )
          .setMaxValue(30)
          .setMinValue(-30)
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription(
            "Updates you Current Exp by the amount." +
              "+ values will also increase your total. HtR 5th Corebook p82"
          )
          .setMaxValue(2000)
          .setMinValue(-2000)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower")
          .setDescription(
            "Updates your Total Willpower by the amount. " +
              "Must be between -20 and 20. HtR 5th Corebook p60"
          )
          .setMaxValue(20)
          .setMinValue(-20)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription(
            "Updates your Total Health by the amount. " +
              "Must be between -30 and 30. HtR 5th Corebook p123"
          )
          .setMaxValue(30)
          .setMinValue(-30)
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
          .setDescription(
            "Any aditional information you would like to include."
          )
          .setMaxLength(300)
      )
  );
  return command;
}
