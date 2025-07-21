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
    await verifySupporterStatus.mortal(interaction.user.id);
  return args;
}

function getCommands() {
  const command = new SlashCommandBuilder()
    .setName("werewolf")
    .setDescription("Werewolf tracker commands for W5 characters.");

  ////////////////// New Werewolf ////////////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("new")
      .setDescription("Create a new W5 Werewolf character.")

      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Name of your character.")
          .setRequired(true)
          .setMaxLength(50)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower")
          .setDescription("Total Willpower (1-20).")
          .setMaxValue(20)
          .setMinValue(1)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription("Total Health (1-20).")
          .setMaxValue(20)
          .setMinValue(1)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription("Total Experience.")
          .setMaxValue(1000)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("rage")
          .setDescription("Current Rage (0-5).")
          .setMaxValue(5)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("harano")
          .setDescription("Current Harano (0-5).")
          .setMaxValue(5)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("hauglosk")
          .setDescription("Current Hauglosk (0-5).")
          .setMaxValue(5)
          .setMinValue(0)
      )

      .addStringOption((option) =>
        option
          .setName("form")
          .setDescription("Current form.")
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
          .setDescription("Superficial Willpower Damage (0-15).")
          .setMaxValue(15)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_agg")
          .setDescription("Aggravated Willpower Damage (0-15).")
          .setMaxValue(15)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_superficial")
          .setDescription("Superficial Health Damage (0-20).")
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_agg")
          .setDescription("Aggravated Health Damage (0-20).")
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addStringOption((option) =>
        option
          .setName("notes")
          .setDescription("Any extra info to include.")
          .setMaxLength(300)
      )

      .addStringOption((option) =>
        option
          .setName("color")
          .setDescription(
            "Sidebar color hex code (e.g. #6f82ab). [Supporter Only]"
          )
          .setMaxLength(7)
          .setMinLength(7)
      )

      .addAttachmentOption((option) =>
        option
          .setName("image")
          .setDescription(
            "Set your character's thumbnail image. [Supporter Only]"
          )
      )
  );

  //////////////////// Set Command ////////////////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("set")
      .setDescription("Set values for your W5 Werewolf character.")

      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Name of your character.")
          .setRequired(true)
          .setMaxLength(50)
          .setAutocomplete(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower")
          .setDescription("Total Willpower (1-20).")
          .setMaxValue(20)
          .setMinValue(1)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription("Total Health (1-20).")
          .setMaxValue(20)
          .setMinValue(1)
      )

      .addIntegerOption((option) =>
        option
          .setName("rage")
          .setDescription("Current Rage (0-5).")
          .setMaxValue(5)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("harano")
          .setDescription("Current Harano (0-5).")
          .setMaxValue(5)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("hauglosk")
          .setDescription("Current Hauglosk (0-5).")
          .setMaxValue(5)
          .setMinValue(0)
      )

      .addStringOption((option) =>
        option
          .setName("form")
          .setDescription("Current form.")
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
            "Total Experience. Positive values also increase current."
          )
          .setMaxValue(1000)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_superficial")
          .setDescription("Superficial Willpower Damage (0-15).")
          .setMaxValue(15)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_agg")
          .setDescription("Aggravated Willpower Damage (0-15).")
          .setMaxValue(15)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_superficial")
          .setDescription("Superficial Health Damage (0-20).")
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_agg")
          .setDescription("Aggravated Health Damage (0-20).")
          .setMaxValue(20)
          .setMinValue(0)
      )

      .addStringOption((option) =>
        option
          .setName("notes")
          .setDescription("Any extra info to include.")
          .setMaxLength(300)
      )

      .addStringOption((option) =>
        option
          .setName("change_name")
          .setDescription("Change your character's name.")
          .setMaxLength(50)
      )

      .addStringOption((option) =>
        option
          .setName("color")
          .setDescription(
            "Sidebar color hex code (e.g. #6f82ab). [Supporter Only]"
          )
          .setMaxLength(7)
          .setMinLength(7)
      )

      .addAttachmentOption((option) =>
        option
          .setName("image")
          .setDescription(
            "Set your character's thumbnail image. [Supporter Only]"
          )
      )
  );

  //////////////////////// Update Command ////////////////////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("update")
      .setDescription("Update values for your W5 Werewolf character.")

      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Name of your character.")
          .setRequired(true)
          .setMaxLength(50)
          .setAutocomplete(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("rage")
          .setDescription("Change Rage by this amount (-10 to 10).")
          .setMaxValue(10)
          .setMinValue(-10)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_superficial")
          .setDescription("Change Superficial Willpower Damage (-20 to 20).")
          .setMaxValue(20)
          .setMinValue(-20)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_superficial")
          .setDescription("Change Superficial Health Damage (-30 to 30).")
          .setMaxValue(30)
          .setMinValue(-30)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower_agg")
          .setDescription("Change Aggravated Willpower Damage (-20 to 20).")
          .setMaxValue(20)
          .setMinValue(-20)
      )

      .addIntegerOption((option) =>
        option
          .setName("health_agg")
          .setDescription("Change Aggravated Health Damage (-30 to 30).")
          .setMaxValue(30)
          .setMinValue(-30)
      )

      .addIntegerOption((option) =>
        option
          .setName("harano")
          .setDescription("Change Harano by this amount (-10 to 10).")
          .setMaxValue(10)
          .setMinValue(-10)
      )

      .addIntegerOption((option) =>
        option
          .setName("hauglosk")
          .setDescription("Change Hauglosk by this amount (-10 to 10).")
          .setMaxValue(10)
          .setMinValue(-10)
      )

      .addStringOption((option) =>
        option
          .setName("form")
          .setDescription("Current form.")
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
            "Change Experience by this amount. Positive values also increase total."
          )
          .setMaxValue(2000)
          .setMinValue(-2000)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower")
          .setDescription("Change Total Willpower (-20 to 20).")
          .setMaxValue(20)
          .setMinValue(-20)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription("Change Total Health (-30 to 30).")
          .setMaxValue(30)
          .setMinValue(-30)
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
          .setDescription("Any extra info to include.")
          .setMaxLength(300)
      )
  );
  return command;
}
