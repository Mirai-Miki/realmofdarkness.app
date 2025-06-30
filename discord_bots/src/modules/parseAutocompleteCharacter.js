"use strict";
/**
 * Parses a character name from autocomplete that might contain special formatting
 *
 * @param {string} nameInput - The character name or formatted string from autocomplete
 * @param {string} defaultSplat - The default splat to use if not specified
 * @returns {Object} An object containing the parsed name, splat and pk
 */
module.exports = function parseAutocompleteCharacter(nameInput, defaultSplat) {
  // Guard against null/undefined input
  if (!nameInput) {
    return {
      name: null,
      splat: defaultSplat || null,
      pk: undefined,
    };
  }

  // Handle special format: ~id|splat (used by autocomplete)
  if (nameInput.startsWith("~")) {
    const parts = nameInput.substring(1).split("|");
    if (parts.length === 2) {
      return {
        name: null, // Name isn't used when we have pk and splat
        splat: parts[1],
        pk: parts[0],
      };
    }
  }

  // Default case: just a regular name
  return {
    name: nameInput,
    splat: defaultSplat || null,
    pk: undefined,
  };
};
