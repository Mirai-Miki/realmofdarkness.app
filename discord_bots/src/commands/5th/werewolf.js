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
   * Executes the werewolf command.
   *
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
        const res = await tracker.new(interaction, Splats.werewolf5th);
        return res;
      case "update":
        const update = await tracker.update(interaction, Splats.werewolf5th);
        return update;
      case "set":
        return await tracker.set(interaction, Splats.werewolf5th);
    }
  },

  async autocomplete(interaction) {
    return await autocomplete5th(interaction, Splats.werewolf5th.slug);
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
    rage: interaction.options.getInteger("rage"),
    harano: interaction.options.getInteger("harano"),
    hauglosk: interaction.options.getInteger("hauglosk"),
    form: interaction.options.getString("form"),
  };

  if (args.color || args.thumbnail)
    await verifySupporterStatus.fledgling(interaction.user.id);
  return args;
}

function getCommands() {
  const command = new SlashCommandBuilder()
    .setName("werewolf")
    .setDescription("Werewolf tracker commands");

  ////////////////// New Werewolf ////////////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("new")
      .setDescription("Create a new w5 Werewolf.")

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
          .setDescription("Your total Willpower. Must be between 1 and 20.")
          .setMaxValue(20)
          .setMinValue(1)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription("Your total Health. Must be between 1 and 20.")
          .setMaxValue(20)
          .setMinValue(1)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription("Your total Experiance.")
          .setMaxValue(1000)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("rage")
          .setDescription("Your current Rage.")
          .setMaxValue(5)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("harano")
          .setDescription("Your current Harano.")
          .setMaxValue(5)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("hauglosk")
          .setDescription("Your current Hauglosk.")
          .setMaxValue(5)
          .setMinValue(0)
      )

      .addStringOption((option) =>
        option
          .setName("form")
          .setDescription("Your current Form.")
          .addChoices(
            { name: "Homid", value: "Homid" },
            { name: "Glabro", value: "Glabro" },
            { name: "Crinos", value: "Crinos" },
            { name: "Hispo", value: "Hispo" },
            { name: "Lupus", value: "Lupus" }
          )
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_superficial")
          .setDescription(
            "Your current Superficial Willpower Damage. " +
              "Must be between 0 and 15."
          )
          .setMaxValue(15)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_agg")
          .setDescription("Your current Aggravated Willpower Damage.")
          .setMaxValue(15)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_superficial")
          .setDescription(
            "Your current Superficial Health Damage. " +
              "Must be between 0 and 20."
          )
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_agg")
          .setDescription(
            "Your current Aggravated Health Damage. " +
              "Must be between 0 and 20."
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
            "Changes your Character's Thumbnail Image. [Supporter Only]"
          )
      )
  );

  //////////////////// Set Command ////////////////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("set")
      .setDescription("Set values for your w5 Werewolf.")

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
          .setDescription("Your total Willpower. Must be between 1 and 20.")
          .setMaxValue(20)
          .setMinValue(1)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription("Your total Health. Must be between 1 and 20.")
          .setMaxValue(20)
          .setMinValue(1)
      )

      .addIntegerOption((option) =>
        option
          .setName("rage")
          .setDescription("Your current Rage.")
          .setMaxValue(5)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("harano")
          .setDescription("Your current Harano.")
          .setMaxValue(5)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("hauglosk")
          .setDescription("Your current Hauglosk.")
          .setMaxValue(5)
          .setMinValue(0)
      )

      .addStringOption((option) =>
        option
          .setName("form")
          .setDescription("Your current Form.")
          .addChoices(
            { name: "Homid", value: "Homid" },
            { name: "Glabro", value: "Glabro" },
            { name: "Crinos", value: "Crinos" },
            { name: "Hispo", value: "Hispo" },
            { name: "Lupus", value: "Lupus" }
          )
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription(
            "Your total Experiance. + values will also increase your current."
          )
          .setMaxValue(1000)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_superficial")
          .setDescription(
            "Your current Superficial Willpower Damage. Must be between 0 and 15."
          )
          .setMaxValue(15)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_agg")
          .setDescription("Your current Aggravated Willpower Damage.")
          .setMaxValue(15)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_superficial")
          .setDescription(
            "Your current Superficial Health Damage. " +
              "Must be between 0 and 20."
          )
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_agg")
          .setDescription(
            "Your current Aggravated Health Damage. " +
              "Must be between 0 and 20."
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
            "Changes your Character's Thumbnail Image. [Supporter Only]"
          )
      )
  );

  //////////////////////// Update Command ////////////////////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("update")
      .setDescription("Update values for your w5 Werewolf.")

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
          .setName("rage")
          .setDescription("Your current Rage.")
          .setMaxValue(10)
          .setMinValue(-10)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_superficial")
          .setDescription(
            "Updates you current SW damage by the amount. Must be between -20 and 20."
          )
          .setMaxValue(20)
          .setMinValue(-20)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_superficial")
          .setDescription(
            "Updates you current SH Damage" +
              " by the amount. Must be between -30 and 30."
          )
          .setMaxValue(30)
          .setMinValue(-30)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_agg")
          .setDescription(
            "Updates you current AW Damage" +
              " by the amount. Must be between -20 and 20."
          )
          .setMaxValue(20)
          .setMinValue(-20)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_agg")
          .setDescription(
            "Updates you current AH Damage" +
              " by the amount. Must be between -30 and 30."
          )
          .setMaxValue(30)
          .setMinValue(-30)
      )

      .addIntegerOption((option) =>
        option
          .setName("harano")
          .setDescription("Your current Harano.")
          .setMaxValue(10)
          .setMinValue(-10)
      )

      .addIntegerOption((option) =>
        option
          .setName("hauglosk")
          .setDescription("Your current Hauglosk.")
          .setMaxValue(10)
          .setMinValue(-10)
      )

      .addStringOption((option) =>
        option
          .setName("form")
          .setDescription("Your current Form.")
          .addChoices(
            { name: "Homid", value: "Homid" },
            { name: "Glabro", value: "Glabro" },
            { name: "Crinos", value: "Crinos" },
            { name: "Hispo", value: "Hispo" },
            { name: "Lupus", value: "Lupus" }
          )
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription(
            "Updates you Current Exp by the amount." +
              "+ values will also increase your total."
          )
          .setMaxValue(2000)
          .setMinValue(-2000)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower")
          .setDescription(
            "Updates your Total Willpower by the amount. " +
              "Must be between -20 and 20."
          )
          .setMaxValue(20)
          .setMinValue(-20)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription(
            "Updates your Total Health by the amount. " +
              "Must be between -30 and 30."
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
