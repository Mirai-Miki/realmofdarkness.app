"use strict";
require("dotenv").config();
const syncAppEmojis = require("./syncAppEmojis");

/**
 * Syncs application emojis for all bot versions sequentially with proper delays
 * @returns {Promise<void>}
 */
async function syncAllEmojis() {
  const versions = ["5th", "20th", "cod"];

  console.log("🚀 Starting emoji sync for all bot versions...\n");

  for (let i = 0; i < versions.length; i++) {
    const version = versions[i];

    try {
      await syncAppEmojis(version);

      // Add a longer delay between versions to ensure proper cleanup
      if (i < versions.length - 1) {
        console.log("⏳ Waiting 5 seconds before next sync...\n");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error(`❌ Failed to sync emojis for ${version}:`, error.message);

      // Continue with next version after a delay
      if (i < versions.length - 1) {
        console.log("⏳ Waiting 5 seconds before trying next version...\n");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  console.log("🎉 Emoji sync process completed for all versions!");
}

// Allow script to be run directly
if (require.main === module) {
  (async () => {
    try {
      await syncAllEmojis();
      process.exit(0);
    } catch (error) {
      console.error("❌ [EMOJI SYNC ALL] Failed:", error.message);
      process.exit(1);
    }
  })();
} else {
  module.exports = syncAllEmojis;
}
