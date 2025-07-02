"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder } = require("@discordjs/builders");
const { Splats } = require("@constants");
const tracker = require("@modules/tracker");
const getHexColor = require("@modules/getColorHex");
const verifySupporterStatus = require("@modules/verifySupporterStatus");
const commandUpdate = require("@modules/commandDatabaseUpdate");
const autocomplete20th = require("@modules/autocomplete");
const { MessageFlags } = require("discord.js");

module.exports = {
  data: getCommands(),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await commandUpdate(interaction);

    if (!interaction.isRepliable()) return "notRepliable";
    interaction.arguments = await getArgs(interaction);
    return await tracker.set(interaction, Splats.changeling20th);
  },

  async autocomplete(interaction) {
    return await autocomplete20th(interaction, Splats.changeling20th.slug);
  },
};

async function getArgs(interaction) {
  const args = {
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
    glamour: interaction.options.getInteger("glamour"),
    banality: interaction.options.getInteger("banality"),
    nightmare: interaction.options.getInteger("nightmare"),
    imbalance: interaction.options.getInteger("imbalance"),
    healthChimerical: interaction.options.getInteger("health_chimerical"),
    bashingChimerical: interaction.options.getInteger("bashing_chimerical"),
    lethalChimerical: interaction.options.getInteger("lethal_chimerical"),
    aggChimerical: interaction.options.getInteger("agg_chimerical"),
  };

  if (args.color || args.thumbnail)
    await verifySupporterStatus.fledgling(interaction.user.id);
  return args;
}

function getCommands() {
  const slashCommand = new SlashCommandBuilder()
    .setName("changeling_set")
    .setDescription("Set values for your Changeling character.")

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
        .setName("glamour")
        .setDescription("Set total Glamour (1-10).")
        .setMinValue(1)
        .setMaxValue(10)
    )

    .addIntegerOption((option) =>
      option
        .setName("banality")
        .setDescription("Set total Banality (1-10).")
        .setMinValue(1)
        .setMaxValue(10)
    )

    .addIntegerOption((option) =>
      option
        .setName("nightmare")
        .setDescription("Set Nightmare (0-10).")
        .setMinValue(0)
        .setMaxValue(10)
    )

    .addIntegerOption((option) =>
      option
        .setName("imbalance")
        .setDescription("Set Imbalance (0-10).")
        .setMinValue(0)
        .setMaxValue(10)
    )

    .addIntegerOption((option) =>
      option
        .setName("exp")
        .setDescription(
          "Set total Experience. Positive values also update current."
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

    .addIntegerOption((option) =>
      option
        .setName("health_chimerical")
        .setDescription("Set Chimerical Health (7-15). Defaults to 7.")
        .setMinValue(7)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("bashing_chimerical")
        .setDescription("Total Chimerical bashing damage.")
        .setMinValue(0)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("lethal_chimerical")
        .setDescription("Total Chimerical lethal damage.")
        .setMinValue(0)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("agg_chimerical")
        .setDescription("Total Chimerical aggravated damage.")
        .setMinValue(0)
        .setMaxValue(15)
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
    );
  return slashCommand;
}
