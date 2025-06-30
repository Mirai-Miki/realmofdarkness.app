"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const findCharacterCommand = require("@modules/findCharacter").command;
const deleteCharacterCommand = require("@modules/deleteCharacter").command;
const setDefaultCharacter = require("@modules/setDefaultCharacter");
const commandUpdate = require("@modules/commandDatabaseUpdate");

module.exports = {
  data: getCommands(),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await commandUpdate(interaction);

    if (!interaction.isRepliable()) return "notRepliable";

    switch (interaction.options.getSubcommand()) {
      case "find":
        return await findCharacterCommand(interaction);
      case "delete":
        return await deleteCharacterCommand(interaction);
      case "default":
        return await setDefaultCharacter(interaction);
    }
  },
};

function getCommands() {
  return (
    new SlashCommandBuilder()
      .setName("character")
      .setDescription("Character Commands")

      //////////////////////////// Character find Command ///////////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("find")
          .setDescription("Finds a tracked Character")
          /*
      .addBooleanOption(option =>
        option.setName("history")
        .setDescription("Select if you would like to display" +
          " the history information.")
      )
      */
          .addUserOption((option) =>
            option
              .setName("player")
              .setDescription(
                "The player the character belongs to. Used by" +
                  " STs to find another players Char [ST Only]"
              )
          )
      )
      ///////////////////// Character Delete Command ////////////////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("delete")
          .setDescription("Choose which Character you wish to Delete.")

          .addUserOption((option) =>
            option
              .setName("player")
              .setDescription("The player the character belongs to. [ST Only]")
          )
      )
      ///////////////////////// Character Defaults /////////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("default")
          .setDescription(
            "Sets a default character for this server to be " +
              "used for dice rolls and character updates."
          )

          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("Name of the character to default to.")
              .setMaxLength(50)
              .setRequired(true)
          )

          .addBooleanOption((option) =>
            option.setName("disable").setDescription("Turns defaults off.")
          )
      )
  );
}
