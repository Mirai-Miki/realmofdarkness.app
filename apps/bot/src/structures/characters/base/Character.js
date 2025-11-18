"use strict";
require(`${process.cwd()}/alias`);
const Consumable = require("../../Consumable");
const API = require("@api");
const sendToTrackerChannel = require("@modules/sendToTrackerChannel");

module.exports = class Character {
  constructor({ client, name } = {}) {
    this.client = client;
    this.name = name;
    this.id = null;
    this.user = null;
    this.member = null;
    this.guild = null;
    this.exp = new Consumable(0);
    this.thumbnail = null;
    this.color = "#000000";
    this.history = {};
    this.changes = {};
    this.isSheet = false;
  }

  async setDiscordInfo({ user, guild, userId, guildId } = {}) {
    if (user) this.user = user;
    if (guild) this.guild = guild;

    if (userId) this.user = await this.client.users.fetch(userId);
    if (guildId) this.guild = await this.client.guilds.fetch(guildId);

    if (this.guild) this.member = await this.guild.members.fetch(this.user.id);
  }

  setFields(args) {
    if (args.nameChange != null) this.name = args.nameChange;
    if (args.exp != null) this.exp.setTotal(args.exp);
    if (args.color != null) this.color = args.color;
    if (args.thumbnail) this.thumbnail = args.thumbnail.url;
    else if (args.thumbnail != null) this.thumbnail = args.thumbnail;
    this.changes = getChanges(args);
  }

  updateFields(args) {
    if (args.exp && args.exp < 0) this.exp.updateCurrent(args.exp);
    else if (args.exp != null) this.exp.incTotal(args.exp);
    this.changes = getChanges(args);
  }

  async deserilize(json) {
    this.id = json.id;
    this.name = json.name;
    this.color = json.theme;
    this.thumbnail = json.faceclaim;
    this.exp.setTotal(json.exp.total);
    this.exp.setCurrent(json.exp.current);
    this.isSheet = json.is_sheet ?? false;

    if (json.faceclaim != null)
      this.thumbnail = "https://realmofdarkness.app" + json.faceclaim;

    await this.setDiscordInfo({ userId: json.user, guildId: json.chronicle });
    return this;
  }

  serialize() {
    const serializer = { character: {} };
    serializer.character["name"] = this.name;
    serializer.character["id"] = this.id;
    serializer.character["user"] = this.user.id;
    serializer.character["chronicle"] = this.guild?.id ? this.guild.id : null;
    serializer.character["theme"] = this.color;
    serializer.character["avatar"] = this.thumbnail ?? "";
    serializer.character["exp_total"] = this.exp.total;
    serializer.character["exp_current"] = this.exp.current;
    return serializer;
  }

  async save(client) {
    if (Object.keys(this.changes).length > 1) {
      if (this.changes.command === "New Character")
        await API.newCharacter(this.serialize());
      else await API.saveCharacter(this.serialize());
      sendToTrackerChannel(client, this);
    }
  }

  getAuthor() {
    let name;
    let iconURL;

    if (this.member) {
      name = this.member.displayName ?? null;
      iconURL = this.member.avatarURL() ?? null;
    }

    if (!name) name = this.user.displayName ?? this.user.username;
    if (!iconURL) iconURL = this.user.avatarURL() ?? null;

    return { name: name, iconURL: iconURL };
  }
};

function getChanges(args) {
  const changes = structuredClone(args);
  delete changes.name;
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) {
      delete changes[key];
      continue;
    }
    if (key === "player") {
      changes.storytellerModified = "True";
      delete changes.player;
    }
    if (key === "thumbnail") changes.thumbnail = "Set";
  }
  return changes;
}
