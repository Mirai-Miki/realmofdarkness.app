"use strict";
const { PermissionFlagsBits, Client, TextChannel } = require("discord.js");

/**
 * Takes in a Guild TextChannel or a (channelId and client) and returns the channel if the
 * bot can post embeds in the channel.
 * @param {Object} options - Options for checking channel permissions.
 * @param {TextChannel} [options.channel] - The Discord.js TextChannel instance.
 * @param {string} [options.channelId] - The ID of the channel to fetch.
 * @param {Client} [options.client] - The Discord.js Client instance (required if channelId is used).
 * @returns {Promise<TextChannel|boolean>} The channel if permissions are sufficient, otherwise false.
 */
module.exports = async function canSendMessages({
  channel = null,
  channelId = null,
  client = null,
} = {}) {
  if (!channel && !channelId)
    throw new Error("Need a text channel or channelId");
  if (!channel && !client) throw new Error("Need a client with channelId");

  try {
    if (!channel && channelId) {
      const discord_channel = await client.channels.fetch(channelId);
      if (discord_channel instanceof TextChannel) {
        channel = discord_channel;
      } else return false;
    }
  } catch (error) {
    if (error.code === 10003)
      return false; //Unknown Channel
    else throw error;
  }

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
