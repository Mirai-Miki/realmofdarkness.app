"use strict";
require(`${process.cwd()}/alias`);
const { Events } = require("discord.js");
const API = require("@api");

module.exports = {
  name: Events.GuildMemberUpdate,
  once: false,
  async execute(oldMember, newMember) {
    if (newMember.partial) await newMember.fetch();
    await API.updateUser(newMember);
  },
};
