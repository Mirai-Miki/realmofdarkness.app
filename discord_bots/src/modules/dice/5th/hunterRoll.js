"use strict";
require(`${process.cwd()}/alias`);
const { trimString } = require("@modules/misc");
const HunterV5RollResults = require("@structures/HunterV5RollResults");
const handleRerollPress = require("@modules/dice/5th/handleButtonPress");
const {
  getComponents,
  getEmbed,
  getContent,
} = require("@modules/dice/5th/getHunterRollResponse");
const getCharacter = require("@src/modules/getCharacter");
const API = require("@api");
const { Splats } = require("@constants");

module.exports = async function HunterDice(interaction) {
  interaction.arguments = await getArgs(interaction);
  interaction.rollResults = await roll(interaction.arguments);

  await handleRerollPress(interaction, getEmbed, getComponents, getContent);
  return {
    content: getContent(interaction),
    embeds: [getEmbed(interaction)],
    components: getComponents(interaction),
  };
};

async function getArgs(interaction) {
  // Get base arguments from command options
  const args = {
    pool: interaction.options.getInteger("pool"),
    desperation: interaction.options.getInteger("desperation") ?? null,
    useCharDesperation:
      interaction.options.getBoolean("use_char_desperation") ?? false,
    difficulty: interaction.options.getInteger("difficulty") ?? 0,
    spec: interaction.options.getString("speciality") ?? null,
    notes: interaction.options.getString("notes") ?? null,
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
      [Splats.hunter5th.slug, Splats.human5th.slug]
    );

    if (defaults) {
      args.character = {
        name: defaults.character.name,
        tracked: defaults.character,
      };
    }
  }

  // Use character's desperation if useCharDesperation is true
  if (
    args.desperation === null &&
    args.character?.tracked &&
    args.useCharDesperation &&
    args.character.tracked.desperation?.current !== undefined
  ) {
    args.desperation = args.character.tracked.desperation.current;
  }

  return args;
}

async function roll(args) {
  const results = new HunterV5RollResults({
    difficulty: args.difficulty,
    pool: args.pool,
    desperation: args.desperation,
    spec: args.spec,
  });

  results.rollDice();
  return results;
}
