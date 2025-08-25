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
    await verifySupporterStatus.mortal(interaction.user.id);
  return args;
}

function getCommands() {
  const slashCommand = new SlashCommandBuilder();
  slashCommand
    .setName("wraith")
    .setDescription("Wraith 20th character commands.");

  ////////////////////////////// Wraith New ///////////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("new")
      .setDescription("Create a new Wraith 20th character.")

      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Character name.")
          .setMaxLength(50)
          .setRequired(true)
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
          .setName("corpus")
          .setDescription("Total Corpus (0-10).")
          .setMinValue(0)
          .setMaxValue(10)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("pathos")
          .setDescription("Pathos rating (0-10).")
          .setMinValue(0)
          .setMaxValue(10)
          .setRequired(true)
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

  /////////////////////////////// Wraith Set //////////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("set")
      .setDescription("Set values for your Wraith 20th character.")

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
          .setName("corpus")
          .setDescription("Set total Corpus (0-10).")
          .setMinValue(0)
          .setMaxValue(10)
      )

      .addIntegerOption((option) =>
        option
          .setName("pathos")
          .setDescription("Set Pathos rating (0-10).")
          .setMinValue(0)
          .setMaxValue(10)
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
          .setMaxValue(10)
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

  ////////////////////////////// Wraith Update /////////////////////////////////
  slashCommand.addSubcommand((subcommand) =>
    subcommand
      .setName("update")
      .setDescription("Update values for your Wraith 20th character.")

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
          .setDescription("Change Willpower by this amount (-15 to 15).")
          .setMinValue(-15)
          .setMaxValue(15)
      )

      .addIntegerOption((option) =>
        option
          .setName("corpus")
          .setDescription("Change current Corpus by this amount (-20 to 20).")
          .setMinValue(-20)
          .setMaxValue(20)
      )

      .addIntegerOption((option) =>
        option
          .setName("pathos")
          .setDescription("Change Pathos by this amount (-20 to 20).")
          .setMinValue(-20)
          .setMaxValue(20)
      )

      .addIntegerOption((option) =>
        option
          .setName("exp")
          .setDescription(
            "Change current EXP. Positive values also increase total."
          )
          .setMinValue(-3000)
          .setMaxValue(3000)
      )

      .addIntegerOption((option) =>
        option
          .setName("health")
          .setDescription("Change Health by this amount (-20 to 20).")
          .setMinValue(-20)
          .setMaxValue(20)
      )

      .addIntegerOption((option) =>
        option
          .setName("bashing_damage")
          .setDescription("Change Bashing damage by this amount (-50 to 50).")
          .setMinValue(-50)
          .setMaxValue(50)
      )

      .addIntegerOption((option) =>
        option
          .setName("lethal_damage")
          .setDescription("Change Lethal damage by this amount (-50 to 50).")
          .setMinValue(-50)
          .setMaxValue(50)
      )

      .addIntegerOption((option) =>
        option
          .setName("agg_damage")
          .setDescription(
            "Change Aggravated damage by this amount (-50 to 50)."
          )
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
