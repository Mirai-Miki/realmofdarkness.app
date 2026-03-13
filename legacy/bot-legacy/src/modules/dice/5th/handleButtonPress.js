"use strict";
require(`${process.cwd()}/alias`);
const { MessageFlags } = require("discord.js");
const { ErrorCodes, handleErrorDebug, RealmError } = require("@errors");
const HunterV5RollResults = require("@structures/HunterV5RollResults");
const { minToMilli } = require("@modules/misc");

module.exports = async function handleButtonPress(
  interaction,
  getEmbed,
  getComponents,
  getContent
) {
  const filter = (i) =>
    i.message.interaction.id === interaction.id &&
    (i.customId === "autoReroll" ||
      i.customId === "selectReroll" ||
      i.customId === "autoRerollRage" ||
      i.customId === "brutalGain" ||
      i.customId === "chooseOverreach" ||
      i.customId === "chooseDespair");

  let channel;

  try {
    if (interaction.channel) channel = interaction.channel;
    else
      channel = await interaction.client.channels.fetch(interaction.channelId);
  } catch (error) {
    throw new RealmError({ code: ErrorCodes.RerollNoChannel });
  }

  interaction.collector = channel.createMessageComponentCollector({
    filter,
    time: minToMilli(14),
  });

  // Start Collector and wait for a button press
  interaction.collector.on("collect", async (i) => {
    if (i.user.id !== interaction.user.id) {
      await i.deferReply({ flags: MessageFlags.Ephemeral });
      try {
        await i.editReply({
          content: `These buttons aren't for you!`,
          flags: MessageFlags.Ephemeral,
        });
      } catch (error) {
        const err = new RealmError({
          cause: error.stack,
          code: ErrorCodes.DiscordAPIError,
        });
        handleErrorDebug(err, interaction);
      }
      return;
    }

    await i.deferUpdate();
    if (i.customId === "autoReroll" || i.customId === "autoRerollRage") {
      let rage;
      if (i.customId === "autoRerollRage") rage = true;
      interaction.rollResults.rerollDice(undefined, rage);
      const components = getComponents(interaction);

      try {
        await i.editReply({
          embeds: [getEmbed(interaction)],
          components: components,
          content: getContent(interaction),
        });
        const update = await updateWillpower(interaction);
        if (update) i.followUp(update);
      } catch (error) {
        const err = new RealmError({
          cause: error.stack,
          code: ErrorCodes.DiscordAPIError,
        });
        handleErrorDebug(err, interaction);
        return;
      }
      if (!components?.length) interaction.collector.stop();
    } else if (i.customId == "selectReroll" && i.isButton()) {
      interaction.selectMenuActive = true;
      try {
        await i.editReply({ components: getComponents(interaction) });
      } catch (error) {
        const err = new RealmError({
          cause: error.stack,
          code: ErrorCodes.DiscordAPIError,
        });
        handleErrorDebug(err, interaction);
      }
    } else if (i.customId == "selectReroll" && i.isStringSelectMenu()) {
      interaction.rollResults.rerollDice(i.values);
      const components = getComponents(interaction);
      try {
        await i.editReply({
          embeds: [getEmbed(interaction)],
          components: components,
          content: getContent(interaction),
        });
        const update = await updateWillpower(interaction);
        if (update) i.followUp(update);
      } catch (error) {
        const err = new RealmError({
          cause: error.stack,
          code: ErrorCodes.DiscordAPIError,
        });
        handleErrorDebug(err, interaction);
        return;
      }
      if (!components?.length) interaction.collector.stop();
    } else if (i.customId == "brutalGain" && i.isButton()) {
      interaction.rollResults.setBrutalGain();
      const components = getComponents(interaction);
      try {
        await i.editReply({
          embeds: [getEmbed(interaction)],
          components: components,
          content: getContent(interaction),
        });
      } catch (error) {
        const err = new RealmError({
          cause: error.stack,
          code: ErrorCodes.DiscordAPIError,
        });
        handleErrorDebug(err, interaction);
        return;
      }
      if (!components?.length) interaction.collector.stop();
    } else if (
      i.customId == "chooseOverreach" ||
      i.customId == "chooseDespair"
    ) {
      let choice;
      if (i.customId === "chooseOverreach" && interaction.rollResults.crit)
        choice = HunterV5RollResults.ResultType.overreachCrit;
      else if (i.customId === "chooseOverreach")
        choice = HunterV5RollResults.ResultType.overreach;
      else choice = HunterV5RollResults.ResultType.despair;

      interaction.rollResults.setOutcome(choice);
      try {
        const message = {
          embeds: [getEmbed(interaction)],
          components: [],
        };
        if (choice !== HunterV5RollResults.ResultType.despair)
          message.components = getComponents(interaction);
        await i.editReply(message);
      } catch (error) {
        const err = new RealmError({
          cause: error.stack,
          code: ErrorCodes.DiscordAPIError,
        });
        handleErrorDebug(err, interaction);
        return;
      }
      if (choice === HunterV5RollResults.ResultType.despair)
        interaction.collector.stop();
    }
  });

  interaction.collector.on("end", async (i, reason) => {
    try {
      if (reason === "time") {
        await interaction.editReply({ components: [] });
      } else reason === "guildDelete";
      {
        return;
      }
    } catch (error) {
      if (error.code === 10008);
      else {
        //Do nothing (Unknown Message);
        const err = new RealmError({
          cause: error.stack,
          code: ErrorCodes.DiscordAPIError,
        });
        handleErrorDebug(err, interaction);
      }
    }
  });
};

async function updateWillpower(interaction) {
  let character;
  if (interaction.arguments.character?.tracked)
    character = interaction.arguments.character.tracked;
  else if (interaction.arguments.sheet)
    character = interaction.arguments.character;

  if (!character || character.version !== "5th") return;

  const change = { command: "Dice Roll", willpowerSup: 1 };
  character.updateFields(change);
  await character.save(interaction.client);
  return { embeds: [character.getEmbed()], flags: MessageFlags.Ephemeral };
}
