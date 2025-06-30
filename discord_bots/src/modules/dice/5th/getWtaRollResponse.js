"use strict";
require(`${process.cwd()}/alias`);
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { Emoji } = require("@constants");
const WtaRoll = require("@structures/Wta5thRollResults");

module.exports.getEmbed = function (interaction) {
  const args = interaction.arguments;
  const results = interaction.rollResults;
  const embed = new EmbedBuilder();

  // Create Title
  let title = "";
  if (interaction.options.getSubcommand() === "rite") title += "Rite | ";
  title += `Pool ${results.totalPool}`;
  if (args.rage)
    title += ` | Rage ${
      args.rage + (args.participants ?? 0) + (args.trainedParticipants ?? 0)
    }`;
  if (args.difficulty) title += ` | Difficulty ${args.difficulty}`;
  if (args.spec) title += " | Spec";
  embed.setTitle(title);
  embed.setURL("https://realmofdarkness.app/");
  embed.setColor(results.outcome.color);

  embed.setAuthor({
    name:
      interaction.member?.displayName ??
      interaction.user.displayName ??
      interaction.user.username,
    iconURL:
      interaction.member?.displayAvatarURL() ??
      interaction.user.displayAvatarURL(),
  });

  if (results.reroll) {
    embed.addFields({
      name: `Rerolled ${results.reroll.length} Dice`,
      value: `${results.reroll.join(", ")}`,
    });
  }

  if (args.character) {
    embed.addFields({
      name: "Character",
      value: args.character.name,
    });

    if (args.character.tracked?.thumbnail)
      embed.setThumbnail(args.character.tracked.thumbnail);
    else if (args.character.isSheet && args.character.thumbnail)
      embed.setThumbnail(args.character.thumbnail);
  }

  // Add Dice fields
  if (results.blackDice.length) {
    embed.addFields({
      name: "Dice",
      value: `${results.blackDice.join(" ")}`,
      inline: true,
    });
  }

  if (results.rageDice.length) {
    embed.addFields({
      name: "Rage check",
      value: `${results.rageDice.join(" ")}`,
      inline: true,
    });
  }

  if (interaction.options.getSubcommand() === "rite") {
    embed.addFields({
      name: "Participants",
      value:
        `Trained: ${args.trainedParticipants ?? 0}` +
        ` | Untrained: ${args.participants ?? 0}`,
      inline: false,
    });
  }

  // Add Spec and Notes Fields
  if (args.spec) embed.addFields({ name: "Specialty", value: args.spec });
  if (args.notes) embed.addFields({ name: "Notes", value: args.notes });

  // Add result Fields
  let resultMessage = "";
  if (!args.difficulty) resultMessage = `Rolled: ${results.total} Sux`;
  else resultMessage = `${results.total} sux vs diff ${args.difficulty}`;

  if (args.difficulty && results.margin >= 0)
    resultMessage += `\nMargin of ${results.margin}`;
  else if (args.difficulty && results.margin < 0)
    resultMessage += `\nMissing ${results.margin * -1}`;

  resultMessage += `\n${results.outcome.toString}`;
  embed.addFields({ name: "Result", value: resultMessage });

  if (results.rageCheck) {
    embed.addFields({
      name: `Rage Check [ ${results.rageCheck.dice.join(", ")} ]`,
      value: results.rageCheck.toString,
    });
  }

  if (results.doubleRageCheck) {
    embed.addFields({
      name: `Double Rage Check [ ${results.doubleRageCheck.roll1.join(
        ", "
      )} ] [ ${results.doubleRageCheck.roll2.join(", ")} ]`,
      value: results.doubleRageCheck.toString,
    });
  }

  // Adding links to bottom of embed
  const links =
    "\n[Website](https://realmofdarkness.app/)" +
    " | [Commands](https://v5.realmofdarkness.app/)" +
    " | [Patreon](https://www.patreon.com/MiraiMiki)";
  embed.data.fields.at(-1).value += links;

  return embed;
};

