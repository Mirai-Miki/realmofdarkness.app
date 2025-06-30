"use strict";
require(`${process.cwd()}/alias`);
const { MessageFlags } = require("discord.js");
const { trimString } = require("@modules/misc");
const getCharacter = require("@src/modules/getCharacter");
const {
  getEmbed,
  getContent,
  getComponents,
} = require("@modules/dice/5th/getVtmRollResponse");
const VtMV5RollResults = require("@structures/VtmV5RollResults");
const handleRerollPress = require("@modules/dice/5th/handleButtonPress");
const API = require("@api");
const { Splats } = require("@src/constants");
const { RealmError, ErrorCodes } = require("@src/errors");

/**
 *
 * @param {Interaction} interaction
 */
module.exports.v5Roll = async function (interaction) {
  interaction.arguments = await getV5RollArgs(interaction);
  interaction.rollResults = await roll(interaction);

  await handleRerollPress(interaction, getEmbed, getComponents, getContent);
  return {
    content: getContent(interaction),
    embeds: [getEmbed(interaction)],
    components: getComponents(interaction),
  };
};

async function getV5RollArgs(interaction) {
  const args = {
    pool: interaction.options.getInteger("pool"),
    hunger: interaction.options.getInteger("hunger"),
    difficulty: interaction.options.getInteger("difficulty"),
    bp: interaction.options.getInteger("blood_surge"),
    spec: interaction.options.getString("speciality"),
    rouse: interaction.options.getString("rouse"),
    notes: interaction.options.getString("notes"),
    character: await getCharacter(
      interaction.options.getString("character"),
      interaction,
      false
    ),
    autoHunger: interaction.options.getBoolean("auto_hunger") ?? true,
  };

  if (interaction.guild && (!args.character || args.autoHunger === null)) {
    const defaults = await API.characterDefaults.get(
      interaction.client,
      interaction.guild.id,
      interaction.user.id,
      [Splats.vampire5th.slug, Splats.human5th.slug, Splats.ghoul5th.slug]
    );

    if (defaults && !args.character)
      args.character = {
        name: defaults.character.name,
        tracked: defaults.character,
      };

    if (!args.character?.tracked?.hunger) args.autoHunger = false;
    else if (defaults && args.autoHunger === null)
      args.autoHunger = defaults.autoHunger;
  }

  return args;
}

/**
 *
 * @param {Interaction} interaction
 */
module.exports.v5SheetRoll = async function (interaction) {
  interaction.arguments = await getSheetRollArgs(interaction);
  interaction.rollResults = await roll(interaction);

  await handleRerollPress(interaction, getEmbed, getComponents, getContent);
  return {
    content: getContent(interaction),
    embeds: [getEmbed(interaction)],
    components: getComponents(interaction),
  };
};

async function getSheetRollArgs(interaction) {
  const args = {
    sheet: true,
    attribute: interaction.options.getString("attribute"),
    attribute2: interaction.options.getString("attribute2"),
    skillPhysical: interaction.options.getString("skill_physical"),
    skillSocial: interaction.options.getString("skill_social"),
    skillMental: interaction.options.getString("skill_mental"),
    discipline: interaction.options.getString("discipline"),
    modifier: interaction.options.getInteger("modifier"),
    hunger: interaction.options.getBoolean("hunger"),
    difficulty: interaction.options.getInteger("difficulty"),
    bp: interaction.options.getBoolean("blood_surge"),
    spec: interaction.options.getString("speciality"),
    rouse: interaction.options.getString("rouse"),
    notes: interaction.options.getString("notes"),
  };

  let character = null;
  const char = await getCharacter(
    interaction.options.getString("name"),
    interaction
  );

  if (char?.tracked) character = char.tracked;

  if (!character && interaction.guild && !args.name) {
    const defaults = await API.characterDefaults.get(
      interaction.client,
      interaction.guild.id,
      interaction.user.id,
      [Splats.vampire5th.slug, Splats.human5th.slug, Splats.ghoul5th.slug]
    );

    if (defaults) character = defaults.character;
  }

  // TODO - Need to fix defaults and getCharacter to return sheets only
  if (!character) {
    throw new RealmError({ code: ErrorCodes.NoSheet });
  } else if (!character?.isSheet) {
    throw new RealmError({ code: ErrorCodes.NotSheet });
  }

  args.character = character;
  let attribute = 0;
  let attribute2 = 0;
  let skillPhysical = 0;
  let skillSocial = 0;
  let skillMental = 0;
  let discipline = 0;
  let mod = args.modifier ?? 0;
  let poolNotes = [];

  if (args.attribute) {
    attribute = character.attributes[args.attribute];
    poolNotes.push(args.attribute);
  }
  if (args.attribute2) {
    attribute2 = character.attributes[args.attribute2];
    poolNotes.push(args.attribute2);
  }
  if (args.skillPhysical) {
    skillPhysical = character.skills[args.skillPhysical].value;
    poolNotes.push(args.skillPhysical);
  }
  if (args.skillSocial) {
    skillSocial = character.skills[args.skillSocial].value;
    poolNotes.push(args.skillSocial);
  }
  if (args.skillMental) {
    skillMental = character.skills[args.skillMental].value;
    poolNotes.push(args.skillMental);
  }
  if (args.discipline) {
    discipline = character.disciplines[args.discipline]?.value;
    if (!discipline) discipline = 0;
    poolNotes.push(args.discipline);
  }
  if (args.spec) poolNotes.push("Spec");
  if (args.bp) {
    args.bp = character.bloodPotency;
    poolNotes.push("Blood Surge");
  }
  if (mod) poolNotes.push("Mod");

  if (poolNotes.length) args.poolNotes = poolNotes.join(" + ");

  args.pool =
    attribute +
    attribute2 +
    skillPhysical +
    skillSocial +
    skillMental +
    discipline +
    mod;
  if (args.pool === 0 && !args.spec && !args.bloodSurge) args.pool = 1;

  if (args.hunger === false) args.hunger = undefined;
  else args.hunger = character.hunger.current;

  return args;
}

/**
 * Takes a set of arguments and performs a roll
 * @param {Object} args Arguments recieved from the interaction
 */
async function roll(interaction) {
  const args = interaction.arguments;

  const results = new VtMV5RollResults({
    difficulty: args.difficulty ?? 1,
    pool: args.pool,
    bp: args.bp,
    spec: args.spec,
    hunger: args.hunger ?? 0,
  });

  let hunger = args.hunger;

  if (
    args.hunger === null &&
    args.character?.tracked &&
    args.autoHunger &&
    args.character.tracked.splat.slug === "vampire5th"
  ) {
    hunger = args.character.tracked.hunger.current;
    args.hunger = hunger;
  }
  results.rollDice(hunger);
  results.setOutcome();

  if (args.bp != null) results.setBloodSurge(args.bp);
  if (args.rouse != null) results.setRouse(args.rouse);
  await updateHunger(interaction, results);
  return results;
}

async function updateHunger(interaction, results) {
  let hunger = 0;
  if (results.bloodSurge && !results.bloodSurge.passed) hunger++;
  if (results.rouse && !results.rouse.passed) hunger++;

  let character;
  if (interaction.arguments.character?.tracked)
    character = interaction.arguments.character.tracked;
  else if (interaction.arguments.sheet)
    character = interaction.arguments.character;

  if (character && hunger && character.splat.slug === "vampire5th") {
    const change = { command: "Dice Roll", hunger: hunger };
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
