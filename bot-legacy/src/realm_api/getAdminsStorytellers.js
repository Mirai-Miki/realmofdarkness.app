"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const RealmAPIError = require("@src/errors/RealmAPIError.js");

module.exports = async function getAdminsStorytellers(guildId) {
  const path = `chronicle/storytellers/get`;
  const data = { guild_id: guildId };

  const res = await postData(path, data);
  switch (res?.status) {
    case 200: // Deleted
      return res.data;
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
