"use strict";
require("dotenv").config();
const { ShardingManager } = require("discord.js");
const path = require("path");

/**
 * Syncs application emojis for a specific bot version using sharding
 * @param {string} version - Bot version (5th, 20th, cod)
 * @returns {Promise<void>}
 */
async function syncAppEmojis(version) {
  // Normalize version string
  const normalizedVersion = version.toLowerCase();
  const upperVersion = normalizedVersion.toUpperCase();

  // Get environment variables
  const token = process.env[`TOKEN_${upperVersion}`];

  if (!token) {
    console.error(
      `❌ [EMOJI SYNC] Missing TOKEN_${upperVersion} environment variable`
    );
    throw new Error(`Missing TOKEN_${upperVersion} environment variable`);
  }

  console.log("\n============================================================");
  console.log(
    `🚀  [EMOJI SYNC] Starting sharded emoji sync for: \x1b[1m${version.toUpperCase()}\x1b[0m\n`
  );

  // Create the sharding manager pointing to our emoji management bot
  const manager = new ShardingManager(
    path.join(__dirname, "..", "src", "bots", "syncEmojiBot.js"),
    {
      token: token,
      totalShards: "auto",
      // Pass the version as script arguments to each shard
      shardArgs: ["--version", version],
    }
  );

  return new Promise((resolve, reject) => {
    let workCompleted = false;

    manager.on("shardCreate", (shard) => {
      shard.on("error", (error) => {
        console.error(`❌ Error in shard ${shard.id}:`, error);
        if (!workCompleted) {
          workCompleted = true;
          reject(error);
        }
      });

      shard.on("death", (child) => {
        // Silently handle shard completion
      });

      shard.on("ready", () => {
        // Silently handle shard ready
      });

      // Listen for completion message from shard 0
      shard.on("message", (message) => {
        if (message.type === "EMOJI_SYNC_COMPLETE" && !workCompleted) {
          workCompleted = true;
          console.log(
            `\n🌠  [EMOJI SYNC] Emoji sync completed for: \x1b[1m${version.toUpperCase()}\x1b[0m`
          );
          console.log(
            "============================================================\n"
          );
          resolve();
        } else if (message.type === "EMOJI_SYNC_ERROR" && !workCompleted) {
          workCompleted = true;
          console.error("❌ Emoji sync failed:", message.error);
          console.log(
            "============================================================\n"
          );
          reject(new Error(message.error));
        }
      });
    });

    // Spawn the shards
    manager
      .spawn()
      .then(() => {
        // Silently handle shard spawning - let the bot handle all output
      })
      .catch((error) => {
        console.error("❌ Error while spawning shards:", error);
        console.log(
          "============================================================\n"
        );
        if (!workCompleted) {
          workCompleted = true;
          reject(error);
        }
      });
  });
}

// Allow script to be run directly or imported
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const version = args[0];

  if (!version) {
    console.error(
      "\n❌  [EMOJI SYNC] Please provide a bot version: 5th, 20th, or cod"
    );
    console.error(
      "============================================================\n"
    );
    process.exit(1);
  }

  // Execute emoji sync
  (async () => {
    try {
      await syncAppEmojis(version);
      // Add a small delay to prevent Discord API rate limiting
      await new Promise((resolve) => setTimeout(resolve, 3000));
      process.exit(0);
    } catch (error) {
      console.error("❌ [EMOJI SYNC] Failed:", error.message);
      process.exit(1);
    }
  })();
} else {
  module.exports = syncAppEmojis;
}
