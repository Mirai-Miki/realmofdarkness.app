"use strict";
require(`${process.cwd()}/alias`);
const { MessageFlags } = require("discord.js");
const { ComponentCID } = require("@constants");
const { RealmError, ErrorCodes } = require("@errors");
const API = require("@api");
const checkPerms = require("@modules/Initiative/checkButtonPerm");

module.exports = {
  name: ComponentCID.INIT_REVEAL,
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const tracker = await API.getInitTracker(interaction.channelId);
    if (!tracker)
      throw new RealmError({
        code: ErrorCodes.InitNoTracker,
        cause: "pressed reveal button",
      });
    await checkPerms(interaction, tracker);
    return await tracker.revealPhase(interaction);
  },
};
