"use strict";
require(`${process.cwd()}/alias`);
/**
 * Autocompletes names based on the provided interaction and options.
 *
 * @param {Interaction} interaction - The interaction object.
 * @param {string | string[] | null} splat - The splat value.
 * @param {boolean} [sheet_only=false] - Indicates whether to only get names from the sheet.
 * @returns {Promise<Array<{ name: string, value: string }>>} - The filtered and mapped choices.
 */
const API = require("@api");

module.exports = async function autocomplete(
  interaction,
  splat,
  sheet_only = false
) {
  const focusedOption = interaction.options.getFocused(true);
  const focusedValue = focusedOption.value.toLowerCase();

  let choices = [];
  if (focusedOption.name === "discipline") {
    choices = await API.getDisciplineNames(
      interaction.user.id,
      interaction.guild?.id
    );

    // Filter discipline names based on whether they're strings or objects
    const filtered = choices.filter((choice) => {
      return choice.toLowerCase().startsWith(focusedValue);
    });

    // Limit the number of options to 25
    const limitedChoices = filtered.slice(0, 25);

    // Map to the required format
    return limitedChoices.map((choice) => ({
      name: choice,
      value: choice,
    }));
  } else if (
    focusedOption.name === "name" ||
    focusedOption.name === "character"
  ) {
    choices = await API.getNamesList(
      interaction.user.id,
      interaction.guild?.id,
      splat,
      sheet_only
    );

    // Filter character names and return special format
    const filtered = choices.filter((choice) =>
      choice.name.toLowerCase().startsWith(focusedValue)
    );

    // Limit the number of options to 25
    const limitedChoices = filtered.slice(0, 25);
    return limitedChoices.map((choice) => ({
      name: choice.name,
      value: `~${choice.id}|${choice.splat}`,
    }));
  }

  return [];
};
