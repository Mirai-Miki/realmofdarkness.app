"use strict";
require(`${process.cwd()}/alias`);
const { time, TimestampStyles } = require("discord.js");

/**
 * Converts hours to milliseconds
 * @param {number} hour - Number of hours
 * @returns {number} Milliseconds
 */
module.exports.hourToMilli = (hour) => {
  return this.minToMilli(hour * 60);
};

/**
 * Converts minutes to milliseconds
 * @param {number} min - Number of minutes
 * @returns {number} Milliseconds
 */
module.exports.minToMilli = (min) => {
  return min * 60 * 1000;
};

/**
 * Trims whitespace from a string and collapses multiple spaces
 * @param {string} string - Input string
 * @returns {string|undefined} Trimmed string or undefined if input is falsy
 */
module.exports.trimString = (string) => {
  if (!string) return undefined;
  return string.trim().replace(/\s+/g, " ");
};

/**
 * Converts a string to a slug (lowercase, underscores for spaces)
 * @param {string} str - Input string
 * @returns {string} Slugified string
 */
module.exports.slugifiy = (str) => {
  return str.toLowerCase().trim().replace(/\s+/g, "_");
};

/**
 * Checks if the bot can send messages in a channel
 * @param {Channel} channel - Discord channel
 * @returns {boolean} True if bot can send messages
 */
module.exports.canSendMessage = (channel) => {
  if (!channel.guild) return true; // Not sending in a guild

  if (!channel.permissionsFor(channel.client.user.id).has("VIEW_CHANNEL")) {
    return false;
  } else if (
    !channel.permissionsFor(channel.client.user.id).has("SEND_MESSAGES")
  ) {
    return false;
  } else return true;
};

/**
 * Checks if the bot can send embeds in a channel
 * @param {Channel} channel - Discord channel
 * @returns {boolean} True if bot can send embeds
 */
module.exports.canEmbed = (channel) => {
  if (!channel.guild) return true; // Not sending in a guild

  if (!channel.permissionsFor(channel.client.user.id).has("EMBED_LINKS")) {
    return false;
  } else return true;
};

/**
 * Converts a Django DateTimeField string to a Discord timestamp
 * @param {string} djangoDateTime - ISO string from Django DateTimeField
 * @param {string|number} style - Discord timestamp style or TimestampStyles constant
 * @returns {string} Discord formatted timestamp
 */
module.exports.toDiscordTimestamp = (
  djangoDateTime,
  style = TimestampStyles.LongDateTime
) => {
  if (!djangoDateTime) return "Unknown";
  const dateTime = new Date(djangoDateTime);
  const unixTimestamp = Math.floor(dateTime.getTime() / 1000); // seconds
  return time(unixTimestamp, style);
};
