"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder } = require("@discordjs/builders");
const remorse = require("@modules/dice/5th/remorse");
const commandUpdate = require("@modules/commandDatabaseUpdate");
const autocomplete5th = require("@modules/autocomplete");
const { Splats } = require("@constants");

module.exports = {
  data: getCommand(),
  async execute(interaction) {
    await interaction.deferReply();
    await commandUpdate(interaction);

    if (!interaction.isRepliable()) return "notRepliable";

    return await remorse(interaction);
  },

  async autocomplete(interaction) {
    return await autocomplete5th(interaction, [
      Splats.vampire5th.slug,
      Splats.human5th.slug,
      Splats.ghoul5th.slug,
    ]);
  },
};

function getCommand() {
  const command = new SlashCommandBuilder()
    .setName("remorse")
    .setDescription("Humanity Remorse roll. p239")

    .addStringOption((option) => {
      option
        .setName("name")
        .setDescription(
          "Name of the character making the roll. " +
            "Must be a sheet character."
        )
        .setMaxLength(50)
        .setAutocomplete(true);
      return option;
    })

    .addStringOption((option) => {
      option
        .setName("notes")
        .setDescription(
          "Any extra information you would like to include about this roll."
        )
        .setMaxLength(300);
      return option;
    });

  return command;
}
