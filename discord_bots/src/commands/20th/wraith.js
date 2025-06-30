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
        return await tracker.new(interaction, Splats.wraith20th);
      case "update":
        return await tracker.update(interaction, Splats.wraith20th);
      case "set":
        return await tracker.set(interaction, Splats.wraith20th);
    }
  },

  async autocomplete(interaction) {
    return await autocomplete20th(interaction, Splats.wraith20th.slug);
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
    bashing: interaction.options.getInteger("bashing_damage"),
    lethal: interaction.options.getInteger("lethal_damage"),
    agg: interaction.options.getInteger("agg_damage"),
    corpus: interaction.options.getInteger("corpus"),
    pathos: interaction.options.getInteger("pathos"),
  };

  if (args.color || args.thumbnail)
    await verifySupporterStatus.fledgling(interaction.user.id);
  return args;
}

function getCommands() {
  const slashCommand = new SlashCommandBuilder();
  slashCommand.setName("wraith").setDescription("x");

  ////////////////////////////// Wraith New ///////////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("new")
      .setDescription("Create a new Wraith 20th")

      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The name of your Character")
          .setMaxLength(50)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("willpower")
          .setDescription(
            "Your total Willpower. " +
              "Must be between 1 and 10. WtO 20th Corebook p115"
          )
          .setMinValue(1)
          .setMaxValue(10)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("corpus")
          .setDescription(
            "Your total Corpus. " +
              "Must be between 0 and 10. WtO 20th Corebook p291"
          )
          .setMinValue(0)
          .setMaxValue(10)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("pathos")
          .setDescription(
            "Your Pathos rating. " +
              "Must be between 0 and 10. WtO 20th Corebook p114"
          )
          .setMinValue(0)
          .setMaxValue(10)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription("Your total Experiance. WtO 20th Corebook p301")
          .setMinValue(0)
          .setMaxValue(1000)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription(
            "Your total Health. Defaults to 7. " +
              "Must be between 7 and 15. WtO 20th Corebook p293"
          )
          .setMinValue(7)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("bashing_damage")
          .setDescription(
            "The total bashing damage inflicted. WtO 20th Corebook p293"
          )
          .setMinValue(0)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("lethal_damage")
          .setDescription(
            "The total lethal damage inflicted. WtO 20th Corebook p294"
          )
          .setMinValue(0)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("agg_damage")
          .setDescription(
            "The total Agg damage inflicted. WtO 20th Corebook p294"
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

  /////////////////////////////// Wraith Set //////////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("set")
      .setDescription("Set values for your Wraith 20th")

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
              "Must be between 1 and 10. WtO 20th Corebook p115"
          )
          .setMinValue(1)
          .setMaxValue(10)
      )

      .addIntegerOption((option) =>
        option
          .setName("corpus")
          .setDescription(
            "Sets you Total Corpus to the number. " +
              "Must be between 0 and 10. WtO 20th Corebook p291"
          )
          .setMinValue(0)
          .setMaxValue(10)
      )

      .addIntegerOption((option) =>
        option
          .setName("pathos")
          .setDescription(
            "Sets your Pathos to the number. " +
              "Must be between 0 and 10. WtO 20th Corebook p114"
          )
          .setMinValue(0)
          .setMaxValue(10)
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription(
            "Sets your total Exp to the number. " +
              "+ values will update current exp as well. WtO 20th Corebook p301"
          )
          .setMinValue(0)
          .setMaxValue(1000)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription(
            "Sets your Health to the number. " +
              "Must be between 7 and 15. WtO 20th Corebook p293"
          )
          .setMinValue(7)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("bashing_damage")
          .setDescription(
            "The total bashing damage inflicted. WtO 20th Corebook p293"
          )
          .setMinValue(0)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("lethal_damage")
          .setDescription(
            "The total lethal damage inflicted. WtO 20th Corebook p294"
          )
          .setMinValue(0)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("agg_damage")
          .setDescription(
            "The total Agg damage inflicted. WtO 20th Corebook p294"
          )
          .setMinValue(0)
          .setMaxValue(10)
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

  ////////////////////////////// Wraith Update /////////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("update")
      .setDescription("Update values for your Wraith 20th")

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
            "Updates your Willpower by the amount. " +
              "Must be between -15 and 15. WtO 20th Corebook p115"
          )
          .setMinValue(-15)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("corpus")
          .setDescription(
            "Updates you current Corpus by the amount. " +
              "Must be between -20 and 20. WtO 20th Corebook p291"
          )
          .setMinValue(-20)
          .setMaxValue(20)
      )

      .addIntegerOption((option) =>
        option
          .setName("pathos")
          .setDescription(
            "Updates your Pathos by the amount. " +
              "Must be between -20 and 20. WtO 20th Corebook p114"
          )
          .setMinValue(-20)
          .setMaxValue(20)
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription(
            "Updates your current exp. + values will increase" +
              " total as well. WtO 20th Corebook p301"
          )
          .setMinValue(-3000)
          .setMaxValue(3000)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription(
            "Updates your Health by the amount. " +
              "Must be between -20 and 20. WtO 20th Corebook p293"
          )
          .setMinValue(-20)
          .setMaxValue(20)
      )

      .addIntegerOption((option) =>
        option
          .setName("bashing_damage")
          .setDescription(
            "Updates your Bashing damage by the amount. " +
              "WtO 20th Corebook p293"
          )
          .setMinValue(-50)
          .setMaxValue(50)
      )

      .addIntegerOption((option) =>
        option
          .setName("lethal_damage")
          .setDescription(
            "Updates your Lethal damage by the amount. " +
              "WtO 20th Corebook p294"
          )
          .setMinValue(-50)
          .setMaxValue(50)
      )

      .addIntegerOption((option) =>
        option
          .setName("agg_damage")
          .setDescription(
            "Updates your Agg damage by the amount. " + "WtO 20th Corebook p294"
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
