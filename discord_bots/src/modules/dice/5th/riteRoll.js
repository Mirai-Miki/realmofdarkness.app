"use strict";
require(`${process.cwd()}/alias`);
const { getEmbed, getContent, getComponents } = require("./getWtaRollResponse");
const { trimString } = require("@modules/misc");
const getCharacter = require("@src/modules/getCharacter");
const Wta5thRollResults = require("@structures/Wta5thRollResults");
const handleButtonPress = require("@modules/dice/5th/handleButtonPress");
const API = require("@api");
const { Splats } = require("@constants");

/**
 *
 * @param {Interaction} interaction
 */
module.exports = async function riteRoll(interaction) {
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
    trainedParticipants: interaction.options.getInteger("trained_participants"),
    participants: interaction.options.getInteger("participants"),
    difficulty: interaction.options.getInteger("difficulty"),
    spec: interaction.options.getString("speciality"),
    rageCheck: interaction.options.getString("rage_check"),
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

/**
 * Takes a set of arguments and performs a roll
 * @param {Object} args Arguments recieved from the interaction
 */
async function roll(interaction) {
  const args = interaction.arguments;
  if (
    args.character?.tracked &&
    args.character.tracked.splat.slug === "werewolf5th"
  ) {
    args.rage = args.character.tracked.rage.current;
  }

  const pool =
    (args.pool ?? 0) +
    (args.participants ?? 0) +
    (args.trainedParticipants ?? 0) * 2;
  const results = new Wta5thRollResults({
    difficulty: args.difficulty ?? 1,
    pool: pool,
    spec: args.spec,
  });

  const rage =
    (args.rage ?? 0) +
    (args.participants ?? 0) +
    (args.trainedParticipants ?? 0);
  results.rollDice(rage);
  results.setOutcome();

  if (args.rageCheck != null) results.setRageCheck(args.rageCheck);
  return results;
}
