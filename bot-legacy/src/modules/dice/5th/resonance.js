/**
 * @fileoverview Resonance rolling module for Vampire: The Masquerade 5th Edition
 * Handles rolling and calculation of blood resonance and temperament for feeding
 *
 * @author Realm of Darkness Bot
 * @version 1.0.0
 */

"use strict";
require(`${process.cwd()}/alias`);
const Roll = require("@modules/dice/roll");
const {
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} = require("discord.js");

/**
 * Main resonance function that processes a Discord interaction for resonance rolling
 * @param {ChatInputCommandInteraction} interaction - Discord interaction object
 * @returns {Promise<import("discord.js").InteractionReplyOptions>} Object containing embeds array for Discord response
 */
module.exports = async function resonance(interaction) {
  interaction.args = getArgs(interaction);
  interaction.rollResults = getResults(interaction);
  return { embeds: [await getEmbed(interaction)] };
};

/**
 * Extracts and returns command arguments from Discord interaction
 * @param {Object} interaction - Discord interaction object
 * @param {Object} interaction.options - Command options from Discord
 * @returns {{temperament: string|null, resonance: string|null, minTemp: string|null, exclude_empty: boolean, notes: string|null}} Parsed arguments object
 */
function getArgs(interaction) {
  return {
    temperament: interaction.options.getString("temperament"),
    resonance: interaction.options.getString("resonance"),
    minTemp: interaction.options.getString("min_temperament"),
    exclude_empty: interaction.options.getBoolean("exclude_empty") || false,
    notes: interaction.options.getString("notes"),
  };
}

/**
 * Calculates and returns the results of temperament and resonance rolls
 * @param {ChatInputCommandInteraction} interaction - Discord interaction object with args property
 * @returns {{temperamentDice: number[]|null, temperament: Object, resonanceDice: number[]|null, resonance: Object}} Roll results
 */
function getResults(interaction) {
  const args = interaction.args;
  const tdice = rollTemperament(args);
  const rdice = rollResonance(args);
  return {
    temperamentDice: tdice,
    temperament: getTemperament(args, tdice),
    resonanceDice: rdice,
    resonance: getResonance(args, rdice),
  };
}

/**
 * Rolls dice for temperament based on minimum temperament requirements
 * @param {Object} args - Command arguments
 * @param {string|null} args.temperament - Pre-specified temperament (if any)
 * @param {string|null} args.minTemp - Minimum temperament requirement ("Fleeting" or "Intense")
 * @returns {number[]|null} Array of dice rolls, null if temperament is pre-specified
 */
function rollTemperament(args) {
  if (args.temperament) return null;

  const dice = [];
  if (args.minTemp === "Fleeting") {
    const tempRoll = Roll.single(10);
    dice.push(tempRoll < 6 ? 6 : tempRoll);
  } else if (args.minTemp === "Intense") dice.push(10);
  else dice.push(Roll.single(10));

  if (dice[0] >= 9) dice.push(Roll.single(10));
  return dice;
}

/**
 * Rolls dice for Resonance based random resonance tables
 * @param {Object} args - Command arguments
 * @param {string|null} args.resonance - Pre-specified resonance (if any)
 * @param {boolean} args.exclude_empty - Whether to exclude empty resonance from roll table
 * @returns {number[]|null} Array of dice rolls (1-10), null if resonance is pre-specified
 */
function rollResonance(args) {
  if (args.resonance) return null;
  if (args.exclude_empty) return [Roll.single(10)];

  const dice = [];
  const roll = Roll.single(10);
  dice.push(roll);

  if (roll >= 9) dice.push(Roll.single(10));
  return dice;
}

/**
 * Determines temperament type based on arguments or dice rolls
 * @param {Object} args - Command arguments
 * @param {string|null} args.temperament - Pre-specified temperament
 * @param {number[]|null} dice - Temperament dice rolls
 * @returns {Object} Temperament object with name and value properties
 */
function getTemperament(args, dice) {
  if (args.temperament) return TemperamentType[args.temperament];

  if (dice.length > 1 && dice[1] >= 9) return TemperamentType.Acute;
  else if (dice.length > 1) return TemperamentType.Intense;

  if (dice[0] < 6) return TemperamentType.Negligible;
  else return TemperamentType.Fleeting;
}

/**
 * Determines resonance type based on arguments or dice roll
 * @param {Object} args - Command arguments
 * @param {string|null} args.resonance - Pre-specified resonance
 * @param {boolean} args.exclude_empty - Whether to exclude empty resonance from roll table
 * @param {number[]|null} dice - Resonance dice roll (1-10)
 * @returns {Object} Resonance object with name, description, powers, and color properties
 */
function getResonance(args, dice) {
  if (args?.resonance) {
    return ResonanceInfo[args.resonance];
  } else if (dice == null) {
    throw new Error(
      "We have no dice roll or arguments provided for resonance determination."
    );
  }

  if (args.exclude_empty) {
    // If empty resonance is not allowed
    const roll = dice[0];
    if (roll <= 3) return ResonanceInfo.Phlegmatic;
    else if (roll <= 6) return ResonanceInfo.Melancholy;
    else if (roll <= 8) return ResonanceInfo.Choleric;
    else return ResonanceInfo.Sanguine;
  }

  const roll = dice.length === 2 ? dice[1] : dice[0];
  if (roll <= 2) return ResonanceInfo.Phlegmatic;
  else if (roll <= 4) return ResonanceInfo.Melancholy;
  else if (roll <= 6) return ResonanceInfo.Choleric;
  else if (roll <= 8) return ResonanceInfo.Sanguine;
  else return ResonanceInfo.Empty;
}

