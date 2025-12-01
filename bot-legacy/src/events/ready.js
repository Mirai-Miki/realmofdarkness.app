"use strict";
require(`${process.cwd()}/alias`);
const { Events } = require("discord.js");
const setActivity = require("@utilsset-activity");
const updateAllGuilds = require("@modules/updateAllGuilds");
const API = require("@api");
const { initializeEmojis } = require("@utilsemoji-manager");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    // Initialize dynamic emoji management
    await initializeEmojis(client);

    await API.updateBot(client);
    await updateAllGuilds(client);
    await setActivity(client);
    setInterval(() => {
      setActivity(client);
    }, 300000);
  },
};
