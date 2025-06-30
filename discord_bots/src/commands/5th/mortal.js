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
        const splat =
          interaction.arguments.characterType === "human"
            ? Splats.human5th
            : Splats.ghoul5th;
        return await tracker.new(interaction, splat);
      case "update":
        return await tracker.update(interaction, null);
      case "set":
        return await tracker.set(interaction, null);
    }
  },

  async autocomplete(interaction) {
    return await autocomplete5th(interaction, [
      Splats.human5th.slug,
      Splats.ghoul5th.slug,
    ]);
  },
};

async function getArgs(interaction) {
  const args = {
    player: interaction.options.getUser("player"),
    name: interaction.options.getString("name"),
    characterType: interaction.options.getString("type"),
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
    humanity: interaction.options.getInteger("humanity"),
    stains: interaction.options.getInteger("stains"),
  };

  if (args.color || args.thumbnail)
    await verifySupporterStatus.fledgling(interaction.user.id);
  return args;
}

function getCommands() {
  const command = new SlashCommandBuilder()
    .setName("mortal")
    .setDescription("Mortal tracker commands");

  ////////////////// New Vampire ////////////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("new")
      .setDescription("Create a new Mortal 5th.")

      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The name of your Character")
          .setRequired(true)
          .setMaxLength(50)
      )

      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("The type of Mortal you are playing.")
          .setRequired(true)
          .addChoices(
            { name: "Human", value: "human" },
            { name: "Ghoul", value: "ghoul" }
          )
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower")
          .setDescription(
            "Your total Willpower. " +
              "Must be between 1 and 20. VtM v5 Corebook p157"
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
              "Must be between 1 and 20. VtM v5 Corebook p126"
          )
          .setMaxValue(20)
          .setMinValue(1)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("humanity")
          .setDescription(
            "Your current Humanity. " +
              "Must be between 0 and 10. VtM v5 Corebook p236"
          )
          .setMaxValue(10)
          .setMinValue(0)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription("Your total Experiance. VtM v5 Corebook p130")
          .setMaxValue(1000)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_superficial")
          .setDescription(
            "Your current Superficial Willpower Damage. " +
              "Must be between 0 and 20. VtM v5 Corebook p126"
          )
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_agg")
          .setDescription(
            "Your current Aggravated Willpower Damage. " +
              "VtM v5 Corebook p126"
          )
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_superficial")
          .setDescription(
            "Your current Superficial Health Damage. " +
              "Must be between 0 and 20. VtM v5 Corebook p126"
          )
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_agg")
          .setDescription(
            "Your current Aggravated Health Damage. " +
              "Must be between 0 and 20. VtM v5 Corebook p126"
          )
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("stains")
          .setDescription(
            "Your current Stains. " +
              "Must be between 0 and 10. VtM v5 Corebook p239"
          )
          .setMaxValue(10)
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
      .setDescription("Set values for your Mortal 5th")

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
              "Must be between 1 and 20. VtM v5 Corebook p157"
          )
          .setMaxValue(20)
          .setMinValue(1)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription(
            "Your total Health. " +
              "Must be between 1 and 20. VtM v5 Corebook p126"
          )
          .setMaxValue(20)
          .setMinValue(1)
      )

      .addIntegerOption((option) =>
        option
          .setName("humanity")
          .setDescription(
            "Your current Humanity. " +
              "Must be between 0 and 10. VtM v5 Corebook p236"
          )
          .setMaxValue(10)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription(
            "Your total Experiance. " +
              "+ values will also increase your current. VtM v5 Corebook p130"
          )
          .setMaxValue(1000)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_superficial")
          .setDescription(
            "Your current Superficial Willpower Damage. " +
              "Must be between 0 and 20. VtM v5 Corebook p126"
          )
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_agg")
          .setDescription(
            "Your current Aggravated Willpower Damage. " +
              "VtM v5 Corebook p126"
          )
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_superficial")
          .setDescription(
            "Your current Superficial Health Damage. " +
              "Must be between 0 and 20. VtM v5 Corebook p126"
          )
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_agg")
          .setDescription(
            "Your current Aggravated Health Damage. " +
              "Must be between 0 and 20. VtM v5 Corebook p126"
          )
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("stains")
          .setDescription(
            "Your current Stains. " +
              "Must be between 0 and 10. VtM v5 Corebook p239"
          )
          .setMaxValue(10)
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
      .setDescription("Update values for your Mortal 5th")

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
          .setName("willpower_superficial")
          .setDescription(
            "Updates you current SW damage" +
              " by the amount. Must be between -30 and 30. VtM v5 Corebook p126"
          )
          .setMaxValue(30)
          .setMinValue(-30)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_superficial")
          .setDescription(
            "Updates you current SH Damage" +
              " by the amount. Must be between -30 and 30. VtM v5 Corebook p126"
          )
          .setMaxValue(30)
          .setMinValue(-30)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_agg")
          .setDescription(
            "Updates you current AW Damage" +
              " by the amount. Must be between -20 and 20. VtM v5 Corebook p126"
          )
          .setMaxValue(30)
          .setMinValue(-30)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_agg")
          .setDescription(
            "Updates you current AH Damage" +
              " by the amount. Must be between -30 and 30. VtM v5 Corebook p126"
          )
          .setMaxValue(30)
          .setMinValue(-30)
      )

      .addIntegerOption((option) =>
        option
          .setName("stains")
          .setDescription(
            "Updates your Stains by the amount. " +
              "Must be between -15 and 15. VtM v5 Corebook p239"
          )
          .setMaxValue(15)
          .setMinValue(-15)
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription(
            "Updates you Current Exp by the amount." +
              "+ values will also increase your total. VtM v5 Corebook p130"
          )
          .setMaxValue(2000)
          .setMinValue(-2000)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower")
          .setDescription(
            "Updates your Total Willpower by the amount. " +
              "Must be between -20 and 20. VtM v5 Corebook p157"
          )
          .setMaxValue(20)
          .setMinValue(-20)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription(
            "Updates your Total Health by the amount. " +
              "Must be between -30 and 30. VtM v5 Corebook p126"
          )
          .setMaxValue(30)
          .setMinValue(-30)
      )

      .addIntegerOption((option) =>
        option
          .setName("humanity")
          .setDescription(
            "Updates your Humanity by the amount. " +
              "Must be between -15 and 15. VtM v5 Corebook p236"
          )
          .setMaxValue(15)
          .setMinValue(-15)
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