/**
 * Creates and returns a Discord embed with resonance roll results
 * @param {ChatInputCommandInteraction} interaction - Discord interaction object
 * @returns {Promise<EmbedBuilder>} Formatted Discord embed with roll results
 */
async function getEmbed(interaction) {
  let apiMember = interaction.member;
  let member = null;
  if (!(apiMember instanceof GuildMember) && interaction.guild) {
    member = await interaction.guild.members.fetch(interaction.user.id);
  }

  const results = interaction.rollResults;
  const args = interaction.args;
  const embed = new EmbedBuilder();

  embed.setAuthor({
    name:
      member?.displayName ??
      interaction.user.displayName ??
      interaction.user.username,
    iconURL: member?.displayAvatarURL() ?? interaction.user.displayAvatarURL(),
  });

  embed.setTitle("Resonance Roll");
  embed.setColor(
    results.resonance.color[results.temperament.name] ?? "#000000"
  );
  embed.setURL("https://realmofdarkness.app/");

  if (args.minTemp)
    embed.addFields({
      name: "Minimum Temperament",
      value: `${args.minTemp}`,
    });

  embed.addFields({
    name: "Result",
    value:
      `\`\`\`${results.temperament.name}` +
      `${
        results.temperament.name === "Negligible"
          ? ""
          : " " + results.resonance.name
      }\`\`\``,
    inline: true,
  });

  embed.addFields({
    name: "Temperament",
    value: `\`\`\`${
      results.temperamentDice
        ? results.temperamentDice
        : results.temperament.name
    }\`\`\``,
    inline: true,
  });

  embed.addFields({
    name: "Resonance",
    value: `\`\`\`${
      results.resonanceDice ? results.resonanceDice : results.resonance.name
    }\`\`\``,
    inline: true,
  });

  if (results.temperament.value > 0) {
    embed.addFields({
      name: "Disciplines",
      value:
        results.temperament.value > 1
          ? results.resonance.powers + "\nAdd +1 dice"
          : results.resonance.powers,
      inline: true,
    });

    embed.addFields({
      name: "Emotions",
      value: results.resonance.description,
      inline: true,
    });
  }

  const links =
    "[Website](https://realmofdarkness.app/)" +
    " | [Commands](https://v5.realmofdarkness.app/)" +
    " | [Patreon](https://www.patreon.com/MiraiMiki)";

  if (args.notes) {
    embed.addFields({ name: "Notes", value: args.notes + `\n\n${links}` });
  } else embed.addFields({ name: "⠀", value: links });

  return embed;
}

/**
 * Temperament types with their associated names and power values
 * @typedef {Object} TemperamentType
 * @property {Object} Negligible - No temperament effect
 * @property {Object} Fleeting - Minor temperament effect
 * @property {Object} Intense - Moderate temperament effect
 * @property {Object} Acute - Strong temperament effect
 */
const TemperamentType = {
  Negligible: { name: "Negligible", value: 0 },
  Fleeting: { name: "Fleeting", value: 1 },
  Intense: { name: "Intense", value: 2 },
  Acute: { name: "Acute", value: 3 },
};

/**
 * Resonance information containing details for each resonance type
 * @typedef {Object} ResonanceInfo
 * @property {Object} Sanguine - Passionate, enthusiastic resonance
 * @property {Object} Choleric - Angry, violent resonance
 * @property {Object} Melancholy - Sad, intellectual resonance
 * @property {Object} Phlegmatic - Calm, controlling resonance
 * @property {Object} Animal - Animal blood resonance
 * @property {Object} Empty - Emotionally detached resonance
 */
const ResonanceInfo = {
  Sanguine: {
    name: "Sanguine",
    description: "Horny, Happy, Addicted,\nActive, Flighty, Enthusiastic",
    powers: "Blood Sorcery, Presence",
    color: {
      Fleeting: "#96008f",
      Intense: "#c800c0",
      Acute: "#ff00f2",
    },
  },
  Choleric: {
    name: "Choleric",
    description: "Angry, Violent, Bullying,\nPassionate, Envious",
    powers: "Celerity, Potence",
    color: {
      Fleeting: "#960000",
      Intense: "#c80000",
      Acute: "#ff0000",
    },
  },
  Melancholy: {
    name: "Melancholy",
    description: "Sad, Scared, Intellectual,\nDepressed, Grounded",
    powers: "Fortitude, Obfuscate",
    color: {
      Fleeting: "#008596",
      Intense: "#00b1c8",
      Acute: "#00e1ff",
    },
  },
  Phlegmatic: {
    name: "Phlegmatic",
    description: "Lazy, Apathetic, Calm,\nControlling, Sentimental",
    powers: "Auspex, Dominate",
    color: {
      Fleeting: "#009600",
      Intense: "#00c800",
      Acute: "#00ff00",
    },
  },
  Animal: {
    name: "Animal",
    description: "Animal Blood, Werewolf Blood,\nChangeling Blood",
    powers: "Animalism, Protean",
    color: {
      Fleeting: "#575000",
      Intense: "#968a00",
      Acute: "#ffea00",
    },
  },
  Empty: {
    name: "Empty",
    description: "Sociopaths, Psychopaths,\nEmotionally Detached",
    powers: "Oblivion",
    color: {
      Fleeting: "#6e6e6e",
      Intense: "#b5b5b5",
      Acute: "#ffffff",
    },
  },
};
