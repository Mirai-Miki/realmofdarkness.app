"use strict";
require("dotenv").config();
const { REST } = require("@discordjs/rest");
const fs = require("fs");
const path = require("path");

/**
 * Syncs application emojis for a specific bot version using REST API directly
 * @param {string} version - Bot version (5th, 20th, cod)
 * @returns {Promise<void>}
 */
async function syncAppEmojis(version) {
  // Normalize version string
  const normalizedVersion = version.toLowerCase();
  const upperVersion = normalizedVersion.toUpperCase();

  // Get environment variables
  const clientId = process.env[`CLIENT_ID_${upperVersion}`];
  const token = process.env[`TOKEN_${upperVersion}`];

  if (!clientId || !token) {
    console.error(
      `❌ [EMOJI SYNC] Missing CLIENT_ID_${upperVersion} or TOKEN_${upperVersion} environment variable`
    );
    throw new Error(`Missing environment variables for ${version}`);
  }

  console.log("\n============================================================");
  console.log(
    `🚀  [EMOJI SYNC] Starting emoji sync for: \x1b[1m${version.toUpperCase()}\x1b[0m\n`
  );

  // Get emojis folder path
  const emojisPath = path.join(process.cwd(), "emojis");

  if (!fs.existsSync(emojisPath)) {
    console.error("❌ Emojis folder not found!");
    throw new Error("Emojis folder not found");
  }

  // Get all emoji files
  const emojiFiles = fs
    .readdirSync(emojisPath)
    .filter((file) => file.match(/\.(png|jpg|jpeg|gif|webp)$/i))
    .map((file) => ({
      name: path.parse(file).name,
      path: path.join(emojisPath, file),
    }));

  console.log(`  - Found ${emojiFiles.length} emoji files`);

  // Create REST client
  const rest = new REST({ version: "10" }).setToken(token);

  try {
    // Fetch current application emojis using REST API
    console.log("  - Fetching current application emojis...");
    const currentEmojis = await rest.get(`/applications/${clientId}/emojis`);

    console.log(
      `  - Found ${currentEmojis.items.length} existing application emojis`
    );

    // Create maps for easier comparison
    const fileEmojiNames = new Set(emojiFiles.map((emoji) => emoji.name));
    const currentEmojiNames = new Set(
      currentEmojis.items.map((emoji) => emoji.name)
    );

    // Find emojis to add (in files but not in application)
    const emojisToAdd = emojiFiles.filter(
      (emoji) => !currentEmojiNames.has(emoji.name)
    );

    // Find emojis to remove (in application but not in files)
    const emojisToRemove = currentEmojis.items.filter(
      (emoji) => !fileEmojiNames.has(emoji.name)
    );

    console.log(
      `  - Changes needed: ${emojisToAdd.length} to add, ${emojisToRemove.length} to remove`
    );

    let addedCount = 0;
    let addFailedCount = 0;
    let removedCount = 0;
    let removeFailedCount = 0;

    // Add new emojis
    if (emojisToAdd.length > 0) {
      console.log(`\n  📥 Adding ${emojisToAdd.length} new emojis:`);
      for (const emoji of emojisToAdd) {
        try {
          // Read the image file and convert to base64 data URI
          const imageBuffer = fs.readFileSync(emoji.path);
          const ext = path.extname(emoji.path).substring(1).toLowerCase();
          const mimeType = getMimeType(ext);
          const imageDataUri = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;

          // Create emoji via REST API
          await rest.post(`/applications/${clientId}/emojis`, {
            body: {
              name: emoji.name,
              image: imageDataUri,
            },
          });

          console.log(`     ✅ ${emoji.name}`);
          addedCount++;

          // Add a small delay to avoid rate limits
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`     ❌ ${emoji.name} - ${error.message}`);
          addFailedCount++;
        }
      }
    }

    // Remove old emojis
    if (emojisToRemove.length > 0) {
      console.log(`\n  🗑️  Removing ${emojisToRemove.length} old emojis:`);
      for (const emoji of emojisToRemove) {
        try {
          // Delete emoji via REST API
          await rest.delete(`/applications/${clientId}/emojis/${emoji.id}`);
          console.log(`     ✅ ${emoji.name}`);
          removedCount++;

          // Add a small delay to avoid rate limits
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`     ❌ ${emoji.name} - ${error.message}`);
          removeFailedCount++;
        }
      }
    }

    // Summary
    const totalSuccess = addedCount + removedCount;
    const totalFailed = addFailedCount + removeFailedCount;

    if (totalSuccess === 0 && totalFailed === 0) {
      console.log(`\n  ✨ No changes needed - all emojis are up to date!`);
    } else {
      console.log(
        `\n  📊 Summary: ${totalSuccess} successful, ${totalFailed} failed`
      );
      if (addedCount > 0)
        console.log(`     Added: ${addedCount}/${emojisToAdd.length}`);
      if (removedCount > 0)
        console.log(`     Removed: ${removedCount}/${emojisToRemove.length}`);
      if (totalFailed > 0)
        console.log(`     ⚠️  Failed operations: ${totalFailed}`);
    }

    console.log(
      `\n🌠  [EMOJI SYNC] Emoji sync completed for: \x1b[1m${version.toUpperCase()}\x1b[0m`
    );
    console.log(
      "============================================================\n"
    );
  } catch (error) {
    console.error("❌ Error managing emojis:", error);
    console.log(
      "============================================================\n"
    );
    throw error;
  }
}

/**
 * Get MIME type for image file extension
 * @param {string} ext - File extension
 * @returns {string} MIME type
 */
function getMimeType(ext) {
  const mimeTypes = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
  };
  return mimeTypes[ext] || "image/png";
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
      process.exit(0);
    } catch (error) {
      console.error("❌ [EMOJI SYNC] Failed:", error.message);
      process.exit(1);
    }
  })();
} else {
  module.exports = syncAppEmojis;
}
