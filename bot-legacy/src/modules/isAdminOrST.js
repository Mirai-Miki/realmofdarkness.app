"use strict";
require(`${process.cwd()}/alias`);
const API = require("@api");
const { PermissionFlagsBits } = require("discord.js");

module.exports = async function isAdminOrST(member, guildId) {
  if (!member || !guildId) throw new Error("Need a member && guildID");

  const roles = await API.getSTRoles(guildId);
  if (
    !member.permissions.has(PermissionFlagsBits.Administrator) &&
    !member.roles.cache.hasAny(...roles)
  ) {
    return false;
  } else return true;
};
