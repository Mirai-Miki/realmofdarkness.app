"use strict";
require(`${process.cwd()}/alias`);
const API = require("@api");
const { RealmError, ErrorCodes } = require("@errors");
const isAdminOrST = require("@modules/isAdminOrST");
const canSendMessage = require("@modules/canSendMessage");
const { EmbedBuilder } = require("discord.js");

module.exports = async function setTrackerChannel(interaction) {
  interaction.arguments = await getArgs(interaction);

  let channel;
  if (interaction.arguments.channel) {
    channel = await API.setTrackerChannel(
      interaction.guild.id,
      interaction.arguments.channel.id
    );
  } else {
    channel = await API.getTrackerChannel(interaction.guild.id);
  }

  return { embeds: [getEmbed(channel)] };
};

async function getArgs(interaction) {
  const args = { channel: interaction.options.getChannel("channel") };

  if (!interaction.guild)
    throw new RealmError({ code: ErrorCodes.GuildRequired });
  else if (!isAdminOrST(interaction.member, interaction.guild.id))
    throw new RealmError({ code: ErrorCodes.NotAdmin });

  if (!args.channel) return args;
  else if (!args.channel.isTextBased() || args.channel.isThread())
    throw new RealmError({ code: ErrorCodes.NotTextChannel });
  else if (!(await canSendMessage({ channel: args.channel })))
    throw new RealmError({ code: ErrorCodes.InvalidChannelPermissions });
  return args;
}

function getEmbed(channelId) {
  let message = "No Tracker Channel currently set.";
  if (channelId) message = "- " + `<#${channelId}>`;
  return new EmbedBuilder()
    .setTitle("Tracker Channel")
    .setDescription(message)
    .setColor("#3bcc99");
}
