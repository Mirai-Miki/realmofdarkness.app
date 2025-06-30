"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { Splats } = require("@constants");

const tracker = require("@modules/tracker");
const getHexColor = require("@modules/getColorHex");
const verifySupporterStatus = require("@modules/verifySupporterStatus");
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
        return await tracker.new(interaction, Splats.ghoul20th);
      case "update":
        return await tracker.update(interaction, Splats.ghoul20th);
      case "set":
        return await tracker.set(interaction, Splats.ghoul20th);
    }
  },

  async autocomplete(interaction) {
    return await autocomplete20th(interaction, Splats.ghoul20th.slug);
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
    blood: interaction.options.getInteger("blood"),
    morality: interaction.options.getInteger("humanity"),
    vitae: interaction.options.getInteger("vitae"),
  };

  if (args.color || args.thumbnail)
    await verifySupporterStatus.fledgling(interaction.user.id);
  return args;
}

function getCommands() {
  const slashCommand = new SlashCommandBuilder();
  slashCommand.setName("ghoul").setDescription(".");

  /////////////////////////////// New Ghoul ////////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("new")
      .setDescription("Create a new Ghoul 20th")

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
              "Must be between 1 and 10. VtM 20th Corebook p120"
          )
          .setMinValue(1)
          .setMaxValue(10)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("humanity")
          .setDescription(
            "Your total Humanity" +
              "Must be between 0 and 10. VtM 20th Corebook p309"
          )
          .setMinValue(0)
          .setMaxValue(10)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("blood")
          .setDescription(
            "Your current Blood Pool. " +
              "Must be between 1 and 10. VtM 20th Corebook p121"
          )
          .setMinValue(1)
          .setMaxValue(10)
      )

      .addIntegerOption((option) =>
        option
          .setName("vitae")
          .setDescription(
            "Your current Vitae Pool. " +
              "Must be between 1 and 5. VtM 20th Corebook p502"
          )
          .setMinValue(1)
          .setMaxValue(5)
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription("Your total Experiance. VtM 20th Corebook p122")
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
            "Changes your Character's Thumbnail" + " Image. [Supporter Only]"
          )
      )
  );

  /////////////////////////////// Set Ghoul ////////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("set")
      .setDescription("Set values for your Ghoul 20th")

      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The name of your Character")
          .setMaxLength(300)
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
          .setName("humanity")
          .setDescription(
            "Sets your humanity to the number. " +
              "Must be between 0 and 10. VtM 20th Corebook p309"
          )
          .setMinValue(0)
          .setMaxValue(10)
      )

      .addIntegerOption((option) =>
        option
          .setName("blood")
          .setDescription(
            "Sets your current Blood Pool to the number. " +
              "Must be between 1 and 10. VtM 20th Corebook p121"
          )
          .setMinValue(1)
          .setMaxValue(10)
      )

      .addIntegerOption((option) =>
        option
          .setName("vitae")
          .setDescription(
            "Sets your current Vitae Pool. " +
              "Must be between 1 and 5. VtM 20th Corebook p502"
          )
          .setMinValue(1)
          .setMaxValue(5)
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
            "Changes your Character's Thumbnail" + " Image. [Supporter Only]"
          )
      )
  );

  ///////////////////////////////// Update Ghoul /////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("update")
      .setDescription("Update values for your Ghoul 20th")

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
              "Must be between -15 and 15. VtM 20th Corebook p120"
          )
          .setMinValue(-15)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("humanity")
          .setDescription(
            "Updates your humanity by the amount. " +
              "Must be between -15 and 15. VtM 20th Corebook p309"
          )
          .setMinValue(-15)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("blood")
          .setDescription(
            "Updates your Blood Pool by the amount. " +
              "Must be between -20 and 20. VtM 20th Corebook p121"
          )
          .setMinValue(-20)
          .setMaxValue(20)
      )

      .addIntegerOption((option) =>
        option
          .setName("vitae")
          .setDescription(
            "Updates your Vitae Pool. " +
              "Must be between -10 and 10. VtM 20th Corebook p502"
          )
          .setMinValue(-10)
          .setMaxValue(10)
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
            "Any aditional information you" + " would like to include."
          )
          .setMaxLength(300)
      )
  );
  return slashCommand;
}
