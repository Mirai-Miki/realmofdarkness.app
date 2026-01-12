#!/usr/bin/env node
/**
 * @file Generate TypeScript types for emoji assets
 * @description Recursively scans the emojis directory and generates:
 *              - Strongly-typed emoji names (union type)
 *              - Nested object structure matching folder hierarchy
 *              - Runtime validation against contracts from @realm/common
 *              Runs automatically during package build.
 */

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

// Get directory name in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Supported image formats for emoji assets
 */
const SUPPORTED_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
] as const;

/**
 * Configuration for type generation
 */
interface TypeGenConfig {
  emojisDir: string;
  outputFile: string;
}

/**
 * Emoji file metadata
 */
interface EmojiFile {
  /** Full emoji name (e.g., "dice_v5_default_primary_crit") */
  name: string;
  /** Path segments (e.g., ["dice", "v5", "default", "primary", "crit"]) */
  segments: string[];
  /** Relative path from emojis root */
  relativePath: string;
}

/**
 * Nested object structure for code generation
 */
type EmojiTree = {
  [key: string]: EmojiTree | string;
};

/**
 * Get configuration paths relative to package root
 */
function getConfig(): TypeGenConfig {
  const packageRoot = path.resolve(__dirname, "..");

  return {
    emojisDir: path.join(packageRoot, "emojis"),
    outputFile: path.join(packageRoot, "src", "types", "emoji.types.ts"),
  };
}

/**
 * Check if a file is a supported image format
 */
function isSupportedImageFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(
    ext as (typeof SUPPORTED_EXTENSIONS)[number]
  );
}

/**
 * Recursively scan directory for emoji files
 */
function scanEmojisRecursive(
  dir: string,
  rootDir: string,
  pathPrefix: string[] = []
): EmojiFile[] {
  const results: EmojiFile[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively scan subdirectory
      const subResults = scanEmojisRecursive(fullPath, rootDir, [
        ...pathPrefix,
        entry.name,
      ]);
      results.push(...subResults);
    } else if (entry.isFile() && isSupportedImageFile(entry.name)) {
      // Add emoji file
      const baseName = path.parse(entry.name).name;
      const segments = [...pathPrefix, baseName];
      const name = segments.join("_");
      const relativePath = path.relative(rootDir, fullPath);

      results.push({
        name,
        segments,
        relativePath,
      });
    }
  }

  return results;
}

/**
 * Generate MD5 hash for Discord emoji name
 * @param fullName - Full emoji name (e.g., "dice_v5_default_secondary_bestial")
 * @returns 32-character hex MD5 hash
 */
function toDiscordHash(fullName: string): string {
  return createHash("md5").update(fullName).digest("hex");
}

/**
 * Build nested object tree from emoji files
 */
function buildEmojiTree(emojis: EmojiFile[]): EmojiTree {
  const tree: EmojiTree = {};

  for (const emoji of emojis) {
    let current = tree;

    // Navigate/create nested structure
    for (let i = 0; i < emoji.segments.length; i++) {
      const segment = emoji.segments[i];
      const isLast = i === emoji.segments.length - 1;

      if (isLast) {
        // Leaf node: assign MD5 hash as Discord emoji name
        current[segment] = toDiscordHash(emoji.name);
      } else {
        // Branch node: create nested object if needed
        if (typeof current[segment] !== "object") {
          current[segment] = {};
        }
        current = current[segment] as EmojiTree;
      }
    }
  }

  return tree;
}

/**
 * Convert segment to PascalCase for TypeScript property names
 */
