#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Generate TypeScript types for emojis based on files in the emojis directory
 */
function generateEmojiTypes() {
  const emojisDir = path.join(__dirname, "..", "emojis");
  const typesDir = path.join(__dirname, "..", "src", "types");
  const outputFile = path.join(typesDir, "emojiTypes.d.ts");

  // Supported image formats
  const supportedExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

  try {
    // Ensure types directory exists
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }

    // Read emoji files
    const files = fs.readdirSync(emojisDir);

    // Filter for supported image formats and extract names
    const emojiNames = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return supportedExtensions.includes(ext);
      })
      .map((file) => path.parse(file).name)
      .sort(); // Sort for consistent output

    if (emojiNames.length === 0) {
      console.warn("No emoji files found in emojis directory");
      return;
    }

    // Generate TypeScript type definition
    const typeContent = `// Auto-generated file. Do not edit manually.
// Generated from emoji files in the emojis/ directory
// Run 'npm run generate-emoji-types' to regenerate

import { ApplicationEmoji } from 'discord.js';

/**
 * Union type of all available emoji names
 */
export type EmojiName = 
${emojiNames.map((name) => `  | "${name}"`).join("\n")};

/**
 * Interface representing the Emoji object with all available emojis
 */
export interface EmojiObject {
${emojiNames.map((name) => `  readonly ${name}: ApplicationEmoji;`).join("\n")}
}

/**
 * Type-safe emoji accessor
 */
export declare const Emoji: EmojiObject;
`;

    // Write the type file
    fs.writeFileSync(outputFile, typeContent, "utf8");

    console.log(`✅ Generated emoji types for ${emojiNames.length} emojis`);
    console.log(
      `📁 Types written to: ${path.relative(process.cwd(), outputFile)}`
    );
  } catch (error) {
    console.error("❌ Failed to generate emoji types:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateEmojiTypes();
}

module.exports = { generateEmojiTypes };
