"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const RealmAPIError = require("@src/errors/RealmAPIError.js");

module.exports = async function getDisciplineNames(userId, guildId) {
  const path = "character/get/discipline/names";
  const data = {
    user_id: userId,
    guild_id: guildId,
  };

  const res = await postData(path, data);
  switch (res?.status) {
    case 200: // Found a character
      const json = res.data.names;
      return json;
    case 204: // No character
      return null;
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