function toPascalCase(str: string): string {
  // Handle numbers: "1" -> "N1", "10" -> "N10"
  if (/^\d+$/.test(str)) {
    return `N${str}`;
  }

  return str
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

/**
 * Generate TypeScript object literal code from tree
 */
function generateObjectCode(tree: EmojiTree, indent: number = 1): string {
  const indentStr = "  ".repeat(indent);
  const lines: string[] = [];

  const keys = Object.keys(tree).sort();

  for (const key of keys) {
    const value = tree[key];
    const propName = toPascalCase(key);

    if (typeof value === "string") {
      // Leaf: emoji name string
      lines.push(`${indentStr}${propName}: "${value}",`);
    } else {
      // Branch: nested object
      lines.push(`${indentStr}${propName}: {`);
      lines.push(generateObjectCode(value, indent + 1));
      lines.push(`${indentStr}},`);
    }
  }

  return lines.join("\n");
}

/**
 * Validate emoji structure against contracts (minimal validation)
 * Full validation happens at runtime with Zod in consuming code
 */
function validateStructure(tree: EmojiTree): void {
  // Check that dice category exists
  if (!tree.dice) {
    throw new Error("Missing required category: dice");
  }

  const dice = tree.dice as EmojiTree;

  // Check required game systems
  const requiredSystems = ["v5", "w5", "h5", "wod20"];
  for (const system of requiredSystems) {
    if (!dice[system]) {
      throw new Error(`Missing required dice system: ${system}`);
    }
  }

  // Check that progress-bar category exists
  if (!tree["progress-bar"]) {
    throw new Error("Missing required category: progress-bar");
  }

  console.log("✅ Basic structure validation passed");
}

/**
 * Generate TypeScript type definition content
 */
function generateTypeContent(emojis: EmojiFile[], tree: EmojiTree): string {
  // Generate MD5 hashes for each emoji (these are the Discord emoji names)
  const emojiHashes = emojis.map((e) => toDiscordHash(e.name)).sort();

  const objectCode = generateObjectCode(tree);

  return `/**
 * @file Auto-generated emoji type definitions
 * @description Generated from emoji files in the emojis/ directory
 * @warning Do not edit manually - run 'pnpm build' to regenerate
 */

import { z } from "zod";

/**
 * Zod schema for emoji name validation.
 * Emoji names are MD5 hashes (32 characters) used as Discord emoji names.
 */
export const EmojiNameSchema = z.enum([
${emojiHashes.map((hash) => `  "${hash}",`).join("\n")}
]);

/**
 * Union type of all available emoji names (MD5 hashes).
 * Each hash corresponds to an emoji uploaded to Discord as an application emoji.
 *
 * @example
 * \`\`\`typescript
 * import type { EmojiName } from '@realm/assets';
 * import { Emojis } from '@realm/assets';
 *
 * // Access emoji hash via nested object
 * const critDie: EmojiName = Emojis.Dice.V5.Default.Primary.Crit;
 * // critDie is the MD5 hash string
 * \`\`\`
 */
export type EmojiName = z.infer<typeof EmojiNameSchema>;

/**
 * Total count of available emojis
 */
export const EMOJI_COUNT = ${emojiHashes.length} as const;

/**
 * Strongly-typed emoji asset accessor.
 * Provides nested object access matching the folder structure.
 * Values are MD5 hashes used as Discord emoji names.
 *
 * @example
 * \`\`\`typescript
 * import { Emojis } from '@realm/assets';
 *
 * // Access V5 dice - returns MD5 hash
 * const critDie = Emojis.Dice.V5.Default.Primary.Crit;
 * // Returns: "31d0640fb8de2b6c669cb749ec8e90e5" (MD5 hash)
 *
 * // Use with EmojiManager
 * const emoji = emojiManager.get(Emojis.Dice.V5.Default.Primary.Crit);
 * \`\`\`
 */
export const Emojis = {
${objectCode}
} as const;
`;
}

/**
 * Write type file to disk
 */
function writeTypeFile(outputFile: string, content: string): void {
  const outputDir = path.dirname(outputFile);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, content, "utf8");
}

/**
 * Main function to generate emoji types
 */
export function generateEmojiTypes(): void {
  try {
    console.log("🔍 Scanning emoji directory...");
    const config = getConfig();

    if (!fs.existsSync(config.emojisDir)) {
      throw new Error(`Emojis directory not found: ${config.emojisDir}`);
    }

    // Recursively scan for emojis
    const emojis = scanEmojisRecursive(config.emojisDir, config.emojisDir).sort(
      (a, b) => a.name.localeCompare(b.name)
    );

    if (emojis.length === 0) {
      throw new Error(`No emoji files found in ${config.emojisDir}`);
    }

    console.log(`📊 Found ${emojis.length} emoji files`);

    // Build nested tree structure
    const tree = buildEmojiTree(emojis);

    // Validate structure
    validateStructure(tree);

    // Generate TypeScript code
    const typeContent = generateTypeContent(emojis, tree);

    // Write to disk
    writeTypeFile(config.outputFile, typeContent);

    // Log success
    const relativePath = path.relative(process.cwd(), config.outputFile);
    console.log(`✅ Generated emoji types for ${emojis.length} emojis`);
    console.log(`📁 Types written to: ${relativePath}`);
  } catch (error) {
    console.error("❌ Failed to generate emoji types:");
    console.error((error as Error).message);
    process.exit(1);
  }
}

// Run if executed directly (not imported)
// Check multiple ways to handle both Unix and Windows paths
const isMainModule =
  import.meta.url === `file://${process.argv[1]}` ||
  import.meta.url === pathToFileURL(process.argv[1]).href ||
  fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  generateEmojiTypes();
}
