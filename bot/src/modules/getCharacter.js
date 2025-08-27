"use strict";
require(`${process.cwd()}/alias`);
const API = require("@api");
const parseAutocompleteCharacter = require("@modules/parseAutocompleteCharacter");

/**
 * Takes a name or autocomplete value and retrieves the corresponding character
 *
 * @param {String} nameInput - Character name or autocomplete value (~id|splat format)
 * @param {Interaction} interaction - The Discord interaction object
 * @param {Boolean} [required=true] - Whether a character must be found or not
 * @returns {Object} An object containing the name and character if found
 * @throws {RealmError} If character lookup fails and required is true
 */
module.exports = async function getCharacter(
  nameInput,
  interaction,
  required = true
) {
  if (!nameInput) return null;

  // Parse the input to extract id, name and splat if possible
  const parsed = parseAutocompleteCharacter(nameInput);

  // Initialize result object with fallback name
  const result = {
    name: parsed.name || nameInput, // Temporary name (may be updated later)
    tracked: null,
  };

  try {
    // Use the API to fetch the character
    result.tracked = await API.getCharacter({
      client: interaction.client,
      name: parsed.name,
      splat: parsed.splat || null,
      pk: parsed.pk,
      user: interaction.member ? interaction.member : interaction.user,
      guild: interaction.guild,
    });

    // If we got a character from autocomplete, use its actual name
    if (result.tracked && parsed.pk) {
      result.name = result.tracked.name;
    }

    return result;
  } catch (error) {
    // If character is required, rethrow the error
    if (required) {
      throw error;
    }

    // Otherwise return the partial result with just the name
    return result;
  }
};
