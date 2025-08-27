"use strict";
require(`${process.cwd()}/alias`);
const API = require("@api");
const { trimString } = require("@modules/misc");
const { RealmError, ErrorCodes } = require("@errors");

/**
 * Retrieves character data based on the interaction.
 *
 * @param {Interaction} interaction - The interaction object.
 * @param {Client} client - The Discord client.
 * @param {boolean} [defaultSearch=false] - Indicates whether to perform a default character search.
 * @returns {Promise<{ id: string, splat: string, name: string, character: Object }>} - The character data.
 */
module.exports = async function getCharacterData(
  interaction,
  client,
  defaultSearch = false,
  splats = null
) {
  const name = interaction.options.getString("name");

  if (name) {
    if (name.startsWith("~")) {
      const [id, splat] = name.slice(1).split("|");
      const character = await API.getCharacter({
        client: client,
        pk: id,
        splat: splat,
      });
      return { name: character.name, character };
    } else {
      return { name: trimString(name), character: null };
    }
  }

  if (defaultSearch) {
    const defaults = await API.getCharacterDefaults(
      client,
      interaction.guild.id,
      interaction.user.id,
      splats
    );
    if (defaults) {
      return { name: defaults.character.name, character: defaults.character };
    }
  }

  return { name: null, character: null };
};
