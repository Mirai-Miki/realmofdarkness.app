"use strict";
const { PermissionFlagsBits } = require("discord.js");

/**
 * Takes in a TextChannel || a (channelId && client) and returns the channel if the
 * bot can post embeds in the channel.
 * @param {TextChannel} channel
 * @param {String} channelId
 * @param {Client} client
 * @returns
 */
module.exports = async function canSendMessages({
  channel = null,
  channelId = null,
  client = null,
} = {}) {
  if (!channel && !channelId) throw new Error("Need at least one argument");
  if (channelId && !client) throw new Error("Need a client with an Id");

  try {
    if (!channel && channelId) channel = await client.channels.fetch(channelId);
  } catch (error) {
    if (error.code === 10003)
      return false; //Unknown Channel
    else throw error;
  }

  if (!channel.isTextBased()) return channel; // Not sending in a guild
  if (
    !channel
      .permissionsFor(channel.client.user.id)
      ?.has([
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
      ])
  )
    return false;
  else return channel;
};
