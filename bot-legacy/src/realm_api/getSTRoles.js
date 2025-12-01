"use strict";
const { postData } = require("./postData.js");
const { RealmAPIError } = require("@errors");

module.exports = async function getSTRoles(guildId) {
  const path = "chronicle/storyteller/roles/get";

  const data = { guild_id: guildId };

  const res = await postData(path, data);
  switch (res?.status) {
    case 200: // Found Roles
      return res.data.roles;
    case 204: // No Roles set
      return [];
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
