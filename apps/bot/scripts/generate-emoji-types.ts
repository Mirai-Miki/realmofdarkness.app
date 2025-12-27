#!/usr/bin/env node
import fs from "fs";
import path from "path";

/**
 * Generate TypeScript types for emojis based on files in the emojis directory
 */
function generateEmojiTypes(): void {
  const emojisDir: string = path.join(process.cwd(), "emojis");
  const typesDir: string = path.join(process.cwd(), "src", "types");
  const outputFile: string = path.join(typesDir, "emoji-types.d.ts");

  // Supported image formats
  const supportedExtensions: string[] = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
  ];

  try {
    // Ensure types directory exists
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }

    // Read emoji files
    const files: string[] = fs.readdirSync(emojisDir);

    // Filter for supported image formats and extract names
    const emojiNames: string[] = files
      .filter((file: string) => {
        const ext: string = path.extname(file).toLowerCase();
        return supportedExtensions.includes(ext);
      })
      .map((file: string) => path.parse(file).name)
      .sort(); // Sort for consistent output

    if (emojiNames.length === 0) {
      console.warn("No emoji files found in emojis directory");
      return;
    }

    // Generate TypeScript type definition
    const typeContent: string = `// Auto-generated file. Do not edit manually.
// Generated from emoji files in the emojis/ directory
// Run 'npm run generate-emoji-types' to regenerate

import type { ApplicationEmoji } from "discord.js";

/**
 * Union type of all available emoji names
 */
export type EmojiName =
${emojiNames.map((name: string) => `  | "${name}"`).join("\n")};

/**
 * Interface representing the Emoji object with all available emojis
 */
export interface EmojiObject {
${emojiNames.map((name: string) => `  readonly ${name}: ApplicationEmoji;`).join("\n")}
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
    console.error(
      "❌ Failed to generate emoji types:",
      (error as Error).message
    );
    process.exit(1);
  }
}

// Run if called directly
generateEmojiTypes();

export { generateEmojiTypes };
