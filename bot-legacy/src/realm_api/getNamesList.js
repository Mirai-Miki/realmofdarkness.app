"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const RealmAPIError = require("@src/errors/RealmAPIError.js");

/**
 * Gets a list of user characters
 * @param {User|GuildMember} user
 * @param {Guild} guild
 * @returns {Promis<Array<String>|null>} List of character || Null if none exist
 */
module.exports = async function getNamesList(
  userId,
  guildId,
  splat,
  sheetOnly = false
) {
  const path = "character/get/names";
  const data = {
    user_id: userId,
    guild_id: guildId,
    splat: splat,
    sheet_only: sheetOnly,
  };
  const res = await postData(path, data);
  switch (res?.status) {
    case 200: // Fetched a names list
      return res.data.characters;
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
