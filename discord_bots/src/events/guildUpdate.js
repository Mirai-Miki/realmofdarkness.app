"use strict";
require(`${process.cwd()}/alias`);
const { Events } = require("discord.js");
const setActivity = require("@modules/setActivity");
const API = require("@api");

module.exports = {
  name: Events.GuildUpdate,
  once: false,
  async execute(oldGuild, newGuild) {
    await setActivity(newGuild.client);
    await API.updateGuild(newGuild);
  },
};
