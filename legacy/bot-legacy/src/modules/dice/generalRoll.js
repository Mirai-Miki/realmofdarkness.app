"use strict";
require(`${process.cwd()}/alias`);
const Roll = require("@src/modules/dice/roll");
const { RealmError, ErrorCodes } = require("@src/errors/index");
const { EmbedBuilder } = require("discord.js");

module.exports = function generalRoll(interaction) {
  interaction.args = getArgs(interaction);
  interaction.sets = parseSets(interaction);
  roll(interaction);
  return { embeds: [getEmbed(interaction)] };
};

function getArgs(interaction) {
  return {
    set1: interaction.options.getString("dice_set_01"),
    set2: interaction.options.getString("dice_set_02"),
    set3: interaction.options.getString("dice_set_03"),
    set4: interaction.options.getString("dice_set_04"),
    set5: interaction.options.getString("dice_set_05"),
    modifier: interaction.options.getInteger("modifier"),
    difficulty: interaction.options.getInteger("difficulty"),
    notes: interaction.options.getString("notes"),
  };
}

function parseSets(interaction) {
  const args = interaction.args;
  const argSets = [args.set1, args.set2, args.set3, args.set4, args.set5];
  const sets = {};
  for (const set of argSets) {
    if (!set) continue;
    const valid = set.match(/^\s*\d+\s*d\s*\d+\s*$/i);
    if (!valid) {
      throw new RealmError({ code: ErrorCodes.InvalidGeneralRollSets });
    }

    let match = valid[0];
    const dice = parseInt(match.match(/\d+/)[0]);
    match = match.replace(/\d+/, "");
    const sides = parseInt(match.match(/\d+/)[0]);

    if (dice > 50 || sides > 500 || dice === 0 || sides === 0) {
      throw new RealmError({ code: ErrorCodes.InvalidGeneralRollDice });
    }

    if (sets[sides]) sets[sides].dice += dice;
    else sets[sides] = { sides: sides, dice: dice };
  }
  return sets;
}

function roll(interaction) {
  let total = 0;
  for (const key of Object.keys(interaction.sets)) {
    const set = interaction.sets[key];
    set["results"] = Roll.manySingle(set.dice, set.sides);
    total += set.results.total;
  }
  if (interaction.args.modifier) total += interaction.args.modifier;
  interaction.sets["total"] = total;
}

function getEmbed(interaction) {
  const args = interaction.args;
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

  embed.setTitle(`General Roll`);

  for (const key of Object.keys(interaction.sets)) {
    if (key == "total") continue;
    const set = interaction.sets[key];

    let mess = "```css\n ";
    for (const result of set.results[key]) {
      mess += `${result.toString()} `;
    }
    mess += "\n```";
    embed.addFields({
      name: `${set.dice}d${set.sides}`,
      value: mess,
      inline: true,
    });
  }

  if (args.modifier)
    embed.addFields({
      name: "Modifier",
      value: `\`\`\`css\n${args.modifier}\n\`\`\``,
      inline: true,
    });

  if (args.notes) embed.addFields({ name: "Notes", value: args.notes });

  if (args.difficulty) {
    if (interaction.sets.total < args.difficulty) {
      // Failed the roll
      const total = args.difficulty - interaction.sets.total;
      embed.addFields({
        name: "Result",
        value:
          `Total of ${interaction.sets.total} vs ` +
          `diff ${args.difficulty}\nMissing ${total}\n` +
          "```ansi\n[2;31mFailed[0m\n```",
      });
      embed.setColor("#cd0e0e");
    } else {
      // Passed the roll
      const total = interaction.sets.total - args.difficulty;
      embed.addFields({
        name: "Result",
        value:
          `Total of ${interaction.sets.total} vs ` +
          `diff ${args.difficulty}\nMargin of ${total}\n` +
          "```ansi\n[2;32mPassed[0m\n```",
      });
      embed.setColor("#66ff33");
    }
  } else {
    // No difficulty
    embed.addFields({
      name: "Result",
      value: `Total of ${interaction.sets.total}`,
    });
    embed.setColor("#000000");
  }

  const links =
    "\n[Website](https://realmofdarkness.app/)" +
    " | [Commands](https://v5.realmofdarkness.app/)" +
    " | [Patreon](https://www.patreon.com/MiraiMiki)";
  embed.data.fields.at(-1).value += links;
  embed.setURL("https://realmofdarkness.app/");

  return embed;
}
