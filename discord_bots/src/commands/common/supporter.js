"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { supporterStatus, supporterJoin } = require("@modules/supporter");
const commandUpdate = require("@modules/commandDatabaseUpdate");

module.exports = {
  data: getCommands(),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await commandUpdate(interaction);

    switch (interaction.options.getSubcommand()) {
      case "status":
        return await supporterStatus(interaction);
      case "join":
        return await supporterJoin(interaction);
    }
  },
};

function getCommands() {
  return (
    new SlashCommandBuilder()
      .setName("supporter")
      .setDescription("Supporter commands.")

      /////////////////// Supporter Status Command ////////////////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("status")
          .setDescription("Your current supporter tier and information.")
      )

      ///////////////////////// Supporter Join Command //////////////////
      .addSubcommand((subcommand) =>
        subcommand.setName("join").setDescription("Become a supporter.")
      )
  );
}
