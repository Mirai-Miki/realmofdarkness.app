"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const { RealmError, RealmAPIError, ErrorCodes } = require("@errors");

/**
 * Finds a chronicle in the Database if one exists
 * @param {String} guild_id - Discord guild/chronicle ID
 * @returns {Promise<Object>} Returns chronicle data if found
 *
 * @example
 * // Get chronicle data
 * const chronicle = await getChronicle({ guild_id: "987654321098765432" });
 * console.log(chronicle.name);
 */
module.exports = async function getChronicle(guildId) {
  const path = "chronicle/get";

  // Validate required parameters
  if (!guildId) {
    throw new RealmError({
      code: ErrorCodes.RealmError,
      message: "guildId must be provided",
    });
  }

  const data = {
    guild_id: guildId,
  };

  const res = await postData(path, data);

  switch (res?.status) {
    case 200: // Found a chronicle
      return res.data;
    case 404: // No chronicle found
      throw new RealmError({
        cause: new Error(`Chronicle with guild ID ${guildId} not found`),
      });
    case 400: // Bad request
      throw new RealmError({
        cause: new Error("Invalid guild_id provided"),
      });
    case 401: // Unauthorized
      throw new RealmError({
        code: ErrorCodes.NotAdmin,
        cause: new Error("Authentication failed"),
      });
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
