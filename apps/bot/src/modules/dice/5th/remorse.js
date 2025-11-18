"use strict";
require(`${process.cwd()}/alias`);
const Roll = require("@src/modules/dice/roll");
const { EmbedBuilder, MessageFlags } = require("discord.js");
const { getContent } = require("@modules/dice/5th/getVtmRollResponse");
const { Splats } = require("@constants");
const { RealmError, ErrorCodes } = require("@errors");
const getCharacter = require("@src/modules/getCharacter");
const API = require("@api");

module.exports = async function remorse(interaction) {
  interaction.args = await getArgs(interaction);
  interaction.rollResults = roll(interaction);
  await updateCharacter(interaction);
  return {
    content: getContent(interaction),
    embeds: [getEmbed(interaction)],
  };
};

async function getArgs(interaction) {
  const args = {
    notes: interaction.options.getString("notes"),
    character: await getCharacter(
      interaction.options.getString("name"),
      interaction
    ),
  };

  // Get character defaults if no character specified
  if (!args.character?.tracked && interaction.guild) {
    const defaults = await API.characterDefaults.get(
      interaction.client,
      interaction.guild.id,
      interaction.user.id,
      [Splats.vampire5th.slug, Splats.human5th.slug, Splats.ghoul5th.slug]
    );

    if (defaults) {
      args.character = {
        name: defaults.character.name,
        tracked: defaults.character,
      };
    }
  }

  if (!args.character?.tracked) {
    throw new RealmError({ code: ErrorCodes.NoCharacterSelected });
  }

  return args;
}

function roll(interation) {
  const args = interation.args;
  const humanity = args.character.tracked.humanity.total;
  const stains = args.character.tracked.humanity.stains;
  let pool = 10 - humanity - stains;
  if (pool <= 0) pool = 1;

  const blackDice = Roll.d10(pool);
  let total = 0;

  for (const dice of blackDice) {
    if (dice >= 6) total++;
  }

  let passed = false;
  if (total >= 1) passed = true;

  return {
    pool,
    humanity,
    stains,
    blackDice,
    total,
    passed,
  };
}

async function updateCharacter(interaction) {
  const results = interaction.rollResults;
  const character = interaction.args.character.tracked;
  const change = { command: "Remorse Roll" };

  if (results.passed) change.stains = -character.humanity.stains;
  else change.humanity = -1;

  character.updateFields(change);
  await character.save(interaction.client);
  interaction.followUps = [
    {
      embeds: [character.getEmbed()],
      flags: MessageFlags.Ephemeral,
    },
  ];
}

function getEmbed(interaction) {
  const results = interaction.rollResults;
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

  embed.setTitle("Remorse Roll");
  embed.setColor(results.passed ? "#66ffcc" : "#a80c26");
  embed.setURL("https://realmofdarkness.app/");

  embed.addFields({
    name: "Character",
    value: args.character.name,
  });

  if (args.character.tracked.thumbnail)
    embed.setThumbnail(args.character.tracked.thumbnail);

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
  let resultMessage = "";
  if (results.passed) {
    resultMessage +=
      "```ansi\n[2;31m[2;34m[2;36mYou feel remorse[0m[2;34m[0m[2;31m[0m\n```";
  } else {
    resultMessage += "```ansi\n[2;31mHumanity Loss[0m\n```";
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
