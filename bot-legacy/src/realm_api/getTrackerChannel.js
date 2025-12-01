"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const { RealmAPIError } = require("@errors");

module.exports = async function getTrackerChannel(guildId) {
  const path = "chronicle/channel/get";
  const data = { guild_id: guildId };

  const res = await postData(path, data);
  switch (res?.status) {
    case 200: // Updated
      return res.data.channel_id;
    case 204:
      return null; // no channel
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
