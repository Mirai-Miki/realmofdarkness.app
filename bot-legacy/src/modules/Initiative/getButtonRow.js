"use strict";
require(`${process.cwd()}/alias`);
const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { InitPhase, ComponentCID } = require("@constants");

module.exports.getInitiativeButtonRow = function (phase) {
  if (phase === InitPhase.ROLL || phase === InitPhase.JOIN) return rollPhaseOne;
  else if (phase === InitPhase.ROLL2 || phase === InitPhase.JOIN2)
    return rollPhaseTwo;
  else if (phase === InitPhase.REVEAL) return revealPhase;
  else if (phase === InitPhase.DECLARE) return declarePhaseOne;
  else if (phase === InitPhase.DECLARED) return declarePhaseTwo;
};

const rollPhaseOne = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId(ComponentCID.INIT_END)
    .setLabel("End Initiative")
    .setStyle(ButtonStyle.Danger)
);

const rollPhaseTwo = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId(ComponentCID.INIT_REVEAL)
      .setLabel("Reveal Initiative")
      .setStyle(ButtonStyle.Primary)
  )
  .addComponents(
    new ButtonBuilder()
      .setCustomId(ComponentCID.INIT_END)
      .setLabel("End Initiative")
      .setStyle(ButtonStyle.Danger)
  );

const revealPhase = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId(ComponentCID.INIT_DECLARE)
      .setLabel("Declare Actions")
      .setStyle(ButtonStyle.Primary)
  )
  .addComponents(
    new ButtonBuilder()
      .setCustomId(ComponentCID.INIT_NEXT_ROUND)
      .setLabel("Next Round (New Init)")
      .setStyle(ButtonStyle.Secondary)
  )
  .addComponents(
    new ButtonBuilder()
      .setCustomId(ComponentCID.INIT_JOIN)
      .setLabel("Next Round (Same Init)")
      .setStyle(ButtonStyle.Secondary)
  )
  .addComponents(
    new ButtonBuilder()
      .setCustomId(ComponentCID.INIT_END)
      .setLabel("End Initiative")
      .setStyle(ButtonStyle.Danger)
  );

const declarePhaseOne = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId(ComponentCID.INIT_SKIP)
      .setLabel("Skip action")
      .setStyle(ButtonStyle.Secondary)
  )
  .addComponents(
    new ButtonBuilder()
      .setCustomId(ComponentCID.INIT_END)
      .setLabel("End Initiative")
      .setStyle(ButtonStyle.Danger)
  );

const declarePhaseTwo = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId(ComponentCID.INIT_NEXT_ROUND)
      .setLabel("Next Round (New Init)")
      .setStyle(ButtonStyle.Primary)
  )
  .addComponents(
    new ButtonBuilder()
      .setCustomId(ComponentCID.INIT_JOIN)
      .setLabel("Next Round (Same Init)")
      .setStyle(ButtonStyle.Primary)
  )
  .addComponents(
    new ButtonBuilder()
      .setCustomId(ComponentCID.INIT_END)
      .setLabel("End Initiative")
      .setStyle(ButtonStyle.Danger)
  );

module.exports.confirmNewTracker = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId(ComponentCID.INIT_CONFIRM)
    .setLabel("Confirm")
    .setStyle(ButtonStyle.Primary)
);
