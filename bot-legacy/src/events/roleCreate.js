"use strict";
require(`${process.cwd()}/alias`);
const { Events, PermissionFlagsBits } = require("discord.js");
const API = require("@api");

module.exports = {
  name: Events.GuildRoleCreate,
  once: false,
  async execute(role) {
    if (!role.permissions.has(PermissionFlagsBits.Administrator)) return;

    for (const member of role.members.values()) {
      await API.updateUser(member);
    }
  },
};
