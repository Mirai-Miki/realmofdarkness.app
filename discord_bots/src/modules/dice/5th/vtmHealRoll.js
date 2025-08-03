"use strict";
require(`${process.cwd()}/alias`);
const getCharacter = require("@src/modules/getCharacter");
const Roll = require("@src/modules/dice/roll");
const { EmbedBuilder, MessageFlags } = require("discord.js");
const API = require("@api");
const { RealmError, ErrorCodes } = require("@errors");
const { Splats } = require("@constants");
const { skip } = require("node:test");

module.exports = {
  healSuperficial,
};

/**
 * Heals superficial damage for a character
 * @param {Interaction} interaction - The interaction object from Discord
 * @returns {Promise<Object>} - The response to send to Discord
 */
async function healSuperficial(interaction) {
  // Get character from interaction
  const args = await getArgs(interaction);
  const character = args.character?.tracked;
  const changes = { command: "heal superficial" };
  let skip = false;

  // Check that character exists
  if (!character) {
    throw new RealmError({ code: ErrorCodes.NoCharacterSelected });
  }

  const type = interaction.options.getString("type");

  // Handle health healing
  if (type === "health") {
    // Can only heal health with a vampire character
    if (character.splat.slug !== "vampire5th") {
      throw new RealmError({ code: ErrorCodes.IncorrectCharType });
    }

    // Perform rouse check
    const rouseResult = performRouseCheck();
    const hungerIncreased = !rouseResult.passed;

    // Update hunger if rouse check failed
    if (hungerIncreased) {
      changes.hunger = 1;
    }

    // Calculate healing amount based on blood potency
    const bp = character.bloodPotency || 0;
    const healAmount = getHealthHealAmount(bp);

    // Apply healing
    changes.healthSup = -healAmount;

    // Save character changes
    if (character.hunger.current < 5) {
      character.updateFields(changes);
      await character.save(interaction.client);
    } else {
      skip = true;
    }

    // Create embed with all information
    const embed = createHealingEmbed(interaction, character, {
      rouseDice: rouseResult.dice,
      rouseSucceeded: rouseResult.passed,
      healAmount: healAmount,
      damageType: "Health",
      skip: skip,
      notes: args.notes,
    });

    // Add character followup if hunger changed
    if (changes.healthSup && !skip) {
      interaction.followUps = [
        {
          embeds: [character.getEmbed()],
          flags: MessageFlags.Ephemeral,
        },
      ];
    }

    return { embeds: [embed] };
  }
  // Handle willpower healing
  else if (type === "willpower") {
    // Check if character is a sheet
    if (!character.isSheet || !character.attributes) {
      throw new RealmError({ code: ErrorCodes.NotSheet });
    }

    const resolve = character.attributes.resolve || 0;
    const composure = character.attributes.composure || 0;
    const healAmount = Math.max(resolve, composure);

    // Apply healing
    character.updateFields({
      command: "heal superficial",
      willpowerSup: -healAmount,
    });

    // Create embed
    const embed = createHealingEmbed(interaction, character, {
      healAmount: healAmount,
      damageType: "Willpower",
      usedAttribute: resolve >= composure ? "Resolve" : "Composure",
      attributeValue: Math.max(resolve, composure),
      notes: args.notes,
    });

    // Save character changes
    await character.save(interaction.client);

    // Add character followup
    interaction.followUps = [
      {
        embeds: [character.getEmbed()],
        flags: MessageFlags.Ephemeral,
      },
    ];

    return { embeds: [embed] };
  }
}

/**
 * Retrieves the arguments for the interaction
 * @param {Interaction} interaction - The interaction object from Discord
 * @returns {Promise<Object>} - The arguments for the interaction
 */
async function getArgs(interaction) {
  const args = {
    character: await getCharacter(
      interaction.options.getString("name"),
      interaction,
      Splats.vampire5th.slug
    ),
    type: interaction.options.getString("type"),
    notes: interaction.options.getString("notes"),
  };

  // Get character defaults if no character specified
  if (!args.character?.tracked && interaction.guild) {
    const defaults = await API.characterDefaults.get(
      interaction.client,
      interaction.guild.id,
      interaction.user.id,
      [Splats.vampire5th.slug]
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
 * Performs a single rouse check
 * @returns {Object} - The result of the rouse check
 */
function performRouseCheck() {
  const dice = Roll.single(10);
  return {
    dice,
    passed: dice >= 6,
  };
}

/**
 * Determines the amount of health to heal based on blood potency
 * @param {number} bp - The blood potency of the character
 * @returns {number} - The amount of health to heal
 */
function getHealthHealAmount(bp) {
  if (bp <= 1) return 1;
  if (bp <= 3) return 2;
  if (bp <= 7) return 3;
  if (bp <= 9) return 4;
  return 5;
}

/**
 * Creates an embed for the healing result
 */
function createHealingEmbed(interaction, character, options) {
  const embed = new EmbedBuilder()
    .setTitle(`Heal Superficial ${options.damageType}`)
    .setURL("https://realmofdarkness.app/")
    .setAuthor({
      name: interaction.member?.displayName ?? interaction.user.username,
      iconURL:
        interaction.member?.displayAvatarURL() ??
        interaction.user.displayAvatarURL(),
    });

  if (skip) {
    embed.setColor("#161717");
  } else if (options.type === "willpower") {
    embed.setColor("#2db5c4");
  } else if (options.rouseSucceeded === false) {
    embed.setColor("#ba111f");
  } else {
    embed.setColor("#11ba6b");
  }

  // Set thumbnail
  if (character.thumbnail) {
    embed.setThumbnail(character.thumbnail);
  }

  // Character info
  embed.addFields({
    name: "Character",
    value: character.name,
  });

  // Dice roll info for health healing
  if (options.skip) {
    embed.addFields({
      name: "Rouse Check",
      value: "```Cannot Rouse the blood at hunger 5```",
    });
  } else if (options.rouseDice) {
    const rousePassText = options.rouseSucceeded
      ? `\`\`\`ansi\n[2;31m[0m[2;31m[2;32m[2;34m[2;36mPassed[0m[2;34m[0m[2;32m[0m[2;31m[0m\n\`\`\``
      : `\`\`\`ansi\n[2;31m[0m[2;31m🔺Hunger Increased[0m\n\`\`\``;

    embed.addFields({
      name: `Rouse Check [${options.rouseDice}]`,
      value: rousePassText,
    });
  }

  // Healing result
  const healingText = `\`\`\`ansi\n[2;31m[0m[2;31m[2;32m[2;34m[2;36mHealed ${
    options.healAmount
  } superficial ${options.damageType.toLowerCase()} damage[0m[2;34m[0m[2;32m[0m[2;31m[0m\n\`\`\``;

  // Summary of all outcomes
  let summaryText = healingText;

  if (!options.skip) {
    embed.addFields({
      name: "Summary",
      value: summaryText,
    });
  }

  // Notes
  if (options.notes) {
    embed.addFields({
      name: "Notes",
      value: options.notes,
    });
  }

  // Add links footer
  const links =
    "[Website](https://realmofdarkness.app/)" +
    " | [Commands](https://v5.realmofdarkness.app/)" +
    " | [Patreon](https://www.patreon.com/MiraiMiki)";
  embed.addFields({ name: "⠀", value: links });

  return embed;
}
