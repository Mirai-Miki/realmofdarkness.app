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
    .setDescription("Vampire 20th tracker commands");

  /////////////////////// New Vampire ////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("new")
      .setDescription("Create a new Vampire 20th")

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
              "Must be between 1 and 10. VtM 20th Corebook p120"
          )
          .setMinValue(1)
          .setMaxValue(10)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("blood")
          .setDescription(
            "Your total Blood Pool. " +
              "Must be between 1 and 100. VtM 20th Corebook p121"
          )
          .setMinValue(1)
          .setMaxValue(100)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("morality")
          .setDescription(
            "Your total Humanity or Path. " +
              "Must be between 0 and 10. VtM 20th Corebook p309"
          )
          .setMinValue(0)
          .setMaxValue(10)
          .setRequired(true)
      )

      .addStringOption((option) =>
        option
          .setName("morality_name")
          .setDescription(
            "The name of your chosen Morality. " +
              "Default to 'Humanity'. VtM 20th Corebook p309"
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
          .setDescription("Your total Experiance. " + "VtM 20th Corebook p122")
          .setMinValue(0)
          .setMaxValue(1000)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription(
            "Your total Health. Defaults to 7. " +
              "Must be between 7 and 15. VtM 20th Corebook p282"
          )
          .setMinValue(7)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("bashing_damage")
          .setDescription(
            "The total bashing damage inflicted. " + "VtM 20th Corebook p285"
          )
          .setMinValue(0)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("lethal_damage")
          .setDescription(
            "The total lethal damage inflicted. " + "VtM 20th Corebook p285"
          )
          .setMinValue(0)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("agg_damage")
          .setDescription(
            "The total Agg damage inflicted. " + "VtM 20th Corebook p285"
          )
          .setMinValue(0)
          .setMaxValue(15)
      )

      .addStringOption((option) =>
        option
          .setName("notes")
          .setDescription(
            "Any aditional information you" + " would like to include."
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

  ///////////////////////// Set Vampire ////////////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("set")
      .setDescription("Set values for your Vampire 20th")

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
            "Sets you total Willpower to the number. " +
              "Must be between 1 and 10. VtM 20th Corebook p120"
          )
          .setMinValue(1)
          .setMaxValue(10)
      )

      .addIntegerOption((option) =>
        option
          .setName("blood")
          .setDescription(
            "Sets you total Blood Pool to the number. " +
              "Must be between 1 and 100. VtM 20th Corebook p121"
          )
          .setMinValue(1)
          .setMaxValue(100)
      )

      .addIntegerOption((option) =>
        option
          .setName("morality")
          .setDescription(
            "Sets your Mortality to the number. " +
              "Must be between 0 and 10. VtM 20th Corebook p309"
          )
          .setMinValue(0)
          .setMaxValue(10)
      )

      .addStringOption((option) =>
        option
          .setName("morality_name")
          .setDescription(
            "Sets the name of your chosen Morality. " + "VtM 20th Corebook p309"
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
          .setDescription(
            "Sets your total Exp to the number. " +
              "Positive value will update current exp as well. V20 Core p122"
          )
          .setMinValue(0)
          .setMaxValue(1000)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription(
            "Sets your Health to the number. " +
              "Must be between 7 and 15. VtM 20th Corebook p282"
          )
          .setMinValue(7)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("bashing_damage")
          .setDescription(
            "The total bashing damage inflicted. VtM 20th Corebook p285"
          )
          .setMinValue(0)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("lethal_damage")
          .setDescription(
            "The total lethal damage inflicted. VtM 20th Corebook p285"
          )
          .setMinValue(0)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("agg_damage")
          .setDescription(
            "The total Agg damage inflicted. VtM 20th Corebook p285"
          )
          .setMinValue(0)
          .setMaxValue(15)
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

  /////////////////////// Update Vampire ////////////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("update")
      .setDescription("Update values for your Vampire 20th")

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
            "Updates your Willpower by the amount. " +
              "Must be between -15 and 15. VtM 20th Corebook p120"
          )
          .setMinValue(-15)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("blood")
          .setDescription(
            "Updates you Blood Pool by the amount. " +
              "Must be between -200 and 200. VtM 20th Corebook p121"
          )
          .setMinValue(-200)
          .setMaxValue(200)
      )

      .addIntegerOption((option) =>
        option
          .setName("morality")
          .setDescription(
            "Updates your Morality by the amount. " +
              "Must be between -20 and 20. VtM 20th Corebook p309"
          )
          .setMinValue(-20)
          .setMaxValue(20)
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription(
            "Updates your current exp. + values will increase" +
              " total as well. VtM 20th Corebook p122"
          )
          .setMinValue(-3000)
          .setMaxValue(3000)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription(
            "Updates your Health by the amount. " +
              "Must be between -20 and 20. VtM 20th Corebook p282"
          )
          .setMinValue(-20)
          .setMaxValue(20)
      )

      .addIntegerOption((option) =>
        option
          .setName("bashing_damage")
          .setDescription(
            "Updates your Bashing damage by the amount. " +
              "VtM 20th Corebook p285"
          )
          .setMinValue(-50)
          .setMaxValue(50)
      )

      .addIntegerOption((option) =>
        option
          .setName("lethal_damage")
          .setDescription(
            "Updates your Lethal damage by the amount. " +
              "VtM 20th Corebook p285"
          )
          .setMinValue(-50)
          .setMaxValue(50)
      )

      .addIntegerOption((option) =>
        option
          .setName("agg_damage")
          .setDescription(
            "Updates your Agg damage by the amount. " + "VtM 20th Corebook p285"
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
          .setDescription(
            "Any aditional information you would like to include."
          )
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
