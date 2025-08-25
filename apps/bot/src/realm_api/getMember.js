"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const AppMember = require("@structures/AppMember");
const { RealmError, RealmAPIError, ErrorCodes } = require("@errors");

/**
 * Finds a member in the Database if one exists
 * @param {String} userId - Discord user ID
 * @param {String} guildId - Discord guild/chronicle ID
 * @returns {Promise<AppMember>} Returns an AppMember class if one is found
 *
 * @example
 * // Using with user and guild IDs
 * const member = await getMember({ userId: "123456789012345678", guildId: "987654321098765432" });
 *
 * @example
 * // Using with Discord objects
 * const member = await getMember({ userId: interaction.user.id, guildId: interaction.guild.id });
 *
 * @example
 * // Check member properties
 * if (member.isAdmin()) {
 *   console.log(`${await member.getDisplayName()} is an admin!`);
 * }
 * if (member.isStoryteller()) {
 *   console.log(`${await member.getDisplayName()} is a storyteller!`);
 * }
 *
 * @example
 * // Lazy load related data
 * const appUser = await member.getAppUser();
 * const chronicle = await member.getChronicle();
 * const characters = await member.getCharacters();
 */
module.exports = async function getMember(userId, guildId) {
  const path = "member/get";

  // Validate required parameters
  if (!userId || !guildId) {
    throw new RealmError({
      cause: new Error("Both userId and guildId must be provided"),
    });
  }

  const data = {
    user_id: userId,
    guild_id: guildId,
  };

  const res = await postData(path, data);

  switch (res?.status) {
    case 200: // Found a member
      const json = res.data;
      return json;
    case 404: // No member found
      throw new RealmError({
        cause: new Error(
          `Member with user ID ${userId} not found in guild ${guildId}`
        ),
      });
    case 400: // Bad request
      throw new RealmError({
        cause: new Error("Invalid userId or guildId provided"),
      });
    case 401: // Unauthorized
      throw new RealmError({
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
