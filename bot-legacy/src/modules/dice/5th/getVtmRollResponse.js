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

module.exports.getEmbed = function (interaction) {
  const args = interaction.arguments;
  const results = interaction.rollResults;
  const embed = new EmbedBuilder();

  // Create Title
  let title = `Pool ${results.totalPool}`;
  if (args.hunger) title += ` | Hunger ${args.hunger}`;
  if (args.difficulty) title += ` | Difficulty ${args.difficulty}`;
  if (args.bp) title += " | Surged";
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

  if (args.poolNotes) {
    embed.addFields({
      name: "Pool",
      value: args.poolNotes,
    });
  }

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

  if (results.hungerDice.length) {
    embed.addFields({
      name: "Hunger",
      value: `${results.hungerDice.join(" ")}`,
      inline: true,
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

  // Adding Surge and Rouse fields
  if (results.bloodSurge) {
    embed.addFields({
      name: `Blood Surge Check [ ${results.bloodSurge.dice} ]`,
      value: results.bloodSurge.toString,
    });
  }

  if (results.rouse) {
    embed.addFields({
      name: `Rouse Check [ ${results.rouse.dice.join(", ")} ]`,
      value: results.rouse.toString,
    });
  }

  // Adding links to bottom of embed
  const links =
    "\n[Website](https://realmofdarkness.app/)" +
    " | [Commands](https://v5.realmofdarkness.app/)" +
    " | [Dice %](https://realmofdarkness.app/v5/dice/)" +
    " | [Patreon](https://www.patreon.com/MiraiMiki)";

  embed.addFields({ name: "⠀", value: links });

  return embed;
};

module.exports.getContent = function (interaction) {
  const diceFail = Emoji.dice_v5_0_p_fail.toString();
  const dicePass = Emoji.dice_v5_0_p_pass.toString();
  const diceCrit = Emoji.dice_v5_0_p_crit.toString();
  const diceHungerFail = Emoji.dice_v5_0_s_fail.toString();
  const diceHungerPass = Emoji.dice_v5_0_s_pass.toString();
  const diceHungerCrit = Emoji.dice_v5_0_s_crit.toString();
  const diceBestial = Emoji.dice_v5_0_s_bestial.toString();

  let content = "";
  // Result Loop
  for (const dice of interaction.rollResults.blackDice) {
    // Adding each dice emoji to the start of the message
    if (dice <= 5) content += diceFail;
    else if (dice <= 9) content += dicePass;
    else content += diceCrit;
    content += " ";
  }

  if (!interaction.rollResults.hungerDice)
    return content.length > 2000 ? null : content;

  for (const dice of interaction.rollResults.hungerDice) {
    if (dice == 1) content += diceBestial;
    else if (dice <= 5) content += diceHungerFail;
    else if (dice <= 9) content += diceHungerPass;
    else content += diceHungerCrit;
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
  if (!interaction.selectMenuActive && !rr.reroll && rr.blackDice.length) {
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId("selectReroll")
        .setLabel("Select Reroll")
        .setStyle(ButtonStyle.Secondary)
    );
  }

  if (buttonRow.components.length) components.push(buttonRow);
  return components;
};

function setSelectRerollMenu(interaction, components) {
  let sortedRolls = interaction.rollResults.blackDice.map((x) => x);
  sortedRolls.sort((a, b) => a - b);
  const options = [];
  const count = {};

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
      value: value,
    });
    if (options.length >= 25) break;
  }
  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("selectReroll")
      .setPlaceholder("Select Dice to Reroll")
      .setMinValues(1)
      .setMaxValues(options.length < 6 ? options.length : 6)
      .addOptions(options)
  );

  components.push(row);
}
