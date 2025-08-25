"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const AppUser = require("@structures/AppUser");
const { RealmError, RealmAPIError, ErrorCodes } = require("@errors");

/**
 * Finds a user in the Database if one exists
 * @param {String|User|GuildMember} user A Discord User ID, User, or GuildMember
 * @returns {Promise<AppUser>} Returns an AppUser class if one is found
 *
 * @example
 * // Using with a Discord User ID string
 * const appUser = await getUser({ user: "123456789012345678" });
 *
 * @example
 * // Using with a Discord User object
 * const appUser = await getUser({ user: interaction.user });
 *
 * @example
 * // Using with a Guild Member
 * const appUser = await getUser({ user: interaction.member });
 */
module.exports = async function getUser(user) {
  const path = "user/get";

  // Extract user ID from different input types
  let userId;
  if (typeof user === "string") {
    userId = user;
  } else if (user?.id) {
    userId = user.id;
  } else {
    throw new RealmError({
      cause: new Error("User ID, User, or GuildMember must be provided"),
    });
  }

  const data = {
    user_id: userId,
  };

  const res = await postData(path, data);

  switch (res?.status) {
    case 200: // Found a user
      const json = res.data;
      return json;
    case 404: // No user found
      throw new RealmError({
        cause: new Error(`User with ID ${userId} not found`),
      });
    case 400: // Bad request
      throw new RealmError({
        cause: new Error("Invalid user ID provided"),
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
