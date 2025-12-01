"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const { RealmAPIError } = require("@errors");
const { GuildMember, PermissionFlagsBits } = require("discord.js");
const getSTRoles = require("./getSTRoles.js");

module.exports = async function updateUser(userD, create = false) {
  const path = "user/update";

  const member = userD instanceof GuildMember ? userD : null;
  const user = userD instanceof GuildMember ? userD.user : userD;

  const data = {
    user: {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar_url: user.displayAvatarURL(),
      create: create,
      member: null,
    },
  };

  if (member) {
    const m = {
      nickname: member.displayName,
      guild_id: member.guild.id,
      avatar_url: member.displayAvatarURL(),
      admin: await isAdmin(member),
      storyteller: await isStoryteller(member, member.guild.id),
    };
    data.user.member = m;
  }

  const res = await postData(path, data);
  switch (res?.status) {
    case 200: // Updated
      return;
    case 204:
      return; // No change
    default:
      throw new RealmAPIError({
        cause: `res_status: ${res?.status}\nres: ${JSON.stringify(
          res?.data,
          null,
          2
        )}\npost: ${JSON.stringify(data, null, 2)}`,
      });
  }
};

async function isStoryteller(member, guildId) {
  const roles = await getSTRoles(guildId);
  if (!member.roles.cache.hasAny(...roles)) return false;
  else return true;
}

async function isAdmin(member) {
  if (!member.permissions.has(PermissionFlagsBits.Administrator)) return false;
  else return true;
}
