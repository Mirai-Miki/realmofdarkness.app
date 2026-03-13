"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const getCharacterClass = require("@modules/getCharacterClass");
const { RealmError, RealmAPIError, ErrorCodes } = require("@errors");

/**
 * Finds a character in the Database if one exists
 * @param {Client} client The discord client making the request
 * @param {String} name Name of the character being fetched
 * @param {User|GuildMember} user A Discord User OR GuildMember
 * @param {Guild} guild Discord Guild if there is one
 * @param {String} splatSlug Slug of the splat if known
 * @param {String} pk Priamary Key of the character if known
 * @returns {Promise<Character>} Returns a Character class if one is found or null if not
 */
module.exports = async function getCharacter({
  client,
  name = null,
  user = null,
  guild = null,
  splat = null,
  pk = null,
} = {}) {
  const path = "character/get";
  const data = {
    name: name,
    splat: splat,
    pk: pk,
    user_id: user?.id,
    guild_id: guild?.id,
  };
  const res = await postData(path, data);
  switch (res?.status) {
    case 200: // Found a character
      const json = res.data;
      const CharacterClass = getCharacterClass(json.splat);
      const char = new CharacterClass({ client: client, name: json.name });
      await char.deserilize(json);
      return char;
    case 404: // No character
      throw new RealmError({ code: ErrorCodes.NoCharacter });
    case 300: // No sheet selected
      throw new RealmError({ code: ErrorCodes.NoCharacterSelected });
    default:
      throw new RealmAPIError({
        cause: `res_status: ${res?.status}\nres: ${JSON.stringify(
          res?.data,
          null,
          2
        )}\npost: ${JSON.stringify(data, null, 2)}`,
      });
  }
};
