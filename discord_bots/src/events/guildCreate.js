"use strict";
require(`${process.cwd()}/alias`);
const { Events } = require("discord.js");
const setActivity = require("@modules/setActivity");
const API = require("@api");

module.exports = {
  name: Events.GuildCreate,
  once: false,
  async execute(guild) {
    await setActivity(guild.client);
    await API.updateGuild(guild);
  },
};
