"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const setStorytellers = require("@modules/setStorytellers");
const setTrackerChannel = require("@modules/setTrackerChannel");
const commandUpdate = require("@modules/commandDatabaseUpdate");

module.exports = {
  data: getCommands(),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await commandUpdate(interaction);

    if (!interaction.isRepliable()) return "notRepliable";

    switch (interaction.options.getSubcommand()) {
      case "tracker":
        return await setTrackerChannel(interaction);
      case "storytellers":
        return await setStorytellers(interaction);
    }
  },
};

function getCommands() {
  return (
    new SlashCommandBuilder()
      .setName("server")
      .setDescription("Server management commands.")

      /////////////////// Server Tracker Command ////////////////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("tracker")
          .setDescription(
            "Set or remove the channel for tracking posts. [ST only]"
          )

          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription(
                "Channel to use for tracking posts, or remove if already set."
              )
          )
      )
      ///////////////////////// Server Storytellers Command //////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("storytellers")
          .setDescription(
            "Set or remove Storyteller (ST) role permissions. [Admin only]"
          )

          .addRoleOption((option) =>
            option.setName("role").setDescription("ST role to add or remove.")
          )
      )
  );
}
