"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const { RealmError, RealmAPIError, ErrorCodes } = require("@errors");

/**
 * Gets character counts for a user (global and guild-specific)
 * @param {String} user_id - Discord user ID
 * @param {String} guild_id - Discord guild/chronicle ID (optional)
 * @returns {Promise<Object>} Returns character count data
 *
 * @example
 * // Get global character counts
 * const counts = await getCharacterCount("123456789012345678");
 * console.log(counts.global.sheets); // Total sheets across all guilds
 * console.log(counts.global.trackers); // Total trackers across all guilds
 * console.log(counts.global.total); // Total characters across all guilds
 *
 * @example
 * // Get guild-specific character counts
 * const counts = await getCharacterCount(
 *   "123456789012345678",
 *   "987654321098765432"
 * );
 * console.log(counts.global.sheets); // Global counts
 * console.log(counts.guild.sheets); // Guild-specific counts
 * console.log(counts.guild.trackers); // Guild-specific tracker counts
 * console.log(counts.guild.total); // Guild-specific total
 */
module.exports = async function getCharacterCount(userId, guildId) {
  const path = "character/count";

  // Validate required parameters
  if (!userId) {
    throw new RealmError({ cause: new Error("userId must be provided") });
  }

  const data = {
    user_id: userId,
    guild_id: guildId,
  };

  const res = await postData(path, data);

  switch (res?.status) {
    case 200: // Found character counts
      return res.data;
    case 400: // Bad request
      throw new RealmError({ cause: new Error("Invalid parameters provided") });
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
