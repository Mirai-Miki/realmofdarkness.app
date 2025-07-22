"use strict";
require(`${process.cwd()}/alias`);
const { Events } = require("discord.js");
const API = require("@api");

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member) {
    if (member.partial) await member.fetch();
    await API.updateUser(member);
  },
};
