"use strict";
require(`${process.cwd()}/alias`);
const getCharacter = require("@src/modules/getCharacter");
const Roll = require("@src/modules/dice/roll");
const { EmbedBuilder, MessageFlags } = require("discord.js");
const API = require("@api");
const { RealmError, ErrorCodes } = require("@errors");
const { Splats } = require("@constants");
const { start } = require("repl");

/**
 * Handles a vampire waking for the night with options for healing and Blush of Life
 */
module.exports = async function v5Wake(interaction) {
  // Get arguments from the interaction
  const args = await getArgs(interaction);

  // Get character
  const character = args.character?.tracked;

  // Check that character exists and is a vampire
  if (!character) {
    throw new RealmError({ code: ErrorCodes.NoCharacterSelected });
  }

  if (character.splat.slug !== "vampire5th") {
    throw new RealmError({ code: ErrorCodes.IncorrectCharType });
  }

  // Initialize results tracking
  const results = {
    wakeRouse: null,
    healAggRouses: [],
    blushRouse: null,
    failedRouses: 0,
    startingHunger: character.hunger.current,
    currentHunger: character.hunger.current,
    hungerGained: 0,
    inTorpor: false,
    healedAgg: false,
    healedWillpower: false,
    willpowerHealed: 0,
    blushActive: false,
    humanity: character.humanity.total || 0,
  };

  // Track operations performed
  const operations = [];
  if (args.healAgg) operations.push("Heal Agg");
  if (args.healWillpower) operations.push("Heal WP");
  if (args.blushOfLife) operations.push("Blush of Life");
  results.operations = operations;

  // Step 1: Wake Roll
  results.wakeRouse = performRouseCheck();

  // Track failed rouse checks
  if (!results.wakeRouse.passed) {
    results.failedRouses++;
    results.currentHunger++;
    // Check for torpor (simulate hunger increase)
    if (results.currentHunger > 5) {
      results.inTorpor = true;
    }
  }

  // Step 2: Heal Aggravated (if requested and not already in torpor)
  if (args.healAgg && !results.inTorpor && results.currentHunger < 5) {
    // Perform 3 additional rouse checks for healing
    for (let i = 0; i < 3; i++) {
      const rouseResult = performRouseCheck();
      results.healAggRouses.push(rouseResult);

      // Track failed rouse checks
      if (!rouseResult.passed) {
        results.failedRouses++;
        results.currentHunger++;
        // Check for torpor (simulate hunger increase)
        if (results.currentHunger > 5) {
          results.inTorpor = true;
          break;
        }
      }

      // Record that agg was healed (even if entered torpor)
      results.healedAgg = true;
    }
  }

  // Step 3: Heal Willpower (if requested)
  if (args.healWillpower) {
    if (!character.isSheet || !character.attributes) {
      throw new RealmError({ code: ErrorCodes.NotSheet });
    }

    const resolve = character.attributes?.resolve || 0;
    const composure = character.attributes?.composure || 0;
    results.willpowerHealed = Math.max(resolve, composure);
    results.willpowerAttribute = resolve >= composure ? "Resolve" : "Composure";

    if (results.willpowerHealed > 0) {
      results.healedWillpower = true;
    }
  }

  // Step 4: Blush of Life (if requested, not in torpor)
  if (args.blushOfLife && !results.inTorpor && results.currentHunger < 5) {
    // Check if humanity 8+ (gets 2 dice)
    if (results.humanity >= 8) {
      // Roll 2 dice and take best result
      const dice1 = Roll.single(10);
      const dice2 = Roll.single(10);
      results.blushRouse = {
        dice: [dice1, dice2],
        passed: dice1 >= 6 || dice2 >= 6,
      };
    } else {
      // Regular rouse check
      results.blushRouse = performRouseCheck();
    }

    // Track failed rouse checks
    if (!results.blushRouse.passed) {
      results.failedRouses++;
      results.currentHunger++;
    }
    results.blushActive = true;
  }

  // Calculate actual hunger gained (capped at 5)
  results.hungerGained = Math.min(
    5 - results.startingHunger, // Can't go above 5
    results.failedRouses // Total failed checks
  );

  // Now apply all character changes at once

  character.updateFields({
    command: "Wake Roll",
    hunger: results.failedRouses ?? 0,
    healthAgg: results.healedAgg ? -1 : 0,
    willpowerSup: -results.willpowerHealed,
  });

  // Save character changes
  await character.save(interaction.client);

  // Create response embed
  const embed = createWakeEmbed(interaction, character, results, args);

  // Prepare response
  const response = {
    embeds: [embed],
  };

  interaction.followUps = [
    {
      embeds: [character.getEmbed()],
      flags: MessageFlags.Ephemeral,
    },
  ];

  return response;
};

/**
 * Retrieves argument values from the interaction
 */
