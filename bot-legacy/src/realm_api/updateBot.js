"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const { RealmAPIError } = require("@errors");

module.exports = async function updateBot(client) {
  if (!client.shard.ids.includes(0)) return;
  const path = "data/set";
  const data = {
    bot: {
      id: client.user.id,
      username: client.user.username,
      discriminator: client.user.discriminator,
      avatar_url: client.user.displayAvatarURL(),
      shard_count: client.shard.count,
    },
  };

  const res = await postData(path, data);
  switch (res?.status) {
    case 200: // Updated
      return true;
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
