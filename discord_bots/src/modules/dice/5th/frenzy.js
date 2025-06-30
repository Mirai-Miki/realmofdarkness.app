"use strict";
require(`${process.cwd()}/alias`);
const Roll = require("@src/modules/dice/roll");
const { EmbedBuilder } = require("discord.js");
const { trimString } = require("@modules/misc");
const getCharacter = require("@src/modules/getCharacter");
const API = require("@api");
const { getContent } = require("@modules/dice/5th/getVtmRollResponse");
const { Splats } = require("@constants");
const { RealmError, ErrorCodes } = require("@errors");

module.exports = async function frenzy(interaction) {
  interaction.args = await getArgs(interaction);
  interaction.rollResults = roll(interaction);
  return {
    content: getContent(interaction),
    embeds: [getEmbed(interaction)],
  };
};

async function getArgs(interaction) {
  const args = {
    difficulty: interaction.options.getInteger("difficulty"),
    modifier: interaction.options.getInteger("modifier"),
    character: await getCharacter(
      interaction.options.getString("name"),
      interaction
    ),
    notes: interaction.options.getString("notes"),
  };

  if (!args.character) {
    if (!interaction.guild)
      throw new RealmError({ code: ErrorCodes.NoCharacterSelected });

    const defaults = await API.characterDefaults.get(
      interaction.client,
      interaction.guild.id,
      interaction.user.id,
      Splats.vampire5th.slug
    );

    if (defaults)
      args.character = {
        name: defaults.character.name,
        tracked: defaults.character,
      };
    else throw new RealmError({ code: ErrorCodes.NoCharacterSelected });
  }

  if (args.character?.tracked?.splat.slug !== Splats.vampire5th.slug)
    throw new RealmError({ code: ErrorCodes.IncorrectCharType });

  return args;
}

function roll(interation) {
  const args = interation.args;
  const character = args.character.tracked;
  const humanity = character.humanity.getOneThird();
  const willpower = character.willpower.getUndamaged();
  let pool = humanity + willpower + args.modifier;
  if (pool <= 0) pool = 1;

  const blackDice = Roll.d10(pool);
  let total = 0;
  let crit = 0;

  for (const dice of blackDice) {
    if (dice === 10) {
      crit++;
      total++;
    } else if (dice >= 6) total++;
  }

  // Calculating how many critals were scored and adding them to the total
  crit = crit % 2 ? crit - 1 : crit;
  total += crit;

  let passed = false;
  if (total >= args.difficulty) passed = true;
  const margin = total - args.difficulty;

  return {
    pool,
    humanity,
    willpower,
    blackDice,
    total,
    passed,
    margin,
  };
}

function getEmbed(interaction) {
  const results = interaction.rollResults;
  const character = interaction.args.character.tracked;
  const args = interaction.args;
  const embed = new EmbedBuilder();

  embed.setAuthor({
    name:
      interaction.member?.displayName ??
      interaction.user.displayName ??
      interaction.user.username,
    iconURL:
      interaction.member?.displayAvatarURL() ??
      interaction.user.displayAvatarURL(),
  });

  embed.setTitle("Resist Frenzy");
  embed.setColor(results.passed ? "#66ffcc" : "#a80c26");
  embed.setURL("https://realmofdarkness.app/");

  embed.addFields({
    name: "Character",
    value: character.name,
  });

  if (character.thumbnail) embed.setThumbnail(character.thumbnail);

  // Add Dice fields
  if (results.blackDice.length) {
    embed.addFields({
      name: "Dice",
      value: `${results.blackDice.join(" ")}`,
      inline: true,
    });
  }

  if (args.notes) embed.addFields({ name: "Notes", value: args.notes });

  // Add result Fields
  let resultMessage = `${results.total} sux vs diff ${args.difficulty}`;

  if (results.margin >= 0) resultMessage += `\nMargin of ${results.margin}`;
  else if (results.margin < 0)
    resultMessage += `\nMissing ${results.margin * -1}`;

  if (results.passed) {
    resultMessage +=
      "```ansi\n[2;31m[2;34m[2;36mResisted[0m[2;34m[0m[2;31m[0m\n```";
  } else {
    resultMessage += "```ansi\n[2;31mFrenzy[0m\n```";
    embed.setThumbnail(
      "https://cdn.discordapp.com/attachments/7140" +
        "50986947117076/886855116035084288/RealmOfDarknessSkullnoBNG.png"
    );
  }
  embed.addFields({ name: "Result", value: resultMessage });

  const links =
    "[Website](https://realmofdarkness.app/)" +
    " | [Commands](https://v5.realmofdarkness.app/)" +
    " | [Patreon](https://www.patreon.com/MiraiMiki)";

  embed.addFields({ name: "⠀", value: links });

  return embed;
}
