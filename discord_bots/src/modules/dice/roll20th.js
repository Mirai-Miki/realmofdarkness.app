"use strict";
require(`${process.cwd()}/alias`);
const { EmbedBuilder, MessageFlags } = require("discord.js");
const { trimString } = require("@modules/misc");
const { RealmError, ErrorCodes } = require("@errors");
const RollResults20th = require("@structures/RollResults20th");
const { Emoji } = require("@constants");
const getCharacter = require("@modules/getCharacter");
const API = require("@api");

module.exports = async function roll20th(interaction) {
  interaction.arguments = await getArgs(interaction);
  applyDicePenalty(interaction);
  interaction.results = new RollResults20th(interaction.arguments);
  await updateWillpower(interaction);
  return { content: getContent(interaction), embeds: [getEmbed(interaction)] };
};

async function getArgs(interaction) {
  const args = {
    pool: interaction.options.getInteger("pool"),
    difficulty: interaction.options.getInteger("difficulty"),
    willpower: interaction.options.getBoolean("willpower"),
    mod: interaction.options.getInteger("modifier"),
    spec: interaction.options.getString("speciality"),
    notes: interaction.options.getString("notes"),
    nightmare: interaction.options.getInteger("nightmare"),
    character: await getCharacter(
      trimString(interaction.options.getString("character")),
      interaction,
      false
    ),
    cancelOnes: interaction.options.getBoolean("no_botch"),
  };

  if ((args.nightmare ?? 0) > args.pool)
    throw new RealmError({ code: ErrorCodes.NightmareOutOfRange });

  if (!args.character && interaction.guild) {
    const defaults = await API.characterDefaults.get(
      interaction.client,
      interaction.guild.id,
      interaction.user.id
    );
    if (defaults)
      args.character = {
        name: defaults.character.name,
        tracked: defaults.character,
      };
  }

  return args;
}

function applyDicePenalty(interaction) {
  if (interaction.arguments.character?.tracked?.health) {
    const dicePenalty = extractDicePenalty(interaction.arguments);
    interaction.arguments.pool -= dicePenalty;

    // Ensure the pool doesn't go below 1
    if (interaction.arguments.pool < 1) {
      interaction.arguments.pool = 1;
    }
  }
}

function extractDicePenalty(interaction) {
  const healthStatus = interaction.character?.tracked.health.damageInfo;
  const match = healthStatus.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function getContent(interaction) {
  const DiceSuxEmotes = {
    1: Emoji.dice_20_0_pass_1.toString(),
    2: Emoji.dice_20_0_pass_2.toString(),
    3: Emoji.dice_20_0_pass_3.toString(),
    4: Emoji.dice_20_0_pass_4.toString(),
    5: Emoji.dice_20_0_pass_5.toString(),
    6: Emoji.dice_20_0_pass_6.toString(),
    7: Emoji.dice_20_0_pass_7.toString(),
    8: Emoji.dice_20_0_pass_8.toString(),
    9: Emoji.dice_20_0_pass_9.toString(),
    10: Emoji.dice_20_0_pass_10.toString(),
  };

  const DiceFailEmotes = {
    1: Emoji.dice_20_0_fail_1.toString(),
    2: Emoji.dice_20_0_fail_2.toString(),
    3: Emoji.dice_20_0_fail_3.toString(),
    4: Emoji.dice_20_0_fail_4.toString(),
    5: Emoji.dice_20_0_fail_5.toString(),
    6: Emoji.dice_20_0_fail_6.toString(),
    7: Emoji.dice_20_0_fail_7.toString(),
    8: Emoji.dice_20_0_fail_8.toString(),
    9: Emoji.dice_20_0_fail_9.toString(),
    10: Emoji.dice_20_0_fail_10.toString(),
  };

  const results = interaction.results;
  const args = interaction.arguments;
  const diff = args.difficulty ?? 1;
  let content = "";

  for (const dice of results.blackDice) {
    if (dice === 10 && args.spec) content += Emoji.dice_v5_0_p_crit.toString();
    else if (dice === 10) content += Emoji.dice_20_0_pass_10.toString();
    else if (dice >= diff) content += DiceSuxEmotes[dice];
    else if (dice < diff && (dice != 1 || args.cancelOnes))
      content += DiceFailEmotes[dice];
    else content += Emoji.dice_20_0_botch.toString();
    content += " ";
  }

  if (content.length && args.nightmare)
    content += Emoji.misc_butterfly.toString();
  for (const dice of results.nightmareDice) {
    if (dice === 10) content += Emoji.dice_20_0_nightmare.toString();
    else if (dice >= diff) content += DiceSuxEmotes[dice];
    else if (dice < diff && (dice != 1 || args.cancelOnes))
      content += DiceFailEmotes[dice];
    else content += Emoji.dice_20_0_botch.toString();
    content += " ";
  }
  return content;
}

async function updateWillpower(interaction) {
  const character = interaction.arguments.character?.tracked;
  if (!character || !interaction.arguments.willpower) return;
  if (character.version !== "20th") return;
  if (character.willpower.current === 0)
    throw new RealmError({ code: ErrorCodes.NoWillpower });

  const change = { command: "Dice Roll", willpower: -1 };
  character.updateFields(change);
  await character.save(interaction.client);
  interaction.followUps = [
    { embeds: [character.getEmbed()], flags: MessageFlags.Ephemeral },
  ];
}

function getEmbed(interaction) {
  const args = interaction.arguments;
  const results = interaction.results;
  const damageInfo = args.character?.tracked?.health.damageInfo ?? null;
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

  let title = `Pool ${args.pool} | Diff ${args.difficulty}`;
  if (args.nightmare) title += ` | Nightmare ${args.nightmare}`;
  if (args.willpower) title += ` | WP`;
  if (args.mod) title += ` | Mod ${args.mod}`;
  if (args.spec) title += ` | Spec`;
  if (args.cancelOnes) title += ` | No Botch`;
  embed.setTitle(title);

  if (args.character) {
    embed.addFields({
      name: "Character",
      value: args.character.name,
    });

    if (damageInfo) {
      embed.addFields({
        name: "Dice penalty",
        value: damageInfo.split("\n")[0], // Only include the first line
      });
    }

    if (args.character.tracked?.thumbnail)
      embed.setThumbnail(args.character.tracked.thumbnail);
  }

  if (results.blackDice.length)
    embed.addFields({
      name: "Dice",
      value: results.getSortedString(results.blackDice, args),
      inline: true,
    });

  if (results.nightmareDice.length)
    embed.addFields({
      name: "Nightmare",
      value: results.getSortedString(results.nightmareDice, args),
      inline: true,
    });

  if (args.spec)
    embed.addFields({
      name: "Specialty",
      value: args.spec,
      inline: true,
    });

  if (args.mod)
    embed.addFields({
      name: "Modifier",
      value: args.mod.toString(),
      inline: true,
    });

  if (args.notes)
    embed.addFields({
      name: "Notes",
      value: args.notes,
      inline: false,
    });

  embed.addFields({
    name: "Result",
    value: `Rolled: ${results.total} Sux\n${results.outcome.toString}`,
    inline: false,
  });

  embed.setColor(results.outcome.color);

  const links =
    "\n[Website](https://realmofdarkness.app/) " +
    "| [Commands](https://realmofdarkness.app/20th/commands/) " +
    "| [Patreon](https://www.patreon.com/MiraiMiki)";
  embed.data.fields.at(-1).value += links;

  embed.setURL("https://realmofdarkness.app/");
  return embed;
}
