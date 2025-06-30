"use strict";
require(`${process.cwd()}/alias`);
const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const { Splats } = require("@constants");
const tracker = require("@modules/tracker");
const getHexColor = require("@modules/getColorHex");
const verifySupporterStatus = require("@modules/verifySupporterStatus");
const commandUpdate = require("@modules/commandDatabaseUpdate");
const autocomplete5th = require("@modules/autocomplete");

module.exports = {
  data: getCommands(),

  /**
   * Executes the vampire command based on the provided interaction.
   * @param {Interaction} interaction - The interaction object representing the command interaction.
   * @returns {Promise<string|void>} - A promise that resolves to a string or void.
   */
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await commandUpdate(interaction);

    if (!interaction.isRepliable()) return "notRepliable";
    interaction.arguments = await getArgs(interaction);
    switch (interaction.options.getSubcommand()) {
      case "new":
        const res = await tracker.new(interaction, Splats.vampire5th);
        await sheetFollowUp(interaction);
        return res;
      case "update":
        const update = await tracker.update(interaction, Splats.vampire5th);
        return update;
      case "set":
        return await tracker.set(interaction, Splats.vampire5th);
    }
  },

  async autocomplete(interaction) {
    return await autocomplete5th(interaction, Splats.vampire5th.slug);
  },
};

/**
 * Sends a follow-up message with information about character sheets.
 * @param {Interaction} interaction - The interaction object representing the command interaction.
 * @returns {Promise<void>} - A promise that resolves when the follow-up message is sent.
 */
async function sheetFollowUp(interaction) {
  if (!interaction.followUps) interaction.followUps = [];
  const message = { flags: MessageFlags.Ephemeral, embeds: [] };

  const embed = new EmbedBuilder();
  embed
    .setColor("#ede61a")
    .setTitle("Character Sheets Available")
    .setDescription(
      'Character sheets are now available and feature complete on the [Website](https://realmofdarkness.app).\n\nWe recommend creating a sheet rather than using the tracker directly as sheets offer more functionality while still being fully compatible with the bot tracker commands. Sheets provide an easy-to-use web interface to update values and access to the `/sheet roll` command for building dice pools without having to look at your character sheet.\n\nTo create a new sheet, simply login to the [Website](https://realmofdarkness.app) and click the "New Sheet" button to get started.'
    );
  message.embeds.push(embed);
  interaction.followUps.push(message);
}

/**
 * Retrieves the arguments from an interaction and returns them as an object.
 *
 * @param {Interaction} interaction - The interaction object containing the options.
 * @returns {Object} - An object containing the retrieved arguments.
 */
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
    hunger: interaction.options.getInteger("hunger"),
    humanity: interaction.options.getInteger("humanity"),
    stains: interaction.options.getInteger("stains"),
  };

  if (args.color || args.thumbnail)
    await verifySupporterStatus.fledgling(interaction.user.id);
  return args;
}

/**
 * Retrieves the slash commands for the vampire tracker.
 * @returns {SlashCommandBuilder} The slash command builder object containing the vampire tracker commands.
 */
function getCommands() {
  const command = new SlashCommandBuilder()
    .setName("vampire")
    .setDescription("vampire tracker commands");

  ////////////////// New Vampire ////////////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("new")
      .setDescription("Create a new v5 Vampire.")

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
          .setName("hunger")
          .setDescription(
            "Your current Hunger. " +
              "Must be between 0 and 5. VtM v5 Corebook p205"
          )
          .setMaxValue(5)
          .setMinValue(0)
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
              "Must be between 0 and 15. VtM v5 Corebook p126"
          )
          .setMaxValue(15)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_agg")
          .setDescription(
            "Your current Aggravated Willpower Damage. " +
              "VtM v5 Corebook p126"
          )
          .setMaxValue(15)
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
      .setDescription("Set values for your v5 Vampire.")

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
          .setName("hunger")
          .setDescription(
            "Your current Hunger. " +
              "Must be between 0 and 5. VtM v5 Corebook p205"
          )
          .setMaxValue(5)
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
              "Must be between 0 and 15. VtM v5 Corebook p126"
          )
          .setMaxValue(15)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_agg")
          .setDescription(
            "Your current Aggravated Willpower Damage. " +
              "VtM v5 Corebook p126"
          )
          .setMaxValue(15)
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
      .setDescription("Update values for your v5 Vampire.")

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
          .setName("hunger")
          .setDescription(
            "Updates your Hunger by the amount. " +
              "Must be between -10 and 10. VtM v5 Corebook p205"
          )
          .setMaxValue(10)
          .setMinValue(-10)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_superficial")
          .setDescription(
            "Updates you current SW damage" +
              " by the amount. Must be between -20 and 20. VtM v5 Corebook p126"
          )
          .setMaxValue(20)
          .setMinValue(-20)
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
          .setMaxValue(20)
          .setMinValue(-20)
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
