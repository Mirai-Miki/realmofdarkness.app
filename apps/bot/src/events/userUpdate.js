"use strict";
require(`${process.cwd()}/alias`);
const { Events } = require("discord.js");
const API = require("@api");

module.exports = {
  name: Events.UserUpdate,
  once: false,
  async execute(oldUser, newUser) {
    if (newUser.partial) await newUser.fetch();
    await API.updateUser(newUser);
  },
};
