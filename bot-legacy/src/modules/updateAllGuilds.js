"use strict";
require(`${process.cwd()}/alias`);
const API = require("@api");

module.exports = async function updateAllGuilds(client) {
  const guilds = client.guilds.cache.values();

  for (const guild of guilds) {
    await API.updateGuild(guild);
    await sleep(100);
  }
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