module.exports.getContent = function (interaction) {
  let content = "";
  // Result Loop
  for (const dice of interaction.rollResults.blackDice) {
    // Adding each dice emoji to the start of the message
    if (dice <= 5) content += Emoji.w5_fail;
    else if (dice <= 9) content += Emoji.w5_success;
    else content += Emoji.w5_crit;
    content += " ";
  }

  for (const dice of interaction.rollResults.rageDice) {
    if (dice <= 2) content += Emoji.brutal_result;
    else if (dice <= 5) content += Emoji.rage_fail;
    else if (dice <= 9) content += Emoji.rage_success;
    else content += Emoji.rage_crit;
    content += " ";
  }
  return content.length > 2000 ? null : content;
};

module.exports.getComponents = function (interaction) {
  const rr = interaction.rollResults;
  const buttonRow = new ActionRowBuilder();
  const components = [];

  if (interaction.selectMenuActive && !rr.reroll) {
    setSelectRerollMenu(interaction, components);
  }
  if (!interaction.selectMenuActive && !rr.reroll && rr.canReroll) {
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId("autoReroll")
        .setLabel("Reroll Failures")
        .setStyle(ButtonStyle.Primary)
    );
  }
  if (!interaction.selectMenuActive && !rr.reroll && rr.canRageReroll) {
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId("autoRerollRage")
        .setLabel("Reroll Failures - w/ Rage")
        .setStyle(ButtonStyle.Primary)
    );
  }
  if (!interaction.selectMenuActive && !rr.reroll && rr.canSelectReroll) {
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId("selectReroll")
        .setLabel("Select Reroll")
        .setStyle(ButtonStyle.Secondary)
    );
  }
  if (!rr.brutalGain && rr.resultType === WtaRoll.ResultType.brutal) {
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId("brutalGain")
        .setLabel("Brutal Gain +4")
        .setStyle(ButtonStyle.Danger)
    );
  }

  if (buttonRow.components.length) components.push(buttonRow);
  return components;
};

function setSelectRerollMenu(interaction, components) {
  let sortedRolls = interaction.rollResults.blackDice.map((x) => x);
  sortedRolls.sort((a, b) => a - b);

  let sortedRageRolls = interaction.rollResults.rageDice.map((x) => x);
  sortedRageRolls.sort((a, b) => a - b);

  const options = [];
  let count = {};

  for (const dice of sortedRolls) {
    let description;
    if (dice < 6) description = "Fail";
    else if (dice < 10) description = "Success";
    else description = "Critical";
    let value;

    // Set Value to correctly handle multiple dice of the same vale
    if (count[dice]) {
      count[dice] += 1;
      value = `${dice} (${count[dice]})`;
    } else {
      value = `${dice}`;
      count[dice] = 1;
    }

    options.push({
      label: `${dice}`,
      description: description,
      value: `${value}`,
    });
    if (options.length >= 25) break;
  }

  count = {};
  for (const dice of sortedRageRolls) {
    if (options.length >= 25) break;
    let description;
    if (dice > 2 && dice < 6) description = "Rage - Fail";
    else if (dice > 5 && dice < 10) description = "Rage - Success";
    else if (dice === 10) description = "Rage - Critical";
    else if (dice === 2) continue;
    let value;

    // Set Value to correctly handle multiple dice of the same vale
    if (count[dice]) {
      count[dice] += 1;
      value = `${dice} (${count[dice]})`;
    } else {
      value = `${dice}`;
      count[dice] = 1;
    }

    options.push({
      label: `${dice}`,
      description: description,
      value: `r${value}`,
    });
  }

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("selectReroll")
      .setPlaceholder("Select Dice to Reroll")
      .setMinValues(1)
      .setMaxValues(options.length < 6 ? options.length : 6)
      .addOptions(options)
  );

  if (options.length) components.push(row);
}
