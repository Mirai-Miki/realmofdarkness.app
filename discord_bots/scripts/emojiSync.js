#!/usr/bin/env node
"use strict";

/**
 * Emoji management script for Discord bots
 * Run this to sync emoji files with Discord application emojis
 */

const manageEmojis = require("./manageEmojis");

async function main() {
  const version = process.argv[2];

  if (!version) {
    console.log("Usage: node scripts/emoji-sync.js <version>");
    console.log("Available versions: 5th, 20th, cod");
    process.exit(1);
  }

  console.log(`Syncing emojis for ${version} bot...`);

  try {
    await manageEmojis({ version });
    console.log("✅ Emoji sync completed!");
  } catch (error) {
    console.error("❌ Emoji sync failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
