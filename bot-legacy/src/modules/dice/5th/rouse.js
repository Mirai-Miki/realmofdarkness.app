"use strict";
require(`${process.cwd()}/alias`);
const getCharacter = require("@src/modules/getCharacter");
const Roll = require("@src/modules/dice/roll");
const { EmbedBuilder, MessageFlags } = require("discord.js");
const API = require("@api");
const { Splats } = require("@constants");

/**
 *
 * @param {Interaction} interaction
 * @returns {DiscordResponse} Response to send to the discord API
 */
module.exports = async function rouse(interaction) {
  interaction.args = await getArgs(interaction);
  interaction.rollResults = roll(interaction.args.reroll);
  await updateHunger(interaction);
  return { embeds: [getEmbed(interaction)] };
};

async function getArgs(interaction) {
  const args = {
    character: await getCharacter(
      interaction.options.getString("character"),
      interaction,
      false
    ),
    reroll: interaction.options.getBoolean("reroll"),
    notes: interaction.options.getString("notes"),
  };

  if (interaction.guild && !args.character) {
    const defaults = await API.characterDefaults.get(
      interaction.client,
      interaction.guild.id,
      interaction.user.id,
      [Splats.vampire5th.slug]
    );

    if (defaults && !args.character)
      args.character = {
        name: defaults.character.name,
        tracked: defaults.character,
      };
  }

  return args;
}

function roll(reroll) {
  const rollResults = {
    dice: [Roll.single(10)],
    toString: "```ansi\n[2;31mHunger Increased[0m[2;31m[0m\n```",
    passed: false,
    color: "#8c0f28",
  };
  if (reroll) rollResults.dice.push(Roll.single(10));

  for (const dice of rollResults.dice) {
    if (dice >= 6) {
      rollResults.passed = true;
      rollResults.toString = "```Hunger Unchanged```";
      rollResults.color = "#1c1616";
    }
  }
  return rollResults;
}

function getEmbed(interaction) {
  const results = interaction.rollResults;
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

  embed.setTitle("Rouse Check");
  embed.setColor(results.color);
  embed.setURL("https://realmofdarkness.app/");

  if (!results.passed)
    embed.setThumbnail(
      "https://cdn.discordapp.com/attachments/7140" +
        "50986947117076/886855116035084288/RealmOfDarknessSkullnoBNG.png"
    );

  if (interaction.args.character) {
    const char = interaction.args.character;
    embed.addFields({ name: "Character", value: char.name });
    if (char.tracked?.thumbnail) embed.setThumbnail(char.tracked.thumbnail);
  }

  embed.addFields({ name: "Rouse Dice", value: `${results.dice.join(" ")}` });
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

async function updateHunger(interaction) {
  if (interaction.rollResults.passed) return;

  const character = interaction.args.character?.tracked;
  if (character && character.splat.slug === "vampire5th") {
    const change = { command: "Rouse Check", hunger: 1 };
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
