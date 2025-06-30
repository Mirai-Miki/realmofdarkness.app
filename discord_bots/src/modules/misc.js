"use strict";

module.exports.hourToMilli = (hour) => {
  return this.minToMilli(hour * 60);
};

module.exports.minToMilli = (min) => {
  return min * 60 * 1000;
};

module.exports.trimString = (string) => {
  if (!string) return undefined;
  return string.trim().replace(/\s+/g, " ");
};

module.exports.slugifiy = (str) => {
  return str.toLowerCase().trim().replace(/\s+/g, "_");
};

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

module.exports.canEmbed = (channel) => {
  if (!channel.guild) return true; // Not sending in a guild

  if (!channel.permissionsFor(channel.client.user.id).has("EMBED_LINKS")) {
    return false;
  } else return true;
};
