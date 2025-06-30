// filepath: /f:/programming/Realm-of-Darkness-Bot/src/commands/5th/wake.js
"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder } = require("@discordjs/builders");
const v5Wake = require("@modules/dice/5th/v5WakeRoll");
const { Splats } = require("@constants");

module.exports = {
  data: getCommand(),

  async execute(interaction) {
    return await v5Wake(interaction);
  },

  async autocomplete(interaction) {
    const autocomplete5th = require("@modules/autocomplete");
    return await autocomplete5th(interaction, [Splats.vampire5th.slug]);
  },
};

function getCommand() {
  return new SlashCommandBuilder()
    .setName("wake")
    .setDescription(
      "Wake your vampire for the night with options for healing and Blush of Life."
    )

    .addStringOption((option) =>
      option
        .setName("character")
        .setDescription("Name of the character waking.")
        .setMaxLength(50)
        .setAutocomplete(true)
    )

    .addBooleanOption((option) =>
      option
        .setName("heal_agg")
        .setDescription(
          "Attempt to heal 1 aggravated health damage (requires 3 additional rouse checks)."
        )
    )

    .addBooleanOption((option) =>
      option
        .setName("heal_willpower")
        .setDescription(
          "Heal superficial willpower damage based on your Resolve or Composure."
        )
    )

    .addBooleanOption((option) =>
      option
        .setName("blush_of_life")
        .setDescription(
          "Activate Blush of Life (requires additional rouse check)."
        )
    )

    .addStringOption((option) =>
      option
        .setName("notes")
        .setDescription("Any extra information you would like to include.")
        .setMaxLength(300)
    );
}
