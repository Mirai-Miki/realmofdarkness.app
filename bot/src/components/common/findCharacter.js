"use strict";
require(`${process.cwd()}/alias`);
const { MessageFlags } = require("discord.js");
const { ComponentCID } = require("@constants");
const findCharacterComponent = require("@modules/findCharacter").component;

module.exports = {
  name: ComponentCID.FindCharacter,
  async execute(interaction) {
    await interaction.deferUpdate({ flags: MessageFlags.Ephemeral });
    return await findCharacterComponent(interaction);
  },
};
