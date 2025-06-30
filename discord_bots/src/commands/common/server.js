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
      .setDescription("server Commands")

      /////////////////// Server Tracker Command ////////////////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("tracker")
          .setDescription(
            "Selects a channel for copies of all tracking posts" +
              " to be sent to. [ST only]"
          )

          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription(
                "The channel to be selected. Or removes a channel" +
                  " if already selected."
              )
          )
      )
      ///////////////////////// Server Storytellers Command //////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("storytellers")
          .setDescription(
            "Sets the ST permissions for the ST only commands" +
              ". [Admin only]"
          )

          .addRoleOption((option) =>
            option
              .setName("role")
              .setDescription("The ST role to be added or removed.")
          )
      )
  );
}
