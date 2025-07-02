"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const tracker = require("@modules/tracker");
const getHexColor = require("@modules/getColorHex");
const verifySupporterStatus = require("@modules/verifySupporterStatus");
const { Splats } = require("@constants");
const commandUpdate = require("@modules/commandDatabaseUpdate");
const autocomplete20th = require("@modules/autocomplete");

module.exports = {
  data: getCommands(),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await commandUpdate(interaction);

    if (!interaction.isRepliable()) return "notRepliable";
    interaction.arguments = await getArgs(interaction);
    switch (interaction.options.getSubcommand()) {
      case "new":
        return await tracker.new(interaction, Splats.vampire20th);
      case "update":
        return await tracker.update(interaction, Splats.vampire20th);
      case "set":
        return await tracker.set(interaction, Splats.vampire20th);
    }
  },

  async autocomplete(interaction) {
    return await autocomplete20th(interaction, Splats.vampire20th.slug);
  },
};

async function getArgs(interaction) {
  const moralityNameType = interaction.options.getString("morality_name");
  let moralityName = null;
  if (moralityNameType) moralityName = MortalityType[moralityNameType];
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
    bashing: interaction.options.getInteger("bashing_damage"),
    lethal: interaction.options.getInteger("lethal_damage"),
    agg: interaction.options.getInteger("agg_damage"),
    blood: interaction.options.getInteger("blood"),
    moralityName: moralityName,
    morality: interaction.options.getInteger("morality"),
  };

  if (args.color || args.thumbnail)
    await verifySupporterStatus.fledgling(interaction.user.id);
  return args;
}

