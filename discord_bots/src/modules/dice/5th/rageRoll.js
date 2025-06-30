"use strict";
require(`${process.cwd()}/alias`);
const { trimString } = require("@modules/misc");
const getCharacter = require("@src/modules/getCharacter");
const Roll = require("@src/modules/dice/roll");
const { EmbedBuilder, MessageFlags } = require("discord.js");
const API = require("@api");
const { Splats } = require("@constants");

const passedString = "```ansi\n[2;33mPassed [{dice}][0m\n```";
const failedString = "```ansi\n[2;33m[2;31mFailed [{dice}][0m[2;33m[0m\n```";

/**
 *
 * @param {Interaction} interaction
 * @returns {DiscordResponse} Response to send to the discord API
 */
module.exports = async function rageRoll(interaction) {
  interaction.args = await getArgs(interaction);
  interaction.results = {
    decreased: 0,
    rolls: [],
    toString:
      "```ansi\n[2;36m[2;34m[2;36mRage Decreased{amount}[0m[2;34m[0m[2;36m[0m\n```",
    color: "#1981bd",
  };

  for (let i = 0; i < interaction.args.checks; i++) {
    const roll = rollCheck(interaction.args.reroll);
    interaction.results.rolls.push(roll);
    if (!roll.passed) {
      interaction.results.decreased++;
    }
  }

  if (interaction.results.decreased === 0) {
    interaction.results.toString = "```Rage Unchanged```";
    interaction.results.color = "#1c1616";
  } else {
    interaction.results.toString = interaction.results.toString.replace(
      "{amount}",
      ` by ${interaction.results.decreased}`
    );
  }

  await updateRage(interaction);

  return { embeds: [getEmbed(interaction)] };
};

async function getArgs(interaction) {
  const args = {
    character: await getCharacter(
      interaction.options.getString("character"),
      interaction,
      false
    ),
    checks: interaction.options.getInteger("checks") ?? 1,
    reroll: interaction.options.getBoolean("reroll"),
    notes: interaction.options.getString("notes"),
  };

  // Get character defaults if no character specified
  if (!args.character?.tracked && interaction.guild) {
    const defaults = await API.characterDefaults.get(
      interaction.client,
      interaction.guild.id,
      interaction.user.id,
      [Splats.werewolf5th.slug]
    );

    if (defaults) {
      args.character = {
        name: defaults.character.name,
        tracked: defaults.character,
      };
    }
  }
  return args;
}

function rollCheck(reroll) {
  const rollResults = {
    dice: [Roll.single(10)],
    passed: false,
  };
  if (reroll) rollResults.dice.push(Roll.single(10));

  for (const dice of rollResults.dice) {
    if (dice >= 6) {
      rollResults.passed = true;
    }
  }
  return rollResults;
}

function getEmbed(interaction) {
  const results = interaction.results;
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

  embed.setTitle("Rage Check");
  embed.setColor(results.color);
  embed.setURL("https://realmofdarkness.app/");

  if (interaction.args.character) {
    const char = interaction.args.character;
    embed.addFields({ name: "Character", value: char.name });
    if (char.tracked?.thumbnail) embed.setThumbnail(char.tracked.thumbnail);
  }

  for (let i = 0; i < results.rolls.length; i++) {
    const result = results.rolls[i];
    let toString;
    if (result.passed) {
      toString = passedString.replace("{dice}", result.dice.join(" "));
    } else {
      toString = failedString.replace("{dice}", result.dice.join(" "));
    }

    embed.addFields({
      name: `Rage Roll ${i + 1}`,
      value: toString,
    });
  }

  if (results.decreased > 0)
    embed.setThumbnail(
      "https://cdn.discordapp.com/attachments/886983353922891816/1259072373802532864/keep-calm-glossy-quote-c77c66.webp"
    );

  if (interaction.args.notes)
    embed.addFields({ name: "Notes", value: interaction.args.notes });
  embed.addFields({ name: "Result", value: results.toString });

  const links =
    "\n[Website](https://realmofdarkness.app/)" +
    " | [Commands](https://v5.realmofdarkness.app/)" +
    " | [Patreon](https://www.patreon.com/MiraiMiki)";

  embed.data.fields.at(-1).value += links;
  return embed;
}

async function updateRage(interaction) {
  if (interaction.results.decreased === 0) return;

  const character = interaction.args.character?.tracked;
  if (character && character.splat.slug === "werewolf5th") {
    const change = {
      command: "Rage Check",
      rage: -interaction.results.decreased,
    };
    character.updateFields(change);
    await character.save(interaction.client);
    interaction.followUps = [
      {
        embeds: [character.getEmbed()],
        flags: MessageFlags.Ephemeral,
      },
    ];
  }
}
