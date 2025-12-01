"use strict";
require(`${process.cwd()}/alias`);
const { MessageFlags } = require("discord.js");
const { ComponentCID } = require("@constants");
const deleteCharacterComponent = require("@modules/deleteCharacter").component;

module.exports = {
  name: ComponentCID.DeleteCharacters,
  async execute(interaction) {
    await interaction.deferUpdate({ flags: MessageFlags.Ephemeral });
    return await deleteCharacterComponent(interaction);
  },
};
