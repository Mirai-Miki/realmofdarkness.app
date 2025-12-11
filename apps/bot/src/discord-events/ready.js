"use strict";
require(`${process.cwd()}/alias`);
const { logger } = require("@realm/logger");
const { Events } = require("discord.js");
const { ActivityService } = require("../services");
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
    ActivityService.update(client);
    setInterval(() => {
      ActivityService.update(client);
    }, 300000);
  },
};
