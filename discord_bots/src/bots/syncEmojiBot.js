"use strict";
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

// Get version from command line arguments passed by ShardingManager
const versionIndex = process.argv.indexOf("--version");
const version = versionIndex !== -1 ? process.argv[versionIndex + 1] : null;

if (!version) {
  console.error("No version provided by launcher");
  process.exit(1);
}

// Normalize version string
const normalizedVersion = version.toLowerCase();
const upperVersion = normalizedVersion.toUpperCase();

// Get environment variables
const clientId = process.env[`CLIENT_ID_${upperVersion}`];
const token = process.env[`TOKEN_${upperVersion}`];

if (!clientId || !token) {
  console.error(`Missing environment variables for ${version}`);
  process.exit(1);
}

// Create client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", async () => {
  // Only proceed if this is shard 0, destroy other shards to save memory
  if (client.shard?.ids?.[0] !== 0) {
    client.destroy();
    process.exit(0);
  }

  console.log(`  - Logged in as \x1b[1m${client.user.tag}\x1b[0m`);

  try {
    // Get emojis folder path
    const emojisPath = path.join(process.cwd(), "emojis");

    if (!fs.existsSync(emojisPath)) {
      console.error("❌ Emojis folder not found!");
      if (process.send) {
        process.send({
          type: "EMOJI_SYNC_ERROR",
          error: "Emojis folder not found",
        });
      }
      process.exit(1);
    }

    // Get all emoji files
    const emojiFiles = fs
      .readdirSync(emojisPath)
      .filter((file) => file.match(/\.(png|jpg|jpeg|gif|webp)$/i))
      .map((file) => ({
        name: path.parse(file).name,
        path: path.join(emojisPath, file),
      }));

    // Fetch current application emojis
    await client.application.emojis.fetch();
    const currentEmojis = client.application.emojis.cache;

    // Create maps for easier comparison
    const fileEmojiNames = new Set(emojiFiles.map((emoji) => emoji.name));
    const currentEmojiNames = new Set(currentEmojis.map((emoji) => emoji.name));

    // Find emojis to add (in files but not in application)
    const emojisToAdd = emojiFiles.filter(
      (emoji) => !currentEmojiNames.has(emoji.name)
    );

    // Find emojis to remove (in application but not in files)
    const emojisToRemove = currentEmojis.filter(
      (emoji) => !fileEmojiNames.has(emoji.name)
    );

    console.log(
      `  - Found ${emojiFiles.length} emoji files, ${currentEmojis.size} existing application emojis`
    );
    console.log(
      `  - Changes needed: ${emojisToAdd.length} to add, ${emojisToRemove.size} to remove`
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
          const attachment = fs.readFileSync(emoji.path);
          await client.application.emojis.create({
            attachment: attachment,
            name: emoji.name,
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
    if (emojisToRemove.size > 0) {
      console.log(`\n  🗑️  Removing ${emojisToRemove.size} old emojis:`);
      for (const emoji of emojisToRemove.values()) {
        try {
          await emoji.delete();
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
        console.log(`     Removed: ${removedCount}/${emojisToRemove.size}`);
      if (totalFailed > 0)
        console.log(`     ⚠️  Failed operations: ${totalFailed}`);
    }

    // Send completion message to parent process
    if (process.send) {
      process.send({ type: "EMOJI_SYNC_COMPLETE" });
    }
  } catch (error) {
    console.error("❌ Error managing emojis:", error);

    // Send error message to parent process
    if (process.send) {
      process.send({ type: "EMOJI_SYNC_ERROR", error: error.message });
    }
  } finally {
    // Give a moment for the message to be sent
    await new Promise((resolve) => setTimeout(resolve, 1000));
    client.destroy();
    process.exit(0);
  }
});

// Add error handling for sharding and process
client.on("error", (error) => {
  console.error("Client error:", error.message);
  if (process.send) {
    process.send({ type: "EMOJI_SYNC_ERROR", error: error.message });
  }
});

// Handle process errors gracefully
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  if (process.send) {
    process.send({ type: "EMOJI_SYNC_ERROR", error: error.message });
  }
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  if (process.send) {
    const errorMessage =
      reason instanceof Error ? reason.message : String(reason);
    process.send({ type: "EMOJI_SYNC_ERROR", error: errorMessage });
  }
  process.exit(1);
});

// Login
client.login(token);
