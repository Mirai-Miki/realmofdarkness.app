"use strict";
const { EmbedBuilder } = require("discord.js");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

/**
 * Error codes used throughout the application
 * Organized by category for easier maintenance
 */
module.exports.ErrorCodes = {
  // System Errors (0-10)
  RealmError: 0,
  DiscordAPIError: 1,
  InvalidGeneralRollSets: 2,
  InvalidGeneralRollDice: 3,
  GuildRequired: 4,
  NotAdminOrST: 5,
  NoCharacter: 6,
  NotHexNumber: 7,
  NotImageURL: 8,
  NightmareOutOfRange: 9,
  NoNamesList: 10,

  // Permission Errors (11-13)
  NotAdmin: 11,
  NotTextChannel: 12,
  InvalidChannelPermissions: 13,

  // Initiative Tracker Errors (13-19)
  InitInvalidPhase: 14,
  InitNoCharacter: 15,
  InitInvalidTurn: 16,
  InitInvalidButtonPerm: 17,
  InitNoTracker: 18,

  // Character Sheet Errors (19-28)
  NoWillpower: 19,
  RerollNoChannel: 20,
  NotSheet: 21,
  NoSheetSelected: 22,
  NoSheet: 23,
  NoCharacterSelected: 24,
  IncorrectCharType: 25,
  TooManySheets: 26,
  NoBlood: 27,
  NoDamage: 28,

  // Supporter Level Errors (100-199)
  RequiresMortal: 100,
  RequiresFledgling: 101,
  RequiresNeonate: 102,
  RequiresAncilla: 103,
  RequiresElder: 104,
  RequiresMethuselah: 105,
  RequiresAntediluvian: 106,
};

/**
 * API-specific error codes for backend communication
 */
module.exports.APIErrorCodes = {
  RealmAPIError: 1000,
  ConnectionRefused: 1001,
  CharacterExists: 1002,
  CharacterLimitReached: 1003,
  NotAnImage: 1004,
  NameExists: 1005,
  NameContainsSpecialCharacter: 1006,
  ImageTooLarge: 1007,
};

// Export error classes
module.exports.RealmError = require("./RealmError");
module.exports.RealmAPIError = require("./RealmAPIError");

/**
 * Handles error logging and debug reporting
 * In development: Logs to console
 * In production: Sends to error reporting channel
 *
 * @param {Error} error - The error to handle
 * @param {Client} client - Discord client instance
 */
module.exports.handleErrorDebug = async function (error, client) {
  // Skip errors marked to not be raised
  if (error.debug?.raise === false) return;

  // Development environment handling
  if (process.env.NODE_ENV === "development") {
    console.error("========== ERROR ==========");
    console.error(error.stack);
    if (error.cause) {
      console.error("\nCaused by:");
      console.error(error.cause);
    }
    console.error("===========================");
    return;
  }

  // Skip Discord API "Unknown Interaction" errors
  // These are common and usually happen when interactions time out
  if (error.code === 10062) return;

  try {
    // Create error report embed
    const debugEmbed = new EmbedBuilder()
      .setTitle(error.name)
      .setColor("#db0f20")
      .setTimestamp();

    // Format error details
    let description = `\`\`\`${error.stack}\`\`\``;
    if (error.debug?.cause) {
      description += `\n\nCaused by:\n\`\`\`${error.cause}\`\`\``;
    }
    debugEmbed.setDescription(description);

    // Get debug channel from environment variable or use fallback
    const debugChannelId = process.env.ERROR_CHANNEL_ID || "776761322859266050";

    // Broadcast error to all shards to ensure it gets sent
    client.shard.broadcastEval(
      async (c, { message, channelId }) => {
        try {
          const channel = c.channels.cache.get(channelId);
          if (channel) {
            await channel.send(message);
            return true;
          }
          return false;
        } catch (e) {
          console.error("Failed to send error report:", e);
          return false;
        }
      },
      {
        context: {
          message: { embeds: [debugEmbed] },
          channelId: debugChannelId,
        },
      }
    );
  } catch (e) {
    // Last resort error logging if the reporting itself fails
    console.error("CRITICAL ERROR:");
    console.error(error);
    console.error("\nFailed to report error due to:");
    console.error(e);
  }
};