async function getArgs(interaction) {
  const args = {
    character: await getCharacter(
      interaction.options.getString("character"),
      interaction,
      Splats.vampire5th.slug
    ),
    healAgg: interaction.options.getBoolean("heal_agg") || false,
    healWillpower: interaction.options.getBoolean("heal_willpower") || false,
    blushOfLife: interaction.options.getBoolean("blush_of_life") || false,
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
 */
function performRouseCheck() {
  const dice = Roll.single(10);
  return {
    dice,
    passed: dice >= 6,
  };
}

/**
 * Creates the wake embed with all results
 */
function createWakeEmbed(interaction, character, results, args) {
  const embed = new EmbedBuilder()
    .setTitle(`Wake for the Night (${results.operations.join(" | ")})`)
    .setURL("https://realmofdarkness.app/")
    .setAuthor({
      name: interaction.member?.displayName ?? interaction.user.username,
      iconURL:
        interaction.member?.displayAvatarURL() ??
        interaction.user.displayAvatarURL(),
    });

  if (results.inTorpor) {
    embed.setColor("#6b0070");
  } else if (results.hungerGained > 0) {
    embed.setColor("#c90a0a");
  } else {
    embed.setColor("#81d2db");
  }

  // Set thumbnail
  if (character.thumbnail) {
    embed.setThumbnail(
      results.inTorpor
        ? "https://cdn.discordapp.com/attachments/714050986947117076/886855116035084288/RealmOfDarknessSkullnoBNG.png"
        : character.thumbnail
    );
  }

  // Add character field
  embed.addFields({
    name: "Character",
    value: character.name,
  });

  // Add Wake Roll field
  const wakePassText = results.wakeRouse.passed
    ? `\`\`\`ansi\n[2;31m[0m[2;31m[2;32m[2;34m[2;36mPassed[0m[2;34m[0m[2;32m[0m[2;31m[0m\n\`\`\``
    : `\`\`\`ansi\n[2;31m[0m[2;31mFailed[0m\n\`\`\``;

  embed.addFields({
    name: `Wake Roll [${results.wakeRouse.dice}]`,
    value: wakePassText,
  });

  // Add Heal Aggravated field if requested
  if (args.healAgg) {
    // Check if healing was skipped due to being at hunger 5
    if (results.healAggRouses.length === 0) {
      embed.addFields({
        name: "Heal Aggravated",
        value: "```Skipped - Hunger at 5```",
      });
    } else {
      // Format all dice rolls as a list
      const diceValues = results.healAggRouses
        .map((roll) => roll.dice)
        .join(", ");

      // Count failures
      const failureCount = results.healAggRouses.filter(
        (roll) => !roll.passed
      ).length;

      let rouseChecksText;
      if (failureCount > 0) {
        rouseChecksText = `\`\`\`ansi\n[2;31m[0m[2;31m${failureCount} Failed[0m\n\`\`\``;
      } else {
        rouseChecksText = `\`\`\`ansi\n[2;31m[0m[2;31m[2;32m[2;34m[2;36mPassed[0m[2;34m[0m[2;32m[0m[2;31m[0m\n\`\`\``;
      }

      embed.addFields({
        name: `Heal Agg [${diceValues}]`,
        value: rouseChecksText,
      });
    }
  }

  // Add Blush of Life field if performed
  if (args.blushOfLife) {
    if (results.blushRouse) {
      let blushText = "";
      const diceValues = Array.isArray(results.blushRouse.dice)
        ? results.blushRouse.dice.join(", ")
        : results.blushRouse.dice;
      blushText = results.blushRouse.passed
        ? `\`\`\`ansi\n[2;31m[0m[2;31m[2;32m[2;34m[2;36mPassed[0m[2;34m[0m[2;32m[0m[2;31m[0m\n\`\`\``
        : `\`\`\`ansi\n[2;31m[0m[2;31mFailed[0m\n\`\`\``;

      embed.addFields({
        name: `Blush of Life [${diceValues}]`,
        value: blushText,
      });
    } else if (character.hunger.current >= 5) {
      embed.addFields({
        name: "Blush of Life",
        value: "```Skipped - Hunger at 5```",
      });
    }
  }

  // Add Willpower Healing field if performed
  if (args.healWillpower) {
    if (results.healedWillpower) {
      embed.addFields({
        name: "Heal Willpower",
        value: `\`\`\`ansi\n[2;31m[0m[2;31m[2;32m[2;34m[2;36mHealed ${results.willpowerHealed} superficial willpower damage.[0m[2;34m[0m[2;32m[0m[2;31m[0m\n\`\`\``,
      });
    }
  }

  // Add outcome summary field
  let outcomeText = "";

  // Handle hunger changes properly
  if (results.failedRouses > 0) {
    if (results.hungerGained > 0) {
      outcomeText += `🔺Hunger increased by ${results.hungerGained}\n`;
    } else if (results.inTorpor) {
      outcomeText += "🔺Hunger was already at 5\n";
    }
  } else {
    outcomeText += "• Hunger unchanged\n";
  }

  if (results.healedAgg) {
    outcomeText += "• Healed 1 Aggravated Health damage\n";
  }

  if (results.healedWillpower) {
    outcomeText += `• Healed ${results.willpowerHealed} Superficial Willpower damage\n`;
  }

  if (results.blushActive) {
    outcomeText += "• Blush of Life activated\n";
  } else if (args.blushOfLife) {
    outcomeText += "• No Blush of Life\n";
  }

  if (results.inTorpor) {
    outcomeText +=
      "```ansi\n[2;31m[0m[2;31mEntered Torpor at Hunger 5![0m\n```";
  } else {
    outcomeText +=
      "```ansi\n[2;31m[0m[2;31m[2;32m[2;34m[2;36mSuccessfully rose for the night[0m[2;34m[0m[2;32m[0m[2;31m[0m\n```";
  }

  embed.addFields({
    name: "Summary",
    value: outcomeText,
  });

  // Add notes field if provided
  if (args.notes) {
    embed.addFields({
      name: "Notes",
      value: args.notes,
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
