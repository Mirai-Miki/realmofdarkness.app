"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const { RealmAPIError } = require("@errors");

module.exports = async function setTrackerChannel(guildId, channelId) {
  const path = "chronicle/channel/set";
  const data = {
    guild_id: guildId,
    channel_id: channelId,
  };

  const res = await postData(path, data);
  switch (res?.status) {
    case 200: // Updated
      return res.data.channel_id;
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