function getCommands() {
  const slashCommand = new SlashCommandBuilder()
    .setName("vampire")
    .setDescription("Vampire 20th character commands.");

  /////////////////////// New Vampire ////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("new")
      .setDescription("Create a new Vampire 20th character.")

      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Character name.")
          .setRequired(true)
          .setMaxLength(50)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower")
          .setDescription("Total Willpower (1-10).")
          .setMinValue(1)
          .setMaxValue(10)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("blood")
          .setDescription("Total Blood Pool (1-100).")
          .setMinValue(1)
          .setMaxValue(100)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("morality")
          .setDescription("Total Humanity or Path (0-10).")
          .setMinValue(0)
          .setMaxValue(10)
          .setRequired(true)
      )

      .addStringOption((option) =>
        option
          .setName("morality_name")
          .setDescription(
            "Name of your chosen Morality. Defaults to 'Humanity'."
          )
          .addChoices(
            { name: "Humanity", value: "1" },
            { name: "Path of Asakku", value: "2" },
            { name: "Path of Blood", value: "3" },
            { name: "Path of the Bones", value: "4" },
            { name: "Path of Caine", value: "5" },
            { name: "Path of Cathari", value: "6" },
            { name: "Path of Death and the Soul", value: "7" },
            { name: "Path of Ecstasy", value: "8" },
            { name: "Path of Entelechy", value: "9" },
            { name: "Path of Evil Revelations", value: "10" },
            { name: "Path of the Feral Heart", value: "11" },
            { name: "Path of Harmony", value: "12" },
            { name: "Path of the Hive", value: "13" },
            { name: "Path of Honorable Accord", value: "14" },
            { name: "Path of Lilith", value: "15" },
            { name: "Path of Metamorphosis", value: "16" },
            { name: "Path of Night", value: "17" },
            { name: "Path of Paradox", value: "18" },
            { name: "Path of Power and the Inner Voice", value: "19" },
            { name: "Path of the Scorched Heart", value: "20" },
            { name: "Path of Self-Focus", value: "21" },
            { name: "Path of Typhon", value: "22" },
            { name: "Path of the Warrior", value: "23" }
          )
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription("Total experience points.")
          .setMinValue(0)
          .setMaxValue(1000)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription("Total Health (7-15). Defaults to 7.")
          .setMinValue(7)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("bashing_damage")
          .setDescription("Total bashing damage.")
          .setMinValue(0)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("lethal_damage")
          .setDescription("Total lethal damage.")
          .setMinValue(0)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("agg_damage")
          .setDescription("Total aggravated damage.")
          .setMinValue(0)
          .setMaxValue(15)
      )

      .addStringOption((option) =>
        option
          .setName("notes")
          .setDescription("Additional notes or info.")
          .setMaxLength(300)
      )

      .addStringOption((option) =>
        option
          .setName("color")
          .setDescription("Sidebar color hex (e.g. #6f82ab). [Supporter Only]")
          .setMaxLength(7)
          .setMinLength(7)
      )

      .addAttachmentOption((option) =>
        option
          .setName("image")
          .setDescription("Set character thumbnail image. [Supporter Only]")
      )
  );

  ///////////////////////// Set Vampire ////////////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("set")
      .setDescription("Set values for your Vampire 20th character.")

      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Character name.")
          .setMaxLength(50)
          .setRequired(true)
          .setAutocomplete(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower")
          .setDescription("Set total Willpower (1-10).")
          .setMinValue(1)
          .setMaxValue(10)
      )

      .addIntegerOption((option) =>
        option
          .setName("blood")
          .setDescription("Set total Blood Pool (1-100).")
          .setMinValue(1)
          .setMaxValue(100)
      )

      .addIntegerOption((option) =>
        option
          .setName("morality")
          .setDescription("Set Humanity or Path (0-10).")
          .setMinValue(0)
          .setMaxValue(10)
      )

      .addStringOption((option) =>
        option
          .setName("morality_name")
          .setDescription("Set name of your chosen Morality.")
          .addChoices(
            { name: "Humanity", value: "1" },
            { name: "Path of Asakku", value: "2" },
            { name: "Path of Blood", value: "3" },
            { name: "Path of the Bones", value: "4" },
            { name: "Path of Caine", value: "5" },
            { name: "Path of Cathari", value: "6" },
            { name: "Path of Death and the Soul", value: "7" },
            { name: "Path of Ecstasy", value: "8" },
            { name: "Path of Entelechy", value: "9" },
            { name: "Path of Evil Revelations", value: "10" },
            { name: "Path of the Feral Heart", value: "11" },
            { name: "Path of Harmony", value: "12" },
            { name: "Path of the Hive", value: "13" },
            { name: "Path of Honorable Accord", value: "14" },
            { name: "Path of Lilith", value: "15" },
            { name: "Path of Metamorphosis", value: "16" },
            { name: "Path of Night", value: "17" },
            { name: "Path of Paradox", value: "18" },
            { name: "Path of Power and the Inner Voice", value: "19" },
            { name: "Path of the Scorched Heart", value: "20" },
            { name: "Path of Self-Focus", value: "21" },
            { name: "Path of Typhon", value: "22" },
            { name: "Path of the Warrior", value: "23" }
          )
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription(
            "Set total experience points. Positive values also update current."
          )
          .setMinValue(0)
          .setMaxValue(1000)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription("Set Health (7-15).")
          .setMinValue(7)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("bashing_damage")
          .setDescription("Total bashing damage.")
          .setMinValue(0)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("lethal_damage")
          .setDescription("Total lethal damage.")
          .setMinValue(0)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("agg_damage")
          .setDescription("Total aggravated damage.")
          .setMinValue(0)
          .setMaxValue(15)
      )

      .addStringOption((option) =>
        option
          .setName("notes")
          .setDescription("Additional notes or info.")
          .setMaxLength(300)
      )

      .addStringOption((option) =>
        option
          .setName("change_name")
          .setDescription("Change character name.")
          .setMaxLength(50)
      )

      .addStringOption((option) =>
        option
          .setName("color")
          .setDescription("Sidebar color hex (e.g. #6f82ab). [Supporter Only]")
          .setMaxLength(7)
          .setMinLength(7)
      )

      .addAttachmentOption((option) =>
        option
          .setName("image")
          .setDescription("Set character thumbnail image. [Supporter Only]")
      )
  );

  /////////////////////// Update Vampire ////////////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("update")
      .setDescription("Update values for your Vampire 20th character.")

      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Character name.")
          .setRequired(true)
          .setMaxLength(50)
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
          .setName("blood")
          .setDescription("Change Blood Pool by amount (-200 to 200).")
          .setMinValue(-200)
          .setMaxValue(200)
      )

      .addIntegerOption((option) =>
        option
          .setName("morality")
          .setDescription("Change Humanity or Path by amount (-20 to 20).")
          .setMinValue(-20)
          .setMaxValue(20)
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription(
            "Change current experience. Positive values also increase total."
          )
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
      )
  );
  return slashCommand;
}

const MortalityType = {
  1: "Humanity",
  2: "Path of Asakku",
  3: "Path of Blood",
  4: "Path of the Bones",
  5: "Path of Caine",
  6: "Path of Cathari",
  7: "Path of Death and the Soul",
  8: "Path of Ecstasy",
  9: "Path of Entelechy",
  10: "Path of Evil Revelations",
  11: "Path of the Feral Heart",
  12: "Path of Harmony",
  13: "Path of the Hive",
  14: "Path of Honorable Accord",
  15: "Path of Lilith",
  16: "Path of Metamorphosis",
  17: "Path of Night",
  18: "Path of Paradox",
  19: "Path of Power and the Inner Voice",
  20: "Path of the Scorched Heart",
  21: "Path of Self-Focus",
  22: "Path of Typhon",
  23: "Path of the Warrior",
};
