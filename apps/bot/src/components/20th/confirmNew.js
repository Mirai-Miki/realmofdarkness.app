"use strict";
require(`${process.cwd()}/alias`);
const { MessageFlags } = require("discord.js");
const { ComponentCID } = require("@constants");
const InitiativeTracker = require("@structures/InitiativeTracker");
const API = require("@api");

module.exports = {
  name: ComponentCID.INIT_CONFIRM,
  async execute(interaction) {
    await interaction.deferUpdate({ flags: MessageFlags.Ephemeral });
    let tracker = await API.getInitTracker(interaction.channelId);
    const message = await interaction.channel.messages.fetch(tracker.messageId);
    if (message) await message.delete();
    tracker = new InitiativeTracker({
      channelId: interaction.channel.id,
      guildId: interaction.guild.id,
      startMemberId: interaction.member.id,
    });
    return await tracker.rollPhase(interaction);
  },
};
