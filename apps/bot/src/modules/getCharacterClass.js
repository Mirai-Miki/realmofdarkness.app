"use strict";
require(`${process.cwd()}/alias`);
const { Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Determine environment and source directory
const runningFromDist = process.env.NODE_ENV !== "development";
const srcDir = runningFromDist ? "dist" : "src";

// Store all character classes
const characters = new Collection();

/**
 * Loads all character classes from the structures/characters directory
 * Caches them for efficient access
 */
function loadCharacterClasses() {
  try {
    // Use path.join for cross-platform compatibility
    const charactersPath = path.join(
      process.cwd(),
      srcDir,
      "structures/characters"
    );

    if (!fs.existsSync(charactersPath)) {
      console.error(`Characters directory not found: ${charactersPath}`);
      return;
    }

    const charFiles = fs
      .readdirSync(charactersPath)
      .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

    for (const file of charFiles) {
      try {
        const char = require(`@structures/characters/${file}`);

        if (!char.getSplat || !char.getSplat().slug) {
          console.warn(
            `Character class in ${file} is missing getSplat() method or slug`
          );
          continue;
        }

        characters.set(char.getSplat().slug, char);
      } catch (error) {
        console.error(`Failed to load character class from ${file}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error loading character classes:`, error);
  }
}

// Initialize character classes
loadCharacterClasses();

/**
 * Retrieves a Character class by its splat slug
 *
 * @param {String} splatSlug - Slug for the splat Class being returned
 * @returns {Character} Character Class definition
 * @throws {Error} If the requested character class doesn't exist
 */
module.exports = function getCharacterClass(splatSlug) {
  const Character = characters.get(splatSlug);
  if (!Character) {
    throw new Error(`No Character class found for splat: ${splatSlug}`);
  }
  return Character;
};
