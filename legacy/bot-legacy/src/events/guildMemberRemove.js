"use strict";
require(`${process.cwd()}/alias`);
const { Events } = require("discord.js");
const API = require("@api");

module.exports = {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member) {
    await API.deleteMember(member.id, member.guild.id);
  },
};
