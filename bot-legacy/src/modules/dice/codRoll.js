"use strict";
require(`${process.cwd()}/alias`);
const { EmbedBuilder } = require("discord.js");
const CodRollResults = require("@structures/CodRollResults");
const { Emoji } = require("@constants");

module.exports = async function CoDRoll(interaction) {
  interaction.arguments = getArgs(interaction);
  interaction.rollResults = new CodRollResults(interaction);
  return { content: getContent(interaction), embeds: [getEmbed(interaction)] };
};

function getArgs(interaction) {
  return {
    pool: interaction.options.getInteger("pool"),
    bonus: interaction.options.getInteger("bonus"),
    penalty: interaction.options.getInteger("penalty"),
    spec: interaction.options.getString("speciality"),
    willpower: interaction.options.getBoolean("willpower"),
    rote: interaction.options.getBoolean("rote"),
    target: interaction.options.getInteger("target"),
    reroll: interaction.options.getInteger("reroll"),
    character: interaction.options.getString("character"),
    notes: interaction.options.getString("notes"),
  };
}

function getContent(interaction) {
  const results = interaction.rollResults;
  let content = toDiceString(results.dice, interaction, true);
  if (results.roteDice.length) {
    content += Emoji.misc_red_dot.toString();
    content += toDiceString(results.roteDice, interaction);
  }
  if (results.rerollDice.length) {
    content += Emoji.misc_black_dot.toString();
    content += toDiceString(results.rerollDice, interaction);
  }
  if (content.length >= 2000) content = null;
  return content;
}

function toDiceString(diceResults, interaction, chanceDice = false) {
  const args = interaction.arguments;
  const chance = interaction.rollResults.chance;
  const emotes = {
    1: {
      fail: Emoji.dice_20_0_fail_1.toString(),
      sux: Emoji.dice_20_0_pass_1.toString(),
    },
    2: {
      fail: Emoji.dice_20_0_fail_2.toString(),
      sux: Emoji.dice_20_0_pass_2.toString(),
    },
    3: {
      fail: Emoji.dice_20_0_fail_3.toString(),
      sux: Emoji.dice_20_0_pass_3.toString(),
    },
    4: {
      fail: Emoji.dice_20_0_fail_4.toString(),
      sux: Emoji.dice_20_0_pass_4.toString(),
    },
    5: {
      fail: Emoji.dice_20_0_fail_5.toString(),
      sux: Emoji.dice_20_0_pass_5.toString(),
    },
    6: {
      fail: Emoji.dice_20_0_fail_6.toString(),
      sux: Emoji.dice_20_0_pass_6.toString(),
    },
    7: {
      fail: Emoji.dice_20_0_fail_7.toString(),
      sux: Emoji.dice_20_0_pass_7.toString(),
    },
    8: {
      fail: Emoji.dice_20_0_fail_8.toString(),
      sux: Emoji.dice_20_0_pass_8.toString(),
    },
    9: {
      fail: Emoji.dice_20_0_fail_9.toString(),
      sux: Emoji.dice_20_0_pass_9.toString(),
    },
    10: {
      fail: Emoji.dice_20_0_fail_10.toString(),
      sux: Emoji.dice_20_0_pass_10.toString(),
    },
  };

  let mess = "";
  for (const dice of diceResults) {
    if (chance) {
      if (dice == 10) mess += Emoji.dice_v5_0_p_crit.toString();
      else if (dice == 1 && chanceDice)
        mess += Emoji.dice_20_0_botch.toString();
      else mess += emotes[dice].fail;
    } else {
      if (dice >= (args.reroll ?? 10))
        mess += Emoji.dice_v5_0_p_crit.toString();
      else if (dice >= (args.target ?? 8)) mess += emotes[dice].sux;
      else mess += emotes[dice].fail;
    }
    mess += " ";
  }
  return mess;
}

function getEmbed(interaction) {
  const args = interaction.arguments;
  const results = interaction.rollResults;
  // Create the embed
  let embed = new EmbedBuilder();

  embed.setAuthor({
    name:
      interaction.member?.displayName ??
      interaction.user.displayName ??
      interaction.user.username,
    iconURL:
      interaction.member?.displayAvatarURL() ??
      interaction.user.displayAvatarURL(),
  });

  let title = `Pool ${args.pool}`;
  if (args.bonus) title += ` | Bonus ${args.bonus}`;
  if (args.penalty) title += ` | Penalty ${args.penalty}`;
  if (args.willpower) title += ` | WP`;
  if (args.spec) title += ` | Spec`;
  if (args.rote) title += ` | Rote`;
  if (args.reroll) title += ` | Reroll ${args.reroll}`;
  if (args.target) title += ` | Target ${args.target}`;
  embed.setTitle(title);

  if (args.character)
    embed.addFields({ name: "Character", value: args.character });

  const dice = sortDiceResults(results.dice, args, results.chance);
  const rote = sortDiceResults(results.roteDice, args);
  const reroll = sortDiceResults(results.rerollDice, args);

  if (dice.length)
    embed.addFields({
      name: `${results.chance ? "Chance Dice" : "Dice"}`,
      value: dice.join(", "),
      inline: true,
    });
  if (rote.length)
    embed.addFields({
      name: "Rote Dice",
      value: rote.join(", "),
      inline: true,
    });
  if (reroll.length)
    embed.addFields({
      name: "Reroll Dice",
      value: reroll.join(", "),
      inline: true,
    });

  if (args.spec) embed.addFields({ name: "Specialty", value: `${args.spec}` });
  if (args.notes) embed.addFields({ name: "Notes", value: args.notes });

  embed.setColor(results.outcome.color);
  let resultMess = "";
  if (results.total) resultMess += `Rolled: ${results.total} Sux`;
  resultMess += `\n${results.outcome.toString}`;
  embed.addFields({ name: "Result", value: resultMess });

  const links =
    "\n[Website](https://realmofdarkness.app/)" +
    " | [Commands](https://realmofdarkness.app/cod/commands/)" +
    " | [Patreon](https://www.patreon.com/MiraiMiki)";
  embed.data.fields.at(-1).value += links;

  embed.setURL("https://realmofdarkness.app/");
  return embed;
}

function sortDiceResults(diceResults, args, chance = false) {
  const sortedResults = diceResults.map((x) => x);
  sortedResults.sort((a, b) => b - a);

  const results = [];
  for (const dice of sortedResults) {
    if (dice >= (args.reroll ?? 10) && dice >= (args.target ?? 8))
      results.push(`**${dice}**`);
    else if (dice >= (args.target ?? 8)) results.push(`${dice}`);
    else if (dice >= (args.reroll ?? 10) && dice < (args.target ?? 8))
      results.push(`**~~${dice}~~**`);
    else if (chance && dice == 1) results.push(`**~~1~~**`);
    else results.push(`~~${dice}~~`);
  }
  return results;
}
