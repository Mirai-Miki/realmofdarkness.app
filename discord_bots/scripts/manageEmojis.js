"use strict";
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

/**
 * Manages application emojis for a specific bot version
 * @param {Object} options - Management options
 * @param {string} options.version - Bot version (5th, 20th, cod)
 * @returns {Promise<void>}
 */
async function manageEmojis({ version }) {
  // Normalize version string
  const normalizedVersion = version.toLowerCase();
  const upperVersion = normalizedVersion.toUpperCase();

  // Get environment variables
  const clientId = process.env[`CLIENT_ID_${upperVersion}`];
  const token = process.env[`TOKEN_${upperVersion}`];

  if (!clientId || !token) {
    console.error(`Missing environment variables for ${version}`);
    return;
  }

  // Create client
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  console.log(`Starting emoji management for ${version} bot...`);

  client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
      // Get emojis folder path
      const emojisPath = path.join(process.cwd(), "emojis");

      if (!fs.existsSync(emojisPath)) {
        console.error("Emojis folder not found!");
        return;
      }

      // Get all emoji files
      const emojiFiles = fs
        .readdirSync(emojisPath)
        .filter((file) => file.match(/\.(png|jpg|jpeg|gif|webp)$/i))
        .map((file) => ({
          name: path.parse(file).name,
          path: path.join(emojisPath, file),
        }));

      console.log(`Found ${emojiFiles.length} emoji files`);

      // Fetch current application emojis
      await client.application.emojis.fetch();
      const currentEmojis = client.application.emojis.cache;

      console.log(`Found ${currentEmojis.size} existing application emojis`);

      // Create maps for easier comparison
      const fileEmojiNames = new Set(emojiFiles.map((emoji) => emoji.name));
      const currentEmojiNames = new Set(
        currentEmojis.map((emoji) => emoji.name)
      );

      // Find emojis to add (in files but not in application)
      const emojisToAdd = emojiFiles.filter(
        (emoji) => !currentEmojiNames.has(emoji.name)
      );

      // Find emojis to remove (in application but not in files)
      const emojisToRemove = currentEmojis.filter(
        (emoji) => !fileEmojiNames.has(emoji.name)
      );

      console.log(`Emojis to add: ${emojisToAdd.length}`);
      console.log(`Emojis to remove: ${emojisToRemove.size}`);

      // Add new emojis
      for (const emoji of emojisToAdd) {
        try {
          console.log(`Adding emoji: ${emoji.name}`);
          const attachment = fs.readFileSync(emoji.path);
          await client.application.emojis.create({
            attachment: attachment,
            name: emoji.name,
          });
          console.log(`✅ Added: ${emoji.name}`);

          // Add a small delay to avoid rate limits
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`❌ Failed to add ${emoji.name}:`, error.message);
        }
      }

      // Remove old emojis
      for (const emoji of emojisToRemove.values()) {
        try {
          console.log(`Removing emoji: ${emoji.name}`);
          await emoji.delete();
          console.log(`✅ Removed: ${emoji.name}`);

          // Add a small delay to avoid rate limits
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`❌ Failed to remove ${emoji.name}:`, error.message);
        }
      }

      console.log("Emoji management completed!");
    } catch (error) {
      console.error("Error managing emojis:", error);
    } finally {
      client.destroy();
    }
  });

  // Login
  await client.login(token);
}

// Allow script to be run directly or imported
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const version = args[0];

  if (!version) {
    console.error("Please provide a bot version: 5th, 20th, or cod");
    process.exit(1);
  }

  // Execute emoji management
  (async () => {
    await manageEmojis({ version });
    process.exit(0);
  })();
} else {
  module.exports = manageEmojis;
}
