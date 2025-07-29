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
      totalShards: "auto", // Let Discord determine required shards
      respawn: false, // Don't respawn shards
      // Pass the version as script arguments to each shard
      shardArgs: ["--version", version],
      // Increase timeout for slower operations with multiple shards
      timeout: 180000, // 3 minutes
    }
  );

  return new Promise((resolve, reject) => {
    let workCompleted = false;
    const shards = new Map();

    // Cleanup function to properly destroy all shards
    const cleanup = async () => {
      try {
        // First, set respawn to false to prevent automatic restarts
        manager.respawn = false;

        // Kill all shards using proper Discord.js methods
        for (const shard of manager.shards.values()) {
          try {
            shard.removeAllListeners();
            shard.kill(); // This is synchronous according to docs
          } catch (error) {
            // Ignore individual shard kill errors
          }
        }

        // Clear our local tracking
        shards.clear();

        // Remove all listeners from the manager
        manager.removeAllListeners();
      } catch (error) {
        // silently handle cleanup errors
      }
    };

    manager.on("shardCreate", (shard) => {
      shards.set(shard.id, shard);

      shard.on("error", (error) => {
        console.error(`❌ Error in shard ${shard.id}:`, error);
        if (!workCompleted) {
          workCompleted = true;
          cleanup();
          setTimeout(() => reject(error), 2000);
        }
      });

      shard.on("death", (child) => {
        // Remove from tracking when shard dies
        shards.delete(shard.id);
      });

      shard.on("ready", () => {
        // Log shard ready event
      });

      // Listen for completion message from shard 0 only
      shard.on("message", (message) => {
        // Only process messages from shard 0
        if (shard.id !== 0) return;

        if (message.type === "EMOJI_SYNC_COMPLETE" && !workCompleted) {
          workCompleted = true;
          console.log(
            `\n🌠  [EMOJI SYNC] Emoji sync completed for: \x1b[1m${version.toUpperCase()}\x1b[0m`
          );
          console.log(
            "============================================================\n"
          );
          cleanup();
          // Add delay to ensure cleanup completes before resolving
          setTimeout(() => resolve(), 2000);
        } else if (message.type === "EMOJI_SYNC_ERROR" && !workCompleted) {
          workCompleted = true;
          console.error("❌ Emoji sync failed:", message.error);
          console.log(
            "============================================================\n"
          );
          cleanup();
          // Add delay to ensure cleanup completes before rejecting
          setTimeout(() => reject(new Error(message.error)), 2000);
        }
      });
    });

    // Add timeout to prevent hanging
    const timeout = setTimeout(
      () => {
        if (!workCompleted) {
          workCompleted = true;
          console.error("❌ Emoji sync timed out after 5 minutes");
          console.log(
            "============================================================\n"
          );
          cleanup();
          setTimeout(() => reject(new Error("Emoji sync timed out")), 2000);
        }
      },
      5 * 60 * 1000
    ); // 5 minutes timeout

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
          clearTimeout(timeout);
          cleanup();
          setTimeout(() => reject(error), 2000);
        }
      });

    // Clear timeout when work completes
    const originalResolve = resolve;
    const originalReject = reject;
    resolve = (...args) => {
      clearTimeout(timeout);
      originalResolve(...args);
    };
    reject = (...args) => {
      clearTimeout(timeout);
      originalReject(...args);
    };
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
      // Add a longer delay between operations to prevent Discord API issues
      await new Promise((resolve) => setTimeout(resolve, 5000));
      process.exit(0);
    } catch (error) {
      console.error("❌ [EMOJI SYNC] Failed:", error.message);
      // Wait a bit before exiting on error too
      await new Promise((resolve) => setTimeout(resolve, 2000));
      process.exit(1);
    }
  })();
} else {
  module.exports = syncAppEmojis;
}
