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
      .setDescription("Character commands.")

      ////////////////////////// Character find Command ///////////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("find")
          .setDescription("Find a tracked character.")
          .addUserOption((option) =>
            option
              .setName("player")
              .setDescription(
                "Storytellers must select the player this character belongs to."
              )
          )
      )
      ///////////////////// Character Delete Command //////////////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("delete")
          .setDescription("Delete a tracked character.")
          .addUserOption((option) =>
            option
              .setName("player")
              .setDescription(
                "Storytellers must select the player this character belongs to."
              )
          )
      )
      ///////////////////////// Character Defaults /////////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("default")
          .setDescription(
            "Set a default character for dice rolls and updates on this server."
          )
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("Name of the character to set as default.")
              .setMaxLength(50)
          )
          .addBooleanOption((option) =>
            option
              .setName("use_char_hunger")
              .setDescription(
                "If enabled, rolls always use this character's hunger."
              )
          )
          .addBooleanOption((option) =>
            option
              .setName("disable")
              .setDescription("Disable default character.")
          )
      )
  );
}
