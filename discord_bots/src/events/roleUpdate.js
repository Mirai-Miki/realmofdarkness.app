"use strict";
require(`${process.cwd()}/alias`);
const { Events, PermissionFlagsBits } = require("discord.js");
const API = require("@api");

module.exports = {
  name: Events.GuildRoleUpdate,
  once: false,
  async execute(oldRole, newRole) {
    if (
      !oldRole.permissions.has(PermissionFlagsBits.Administrator) &&
      !newRole.permissions.has(PermissionFlagsBits.Administrator)
    )
      return;

    for (const member of newRole.members.values()) {
      await API.updateUser(member);
    }
  },
};
