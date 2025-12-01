"use strict";
require(`${process.cwd()}/alias`);
const API = require("@api");
const { RealmError, ErrorCodes } = require("@errors");
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = async function setStorytellers(interaction) {
  interaction.arguments = await getArgs(interaction);

  let roles;
  if (interaction.arguments.role) {
    roles = await API.setStorytellers(
      interaction.guild.id,
      interaction.arguments.role.id
    );

    // Need to get all members with this role and update them
    for (const member of interaction.arguments.role.members.values()) {
      await API.updateUser(member);
    }
  } else {
    roles = await API.getSTRoles(interaction.guild.id);
  }

  return { embeds: [getEmbed(roles)] };
};

async function getArgs(interaction) {
  const args = { role: interaction.options.getRole("role") };

  if (!interaction.guild)
    throw new RealmError({ code: ErrorCodes.GuildRequired });
  else if (
    !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
  )
    throw new RealmError({ code: ErrorCodes.NotAdmin });

  return args;
}

function getEmbed(roles) {
  for (let i = 0; i < roles.length; i++) {
    roles[i] = `<@&${roles[i]}>`;
  }

  let roleMessage = "No Storyteller Roles currently set.";
  if (roles.length) roleMessage = "- " + roles.join("\n- ");
  return new EmbedBuilder()
    .setTitle("Storyteller Roles")
    .setDescription(roleMessage)
    .setColor("#ccad3b");
}
