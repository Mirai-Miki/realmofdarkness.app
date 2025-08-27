"use strict";
const { ActivityType } = require("discord.js");

module.exports = async function setActivity(client) {
  let guildSizes;
  let size;
  if (client.shard) {
    guildSizes = await client.shard.fetchClientValues("guilds.cache.size");
    size = guildSizes.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
  } else size = client.guilds.cache.size;

  client.user.setActivity({
    name: `${size} Chronicles - Shard: ${client.shard?.ids ?? "None"}`,
    type: ActivityType.Watching,
    shard: client.shard?.ids ?? null,
  });
};
