"use strict";
require(`${process.cwd()}/alias`);
const API = require("@api");
const canSendMessages = require("@modules/canSendMessage");

module.exports = async function sendToTrackerChannel(client, character) {
  const guildId = character.guild?.id;
  if (!guildId) return;

  const channelId = await API.getTrackerChannel(guildId);
  if (!channelId) return;

  const channel = await canSendMessages({
    channelId: channelId,
    client: client,
  });
  if (!channel) return console.log("Cannot send message to channel");
  const notes = character.changes.notes;

  await channel.send({
    content: getContent(character),
    embeds: [character.getEmbed(notes)],
  });
};

function getContent(character) {
  let content = "";
  const changes = structuredClone(character.changes);

  content += changes.command;
  delete changes.command;
  if (changes.notes) delete changes.notes;

  const entries = Object.entries(changes);
  const args = [];
  for (const entry of entries) {
    args.push(entry.join(": "));
  }

  content += `: {${args.join(" | ")}}`;
  return content;
}
