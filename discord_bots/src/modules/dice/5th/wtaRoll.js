"use strict";
require(`${process.cwd()}/alias`);
const { MessageFlags } = require("discord.js");
const { trimString } = require("@modules/misc");
const getCharacter = require("@src/modules/getCharacter");
const {
  getEmbed,
  getContent,
  getComponents,
} = require("@modules/dice/5th/getWtaRollResponse");
const Wta5thRollResults = require("@structures/Wta5thRollResults");
const handleButtonPress = require("@modules/dice/5th/handleButtonPress");
const API = require("@api");
const { Splats } = require("@constants");

/**
 *
 * @param {Interaction} interaction
 */
module.exports = async function wtaRoll(interaction) {
  interaction.arguments = await getArgs(interaction);
  interaction.rollResults = await roll(interaction);

  await handleButtonPress(interaction, getEmbed, getComponents, getContent);
  return {
    content: getContent(interaction),
    embeds: [getEmbed(interaction)],
    components: getComponents(interaction),
  };
};

async function getArgs(interaction) {
  const args = {
    pool: interaction.options.getInteger("pool"),
    rage: interaction.options.getInteger("rage"),
    autoRage: interaction.options.getBoolean("use_char_rage") ?? true,
    difficulty: interaction.options.getInteger("difficulty"),
    spec: interaction.options.getString("speciality"),
    rageCheck: interaction.options.getString("rage_check"),
    doubleRageCheck: interaction.options.getString("double_rage_check"),
    notes: interaction.options.getString("notes"),
    character: await getCharacter(
      interaction.options.getString("character"),
      interaction,
      false
    ),
  };

  // Get character defaults if no character specified
  if (!args.character?.tracked && interaction.guild) {
    const defaults = await API.characterDefaults.get(
      interaction.client,
      interaction.guild.id,
      interaction.user.id,
      [Splats.werewolf5th.slug, Splats.human5th.slug]
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

/**
 * Takes a set of arguments and performs a roll
 * @param {Object} args Arguments recieved from the interaction
 */
async function roll(interaction) {
  const args = interaction.arguments;
  if (
    args.character?.tracked &&
    args.autoRage &&
    args.character.tracked.splat.slug === "werewolf5th"
  ) {
    args.rage = args.character.tracked.rage.current;
  }

  const results = new Wta5thRollResults({
    difficulty: args.difficulty ?? 1,
    pool: args.pool,
    spec: args.spec,
  });

  results.rollDice(args.rage);
  results.setOutcome();

  if (args.rageCheck != null) results.setRageCheck(args.rageCheck);
  else if (args.doubleRageCheck != null)
    results.setDoubleRageCheck(args.doubleRageCheck);

  await updateRage(interaction, results);
  return results;
}

async function updateRage(interaction, results) {
  let rage = 0;
  if (results.rageCheck?.passed === false) rage++;
  else if (results.doubleRageCheck?.decreased > 0)
    rage += results.doubleRageCheck.decreased;

  let character;
  if (interaction.arguments.character?.tracked)
    character = interaction.arguments.character.tracked;
  else if (interaction.arguments.sheet)
    character = interaction.arguments.character;

  if (character && rage && character.splat.slug === "werewolf5th") {
    const change = { command: "Dice Roll", rage: -rage };
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
